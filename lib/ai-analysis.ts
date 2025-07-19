import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisRequest {
  contractId: string;
  contractText: string;
  contractMetadata: {
    fileName: string;
    fileSize: number;
    pageCount?: number;
    contractType?: string;
    jurisdiction?: string;
    contractValue?: number;
    parties?: string[];
  };
  analysisType: 'comprehensive' | 'risk-assessment' | 'clause-extraction' | 'basic';
  userId: string;
  organizationId?: string;
}

export interface AnalysisResponse {
  success: boolean;
  result?: any;
  error?: string;
  processingTime?: number;
  tokensUsed?: number;
  cost?: number;
}

export interface Clause {
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  pageNumber?: number;
  section?: string;
  extractedText?: string;
  confidence?: number;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  impact?: string;
  probability?: string;
  mitigation?: string;
  pageNumber?: number;
  section?: string;
  confidence?: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  implementation?: string;
  timeline?: string;
  effort?: string;
  impact?: string;
}

export interface ProcessedAnalysis {
  summary: string;
  clauses: Clause[];
  risks: Risk[];
  recommendations: Recommendation[];
  metadata: {
    totalClauses: number;
    totalRisks: number;
    totalRecommendations: number;
    highRiskCount: number;
    criticalRiskCount: number;
    confidenceScore: number;
    processingTime: number;
    tokensUsed: number;
    estimatedCost: number;
  };
}

// Prompt templates for different analysis types
const PROMPT_TEMPLATES = {
  comprehensive: `You are an expert contract analyst. Analyze the following contract and provide a comprehensive analysis.

Contract Text:
{contractText}

Contract Metadata:
- File Name: {fileName}
- Contract Type: {contractType}
- Jurisdiction: {jurisdiction}
- Contract Value: {contractValue}
- Parties: {parties}

Please provide a detailed analysis in the following JSON format:

{
  "summary": "Executive summary of the contract analysis",
  "clauses": [
    {
      "id": "unique_id",
      "title": "Clause title",
      "description": "Brief description of the clause",
      "category": "payment|termination|liability|confidentiality|intellectual_property|other",
      "importance": "low|medium|high",
      "pageNumber": 1,
      "section": "Section number if available",
      "extractedText": "Relevant text from the contract",
      "confidence": 0.95
    }
  ],
  "risks": [
    {
      "id": "unique_id",
      "title": "Risk title",
      "description": "Description of the risk",
      "severity": "low|medium|high|critical",
      "category": "financial|legal|operational|compliance|reputational",
      "impact": "Detailed impact analysis",
      "probability": "Assessment of probability",
      "mitigation": "Suggested mitigation strategies",
      "pageNumber": 1,
      "section": "Section number if available",
      "confidence": 0.90
    }
  ],
  "recommendations": [
    {
      "id": "unique_id",
      "title": "Recommendation title",
      "description": "Description of the recommendation",
      "priority": "low|medium|high",
      "category": "legal|financial|operational|compliance|risk_mitigation",
      "implementation": "Implementation steps",
      "timeline": "Suggested timeline",
      "effort": "Effort assessment",
      "impact": "Expected impact"
    }
  ]
}

Focus on identifying key clauses, potential risks, and actionable recommendations. Be thorough but concise.`,

  'risk-assessment': `You are a risk assessment specialist. Analyze the following contract for potential risks.

Contract Text:
{contractText}

Contract Metadata:
- File Name: {fileName}
- Contract Type: {contractType}
- Jurisdiction: {jurisdiction}
- Contract Value: {contractValue}

Please provide a risk-focused analysis in the following JSON format:

{
  "summary": "Risk assessment summary",
  "risks": [
    {
      "id": "unique_id",
      "title": "Risk title",
      "description": "Description of the risk",
      "severity": "low|medium|high|critical",
      "category": "financial|legal|operational|compliance|reputational",
      "impact": "Detailed impact analysis",
      "probability": "Assessment of probability",
      "mitigation": "Suggested mitigation strategies",
      "pageNumber": 1,
      "section": "Section number if available",
      "confidence": 0.90
    }
  ],
  "recommendations": [
    {
      "id": "unique_id",
      "title": "Risk mitigation recommendation",
      "description": "Description of the recommendation",
      "priority": "low|medium|high",
      "category": "risk_mitigation",
      "implementation": "Implementation steps",
      "timeline": "Suggested timeline",
      "effort": "Effort assessment",
      "impact": "Expected impact"
    }
  ]
}

Focus specifically on identifying and assessing risks.`,

  'clause-extraction': `You are a contract clause extraction specialist. Extract and categorize important clauses from the following contract.

Contract Text:
{contractText}

Contract Metadata:
- File Name: {fileName}
- Contract Type: {contractType}

Please extract clauses in the following JSON format:

{
  "summary": "Clause extraction summary",
  "clauses": [
    {
      "id": "unique_id",
      "title": "Clause title",
      "description": "Brief description of the clause",
      "category": "payment|termination|liability|confidentiality|intellectual_property|other",
      "importance": "low|medium|high",
      "pageNumber": 1,
      "section": "Section number if available",
      "extractedText": "Relevant text from the contract",
      "confidence": 0.95
    }
  ]
}

Focus on extracting and categorizing important contractual clauses.`,

  basic: `You are a contract analyst. Provide a basic analysis of the following contract.

Contract Text:
{contractText}

Contract Metadata:
- File Name: {fileName}

Please provide a basic analysis in the following JSON format:

{
  "summary": "Basic contract summary",
  "clauses": [
    {
      "id": "unique_id",
      "title": "Clause title",
      "description": "Brief description of the clause",
      "category": "other",
      "importance": "medium",
      "pageNumber": 1,
      "extractedText": "Relevant text from the contract",
      "confidence": 0.80
    }
  ]
}

Provide a basic overview of the contract.`
};

// Cost calculation based on OpenAI pricing (GPT-4o-2024-08-06)
const COST_PER_1K_TOKENS = {
  input: 0.005,  // $0.005 per 1K input tokens
  output: 0.015  // $0.015 per 1K output tokens
};

export class AIAnalysisService {
  private static instance: AIAnalysisService;
  private analysisQueue: Map<string, Promise<AnalysisResponse>> = new Map();

  private constructor() {}

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  /**
   * Process contract analysis using OpenAI
   */
  public async analyzeContract(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Check if analysis is already in progress
      const queueKey = `${request.contractId}-${request.analysisType}`;
      if (this.analysisQueue.has(queueKey)) {
        return await this.analysisQueue.get(queueKey)!;
      }

      // Create analysis promise
      const analysisPromise = this.performAnalysis(request);
      this.analysisQueue.set(queueKey, analysisPromise);

      // Clean up queue after completion
      analysisPromise.finally(() => {
        this.analysisQueue.delete(queueKey);
      });

      const result = await analysisPromise;
      const processingTime = Date.now() - startTime;

      return {
        ...result,
        processingTime
      };

    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Perform the actual AI analysis
   */
  private async performAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // Validate input
      if (!request.contractText || request.contractText.trim().length === 0) {
        throw new Error('Contract text is required');
      }

      // Get appropriate prompt template
      const promptTemplate = PROMPT_TEMPLATES[request.analysisType];
      if (!promptTemplate) {
        throw new Error(`Unsupported analysis type: ${request.analysisType}`);
      }

      // Prepare prompt with contract data
      const prompt = this.preparePrompt(promptTemplate, request);

      // Estimate token usage for cost optimization
      const estimatedTokens = this.estimateTokenUsage(prompt);
      const maxTokens = this.getMaxTokens(request.analysisType);

      // Check if we need to truncate the contract text
      const optimizedPrompt = this.optimizePromptForCost(prompt, maxTokens);

      // Make OpenAI API call
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: 'You are an expert contract analyst. Analyze the provided contract and extract key information in the specified structured format.'
          },
          {
            role: 'user',
            content: optimizedPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1, // Low temperature for consistent results
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "contract_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Executive summary of the contract analysis"
                },
                clauses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      category: { 
                        type: "string",
                        enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "other"]
                      },
                      importance: { 
                        type: "string",
                        enum: ["low", "medium", "high"]
                      },
                      pageNumber: { type: "number" },
                      section: { type: "string" },
                      extractedText: { type: "string" },
                      confidence: { type: "number" }
                    },
                    required: ["id", "title", "description", "category", "importance"],
                    additionalProperties: false
                  }
                },
                risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      severity: { 
                        type: "string",
                        enum: ["low", "medium", "high", "critical"]
                      },
                      category: { type: "string" },
                      impact: { type: "string" },
                      probability: { type: "string" },
                      mitigation: { type: "string" },
                      pageNumber: { type: "number" },
                      section: { type: "string" },
                      confidence: { type: "number" }
                    },
                    required: ["id", "title", "description", "severity", "category"],
                    additionalProperties: false
                  }
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { 
                        type: "string",
                        enum: ["low", "medium", "high"]
                      },
                      category: { type: "string" },
                      implementation: { type: "string" },
                      timeline: { type: "string" },
                      effort: { type: "string" },
                      impact: { type: "string" }
                    },
                    required: ["id", "title", "description", "priority", "category"],
                    additionalProperties: false
                  }
                }
              },
              required: ["summary"],
              additionalProperties: false
            }
          }
        }
      });

      // Parse and validate response
      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      // Parse JSON response
      const parsedResponse = this.parseAnalysisResponse(responseContent);

      // Calculate costs
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = this.calculateCost(
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0
      );

      // Process and validate the analysis
      const processedAnalysis = this.processAnalysisResult(parsedResponse, request);

      return {
        success: true,
        result: processedAnalysis,
        tokensUsed,
        cost
      };

    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Prepare prompt with contract data
   */
  private preparePrompt(template: string, request: AnalysisRequest): string {
    return template
      .replace('{contractText}', request.contractText)
      .replace('{fileName}', request.contractMetadata.fileName || 'Unknown')
      .replace('{contractType}', request.contractMetadata.contractType || 'Unknown')
      .replace('{jurisdiction}', request.contractMetadata.jurisdiction || 'Unknown')
      .replace('{contractValue}', request.contractMetadata.contractValue?.toString() || 'Unknown')
      .replace('{parties}', request.contractMetadata.parties?.join(', ') || 'Unknown');
  }

  /**
   * Estimate token usage for cost optimization
   */
  private estimateTokenUsage(prompt: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  /**
   * Get maximum tokens based on analysis type
   */
  private getMaxTokens(analysisType: string): number {
    switch (analysisType) {
      case 'comprehensive':
        return 4000;
      case 'risk-assessment':
        return 3000;
      case 'clause-extraction':
        return 2500;
      case 'basic':
        return 2000;
      default:
        return 3000;
    }
  }

  /**
   * Optimize prompt for cost efficiency
   */
  private optimizePromptForCost(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokenUsage(prompt);
    
    if (estimatedTokens > maxTokens * 0.8) {
      // Truncate contract text if too long
      const maxContractLength = maxTokens * 3; // Rough estimation
      const contractTextMatch = prompt.match(/Contract Text:\n([\s\S]*?)(?=\n\n|$)/);
      
      if (contractTextMatch && contractTextMatch[1].length > maxContractLength) {
        const truncatedText = contractTextMatch[1].substring(0, maxContractLength) + '\n\n[Text truncated for cost optimization]';
        return prompt.replace(contractTextMatch[1], truncatedText);
      }
    }
    
    return prompt;
  }

  /**
   * Parse and validate AI response
   */
  private parseAnalysisResponse(responseContent: string): any {
    try {
      // Parse the JSON response from OpenAI
      // With json_schema validation, the response should be properly structured
      const parsed = JSON.parse(responseContent);
      
      // Validate required fields
      if (!parsed.summary) {
        throw new Error('Missing summary in AI response');
      }
      
      // Ensure arrays exist to prevent runtime errors
      if (!Array.isArray(parsed.clauses)) {
        parsed.clauses = [];
      }
      if (!Array.isArray(parsed.risks)) {
        parsed.risks = [];
      }
      if (!Array.isArray(parsed.recommendations)) {
        parsed.recommendations = [];
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Response content:', responseContent);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  /**
   * Process and validate analysis result
   */
  private processAnalysisResult(rawResult: any, request: AnalysisRequest): ProcessedAnalysis {
    // Ensure arrays exist
    const clauses = Array.isArray(rawResult.clauses) ? rawResult.clauses : [];
    const risks = Array.isArray(rawResult.risks) ? rawResult.risks : [];
    const recommendations = Array.isArray(rawResult.recommendations) ? rawResult.recommendations : [];

    // Calculate statistics
    const highRiskCount = risks.filter((r: Risk) => r.severity === 'high').length;
    const criticalRiskCount = risks.filter((r: Risk) => r.severity === 'critical').length;

    // Calculate confidence score based on data quality
    const confidenceScore = this.calculateConfidenceScore(rawResult);

    return {
      summary: rawResult.summary || 'No summary provided',
      clauses: clauses.map((c: any, index: number) => ({
        id: c.id || `clause_${index}`,
        title: c.title || 'Untitled Clause',
        description: c.description || '',
        category: c.category || 'other',
        importance: c.importance || 'medium',
        pageNumber: c.pageNumber,
        section: c.section,
        extractedText: c.extractedText,
        confidence: c.confidence || 0.8
      })),
      risks: risks.map((r: any, index: number) => ({
        id: r.id || `risk_${index}`,
        title: r.title || 'Untitled Risk',
        description: r.description || '',
        severity: r.severity || 'medium',
        category: r.category || 'operational',
        impact: r.impact,
        probability: r.probability,
        mitigation: r.mitigation,
        pageNumber: r.pageNumber,
        section: r.section,
        confidence: r.confidence || 0.8
      })),
      recommendations: recommendations.map((r: any, index: number) => ({
        id: r.id || `rec_${index}`,
        title: r.title || 'Untitled Recommendation',
        description: r.description || '',
        priority: r.priority || 'medium',
        category: r.category || 'operational',
        implementation: r.implementation,
        timeline: r.timeline,
        effort: r.effort,
        impact: r.impact
      })),
      metadata: {
        totalClauses: clauses.length,
        totalRisks: risks.length,
        totalRecommendations: recommendations.length,
        highRiskCount,
        criticalRiskCount,
        confidenceScore,
        processingTime: 0, // Will be set by caller
        tokensUsed: 0, // Will be set by caller
        estimatedCost: 0 // Will be set by caller
      }
    };
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidenceScore(result: any): number {
    let score = 0.8; // Base score
    
    // Bonus for having summary
    if (result.summary && result.summary.length > 50) {
      score += 0.1;
    }
    
    // Bonus for having clauses
    if (Array.isArray(result.clauses) && result.clauses.length > 0) {
      score += 0.05;
    }
    
    // Bonus for having risks
    if (Array.isArray(result.risks) && result.risks.length > 0) {
      score += 0.05;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * COST_PER_1K_TOKENS.input;
    const outputCost = (outputTokens / 1000) * COST_PER_1K_TOKENS.output;
    return inputCost + outputCost;
  }

  /**
   * Get analysis queue status
   */
  public getQueueStatus(): { active: number; total: number } {
    return {
      active: this.analysisQueue.size,
      total: this.analysisQueue.size
    };
  }

  /**
   * Cancel analysis in queue
   */
  public cancelAnalysis(contractId: string, analysisType: string): boolean {
    const queueKey = `${contractId}-${analysisType}`;
    return this.analysisQueue.delete(queueKey);
  }
}

// Export singleton instance
export const aiAnalysisService = AIAnalysisService.getInstance(); 