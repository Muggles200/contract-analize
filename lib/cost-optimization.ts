import { prisma } from './db';

export interface CostMetrics {
  totalCost: number;
  averageCostPerAnalysis: number;
  totalAnalyses: number;
  costByAnalysisType: Record<string, number>;
  costByMonth: Record<string, number>;
  tokenUsage: {
    totalTokens: number;
    averageTokensPerAnalysis: number;
    inputTokens: number;
    outputTokens: number;
  };
}

export interface CostOptimizationSettings {
  maxTokensPerAnalysis: number;
  maxCostPerAnalysis: number;
  enableTextTruncation: boolean;
  useLowerCostModel: boolean;
  batchProcessing: boolean;
}

export class CostOptimizationService {
  private static instance: CostOptimizationService;
  private settings: CostOptimizationSettings;

  private constructor() {
    this.settings = {
      maxTokensPerAnalysis: 8000,
      maxCostPerAnalysis: 0.50, // $0.50 USD
      enableTextTruncation: true,
      useLowerCostModel: false,
      batchProcessing: false
    };
  }

  public static getInstance(): CostOptimizationService {
    if (!CostOptimizationService.instance) {
      CostOptimizationService.instance = new CostOptimizationService();
    }
    return CostOptimizationService.instance;
  }

  /**
   * Get cost metrics for the application
   */
  public async getCostMetrics(
    userId?: string,
    organizationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CostMetrics> {
    const whereClause: any = {
      status: 'COMPLETED',
      estimatedCost: { not: null }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    if (startDate || endDate) {
      whereClause.completedAt = {};
      if (startDate) whereClause.completedAt.gte = startDate;
      if (endDate) whereClause.completedAt.lte = endDate;
    }

    const analyses = await prisma.analysisResult.findMany({
      where: whereClause,
      select: {
        estimatedCost: true,
        tokensUsed: true,
        analysisType: true,
        completedAt: true
      }
    });

    const totalCost = analyses.reduce((sum, analysis) => sum + (Number(analysis.estimatedCost) || 0), 0);
    const totalAnalyses = analyses.length;
    const averageCostPerAnalysis = totalAnalyses > 0 ? totalCost / totalAnalyses : 0;

    // Calculate cost by analysis type
    const costByAnalysisType: Record<string, number> = {};
    analyses.forEach(analysis => {
      const type = analysis.analysisType;
      costByAnalysisType[type] = (costByAnalysisType[type] || 0) + (Number(analysis.estimatedCost) || 0);
    });

    // Calculate cost by month
    const costByMonth: Record<string, number> = {};
    analyses.forEach(analysis => {
      if (analysis.completedAt) {
        const month = analysis.completedAt.toISOString().substring(0, 7); // YYYY-MM
        costByMonth[month] = (costByMonth[month] || 0) + (Number(analysis.estimatedCost) || 0);
      }
    });

    // Calculate token usage
    const totalTokens = analyses.reduce((sum, analysis) => sum + (analysis.tokensUsed || 0), 0);
    const averageTokensPerAnalysis = totalAnalyses > 0 ? totalTokens / totalAnalyses : 0;

    // Estimate input vs output tokens (rough estimation)
    const inputTokens = Math.round(totalTokens * 0.7); // Assume 70% input, 30% output
    const outputTokens = totalTokens - inputTokens;

    return {
      totalCost,
      averageCostPerAnalysis,
      totalAnalyses,
      costByAnalysisType,
      costByMonth,
      tokenUsage: {
        totalTokens,
        averageTokensPerAnalysis,
        inputTokens,
        outputTokens
      }
    };
  }

  /**
   * Get cost optimization recommendations
   */
  public async getOptimizationRecommendations(
    userId?: string,
    organizationId?: string
  ): Promise<string[]> {
    const recommendations: string[] = [];
    const metrics = await this.getCostMetrics(userId, organizationId);

    // Check average cost per analysis
    if (metrics.averageCostPerAnalysis > this.settings.maxCostPerAnalysis) {
      recommendations.push(
        `Average cost per analysis ($${metrics.averageCostPerAnalysis.toFixed(3)}) is above the target ($${this.settings.maxCostPerAnalysis}). Consider using shorter prompts or more specific analysis types.`
      );
    }

    // Check token usage
    if (metrics.tokenUsage.averageTokensPerAnalysis > this.settings.maxTokensPerAnalysis) {
      recommendations.push(
        `Average token usage (${Math.round(metrics.tokenUsage.averageTokensPerAnalysis)}) is above the limit (${this.settings.maxTokensPerAnalysis}). Enable text truncation or use more focused analysis.`
      );
    }

    // Check for expensive analysis types
    const expensiveTypes = Object.entries(metrics.costByAnalysisType)
      .filter(([_, cost]) => cost > 10) // Flag types costing more than $10
      .sort(([, a], [, b]) => b - a);

    if (expensiveTypes.length > 0) {
      recommendations.push(
        `High-cost analysis types detected: ${expensiveTypes.map(([type, cost]) => `${type} ($${cost.toFixed(2)})`).join(', ')}. Consider using basic analysis for initial screening.`
      );
    }

    // Check for recent cost trends
    const recentMonths = Object.keys(metrics.costByMonth).slice(-3);
    if (recentMonths.length >= 2) {
      const recentCosts = recentMonths.map(month => metrics.costByMonth[month]);
      const costTrend = recentCosts[recentCosts.length - 1] - recentCosts[0];
      
      if (costTrend > 5) { // $5 increase
        recommendations.push(
          `Monthly costs are increasing ($${costTrend.toFixed(2)} over the last ${recentMonths.length} months). Review analysis frequency and types.`
        );
      }
    }

    // General recommendations
    if (!this.settings.enableTextTruncation) {
      recommendations.push('Enable text truncation to reduce token usage for large documents.');
    }

    if (!this.settings.useLowerCostModel) {
      recommendations.push('Consider using GPT-3.5-turbo for basic analyses to reduce costs.');
    }

    if (!this.settings.batchProcessing) {
      recommendations.push('Enable batch processing to optimize multiple analyses.');
    }

    return recommendations;
  }

  /**
   * Update cost optimization settings
   */
  public updateSettings(newSettings: Partial<CostOptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  public getSettings(): CostOptimizationSettings {
    return { ...this.settings };
  }

  /**
   * Estimate cost for a potential analysis
   */
  public estimateAnalysisCost(
    contractTextLength: number,
    analysisType: string,
    includeMetadata: boolean = true
  ): { estimatedCost: number; estimatedTokens: number; recommendations: string[] } {
    // Rough token estimation (1 token ≈ 4 characters)
    const baseTokens = Math.ceil(contractTextLength / 4);
    const metadataTokens = includeMetadata ? 200 : 0;
    
    // Analysis type multipliers
    const typeMultipliers: Record<string, number> = {
      'basic': 1.0,
      'clause-extraction': 1.2,
      'risk-assessment': 1.5,
      'comprehensive': 2.0
    };

    const multiplier = typeMultipliers[analysisType] || 1.0;
    const estimatedTokens = Math.round((baseTokens + metadataTokens) * multiplier);

    // Cost calculation (GPT-4 pricing)
    const inputCost = (estimatedTokens * 0.7 / 1000) * 0.03; // 70% input tokens
    const outputCost = (estimatedTokens * 0.3 / 1000) * 0.06; // 30% output tokens
    const estimatedCost = inputCost + outputCost;

    const recommendations: string[] = [];

    if (estimatedCost > this.settings.maxCostPerAnalysis) {
      recommendations.push(
        `Estimated cost ($${estimatedCost.toFixed(3)}) exceeds limit ($${this.settings.maxCostPerAnalysis}). Consider using a different analysis type or truncating the document.`
      );
    }

    if (estimatedTokens > this.settings.maxTokensPerAnalysis) {
      recommendations.push(
        `Estimated tokens (${estimatedTokens}) exceeds limit (${this.settings.maxTokensPerAnalysis}). Enable text truncation.`
      );
    }

    if (contractTextLength > 50000) { // 50KB
      recommendations.push(
        'Document is large. Consider using basic analysis first, then targeted analysis for specific sections.'
      );
    }

    return {
      estimatedCost,
      estimatedTokens,
      recommendations
    };
  }

  /**
   * Get cost alerts for high-spending users/organizations
   */
  public async getCostAlerts(
    threshold: number = 50 // $50 USD
  ): Promise<Array<{ userId: string; organizationId?: string; totalCost: number; alert: string }>> {
    const alerts: Array<{ userId: string; organizationId?: string; totalCost: number; alert: string }> = [];

    // Check individual user costs
    const userCosts = await prisma.analysisResult.groupBy({
      by: ['userId'],
      where: {
        status: 'COMPLETED',
        estimatedCost: { not: null }
      },
      _sum: {
        estimatedCost: true
      }
    });

    userCosts.forEach(user => {
      const totalCost = user._sum.estimatedCost || 0;
      if (Number(totalCost) > threshold) {
        alerts.push({
          userId: user.userId,
          totalCost: Number(totalCost),
          alert: `User has spent $${totalCost.toFixed(2)} on analysis`
        });
      }
    });

    // Check organization costs
    const orgCosts = await prisma.analysisResult.groupBy({
      by: ['organizationId'],
      where: {
        status: 'COMPLETED',
        estimatedCost: { not: null },
        organizationId: { not: null }
      },
      _sum: {
        estimatedCost: true
      }
    });

    orgCosts.forEach(org => {
      const totalCost = org._sum.estimatedCost || 0;
      if (Number(totalCost) > threshold && org.organizationId) {
        alerts.push({
          userId: '',
          organizationId: org.organizationId,
          totalCost: Number(totalCost),
          alert: `Organization has spent $${totalCost.toFixed(2)} on analysis`
        });
      }
    });

    return alerts.sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Optimize text for cost efficiency
   */
  public optimizeTextForCost(text: string, maxTokens: number): string {
    if (!this.settings.enableTextTruncation) {
      return text;
    }

    const estimatedTokens = Math.ceil(text.length / 4);
    if (estimatedTokens <= maxTokens) {
      return text;
    }

    // Calculate how much text to keep
    const maxCharacters = maxTokens * 4;
    const truncatedText = text.substring(0, maxCharacters);
    
    return truncatedText + '\n\n[Text truncated for cost optimization]';
  }
}

// Export singleton instance
export const costOptimizationService = CostOptimizationService.getInstance(); 