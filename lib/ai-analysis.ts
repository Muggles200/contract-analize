import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

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
  // New options for long contract handling
  longContractOptions?: {
    enableChunking?: boolean;
    chunkSize?: number;
    enableSummarization?: boolean;
    enableHierarchicalAnalysis?: boolean;
    maxChunks?: number;
    chunkOverlap?: number;
  };
}

// New interfaces for long contract handling
export interface ContractChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  pageNumber?: number;
  section?: string;
  summary?: string;
  keyTerms?: string[];
  importance: 'low' | 'medium' | 'high';
}

export interface ChunkAnalysis {
  chunkId: string;
  summary: string;
  clauses: Clause[];
  risks: Risk[];
  recommendations: Recommendation[];
  keyTerms: string[];
  importance: 'low' | 'medium' | 'high';
  confidence: number;
  processingTime: number;
  tokensUsed: number;
  cost: number;
}

export interface HierarchicalAnalysis {
  executiveSummary: string;
  documentStructure: {
    sections: Array<{
      title: string;
      pageRange: string;
      importance: 'low' | 'medium' | 'high';
      summary: string;
      keyClauses: string[];
      risks: string[];
    }>;
  };
  consolidatedAnalysis: {
    summary: string;
    clauses: Clause[];
    risks: Risk[];
    recommendations: Recommendation[];
    extractedMetadata: ContractMetadata;
  };
  chunkAnalyses: ChunkAnalysis[];
  metadata: {
    totalChunks: number;
    totalPages: number;
    processingTime: number;
    tokensUsed: number;
    estimatedCost: number;
    chunkingStrategy: string;
    qualityMetrics: {
      coverageScore: number;
      consistencyScore: number;
      completenessScore: number;
    };
  };
}

export interface AnalysisResponse {
  success: boolean;
  result?: any;
  error?: string;
  refusal?: string; // Added for handling AI refusals
  errorType?: string; // Added for error classification
  processingTime?: number;
  tokensUsed?: number;
  cost?: number;
  // New fields for long contract handling
  isLongContract?: boolean;
  chunkingInfo?: {
    totalChunks: number;
    chunkingStrategy: string;
    coveragePercentage: number;
  };
  hierarchicalAnalysis?: HierarchicalAnalysis;
}

export interface Clause {
  id: string;
  title: string;
  description: string;
  category: 'payment' | 'termination' | 'liability' | 'confidentiality' | 'intellectual_property' | 'dispute_resolution' | 'force_majeure' | 'indemnification' | 'warranties' | 'other';
  importance: 'low' | 'medium' | 'high';
  pageNumber?: number;
  section?: string;
  extractedText?: string;
  confidence: number;
  metadata?: {
    lineNumbers?: number[];
    relatedClauses?: string[];
    legalImplications?: string;
  };
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'legal' | 'operational' | 'compliance' | 'reputational' | 'technical' | 'regulatory';
  impact: string;
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  mitigation: string;
  pageNumber?: number;
  section?: string;
  confidence: number;
  metadata?: {
    affectedClauses?: string[];
    regulatoryReferences?: string[];
    precedentCases?: string[];
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'legal' | 'financial' | 'operational' | 'compliance' | 'risk_mitigation' | 'negotiation' | 'documentation';
  implementation: string;
  timeline: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  effort: 'minimal' | 'low' | 'medium' | 'high' | 'extensive';
  impact: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: string;
  stakeholders?: string[];
}

export interface ContractMetadata {
  parties: {
    primary: string;
    secondary: string;
    additional?: string[];
  };
  dates: {
    effective?: string;
    expiration?: string;
    signed?: string;
  };
  financial: {
    totalValue?: number;
    currency?: string;
    paymentTerms?: string;
    penalties?: string;
  };
  jurisdiction: {
    governingLaw?: string;
    courts?: string;
    disputeResolution?: string;
  };
  contractType: string;
  confidenceScore: number;
}

export interface ProcessedAnalysis {
  summary: string;
  clauses: Clause[];
  risks: Risk[];
  recommendations: Recommendation[];
  extractedMetadata: ContractMetadata;
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
    qualityMetrics: {
      clauseCompleteness: number;
      riskAssessmentDepth: number;
      recommendationActionability: number;
    };
  };
}

// Enhanced JSON Schemas for different analysis types
const JSON_SCHEMAS = {
  chunk_analysis: {
    name: "chunk_contract_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Brief summary of this contract section"
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
                enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "dispute_resolution", "force_majeure", "indemnification", "warranties", "other"]
              },
              importance: { 
                type: "string",
                enum: ["low", "medium", "high"]
              },
              extractedText: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["id", "title", "description", "category", "importance", "extractedText", "confidence"],
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
              category: { 
                type: "string",
                enum: ["financial", "legal", "operational", "compliance", "reputational", "technical", "regulatory"]
              },
              impact: { type: "string" },
              probability: { 
                type: "string",
                enum: ["very_low", "low", "medium", "high", "very_high"]
              },
              mitigation: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["id", "title", "description", "severity", "category", "impact", "probability", "mitigation", "confidence"],
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
                enum: ["low", "medium", "high", "urgent"]
              },
              category: { 
                type: "string",
                enum: ["legal", "financial", "operational", "compliance", "risk_mitigation", "negotiation", "documentation"]
              },
              implementation: { type: "string" },
              timeline: { 
                type: "string",
                enum: ["immediate", "short_term", "medium_term", "long_term"]
              },
              effort: { 
                type: "string",
                enum: ["minimal", "low", "medium", "high", "extensive"]
              },
              impact: { 
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              }
            },
            required: ["id", "title", "description", "priority", "category", "implementation", "timeline", "effort", "impact"],
            additionalProperties: false
          }
        },
        keyTerms: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["summary", "clauses", "risks", "recommendations", "keyTerms"],
      additionalProperties: false
    }
  },
  comprehensive: {
    name: "comprehensive_contract_analysis",
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
                enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "dispute_resolution", "force_majeure", "indemnification", "warranties", "other"]
              },
              importance: { 
                type: "string",
                enum: ["low", "medium", "high"]
              },
              pageNumber: { type: "number" },
              section: { type: "string" },
              extractedText: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              },
              metadata: {
                type: "object",
                properties: {
                  lineNumbers: {
                    type: "array",
                    items: { type: "number" }
                  },
                  relatedClauses: {
                    type: "array",
                    items: { type: "string" }
                  },
                  legalImplications: { type: "string" }
                },
                required: ["lineNumbers", "relatedClauses", "legalImplications"],
                additionalProperties: false
              }
            },
            required: ["id", "title", "description", "category", "importance", "pageNumber", "section", "extractedText", "confidence", "metadata"],
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
              category: { 
                type: "string",
                enum: ["financial", "legal", "operational", "compliance", "reputational", "technical", "regulatory"]
              },
              impact: { type: "string" },
              probability: { 
                type: "string",
                enum: ["very_low", "low", "medium", "high", "very_high"]
              },
              mitigation: { type: "string" },
              pageNumber: { type: "number" },
              section: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              },
              metadata: {
                type: "object",
                properties: {
                  affectedClauses: {
                    type: "array",
                    items: { type: "string" }
                  },
                  regulatoryReferences: {
                    type: "array",
                    items: { type: "string" }
                  },
                  precedentCases: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["affectedClauses", "regulatoryReferences", "precedentCases"],
                additionalProperties: false
              }
            },
            required: ["id", "title", "description", "severity", "category", "impact", "probability", "mitigation", "pageNumber", "section", "confidence", "metadata"],
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
                enum: ["low", "medium", "high", "urgent"]
              },
              category: { 
                type: "string",
                enum: ["legal", "financial", "operational", "compliance", "risk_mitigation", "negotiation", "documentation"]
              },
              implementation: { type: "string" },
              timeline: { 
                type: "string",
                enum: ["immediate", "short_term", "medium_term", "long_term"]
              },
              effort: { 
                type: "string",
                enum: ["minimal", "low", "medium", "high", "extensive"]
              },
              impact: { 
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              },
              estimatedCost: { type: "string" },
              stakeholders: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["id", "title", "description", "priority", "category", "implementation", "timeline", "effort", "impact", "estimatedCost", "stakeholders"],
            additionalProperties: false
          }
        },
        extractedMetadata: {
          type: "object",
          properties: {
            parties: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "string" },
                additional: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["primary", "secondary", "additional"],
              additionalProperties: false
            },
            dates: {
              type: "object",
              properties: {
                effective: { type: "string" },
                expiration: { type: "string" },
                signed: { type: "string" }
              },
              required: ["effective", "expiration", "signed"],
              additionalProperties: false
            },
            financial: {
              type: "object",
              properties: {
                totalValue: { type: "number" },
                currency: { type: "string" },
                paymentTerms: { type: "string" },
                penalties: { type: "string" }
              },
              required: ["totalValue", "currency", "paymentTerms", "penalties"],
              additionalProperties: false
            },
            jurisdiction: {
              type: "object",
              properties: {
                governingLaw: { type: "string" },
                courts: { type: "string" },
                disputeResolution: { type: "string" }
              },
              required: ["governingLaw", "courts", "disputeResolution"],
              additionalProperties: false
            },
            contractType: { type: "string" },
            confidenceScore: { 
              type: "number",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["parties", "dates", "financial", "jurisdiction", "contractType", "confidenceScore"],
          additionalProperties: false
        },
        qualityMetrics: {
          type: "object",
          properties: {
            clauseCompleteness: { 
              type: "number",
              minimum: 0,
              maximum: 1
            },
            riskAssessmentDepth: { 
              type: "number",
              minimum: 0,
              maximum: 1
            },
            recommendationActionability: { 
              type: "number",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["clauseCompleteness", "riskAssessmentDepth", "recommendationActionability"],
          additionalProperties: false
        }
      },
      required: ["summary", "clauses", "risks", "recommendations", "extractedMetadata", "qualityMetrics"],
      additionalProperties: false
    }
  },

  'risk-assessment': {
    name: "risk_focused_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Risk assessment summary"
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
              category: { 
                type: "string",
                enum: ["financial", "legal", "operational", "compliance", "reputational", "technical", "regulatory"]
              },
              impact: { type: "string" },
              probability: { 
                type: "string",
                enum: ["very_low", "low", "medium", "high", "very_high"]
              },
              mitigation: { type: "string" },
              pageNumber: { type: "number" },
              section: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["id", "title", "description", "severity", "category", "impact", "probability", "mitigation", "pageNumber", "section", "confidence"],
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
                enum: ["low", "medium", "high", "urgent"]
              },
              category: { 
                type: "string",
                enum: ["risk_mitigation"]
              },
              implementation: { type: "string" },
              timeline: { 
                type: "string",
                enum: ["immediate", "short_term", "medium_term", "long_term"]
              },
              effort: { 
                type: "string",
                enum: ["minimal", "low", "medium", "high", "extensive"]
              },
              impact: { 
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              }
            },
            required: ["id", "title", "description", "priority", "category", "implementation", "timeline", "effort", "impact"],
            additionalProperties: false
          }
        },
        qualityMetrics: {
          type: "object",
          properties: {
            riskAssessmentDepth: { 
              type: "number",
              minimum: 0,
              maximum: 1
            },
            recommendationActionability: { 
              type: "number",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["riskAssessmentDepth", "recommendationActionability"],
          additionalProperties: false
        }
      },
      required: ["summary", "risks", "recommendations", "qualityMetrics"],
      additionalProperties: false
    }
  },

  'clause-extraction': {
    name: "clause_extraction",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Clause extraction summary"
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
                enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "dispute_resolution", "force_majeure", "indemnification", "warranties", "other"]
              },
              importance: { 
                type: "string",
                enum: ["low", "medium", "high"]
              },
              pageNumber: { type: "number" },
              section: { type: "string" },
              extractedText: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["id", "title", "description", "category", "importance", "pageNumber", "section", "extractedText", "confidence"],
            additionalProperties: false
          }
        },
        qualityMetrics: {
          type: "object",
          properties: {
            clauseCompleteness: { 
              type: "number",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["clauseCompleteness"],
          additionalProperties: false
        }
      },
      required: ["summary", "clauses", "qualityMetrics"],
      additionalProperties: false
    }
  },

  basic: {
    name: "basic_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Basic contract summary"
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
                enum: ["other"]
              },
              importance: { 
                type: "string",
                enum: ["medium"]
              },
              pageNumber: { type: "number" },
              extractedText: { type: "string" },
              confidence: { 
                type: "number",
                minimum: 0,
                maximum: 1
              }
            },
            required: ["id", "title", "description", "category", "importance", "pageNumber", "extractedText", "confidence"],
            additionalProperties: false
          }
        },
        qualityMetrics: {
          type: "object",
          properties: {
            clauseCompleteness: { 
              type: "number",
              minimum: 0,
              maximum: 1
            }
          },
          required: ["clauseCompleteness"],
          additionalProperties: false
        }
      },
      required: ["summary", "clauses", "qualityMetrics"],
      additionalProperties: false
    }
  }
};

// Enhanced prompt templates optimized for structured outputs
const PROMPT_TEMPLATES = {
  comprehensive: `You are an expert contract analyst with deep expertise in legal document analysis, risk assessment, and contract management. Analyze the provided contract comprehensively and extract all key information with high precision.

CONTRACT TO ANALYZE:
{contractText}

CONTRACT METADATA:
- File Name: {fileName}
- Contract Type: {contractType}
- Jurisdiction: {jurisdiction}
- Contract Value: {contractValue}
- Parties: {parties}

ANALYSIS REQUIREMENTS:

1. EXECUTIVE SUMMARY: Provide a comprehensive 2-3 paragraph summary covering the contract's purpose, key terms, major obligations, and overall assessment.

2. CLAUSE EXTRACTION: Identify and extract ALL significant clauses, including:
   - Payment terms and financial obligations
   - Termination conditions and notice periods
   - Liability limitations and indemnification
   - Confidentiality and non-disclosure provisions
   - Intellectual property rights and ownership
   - Dispute resolution mechanisms
   - Force majeure provisions
   - Warranties and representations
   - Any other material terms

3. RISK ASSESSMENT: Conduct thorough risk analysis covering:
   - Financial risks (payment defaults, cost overruns, penalties)
   - Legal risks (regulatory compliance, enforceability issues)
   - Operational risks (performance failures, delivery delays)
   - Compliance risks (regulatory violations, audit issues)
   - Reputational risks (public relations impacts)
   - Technical risks (system failures, data breaches)
   - Regulatory risks (changing laws, licensing issues)

4. METADATA EXTRACTION: Extract structured contract metadata including:
   - All parties (primary, secondary, additional)
   - Critical dates (effective, expiration, signing dates)
   - Financial terms (total value, currency, payment schedules)
   - Jurisdiction details (governing law, court jurisdiction, dispute resolution)

5. RECOMMENDATIONS: Provide actionable recommendations with specific implementation guidance.

6. QUALITY METRICS: Assess the analysis quality and completeness.

CONFIDENCE SCORING: Assign confidence scores (0.0-1.0) based on:
- Text clarity and specificity
- Legal terminology precision
- Context availability
- Cross-referencing ability

Focus on accuracy, completeness, and actionable insights. Ensure all extracted information is properly categorized and includes confidence scores.

IMPORTANT OUTPUT REQUIREMENTS:
- Return your analysis as a valid JSON object that conforms to the specified schema
- Ensure all required fields are present and properly formatted
- Keep descriptions informative but concise to stay within token limits
- Use appropriate confidence scores (0.0-1.0) to indicate the quality of your analysis
- If the contract is very long, prioritize the most critical information first`,

  'risk-assessment': `You are a specialized contract risk assessment expert with extensive experience in identifying, evaluating, and mitigating contractual risks across various industries and jurisdictions.

CONTRACT TO ANALYZE:
{contractText}

CONTRACT METADATA:
- File Name: {fileName}
- Contract Type: {contractType}
- Jurisdiction: {jurisdiction}
- Contract Value: {contractValue}

RISK ASSESSMENT OBJECTIVES:

1. COMPREHENSIVE RISK IDENTIFICATION: Systematically identify ALL potential risks including:
   - Financial risks: Payment defaults, cost escalations, currency fluctuations, penalties
   - Legal risks: Regulatory non-compliance, enforceability issues, jurisdiction problems
   - Operational risks: Performance failures, delivery delays, quality issues
   - Compliance risks: Regulatory violations, audit failures, licensing issues
   - Reputational risks: Public relations impacts, brand damage, stakeholder concerns
   - Technical risks: System failures, data breaches, technology obsolescence
   - Regulatory risks: Changing regulations, licensing requirements, government policy shifts

2. RISK SEVERITY ASSESSMENT: Evaluate each risk using:
   - Impact magnitude (financial, operational, legal consequences)
   - Probability likelihood (very_low, low, medium, high, very_high)
   - Detectability and warning signs
   - Time sensitivity and urgency

3. MITIGATION STRATEGIES: For each identified risk, provide:
   - Specific mitigation actions
   - Implementation timelines
   - Resource requirements
   - Monitoring mechanisms
   - Contingency plans

4. PRIORITIZATION: Rank risks by urgency and provide actionable recommendations focused on risk mitigation.

Assign confidence scores (0.0-1.0) based on evidence clarity, risk visibility, and assessment certainty. Focus on practical, implementable risk mitigation strategies.

IMPORTANT OUTPUT REQUIREMENTS:
- Return your analysis as a valid JSON object that conforms to the specified schema
- Ensure all required fields are present and properly formatted
- Keep risk descriptions clear and actionable within token limits
- Use appropriate confidence scores to indicate assessment certainty`,

  'clause-extraction': `You are a specialized contract clause extraction expert with deep knowledge of legal document structure, contractual language patterns, and clause categorization across multiple contract types.

CONTRACT TO ANALYZE:
{contractText}

CONTRACT METADATA:
- File Name: {fileName}
- Contract Type: {contractType}

CLAUSE EXTRACTION OBJECTIVES:

1. SYSTEMATIC CLAUSE IDENTIFICATION: Extract ALL significant contractual clauses including:
   - Payment terms: Due dates, amounts, methods, late fees, currency specifications
   - Termination provisions: Notice periods, conditions, procedures, consequences
   - Liability limitations: Caps, exclusions, indemnification requirements
   - Confidentiality terms: Scope, duration, exceptions, disclosure restrictions
   - Intellectual property: Ownership, licensing, usage rights, restrictions
   - Dispute resolution: Arbitration, mediation, court jurisdiction, governing law
   - Force majeure: Events covered, notification requirements, remedy procedures
   - Indemnification: Scope, limits, procedures, defense obligations
   - Warranties: Express, implied, disclaimers, duration, remedies
   - Other material terms: Performance standards, compliance requirements, reporting obligations

2. CLAUSE CATEGORIZATION: Accurately categorize each clause with appropriate importance levels:
   - High importance: Critical business terms, significant financial obligations, major legal obligations
   - Medium importance: Supporting terms, standard provisions, procedural requirements
   - Low importance: Administrative details, standard boilerplate, minor procedural terms

3. EXTRACTION PRECISION: For each clause provide:
   - Exact extracted text from the contract
   - Clear, concise description
   - Page/section references where available
   - Confidence assessment based on text clarity and completeness

4. QUALITY ASSESSMENT: Evaluate clause completeness and extraction accuracy.

Focus on precision, completeness, and proper categorization. Ensure extracted text is verbatim and descriptions are accurate.

IMPORTANT OUTPUT REQUIREMENTS:
- Return your analysis as a valid JSON object that conforms to the specified schema
- Ensure all required fields are present and properly formatted
- Include exact extracted text and accurate descriptions
- Use appropriate confidence scores for extraction quality`,

  basic: `You are a contract analyst providing essential contract analysis for quick understanding and basic risk awareness.

CONTRACT TO ANALYZE:
{contractText}

CONTRACT METADATA:
- File Name: {fileName}

BASIC ANALYSIS OBJECTIVES:

1. CONTRACT OVERVIEW: Provide a clear, concise summary covering:
   - Contract purpose and scope
   - Key parties and their roles
   - Primary obligations and rights
   - Duration and key dates

2. ESSENTIAL CLAUSE IDENTIFICATION: Extract the most important clauses that any stakeholder should understand:
   - Core business terms
   - Key obligations
   - Important deadlines
   - Critical conditions

3. QUALITY ASSESSMENT: Evaluate the completeness of the basic analysis.

Focus on clarity and accessibility. Provide essential information for quick contract understanding without overwhelming detail.

IMPORTANT OUTPUT REQUIREMENTS:
- Return your analysis as a valid JSON object that conforms to the specified schema
- Ensure all required fields are present and properly formatted
- Keep information clear and concise for quick understanding`
};

// Function definitions for specialized analysis tasks
const ANALYSIS_FUNCTIONS = {
  extractContractMetadata: {
    name: "extract_contract_metadata",
    description: "Extract structured metadata from contract text including parties, dates, financial terms, and jurisdiction information",
    parameters: {
      type: "object",
      properties: {
        parties: {
          type: "object",
          properties: {
            primary: { type: "string", description: "Primary contracting party" },
            secondary: { type: "string", description: "Secondary contracting party" },
            additional: { 
              type: "array", 
              items: { type: "string" },
              description: "Additional parties involved"
            }
          },
          required: ["primary", "secondary", "additional"],
          additionalProperties: false
        },
        dates: {
          type: "object",
          properties: {
            effective: { type: "string", description: "Contract effective date (ISO format)" },
            expiration: { type: "string", description: "Contract expiration date (ISO format)" },
            signed: { type: "string", description: "Contract signing date (ISO format)" }
          },
          required: ["effective", "expiration", "signed"],
          additionalProperties: false
        },
        financial: {
          type: "object",
          properties: {
            totalValue: { type: "number", description: "Total contract value" },
            currency: { type: "string", description: "Currency code (e.g., USD, EUR)" },
            paymentTerms: { type: "string", description: "Payment terms description" },
            penalties: { type: "string", description: "Penalty terms description" }
          },
          required: ["totalValue", "currency", "paymentTerms", "penalties"],
          additionalProperties: false
        },
        jurisdiction: {
          type: "object",
          properties: {
            governingLaw: { type: "string", description: "Governing law jurisdiction" },
            courts: { type: "string", description: "Court jurisdiction" },
            disputeResolution: { type: "string", description: "Dispute resolution mechanism" }
          },
          required: ["governingLaw", "courts", "disputeResolution"],
          additionalProperties: false
        },
        contractType: { type: "string", description: "Type of contract" },
        confidenceScore: { 
          type: "number", 
          minimum: 0, 
          maximum: 1,
          description: "Confidence score for metadata extraction accuracy"
        }
      },
      required: ["parties", "dates", "financial", "jurisdiction", "contractType", "confidenceScore"],
      additionalProperties: false
    }
  },

  calculateRiskScore: {
    name: "calculate_risk_score",
    description: "Calculate comprehensive risk score and risk metrics for the contract",
    parameters: {
      type: "object",
      properties: {
        overallRiskScore: { 
          type: "number", 
          minimum: 0, 
          maximum: 10,
          description: "Overall risk score from 0 (lowest risk) to 10 (highest risk)"
        },
        riskBreakdown: {
          type: "object",
          properties: {
            financial: { type: "number", minimum: 0, maximum: 10 },
            legal: { type: "number", minimum: 0, maximum: 10 },
            operational: { type: "number", minimum: 0, maximum: 10 },
            compliance: { type: "number", minimum: 0, maximum: 10 },
            reputational: { type: "number", minimum: 0, maximum: 10 }
          },
          required: ["financial", "legal", "operational", "compliance", "reputational"],
          additionalProperties: false
        },
        riskFactors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              factor: { type: "string" },
              impact: { type: "number", minimum: 0, maximum: 10 },
              likelihood: { type: "number", minimum: 0, maximum: 10 },
              description: { type: "string" }
            },
            required: ["factor", "impact", "likelihood", "description"],
            additionalProperties: false
          }
        },
        confidence: { 
          type: "number", 
          minimum: 0, 
          maximum: 1,
          description: "Confidence in risk assessment accuracy"
        }
      },
      required: ["overallRiskScore", "riskBreakdown", "riskFactors", "confidence"],
      additionalProperties: false
    }
  },

  validateClauseCompleteness: {
    name: "validate_clause_completeness",
    description: "Validate completeness of extracted clauses and identify missing standard clauses",
    parameters: {
      type: "object",
      properties: {
        presentClauses: {
          type: "array",
          items: { 
            type: "string",
            enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "dispute_resolution", "force_majeure", "indemnification", "warranties", "governing_law", "assignment", "modification"]
          },
          description: "List of clause types found in the contract"
        },
        missingClauses: {
          type: "array",
          items: { 
            type: "string",
            enum: ["payment", "termination", "liability", "confidentiality", "intellectual_property", "dispute_resolution", "force_majeure", "indemnification", "warranties", "governing_law", "assignment", "modification"]
          },
          description: "List of standard clause types missing from the contract"
        },
        criticalMissing: {
          type: "array",
          items: { type: "string" },
          description: "List of critically important missing clauses"
        },
        completenessScore: { 
          type: "number", 
          minimum: 0, 
          maximum: 1,
          description: "Clause completeness score"
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              missingClause: { type: "string" },
              importance: { type: "string", enum: ["critical", "important", "recommended"] },
              reason: { type: "string" },
              suggestedLanguage: { type: "string" }
            },
            required: ["missingClause", "importance", "reason", "suggestedLanguage"],
            additionalProperties: false
          }
        }
      },
      required: ["presentClauses", "missingClauses", "criticalMissing", "completenessScore", "recommendations"],
      additionalProperties: false
    }
  },

  chunkAnalysis: {
    name: "chunk_analysis",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        clauses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              importance: { type: "string" },
              extractedText: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["id", "title", "description", "category", "importance", "extractedText", "confidence"],
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
              severity: { type: "string" },
              category: { type: "string" },
              impact: { type: "string" },
              probability: { type: "string" },
              mitigation: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["id", "title", "description", "severity", "category", "impact", "probability", "mitigation", "confidence"],
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
              priority: { type: "string" },
              category: { type: "string" },
              implementation: { type: "string" },
              timeline: { type: "string" },
              effort: { type: "string" },
              impact: { type: "string" }
            },
            required: ["id", "title", "description", "priority", "category", "implementation", "timeline", "effort", "impact"],
            additionalProperties: false
          }
        },
        keyTerms: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["summary", "clauses", "risks", "recommendations", "keyTerms"],
      additionalProperties: false
    }
  }
};

// Cost calculation based on OpenAI pricing
const COST_PER_1K_TOKENS = {
  // Main analysis uses gpt-4.1-2025-04-14
  main: {
    input: 0.002,   // $0.002 per 1K input tokens (gpt-4.1)
    output: 0.008   // $0.008 per 1K output tokens (gpt-4.1)
  },
  // Chunk analysis uses gpt-4o-mini-2024-07-18  
  chunk: {
    input: 0.00015,  // $0.00015 per 1K input tokens (gpt-4o-mini)
    output: 0.0006   // $0.0006 per 1K output tokens (gpt-4o-mini)
  }
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
   * Perform the actual AI analysis with enhanced features
   */
  private async performAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Validate input and contract quality
      const contractQualityCheck = this.validateContractQuality(request.contractText);
      if (!contractQualityCheck.isValid) {
        return {
          success: false,
          error: contractQualityCheck.issues.join('; '),
          errorType: 'validation_error',
          processingTime: Date.now() - startTime
        };
      }
      
      // Log quality suggestions for improvement
      if (contractQualityCheck.suggestions.length > 0) {
        console.log('💡 Contract quality suggestions:', contractQualityCheck.suggestions);
      }

      // Check if this is a long contract that needs special handling
      const isLongContract = this.isLongContract(request.contractText, request.longContractOptions);
      
      if (isLongContract && request.longContractOptions?.enableChunking) {
        console.log('📄 Long contract detected, using chunking strategy...');
        return await this.analyzeLongContract(request);
      }

      // Standard analysis for normal-sized contracts
      let analysisResult;
      if (request.analysisType === 'comprehensive') {
        analysisResult = await this.performEnhancedAnalysis(request);
      } else {
        const mainResult = await this.performMainAnalysis(request);
        const responseContent = mainResult.choices[0]?.message?.content || '{}';
        
        try {
          analysisResult = {
            analysis: JSON.parse(responseContent),
            usage: mainResult.usage
          };
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.error('Response content length:', responseContent.length);
          console.error('Response content preview:', responseContent.substring(0, 200) + '...');
          throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}. This may indicate the response was truncated due to token limits.`);
        }
      }

      // Enhanced response handling with refusal support
      if (!analysisResult.analysis) {
        throw new Error('No analysis result received');
      }

      // Calculate costs
      const tokensUsed = analysisResult.usage?.total_tokens || 0;
      const cost = this.calculateCost(
        analysisResult.usage?.prompt_tokens || 0,
        analysisResult.usage?.completion_tokens || 0
      );

      // Process and validate the analysis with enhanced validation
      const processedAnalysis = this.processAnalysisResult(analysisResult.analysis, request);

      // Validate analysis quality
      const qualityCheck = this.validateAnalysisQuality(processedAnalysis, request);
      if (!qualityCheck.isValid) {
        console.warn('Analysis quality issues detected:', qualityCheck.issues);
        // Still return the analysis but with warnings
      }

      return {
        success: true,
        result: processedAnalysis,
        tokensUsed,
        cost,
        processingTime: Date.now() - startTime,
        isLongContract: false
      };

    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Enhanced error classification
      const errorType = this.classifyError(error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        errorType,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Enhanced analysis with function calling for specialized tasks
   */
  private async performEnhancedAnalysis(request: AnalysisRequest): Promise<any> {
    const promises = [];

    // Main analysis with structured outputs
    promises.push(this.performMainAnalysis(request));

    // Function calling for specialized tasks
    if (request.analysisType === 'comprehensive') {
      promises.push(this.extractMetadataWithFunctionCalling(request));
      promises.push(this.calculateRiskScoreWithFunctionCalling(request));
      promises.push(this.validateClauseCompletenessWithFunctionCalling(request));
    }

    const results = await Promise.all(promises);
    
    // Combine results
    return this.combineAnalysisResults(results, request);
  }

  /**
   * Perform main analysis with structured outputs
   */
  private async performMainAnalysis(request: AnalysisRequest): Promise<any> {
    // This is the existing analysis logic
    const promptTemplate = PROMPT_TEMPLATES[request.analysisType];
    const prompt = this.preparePrompt(promptTemplate, request);
    const optimizedPrompt = this.optimizePromptForCost(prompt, this.getMaxTokens(request.analysisType));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14', // Latest model with better performance and lower cost
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
      max_tokens: this.getMaxTokens(request.analysisType),
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: JSON_SCHEMAS[request.analysisType]
      }
    });

    return completion;
  }

  /**
   * Extract metadata using function calling
   */
  private async extractMetadataWithFunctionCalling(request: AnalysisRequest): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-2025-04-14', // Latest model for better metadata extraction
        messages: [
          {
            role: 'system',
            content: 'You are a metadata extraction specialist. Extract structured metadata from the contract text with high precision.'
          },
          {
            role: 'user',
            content: `Extract comprehensive metadata from this contract:\n\n${request.contractText.substring(0, 8000)}`
          }
        ],
                 tools: [
           {
             type: "function",
             function: {
               ...ANALYSIS_FUNCTIONS.extractContractMetadata,
               strict: true
             }
           }
         ],
        tool_choice: {
          type: "function",
          function: { name: "extract_contract_metadata" }
        },
        temperature: 0.1
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall?.function) {
        return JSON.parse(toolCall.function.arguments);
      }

      return null;
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return null;
    }
  }

  /**
   * Calculate risk score using function calling
   */
  private async calculateRiskScoreWithFunctionCalling(request: AnalysisRequest): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-2025-04-14', // Latest model for better risk assessment
        messages: [
          {
            role: 'system',
            content: 'You are a risk assessment specialist. Calculate comprehensive risk scores and identify risk factors.'
          },
          {
            role: 'user',
            content: `Analyze and score the risks in this contract:\n\n${request.contractText.substring(0, 8000)}`
          }
        ],
                 tools: [
           {
             type: "function",
             function: {
               ...ANALYSIS_FUNCTIONS.calculateRiskScore,
               strict: true
             }
           }
         ],
        tool_choice: {
          type: "function",
          function: { name: "calculate_risk_score" }
        },
        temperature: 0.1
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall?.function) {
        return JSON.parse(toolCall.function.arguments);
      }

      return null;
    } catch (error) {
      console.error('Risk scoring error:', error);
      return null;
    }
  }

  /**
   * Validate clause completeness using function calling
   */
  private async validateClauseCompletenessWithFunctionCalling(request: AnalysisRequest): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-2025-04-14', // Latest model for better clause validation
        messages: [
          {
            role: 'system',
            content: 'You are a clause completeness validator. Identify present and missing clauses in contracts.'
          },
          {
            role: 'user',
            content: `Validate clause completeness for this ${request.contractMetadata.contractType || 'contract'}:\n\n${request.contractText.substring(0, 8000)}`
          }
        ],
                 tools: [
           {
             type: "function",
             function: {
               ...ANALYSIS_FUNCTIONS.validateClauseCompleteness,
               strict: true
             }
           }
         ],
        tool_choice: {
          type: "function",
          function: { name: "validate_clause_completeness" }
        },
        temperature: 0.1
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall?.function) {
        return JSON.parse(toolCall.function.arguments);
      }

      return null;
    } catch (error) {
      console.error('Clause validation error:', error);
      return null;
    }
  }

  /**
   * Combine results from main analysis and function calling
   */
  private combineAnalysisResults(results: any[], request: AnalysisRequest): any {
    const [mainResult, metadataResult, riskScoreResult, clauseValidationResult] = results;
    
    // Parse main analysis result
    const choice = mainResult.choices[0];
    let mainAnalysis: any = {};
    
    if (choice?.message?.content) {
      try {
        mainAnalysis = JSON.parse(choice.message.content);
        console.log('✅ Main analysis JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ Main analysis JSON parsing failed:', parseError);
        console.error('📄 Content length:', choice.message.content.length);
        console.error('📝 Content preview:', choice.message.content.substring(0, 500));
        console.error('📄 Content ending:', choice.message.content.substring(-200));
        
        // Check if content was truncated
        if (choice.message.content.length >= 7000) {
          console.warn('⚠️  Response appears to be truncated (length >= 7000 chars)');
        }
        
        // Try to recover the JSON
        console.log('🔧 Attempting JSON recovery...');
        mainAnalysis = this.attemptJSONRecovery(choice.message.content, { 
          id: 'main_analysis', 
          content: '', 
          startIndex: 0, 
          endIndex: 0, 
          importance: 'high' 
        } as ContractChunk);
      }
    }

    // Enhance main analysis with function calling results
    if (metadataResult) {
      mainAnalysis.extractedMetadata = metadataResult;
    }

    if (riskScoreResult) {
      mainAnalysis.riskScoring = riskScoreResult;
    }

    if (clauseValidationResult) {
      mainAnalysis.clauseValidation = clauseValidationResult;
    }

    // Enhance quality metrics
    if (mainAnalysis.qualityMetrics) {
      if (clauseValidationResult?.completenessScore) {
        mainAnalysis.qualityMetrics.clauseCompleteness = clauseValidationResult.completenessScore;
      }
      if (riskScoreResult?.confidence) {
        mainAnalysis.qualityMetrics.riskAssessmentDepth = riskScoreResult.confidence;
      }
    }

    return {
      analysis: mainAnalysis,
      usage: mainResult.usage,
      functionCallResults: {
        metadata: metadataResult,
        riskScoring: riskScoreResult,
        clauseValidation: clauseValidationResult
      }
    };
  }

  /**
   * Prepare prompt with contract data
   */
  private preparePrompt(template: string, request: AnalysisRequest): string {
    if (!template) {
      throw new Error(`Invalid analysis type: ${request.analysisType}. Supported types: comprehensive, risk-assessment, clause-extraction, basic`);
    }
    
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
        return 8000; // Increased for complex JSON responses
      case 'risk-assessment':
        return 6000; // Increased for detailed risk analysis
      case 'clause-extraction':
        return 5000; // Increased for clause details
      case 'basic':
        return 4000; // Increased for basic analysis
      default:
        return 6000; // Higher default for safety
    }
  }

  /**
   * Optimize prompt for cost efficiency
   */
  private optimizePromptForCost(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokenUsage(prompt);
    
    // Reserve tokens for output (50% of max tokens for structured outputs)
    const inputTokenLimit = Math.floor(maxTokens * 0.5);
    
    if (estimatedTokens > inputTokenLimit) {
      // Conservative truncation - target 80% of input limit to ensure structured response integrity
      const targetTokens = Math.floor(inputTokenLimit * 0.8);
      const targetCharacters = targetTokens * 4; // Conservative estimation
      
      if (prompt.length > targetCharacters) {
        // Find the contract text and truncate it
        const contractTextStart = prompt.indexOf('CONTRACT TO ANALYZE:');
        const contractTextEnd = prompt.indexOf('\n\nCONTRACT METADATA:', contractTextStart);
        
        if (contractTextStart !== -1 && contractTextEnd !== -1) {
          const beforeContract = prompt.substring(0, contractTextStart);
          const afterContract = prompt.substring(contractTextEnd);
          const availableForContract = targetCharacters - beforeContract.length - afterContract.length - 100; // Buffer
          
          if (availableForContract > 1000) { // Minimum contract text
            const contractSection = prompt.substring(contractTextStart, contractTextEnd);
            const contractLines = contractSection.split('\n');
            const header = contractLines[0] + '\n'; // Keep "CONTRACT TO ANALYZE:" line
            const contractText = contractLines.slice(1).join('\n');
            
            const truncatedContract = contractText.substring(0, availableForContract - header.length);
            const optimizedContract = header + truncatedContract + '\n\n[Contract text truncated for token limit compliance]';
            
            return beforeContract + optimizedContract + afterContract;
          }
        }
        
        // Fallback: simple truncation
        return prompt.substring(0, targetCharacters) + '\n\n[Prompt truncated for token limit compliance]';
      }
    }
    
    return prompt;
  }

  /**
   * Parse and validate AI response
   */
  private parseAnalysisResponse(responseContent: string, analysisType?: string): any {
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
      extractedMetadata: rawResult.extractedMetadata || {
        parties: { primary: 'Unknown', secondary: 'Unknown' },
        contractType: 'Unknown',
        confidenceScore: 0.8
      },
      metadata: {
        totalClauses: clauses.length,
        totalRisks: risks.length,
        totalRecommendations: recommendations.length,
        highRiskCount,
        criticalRiskCount,
        confidenceScore,
        processingTime: 0, // Will be set by caller
        tokensUsed: 0, // Will be set by caller
        estimatedCost: 0, // Will be set by caller
        qualityMetrics: {
          clauseCompleteness: this.calculateClauseCompleteness(rawResult),
          riskAssessmentDepth: this.calculateRiskAssessmentDepth(rawResult),
          recommendationActionability: this.calculateRecommendationActionability(rawResult)
        }
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
  private calculateCost(inputTokens: number, outputTokens: number, isChunkAnalysis: boolean = false): number {
    const rates = isChunkAnalysis ? COST_PER_1K_TOKENS.chunk : COST_PER_1K_TOKENS.main;
    const inputCost = (inputTokens / 1000) * rates.input;
    const outputCost = (outputTokens / 1000) * rates.output;
    return inputCost + outputCost;
  }

  /**
   * Calculate clause completeness
   */
  private calculateClauseCompleteness(result: any): number {
    const totalExpectedClauses = 10; // Example: estimate total clauses
    const extractedClauses = Array.isArray(result.clauses) ? result.clauses.length : 0;
    return extractedClauses / totalExpectedClauses;
  }

  /**
   * Calculate risk assessment depth
   */
  private calculateRiskAssessmentDepth(result: any): number {
    const totalExpectedRisks = 10; // Example: estimate total risks
    const assessedRisks = Array.isArray(result.risks) ? result.risks.length : 0;
    return assessedRisks / totalExpectedRisks;
  }

  /**
   * Calculate recommendation actionability
   */
  private calculateRecommendationActionability(result: any): number {
    const totalExpectedRecommendations = 10; // Example: estimate total recommendations
    const actionableRecommendations = Array.isArray(result.recommendations) ? result.recommendations.length : 0;
    return actionableRecommendations / totalExpectedRecommendations;
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

  /**
   * Validate analysis quality
   */
  private validateAnalysisQuality(analysis: ProcessedAnalysis, request: AnalysisRequest): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check if summary is meaningful
    if (!analysis.summary || analysis.summary.length < 100) {
      issues.push('Summary is too short or missing');
    }

    // Check clause completeness based on analysis type
    if (['comprehensive', 'clause-extraction'].includes(request.analysisType) && analysis.clauses.length === 0) {
      issues.push('No clauses extracted for clause-focused analysis');
    }

    // Check risk assessment completeness
    if (['comprehensive', 'risk-assessment'].includes(request.analysisType) && analysis.risks.length === 0) {
      issues.push('No risks identified for risk-focused analysis');
    }

    // Check confidence scores
    const lowConfidenceClauses = analysis.clauses.filter(c => c.confidence < 0.5).length;
    const lowConfidenceRisks = analysis.risks.filter(r => r.confidence < 0.5).length;
    
    if (lowConfidenceClauses > analysis.clauses.length * 0.5) {
      issues.push('High proportion of low-confidence clauses');
    }
    
    if (lowConfidenceRisks > analysis.risks.length * 0.5) {
      issues.push('High proportion of low-confidence risks');
    }

    // Check metadata completeness for comprehensive analysis
    if (request.analysisType === 'comprehensive') {
      if (!analysis.extractedMetadata.parties.primary || !analysis.extractedMetadata.parties.secondary) {
        issues.push('Missing essential party information in metadata');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Classify error types for better handling
   */
  private classifyError(error: any): string {
    if (!error) return 'unknown';

    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      return 'rate_limit';
    }
    
    if (errorMessage.includes('token') || errorMessage.includes('context length')) {
      return 'token_limit';
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return 'timeout';
    }
    
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      return 'parse_error';
    }
    
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return 'auth_error';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network_error';
    }
    
    if (errorMessage.includes('content policy') || errorMessage.includes('moderation')) {
      return 'content_policy';
    }
    
    return 'analysis_error';
  }

  /**
   * Batch analyze multiple contracts with rate limiting
   */
  public async batchAnalyzeContracts(requests: AnalysisRequest[], options?: {
    maxConcurrent?: number;
    delayBetweenRequests?: number;
  }): Promise<AnalysisResponse[]> {
    const maxConcurrent = options?.maxConcurrent || 3;
    const delayBetweenRequests = options?.delayBetweenRequests || 1000;
    
    const results: AnalysisResponse[] = [];
    const chunks = this.chunkArray(requests, maxConcurrent);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(request => this.analyzeContract(request));
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // Add delay between chunks to respect rate limits
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(delayBetweenRequests);
      }
    }
    
    return results;
  }

  /**
   * Get analysis statistics and metrics
   */
  public getAnalysisMetrics(): {
    queueSize: number;
    averageProcessingTime: number;
    successRate: number;
    totalCost: number;
  } {
    // This would typically track metrics over time
    // For now, return basic queue information
    return {
      queueSize: this.analysisQueue.size,
      averageProcessingTime: 0, // Would be calculated from historical data
      successRate: 0, // Would be calculated from historical data
      totalCost: 0 // Would be calculated from historical data
    };
  }

  /**
   * Validate contract text quality before analysis
   */
  private validateContractQuality(contractText: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!contractText || contractText.trim().length === 0) {
      issues.push('Contract text is empty');
      return { isValid: false, issues, suggestions };
    }
    
    // Only warn for very short contracts, don't reject them
    if (contractText.length < 50) {
      suggestions.push('Contract text is very short - consider providing more detailed content');
    }
    
    // For very long contracts, just warn but still process
    if (contractText.length > 100000) {
      suggestions.push('Contract text is very long - consider breaking into smaller sections for better analysis');
    }
    
    // Check for common contract elements (suggestions only, not validation errors)
    const hasPaymentTerms = /payment|fee|cost|price|amount/i.test(contractText);
    const hasParties = /between|party|company|corporation|llc|inc/i.test(contractText);
    const hasDates = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(contractText);
    
    if (!hasPaymentTerms) {
      suggestions.push('No payment terms detected - consider adding financial information');
    }
    
    if (!hasParties) {
      suggestions.push('No clear party identification - consider adding party names');
    }
    
    if (!hasDates) {
      suggestions.push('No dates detected - consider adding contract dates');
    }
    
    return {
      isValid: true, // Always valid unless empty
      issues,
      suggestions
    };
  }

  /**
   * Helper method to chunk array for batch processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Helper method to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // LONG CONTRACT HANDLING METHODS
  // ============================================================================

  /**
   * Determine if a contract is considered "long" and needs special handling
   */
  private isLongContract(contractText: string, options?: AnalysisRequest['longContractOptions']): boolean {
    const defaultThreshold = 30000; // 30KB default threshold (reduced for better testing)
    
    // If chunking is explicitly enabled, always use long contract analysis
    // This ensures that custom chunk sizes work even for smaller contracts
    if (options?.enableChunking) {
      return true;
    }
    
    return contractText.length > defaultThreshold;
  }

  /**
   * Analyze long contracts using chunking and hierarchical analysis
   */
  private async analyzeLongContract(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting long contract analysis...');
      
      // Step 1: Create intelligent chunks
      const chunks = await this.createIntelligentChunks(request);
      console.log(`📄 Created ${chunks.length} chunks for analysis`);
      
      // Step 2: Analyze each chunk
      const chunkAnalyses = await this.analyzeChunks(chunks, request);
      console.log(`✅ Completed analysis of ${chunkAnalyses.length} chunks`);
      
      // Step 3: Create document structure overview
      const documentStructure = await this.createDocumentStructure(chunks, chunkAnalyses, request);
      
      // Step 4: Consolidate results
      const consolidatedAnalysis = await this.consolidateChunkAnalyses(chunkAnalyses, request);
      
      // Step 5: Generate executive summary
      const executiveSummary = await this.generateExecutiveSummary(chunks, chunkAnalyses, consolidatedAnalysis, request);
      
      // Calculate total metrics
      const totalTokens = chunkAnalyses.reduce((sum, ca) => sum + ca.tokensUsed, 0);
      const totalCost = chunkAnalyses.reduce((sum, ca) => sum + ca.cost, 0);
      const processingTime = Date.now() - startTime;
      
      // Create hierarchical analysis result
      const hierarchicalAnalysis: HierarchicalAnalysis = {
        executiveSummary,
        documentStructure,
        consolidatedAnalysis,
        chunkAnalyses,
        metadata: {
          totalChunks: chunks.length,
          totalPages: request.contractMetadata.pageCount || Math.ceil(chunks.length / 2),
          processingTime,
          tokensUsed: totalTokens,
          estimatedCost: totalCost,
          chunkingStrategy: this.getChunkingStrategy(request),
          qualityMetrics: this.calculateLongContractQualityMetrics(chunks, chunkAnalyses)
        }
      };
      
      return {
        success: true,
        result: hierarchicalAnalysis,
        tokensUsed: totalTokens,
        cost: totalCost,
        processingTime,
        isLongContract: true,
        chunkingInfo: {
          totalChunks: chunks.length,
          chunkingStrategy: this.getChunkingStrategy(request),
          coveragePercentage: this.calculateCoveragePercentage(chunks, request.contractText)
        },
        hierarchicalAnalysis
      };
      
    } catch (error) {
      console.error('Long contract analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Long contract analysis failed',
        errorType: this.classifyError(error),
        processingTime: Date.now() - startTime,
        isLongContract: true
      };
    }
  }

  /**
   * Create intelligent chunks from contract text
   */
  private async createIntelligentChunks(request: AnalysisRequest): Promise<ContractChunk[]> {
    const { contractText, longContractOptions } = request;
    const chunkSize = longContractOptions?.chunkSize || 8000; // Default 8K characters
    const maxChunks = longContractOptions?.maxChunks || 20;
    const overlap = longContractOptions?.chunkOverlap || 500;
    
    const chunks: ContractChunk[] = [];
    let currentIndex = 0;
    let chunkId = 1;
    
    while (currentIndex < contractText.length && chunks.length < maxChunks) {
      const endIndex = Math.min(currentIndex + chunkSize, contractText.length);
      
      // Try to find a good breaking point (sentence or paragraph end)
      let actualEndIndex = endIndex;
      if (endIndex < contractText.length) {
        // Look for sentence endings within the last 200 characters
        const searchStart = Math.max(endIndex - 200, currentIndex);
        const searchText = contractText.substring(searchStart, endIndex);
        
        // Find the last sentence ending
        const sentenceEnd = searchText.lastIndexOf('. ');
        const paragraphEnd = searchText.lastIndexOf('\n\n');
        const sectionEnd = searchText.lastIndexOf('\n\n\n');
        
        if (sectionEnd !== -1) {
          actualEndIndex = searchStart + sectionEnd + 3;
        } else if (paragraphEnd !== -1) {
          actualEndIndex = searchStart + paragraphEnd + 2;
        } else if (sentenceEnd !== -1) {
          actualEndIndex = searchStart + sentenceEnd + 2;
        }
      }
      
      const content = contractText.substring(currentIndex, actualEndIndex);
      
      // Analyze chunk importance using AI
      const importance = await this.analyzeChunkImportance(content, request);
      
      chunks.push({
        id: `chunk_${chunkId}`,
        content,
        startIndex: currentIndex,
        endIndex: actualEndIndex,
        importance,
        pageNumber: Math.ceil(chunkId / 2), // Rough estimate
        section: this.identifySection(content)
      });
      
      // Move to next chunk with overlap
      currentIndex = Math.max(actualEndIndex - overlap, currentIndex + 1);
      chunkId++;
    }
    
    return chunks;
  }

  /**
   * Analyze individual chunks
   */
  private async analyzeChunks(chunks: ContractChunk[], request: AnalysisRequest): Promise<ChunkAnalysis[]> {
    const analyses: ChunkAnalysis[] = [];
    const maxConcurrent = 3; // Process 3 chunks at a time
    
    for (let i = 0; i < chunks.length; i += maxConcurrent) {
      const chunkBatch = chunks.slice(i, i + maxConcurrent);
      const batchPromises = chunkBatch.map(chunk => this.analyzeSingleChunk(chunk, request));
      
      const batchResults = await Promise.all(batchPromises);
      analyses.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + maxConcurrent < chunks.length) {
        await this.delay(1000);
      }
    }
    
    return analyses;
  }

  /**
   * Analyze a single chunk
   */
  private async analyzeSingleChunk(chunk: ContractChunk, request: AnalysisRequest): Promise<ChunkAnalysis> {
    const startTime = Date.now();
    
    try {
      const prompt = this.createChunkAnalysisPrompt(chunk, request);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18', // Much more cost-effective for chunk analysis
        messages: [
          {
            role: 'system',
            content: 'You are a contract analysis specialist. Analyze contract sections and extract structured information in the specified JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000, // Further increased to prevent JSON truncation
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: JSON_SCHEMAS.chunk_analysis
        }
      });
      
      const responseContent = completion.choices[0]?.message?.content || '{}';
      
      let analysis;
      try {
        // With JSON schema, the response should be properly structured
        analysis = JSON.parse(responseContent);
      } catch (parseError) {
        console.error(`JSON parsing failed for chunk ${chunk.id}:`, parseError);
        console.error('Response content:', responseContent.substring(0, 500));
        
        // Fallback to basic analysis if JSON schema fails
        analysis = {
          summary: `Analysis of contract section ${chunk.id} (parsing failed)`,
          clauses: [],
          risks: [],
          recommendations: [],
          keyTerms: []
        };
      }
      
      const processingTime = Date.now() - startTime;
      const tokensUsed = completion.usage?.total_tokens || 0;
             const cost = this.calculateCost(
         completion.usage?.prompt_tokens || 0,
         completion.usage?.completion_tokens || 0,
         true // This is chunk analysis, use cheaper rates
       );
      
      return {
        chunkId: chunk.id,
        summary: analysis.summary,
        clauses: analysis.clauses || [],
        risks: analysis.risks || [],
        recommendations: analysis.recommendations || [],
        keyTerms: analysis.keyTerms || [],
        importance: chunk.importance,
        confidence: this.calculateChunkConfidence(analysis),
        processingTime,
        tokensUsed,
        cost
      };
      
    } catch (error) {
      console.error(`Error analyzing chunk ${chunk.id}:`, error);
      
      // Return a minimal analysis for failed chunks
      return {
        chunkId: chunk.id,
        summary: 'Analysis failed for this chunk',
        clauses: [],
        risks: [],
        recommendations: [],
        keyTerms: [],
        importance: chunk.importance,
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        cost: 0
      };
    }
  }

  /**
   * Create document structure overview
   */
  private async createDocumentStructure(
    chunks: ContractChunk[], 
    chunkAnalyses: ChunkAnalysis[], 
    request: AnalysisRequest
  ): Promise<HierarchicalAnalysis['documentStructure']> {
    const sections: Array<{
      title: string;
      pageRange: string;
      importance: 'low' | 'medium' | 'high';
      summary: string;
      keyClauses: string[];
      risks: string[];
    }> = [];
    
    // Group chunks by importance and create sections
    const highImportanceChunks = chunks.filter(c => c.importance === 'high');
    const mediumImportanceChunks = chunks.filter(c => c.importance === 'medium');
    const lowImportanceChunks = chunks.filter(c => c.importance === 'low');
    
    if (highImportanceChunks.length > 0) {
      sections.push({
        title: 'Critical Sections',
        pageRange: `Pages ${highImportanceChunks[0].pageNumber}-${highImportanceChunks[highImportanceChunks.length - 1].pageNumber}`,
        importance: 'high',
        summary: 'Contains the most critical contract terms and obligations',
        keyClauses: this.extractKeyClausesFromChunks(highImportanceChunks, chunkAnalyses),
        risks: this.extractKeyRisksFromChunks(highImportanceChunks, chunkAnalyses)
      });
    }
    
    if (mediumImportanceChunks.length > 0) {
      sections.push({
        title: 'Standard Sections',
        pageRange: `Pages ${mediumImportanceChunks[0].pageNumber}-${mediumImportanceChunks[mediumImportanceChunks.length - 1].pageNumber}`,
        importance: 'medium',
        summary: 'Contains standard contract provisions and supporting terms',
        keyClauses: this.extractKeyClausesFromChunks(mediumImportanceChunks, chunkAnalyses),
        risks: this.extractKeyRisksFromChunks(mediumImportanceChunks, chunkAnalyses)
      });
    }
    
    if (lowImportanceChunks.length > 0) {
      sections.push({
        title: 'Administrative Sections',
        pageRange: `Pages ${lowImportanceChunks[0].pageNumber}-${lowImportanceChunks[lowImportanceChunks.length - 1].pageNumber}`,
        importance: 'low',
        summary: 'Contains administrative details and boilerplate provisions',
        keyClauses: this.extractKeyClausesFromChunks(lowImportanceChunks, chunkAnalyses),
        risks: this.extractKeyRisksFromChunks(lowImportanceChunks, chunkAnalyses)
      });
    }
    
    return { sections };
  }

  /**
   * Consolidate chunk analyses into a unified result
   */
  private async consolidateChunkAnalyses(
    chunkAnalyses: ChunkAnalysis[], 
    request: AnalysisRequest
  ): Promise<HierarchicalAnalysis['consolidatedAnalysis']> {
    // Merge all clauses, risks, and recommendations
    const allClauses: Clause[] = [];
    const allRisks: Risk[] = [];
    const allRecommendations: Recommendation[] = [];
    
    chunkAnalyses.forEach((analysis, index) => {
      // Skip failed analyses
      if (!analysis || analysis.confidence < 0.1) {
        return;
      }
      
      // Add chunk prefix to IDs to avoid conflicts
      if (analysis.clauses && Array.isArray(analysis.clauses)) {
        analysis.clauses.forEach(clause => {
          allClauses.push({
            ...clause,
            id: `chunk_${index + 1}_${clause.id}`,
            pageNumber: Math.ceil((index + 1) / 2)
          });
        });
      }
      
      if (analysis.risks && Array.isArray(analysis.risks)) {
        analysis.risks.forEach(risk => {
          allRisks.push({
            ...risk,
            id: `chunk_${index + 1}_${risk.id}`,
            pageNumber: Math.ceil((index + 1) / 2)
          });
        });
      }
      
      if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
        analysis.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            id: `chunk_${index + 1}_${rec.id}`
          });
        });
      }
    });
    
    // Remove duplicates and merge similar items
    const uniqueClauses = this.mergeSimilarClauses(allClauses);
    const uniqueRisks = this.mergeSimilarRisks(allRisks);
    const uniqueRecommendations = this.mergeSimilarRecommendations(allRecommendations);
    
    // Generate consolidated summary
    const summaries = chunkAnalyses.map(ca => ca.summary).filter(s => s && s.length > 0);
    const consolidatedSummary = await this.generateConsolidatedSummary(summaries, request);
    
    // Extract metadata from high-confidence chunks
    const highConfidenceAnalyses = chunkAnalyses.filter(ca => ca.confidence > 0.7);
    const extractedMetadata = this.extractMetadataFromChunks(highConfidenceAnalyses, request);
    
    return {
      summary: consolidatedSummary,
      clauses: uniqueClauses,
      risks: uniqueRisks,
      recommendations: uniqueRecommendations,
      extractedMetadata
    };
  }

  /**
   * Generate executive summary for the entire document
   */
  private async generateExecutiveSummary(
    chunks: ContractChunk[],
    chunkAnalyses: ChunkAnalysis[],
    consolidatedAnalysis: HierarchicalAnalysis['consolidatedAnalysis'],
    request: AnalysisRequest
  ): Promise<string> {
    const highImportanceAnalyses = chunkAnalyses.filter(ca => {
      const chunk = chunks.find(c => c.id === ca.chunkId);
      return chunk?.importance === 'high';
    });
    
    const keyPoints = [
      `Document Type: ${request.contractMetadata.contractType || 'Contract'}`,
      `Total Sections: ${chunks.length}`,
      `Critical Sections: ${highImportanceAnalyses.length}`,
      `Key Risks Identified: ${consolidatedAnalysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length}`,
      `Major Clauses: ${consolidatedAnalysis.clauses.filter(c => c.importance === 'high').length}`
    ];
    
    const summary = `This ${request.contractMetadata.contractType || 'contract'} consists of ${chunks.length} sections with ${highImportanceAnalyses.length} critical areas requiring immediate attention. The analysis identified ${consolidatedAnalysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length} high-priority risks and ${consolidatedAnalysis.clauses.filter(c => c.importance === 'high').length} major clauses that should be carefully reviewed.`;
    
    return summary;
  }

  // ============================================================================
  // HELPER METHODS FOR LONG CONTRACT ANALYSIS
  // ============================================================================

  /**
   * Analyze chunk importance using AI
   */
  private async analyzeChunkImportance(content: string, request: AnalysisRequest): Promise<'low' | 'medium' | 'high'> {
    try {
      const prompt = `Analyze this contract section and determine its importance level (low, medium, or high). Consider factors like:
- Presence of financial terms, payment obligations, or monetary amounts
- Legal obligations, liabilities, or indemnification clauses
- Termination conditions or dispute resolution mechanisms
- Intellectual property rights or confidentiality provisions
- Critical dates, deadlines, or performance requirements

Contract section:
${content.substring(0, 2000)}

Respond with only: low, medium, or high`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18', // Use mini for simple importance analysis
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });
      
      const response = completion.choices[0]?.message?.content?.toLowerCase().trim();
      
      if (response === 'high') return 'high';
      if (response === 'low') return 'low';
      return 'medium';
      
    } catch (error) {
      console.error('Error analyzing chunk importance:', error);
      return 'medium'; // Default to medium importance
    }
  }

  /**
   * Identify section type from content
   */
  private identifySection(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('payment') || lowerContent.includes('fee') || lowerContent.includes('amount')) {
      return 'Payment Terms';
    }
    if (lowerContent.includes('termination') || lowerContent.includes('terminate')) {
      return 'Termination';
    }
    if (lowerContent.includes('liability') || lowerContent.includes('indemnification')) {
      return 'Liability & Indemnification';
    }
    if (lowerContent.includes('confidentiality') || lowerContent.includes('non-disclosure')) {
      return 'Confidentiality';
    }
    if (lowerContent.includes('intellectual property') || lowerContent.includes('ip')) {
      return 'Intellectual Property';
    }
    if (lowerContent.includes('dispute') || lowerContent.includes('arbitration')) {
      return 'Dispute Resolution';
    }
    if (lowerContent.includes('force majeure')) {
      return 'Force Majeure';
    }
    if (lowerContent.includes('warranty') || lowerContent.includes('warranties')) {
      return 'Warranties';
    }
    
    return 'General Provisions';
  }

  /**
   * Create analysis prompt for a chunk
   */
  private createChunkAnalysisPrompt(chunk: ContractChunk, request: AnalysisRequest): string {
    return `Analyze this contract section and extract all relevant information. Return your analysis as a valid JSON object following the specified schema.

CONTRACT SECTION:
${chunk.content}

ANALYSIS REQUIREMENTS:
1. Provide a concise summary of this section's purpose and key content
2. Identify all significant clauses with their categories and importance levels
3. Assess potential risks, their severity, and mitigation strategies  
4. Generate actionable recommendations for improvement or risk mitigation
5. Extract key terms and important phrases
6. Assign confidence scores (0.0-1.0) based on text clarity and specificity

IMPORTANT: 
- Return ONLY a valid JSON object that conforms to the specified schema
- Ensure all required fields are present
- Keep descriptions concise but informative to stay within token limits
- If you cannot complete the analysis due to length, prioritize the most important elements
- Use confidence scores to indicate the quality of your analysis

Focus on accuracy and completeness while maintaining high confidence scores for clear, well-defined elements.`;
  }

  /**
   * Attempt to recover malformed JSON by fixing common issues
   */
  private attemptJSONRecovery(content: string, chunk: ContractChunk): any {
    try {
      console.log(`Attempting JSON recovery for chunk ${chunk.id}...`);
      
      // First, try to clean up the content
      let fixedContent = content.trim();
      
      // Remove any non-JSON content before the first {
      const firstBrace = fixedContent.indexOf('{');
      if (firstBrace > 0) {
        fixedContent = fixedContent.substring(firstBrace);
      }
      
      // Try to find the last complete JSON object
      let braceCount = 0;
      let inString = false;
      let escaped = false;
      let lastCompleteEnd = -1;
      
      for (let i = 0; i < fixedContent.length; i++) {
        const char = fixedContent[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escaped = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastCompleteEnd = i;
            }
          }
        }
      }
      
      // If we found a complete object, try to parse it
      if (lastCompleteEnd > 0) {
        const completeJson = fixedContent.substring(0, lastCompleteEnd + 1);
        try {
          return JSON.parse(completeJson);
        } catch (e) {
          console.log('Complete object parsing failed, trying fixes...');
        }
      }
      
      // Try to fix common JSON issues
      let attempts = [
        // Original content
        fixedContent,
        // Add closing braces
        fixedContent + '}',
        fixedContent + '}}',
        fixedContent + '}}}',
        // Fix unterminated strings by adding quote and closing
        fixedContent.replace(/("[^"]*$)/, '$1"') + '}',
        // Remove trailing commas
        fixedContent.replace(/,(\s*[}\]])/g, '$1'),
        // Fix common truncation patterns
        fixedContent.replace(/,\s*$/, '') + '}',
        // Try to complete last property
        fixedContent.replace(/:\s*$/, ': ""') + '}'
      ];
      
      for (const attempt of attempts) {
        try {
          const parsed = JSON.parse(attempt);
          console.log(`JSON recovery succeeded with attempt: ${attempt.substring(0, 100)}...`);
          return parsed;
        } catch (e) {
          // Continue to next attempt
        }
      }
      
      // Try to extract partial information using regex
      console.log('Attempting regex-based extraction...');
      const summary = this.extractFieldWithRegex(fixedContent, 'summary') || `Analysis of contract section ${chunk.id}`;
      const clauses = this.extractArrayFieldWithRegex(fixedContent, 'clauses') || [];
      const risks = this.extractArrayFieldWithRegex(fixedContent, 'risks') || [];
      const recommendations = this.extractArrayFieldWithRegex(fixedContent, 'recommendations') || [];
      const keyTerms = this.extractArrayFieldWithRegex(fixedContent, 'keyTerms') || [];
      
      return {
        summary,
        clauses,
        risks,
        recommendations,
        keyTerms
      };
      
    } catch (recoveryError) {
      console.error(`JSON recovery failed for chunk ${chunk.id}:`, recoveryError);
      
      // Return a minimal valid analysis as last resort
      return {
        summary: `Analysis of contract section ${chunk.id} (automated recovery)`,
        clauses: [],
        risks: [],
        recommendations: [],
        keyTerms: []
      };
    }
  }

  /**
   * Extract a field value using regex when JSON parsing fails
   */
  private extractFieldWithRegex(content: string, fieldName: string): string | null {
    try {
      const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
      const match = content.match(regex);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Extract an array field using regex when JSON parsing fails
   */
  private extractArrayFieldWithRegex(content: string, fieldName: string): any[] {
    try {
      const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*(?:\\][^\\]]*)*?)\\]`, 'i');
      const match = content.match(regex);
      if (match) {
        try {
          return JSON.parse(`[${match[1]}]`);
        } catch (e) {
          return [];
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Calculate confidence score for a chunk analysis
   */
  private calculateChunkConfidence(analysis: any): number {
    let score = 0.5; // Base score
    
    if (analysis.summary && analysis.summary.length > 50) score += 0.2;
    if (analysis.clauses && analysis.clauses.length > 0) score += 0.15;
    if (analysis.risks && analysis.risks.length > 0) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract key clauses from chunks
   */
  private extractKeyClausesFromChunks(chunks: ContractChunk[], chunkAnalyses: ChunkAnalysis[]): string[] {
    const keyClauses: string[] = [];
    
    chunks.forEach(chunk => {
      const analysis = chunkAnalyses.find(ca => ca.chunkId === chunk.id);
      if (analysis) {
        const highImportanceClauses = analysis.clauses.filter(c => c.importance === 'high');
        keyClauses.push(...highImportanceClauses.map(c => c.title));
      }
    });
    
    return keyClauses.slice(0, 5); // Return top 5
  }

  /**
   * Extract key risks from chunks
   */
  private extractKeyRisksFromChunks(chunks: ContractChunk[], chunkAnalyses: ChunkAnalysis[]): string[] {
    const keyRisks: string[] = [];
    
    chunks.forEach(chunk => {
      const analysis = chunkAnalyses.find(ca => ca.chunkId === chunk.id);
      if (analysis) {
        const highSeverityRisks = analysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical');
        keyRisks.push(...highSeverityRisks.map(r => r.title));
      }
    });
    
    return keyRisks.slice(0, 5); // Return top 5
  }

  /**
   * Merge similar clauses to avoid duplicates
   */
  private mergeSimilarClauses(clauses: Clause[]): Clause[] {
    const merged: Clause[] = [];
    const seen: Set<string> = new Set();
    
    clauses.forEach(clause => {
      const key = `${clause.category}_${clause.title.toLowerCase().replace(/\s+/g, '_')}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(clause);
      }
    });
    
    return merged;
  }

  /**
   * Merge similar risks to avoid duplicates
   */
  private mergeSimilarRisks(risks: Risk[]): Risk[] {
    const merged: Risk[] = [];
    const seen: Set<string> = new Set();
    
    risks.forEach(risk => {
      const key = `${risk.category}_${risk.title.toLowerCase().replace(/\s+/g, '_')}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(risk);
      }
    });
    
    return merged;
  }

  /**
   * Merge similar recommendations to avoid duplicates
   */
  private mergeSimilarRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const merged: Recommendation[] = [];
    const seen: Set<string> = new Set();
    
    recommendations.forEach(rec => {
      const key = `${rec.category}_${rec.title.toLowerCase().replace(/\s+/g, '_')}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(rec);
      }
    });
    
    return merged;
  }

  /**
   * Generate consolidated summary from chunk summaries
   */
  private async generateConsolidatedSummary(summaries: string[], request: AnalysisRequest): Promise<string> {
    if (summaries.length === 0) return 'No summary available';
    if (summaries.length === 1) return summaries[0];
    
    const combinedSummaries = summaries.join('\n\n');
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-2025-04-14', // Use main model for important summary consolidation
        messages: [
          {
            role: 'system',
            content: 'You are a contract analysis specialist. Create a comprehensive summary from multiple section summaries.'
          },
          {
            role: 'user',
            content: `Create a comprehensive summary of this contract from the following section summaries:\n\n${combinedSummaries}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });
      
      return completion.choices[0]?.message?.content || 'Summary generation failed';
      
    } catch (error) {
      console.error('Error generating consolidated summary:', error);
      return summaries[0] + ' (Additional sections analyzed)';
    }
  }

  /**
   * Extract metadata from high-confidence chunks
   */
  private extractMetadataFromChunks(chunkAnalyses: ChunkAnalysis[], request: AnalysisRequest): ContractMetadata {
    // This is a simplified extraction - in practice, you'd want more sophisticated logic
    return {
      parties: {
        primary: 'Extracted from analysis',
        secondary: 'Extracted from analysis',
        additional: []
      },
      dates: {
        effective: 'To be determined',
        expiration: 'To be determined',
        signed: 'To be determined'
      },
      financial: {
        totalValue: 0,
        currency: 'USD',
        paymentTerms: 'Extracted from analysis',
        penalties: 'Extracted from analysis'
      },
      jurisdiction: {
        governingLaw: 'To be determined',
        courts: 'To be determined',
        disputeResolution: 'To be determined'
      },
      contractType: request.contractMetadata.contractType || 'Contract',
      confidenceScore: 0.8
    };
  }

  /**
   * Get chunking strategy description
   */
  private getChunkingStrategy(request: AnalysisRequest): string {
    const options = request.longContractOptions;
    if (!options) return 'Default chunking';
    
    return `Chunk size: ${options.chunkSize || 8000}, Max chunks: ${options.maxChunks || 20}, Overlap: ${options.chunkOverlap || 500}`;
  }

  /**
   * Calculate coverage percentage
   */
  private calculateCoveragePercentage(chunks: ContractChunk[], originalText: string): number {
    const totalCovered = chunks.reduce((sum, chunk) => sum + (chunk.endIndex - chunk.startIndex), 0);
    return Math.min((totalCovered / originalText.length) * 100, 100);
  }

  /**
   * Calculate quality metrics for long contract analysis
   */
  private calculateLongContractQualityMetrics(chunks: ContractChunk[], chunkAnalyses: ChunkAnalysis[]): {
    coverageScore: number;
    consistencyScore: number;
    completenessScore: number;
  } {
    const coverageScore = chunkAnalyses.filter(ca => ca.confidence > 0.5).length / chunkAnalyses.length;
    const consistencyScore = this.calculateConsistencyScore(chunkAnalyses);
    const completenessScore = this.calculateCompletenessScore(chunks, chunkAnalyses);
    
    return {
      coverageScore,
      consistencyScore,
      completenessScore
    };
  }

  /**
   * Calculate consistency score across chunks
   */
  private calculateConsistencyScore(chunkAnalyses: ChunkAnalysis[]): number {
    if (chunkAnalyses.length < 2) return 1.0;
    
    const confidenceScores = chunkAnalyses.map(ca => ca.confidence);
    const mean = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    const variance = confidenceScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / confidenceScores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Higher consistency = lower standard deviation
    return Math.max(0, 1 - standardDeviation);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(chunks: ContractChunk[], chunkAnalyses: ChunkAnalysis[]): number {
    const totalClauses = chunkAnalyses.reduce((sum, ca) => sum + ca.clauses.length, 0);
    const totalRisks = chunkAnalyses.reduce((sum, ca) => sum + ca.risks.length, 0);
    const totalRecommendations = chunkAnalyses.reduce((sum, ca) => sum + ca.recommendations.length, 0);
    
    // Expected minimum items per chunk
    const expectedClauses = chunks.length * 2;
    const expectedRisks = chunks.length * 1.5;
    const expectedRecommendations = chunks.length * 1;
    
    const clauseCompleteness = Math.min(totalClauses / expectedClauses, 1);
    const riskCompleteness = Math.min(totalRisks / expectedRisks, 1);
    const recommendationCompleteness = Math.min(totalRecommendations / expectedRecommendations, 1);
    
    return (clauseCompleteness + riskCompleteness + recommendationCompleteness) / 3;
  }
}

// Export singleton instance
export const aiAnalysisService = AIAnalysisService.getInstance(); 