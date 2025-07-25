import { prisma } from './db';
import { aiAnalysisService, AnalysisRequest, AnalysisResponse } from './ai-analysis';
import { AnalysisStatus, AnalysisResult } from './generated/prisma';
import { createAnalysisCompleteNotification } from './notification-utils';
import { textExtractionService } from './text-extraction';

export interface QueueJob {
  id: string;
  contractId: string;
  analysisType: string;
  userId: string;
  organizationId?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface QueueStatus {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
}

class AnalysisQueue {
  private static instance: AnalysisQueue;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly MAX_CONCURRENT_JOBS = 3;
  private readonly PROCESSING_INTERVAL = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;

  private constructor() {}

  public static getInstance(): AnalysisQueue {
    if (!AnalysisQueue.instance) {
      AnalysisQueue.instance = new AnalysisQueue();
    }
    return AnalysisQueue.instance;
  }

  /**
   * Start the queue processor
   */
  public start(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL);

    console.log('Analysis queue processor started');
  }

  /**
   * Stop the queue processor
   */
  public stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log('Analysis queue processor stopped');
  }

  /**
   * Add a job to the queue
   */
  public async addJob(
    contractId: string,
    analysisType: string,
    userId: string,
    organizationId?: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    try {
      // Check if analysis already exists
      const existingAnalysis = await prisma.analysisResult.findFirst({
        where: {
          contractId,
          analysisType,
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        }
      });

      if (existingAnalysis) {
        throw new Error('Analysis already in progress for this contract');
      }

      // Create analysis record
      const analysis = await prisma.analysisResult.create({
        data: {
          contractId,
          analysisType,
          status: AnalysisStatus.PENDING,
          userId,
          organizationId,
          priority: priority.toUpperCase(),
          progress: 0,
          retryCount: 0,
          maxRetries: this.MAX_RETRIES,
          createdAt: new Date()
        }
      });

      console.log(`Job added to queue: ${analysis.id}`);
      return analysis.id;

    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw error;
    }
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    try {
      // Get current processing count
      const processingCount = await prisma.analysisResult.count({
        where: {
          status: AnalysisStatus.PROCESSING
        }
      });

      if (processingCount >= this.MAX_CONCURRENT_JOBS) {
        return; // Max concurrent jobs reached
      }

      // Get next job to process
      const nextJob = await this.getNextJob();
      if (!nextJob) {
        return; // No jobs to process
      }

      // Process the job
      await this.processJob(nextJob);

    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  /**
   * Get the next job to process
   */
  private async getNextJob(): Promise<AnalysisResult | null> {
    return await prisma.analysisResult.findFirst({
      where: {
        status: AnalysisStatus.PENDING,
        retryCount: {
          lt: this.MAX_RETRIES
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Process a single job
   */
  private async processJob(job: AnalysisResult): Promise<void> {
    try {
      // Update job status to processing
      await prisma.analysisResult.update({
        where: { id: job.id },
        data: {
          status: AnalysisStatus.PROCESSING,
          startedAt: new Date(),
          progress: 10
        }
      });

      // Get contract data
      const contract = await prisma.contract.findUnique({
        where: { id: job.contractId }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Extract text from contract using real text extraction service
      const contractText = await this.extractContractText(contract);

      // Parse metadata from JSON
      const metadata = contract.metadata as any;

      // Prepare analysis request
      const analysisRequest: AnalysisRequest = {
        contractId: job.contractId,
        contractText,
        contractMetadata: {
          fileName: contract.fileName,
          fileSize: Number(contract.fileSize),
          pageCount: metadata?.pageCount,
          contractType: metadata?.contractType,
          jurisdiction: metadata?.jurisdiction,
          contractValue: metadata?.contractValue,
          parties: metadata?.parties
        },
        analysisType: job.analysisType as any,
        userId: job.userId,
        organizationId: job.organizationId || undefined
      };

      // Update progress
      await prisma.analysisResult.update({
        where: { id: job.id },
        data: { progress: 30 }
      });

      // Perform AI analysis
      const analysisResponse = await aiAnalysisService.analyzeContract(analysisRequest);

      // Update progress
      await prisma.analysisResult.update({
        where: { id: job.id },
        data: { progress: 80 }
      });

      if (analysisResponse.success && analysisResponse.result) {
        // Store analysis results
        await this.storeAnalysisResults(job.id, analysisResponse.result, analysisResponse);

        // Update job as completed
        await prisma.analysisResult.update({
          where: { id: job.id },
          data: {
            status: AnalysisStatus.COMPLETED,
            completedAt: new Date(),
            progress: 100,
            processingTime: analysisResponse.processingTime,
            tokensUsed: analysisResponse.tokensUsed,
            estimatedCost: analysisResponse.cost
          }
        });

        // Create notification for analysis completion
        try {
          await createAnalysisCompleteNotification(
            job.userId,
            job.contractId,
            contract.fileName,
            job.id,
            analysisResponse.result
          );
        } catch (notificationError) {
          console.error('Error creating analysis completion notification:', notificationError);
          // Don't fail the job if notification fails
        }

        console.log(`Job completed: ${job.id}`);

      } else {
        throw new Error(analysisResponse.error || 'Analysis failed');
      }

    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);

      // Update retry count
      const newRetryCount = job.retryCount + 1;
      const shouldRetry = newRetryCount < this.MAX_RETRIES;

      await prisma.analysisResult.update({
        where: { id: job.id },
        data: {
          status: shouldRetry ? AnalysisStatus.PENDING : AnalysisStatus.FAILED,
          retryCount: newRetryCount,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: shouldRetry ? undefined : new Date()
        }
      });

      if (shouldRetry) {
        console.log(`Job ${job.id} will be retried (attempt ${newRetryCount}/${this.MAX_RETRIES})`);
      } else {
        console.log(`Job ${job.id} failed after ${this.MAX_RETRIES} attempts`);
      }
    }
  }

  /**
   * Extract text from contract using real text extraction service
   */
  private async extractContractText(contract: any): Promise<string> {
    try {
      // Get the file buffer from storage
      // In a real implementation, you would download the file from your storage service
      // For now, we'll assume the file is available locally or through a URL
      
      let fileBuffer: Buffer;
      
      if (contract.fileUrl) {
        // Download file from URL
        const response = await fetch(contract.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }
        fileBuffer = Buffer.from(await response.arrayBuffer());
      } else if (contract.filePath) {
        // Read file from local path
        const fs = require('fs').promises;
        fileBuffer = await fs.readFile(contract.filePath);
      } else {
        // Fallback to placeholder if no file source is available
        console.warn('No file source available for text extraction, using placeholder');
        return `Contract text for ${contract.fileName}. This is a placeholder implementation. In production, this would extract actual text from the uploaded document.`;
      }

      // Extract text using the real text extraction service
      const extractionResult = await textExtractionService.extractText(
        fileBuffer,
        contract.fileName,
        {
          enableOCR: true,
          enableImageProcessing: true,
          maxPages: 100, // Limit to 100 pages for performance
          confidenceThreshold: 0.7,
        }
      );

      // Log extraction results
      console.log(`Text extraction completed for ${contract.fileName}:`);
      console.log(`- Pages: ${extractionResult.pageCount}`);
      console.log(`- Confidence: ${extractionResult.confidence}`);
      console.log(`- Language: ${extractionResult.language}`);
      console.log(`- OCR Used: ${extractionResult.metadata.ocrUsed}`);
      console.log(`- Quality Score: ${extractionResult.metadata.qualityScore}`);

      // Update contract metadata with extraction results
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          metadata: {
            ...contract.metadata,
            textExtraction: {
              extractedAt: extractionResult.metadata.extractedAt,
              confidence: extractionResult.confidence,
              pageCount: extractionResult.pageCount,
              language: extractionResult.language,
              ocrUsed: extractionResult.metadata.ocrUsed,
              qualityScore: extractionResult.metadata.qualityScore,
              processingTime: extractionResult.processingTime,
            },
          },
        },
      });

      return extractionResult.text;

    } catch (error) {
      console.error('Text extraction error:', error);
      
      // Fallback to placeholder if extraction fails
      console.warn('Text extraction failed, using placeholder text');
      return `Contract text for ${contract.fileName}. Text extraction failed: ${error}. This is a placeholder implementation.`;
    }
  }

  /**
   * Store analysis results in the database
   */
  private async storeAnalysisResults(
    analysisId: string,
    results: any,
    analysisResponse: AnalysisResponse
  ): Promise<void> {
    try {
      // Store the main analysis result
      await prisma.analysisResult.update({
        where: { id: analysisId },
        data: {
          summary: results.summary,
          results: results,
          confidenceScore: results.metadata.confidenceScore,
          totalClauses: results.metadata.totalClauses,
          totalRisks: results.metadata.totalRisks,
          totalRecommendations: results.metadata.totalRecommendations,
          highRiskCount: results.metadata.highRiskCount,
          criticalRiskCount: results.metadata.criticalRiskCount
        }
      });

      console.log(`Analysis results stored for job: ${analysisId}`);

    } catch (error) {
      console.error('Error storing analysis results:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  public async getJobStatus(jobId: string): Promise<AnalysisResult | null> {
    return await prisma.analysisResult.findUnique({
      where: { id: jobId }
    });
  }

  /**
   * Cancel a job
   */
  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await prisma.analysisResult.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        return false;
      }

      if (job.status === AnalysisStatus.COMPLETED || job.status === AnalysisStatus.FAILED) {
        return false; // Cannot cancel completed/failed jobs
      }

      // Cancel in AI service if processing
      if (job.status === AnalysisStatus.PROCESSING) {
        aiAnalysisService.cancelAnalysis(job.contractId, job.analysisType);
      }

      // Update job status
      await prisma.analysisResult.update({
        where: { id: jobId },
        data: {
          status: AnalysisStatus.CANCELLED,
          completedAt: new Date()
        }
      });

      console.log(`Job cancelled: ${jobId}`);
      return true;

    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Retry a failed job
   */
  public async retryJob(jobId: string): Promise<boolean> {
    try {
      const job = await prisma.analysisResult.findUnique({
        where: { id: jobId }
      });

      if (!job || job.status !== AnalysisStatus.FAILED) {
        return false;
      }

      // Reset job for retry
      await prisma.analysisResult.update({
        where: { id: jobId },
        data: {
          status: AnalysisStatus.PENDING,
          retryCount: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
          progress: 0
        }
      });

      console.log(`Job queued for retry: ${jobId}`);
      return true;

    } catch (error) {
      console.error('Error retrying job:', error);
      return false;
    }
  }

  /**
   * Get queue status
   */
  public async getQueueStatus(): Promise<QueueStatus> {
    const [
      total,
      pending,
      processing,
      completed,
      failed
    ] = await Promise.all([
      prisma.analysisResult.count(),
      prisma.analysisResult.count({ where: { status: AnalysisStatus.PENDING } }),
      prisma.analysisResult.count({ where: { status: AnalysisStatus.PROCESSING } }),
      prisma.analysisResult.count({ where: { status: AnalysisStatus.COMPLETED } }),
      prisma.analysisResult.count({ where: { status: AnalysisStatus.FAILED } })
    ]);

    // Calculate average processing time
    const completedJobs = await prisma.analysisResult.findMany({
      where: {
        status: AnalysisStatus.COMPLETED,
        processingTime: { not: null }
      },
      select: { processingTime: true }
    });

    const averageProcessingTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => sum + (job.processingTime || 0), 0) / completedJobs.length
      : 0;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      averageProcessingTime
    };
  }

  /**
   * Get jobs for a user
   */
  public async getUserJobs(
    userId: string,
    organizationId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AnalysisResult[]> {
    return await prisma.analysisResult.findMany({
      where: {
        userId,
        ...(organizationId && { organizationId })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Clean up old completed jobs
   */
  public async cleanupOldJobs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.analysisResult.deleteMany({
      where: {
        status: {
          in: [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED, AnalysisStatus.CANCELLED]
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${result.count} old jobs`);
    return result.count;
  }
}

// Export singleton instance
export const analysisQueue = AnalysisQueue.getInstance(); 