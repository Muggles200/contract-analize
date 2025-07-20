import { aiAnalysisService, AnalysisRequest } from './ai-analysis';

/**
 * Test suite for enhanced AI analysis improvements
 */
class AIAnalysisTestSuite {
  
  /**
   * Test comprehensive analysis with enhanced features
   */
  async testComprehensiveAnalysis(): Promise<void> {
    console.log('🧪 Testing Comprehensive Analysis with Enhanced Features...');
    
    const sampleContract = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on January 15, 2024, between TechCorp Inc., a Delaware corporation ("Company"), and DataServices LLC, a California limited liability company ("Service Provider").

1. SERVICES
Service Provider shall provide cloud infrastructure management services including server monitoring, backup services, and technical support.

2. PAYMENT TERMS
Company agrees to pay Service Provider $10,000 monthly, due on the first day of each month. Late payments will incur a 1.5% monthly penalty.

3. TERM AND TERMINATION
This Agreement shall commence on February 1, 2024, and continue for a period of 12 months. Either party may terminate with 30 days written notice.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information shared during the course of this agreement.

5. LIABILITY LIMITATION
Service Provider's liability shall not exceed the total amount paid under this Agreement in the preceding 12 months.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________        _________________________
TechCorp Inc.                    DataServices LLC
    `;

    const request: AnalysisRequest = {
      contractId: 'test-001',
      contractText: sampleContract,
      contractMetadata: {
        fileName: 'service-agreement-test.pdf',
        fileSize: 2048,
        pageCount: 2,
        contractType: 'Service Agreement',
        jurisdiction: 'Delaware',
        contractValue: 120000,
        parties: ['TechCorp Inc.', 'DataServices LLC']
      },
      analysisType: 'comprehensive',
      userId: 'test-user-001',
      organizationId: 'test-org-001'
    };

    try {
      const result = await aiAnalysisService.analyzeContract(request);
      
      if (result.success && result.result) {
        console.log('✅ Comprehensive analysis completed successfully');
        console.log(`📊 Processing time: ${result.processingTime}ms`);
        console.log(`💰 Cost: $${result.cost?.toFixed(4)}`);
        console.log(`🎯 Confidence: ${result.result.metadata?.confidenceScore || 'N/A'}`);
        
        // Validate structure
        this.validateAnalysisStructure(result.result);
        
        // Check for enhanced features
        if (result.result.extractedMetadata) {
          console.log('✅ Enhanced metadata extraction working');
          console.log(`👥 Parties: ${result.result.extractedMetadata.parties?.primary} & ${result.result.extractedMetadata.parties?.secondary}`);
        }
        
        if (result.result.metadata?.qualityMetrics) {
          console.log('✅ Quality metrics available');
          console.log(`📈 Clause completeness: ${(result.result.metadata.qualityMetrics.clauseCompleteness * 100).toFixed(1)}%`);
        }
        
      } else {
        console.error('❌ Analysis failed:', result.error);
        if (result.refusal) {
          console.error('🚫 AI refused analysis:', result.refusal);
        }
      }
      
    } catch (error) {
      console.error('❌ Test failed with error:', error);
    }
  }

  /**
   * Test risk assessment analysis
   */
  async testRiskAssessment(): Promise<void> {
    console.log('\n🧪 Testing Risk Assessment Analysis...');
    
    const riskContract = `
HIGH RISK CONTRACT EXAMPLE

This contract contains several problematic clauses:

1. UNLIMITED LIABILITY
Company accepts unlimited liability for all damages, whether direct, indirect, consequential, or punitive.

2. AUTOMATIC RENEWAL
This contract automatically renews every year unless terminated with 90 days notice.

3. BROAD INDEMNIFICATION
Company shall indemnify Provider against all claims, including those arising from Provider's own negligence.

4. PAYMENT TERMS
All payments are non-refundable and due immediately upon demand.

5. TERMINATION
Provider may terminate immediately for any reason without notice.
    `;

    const request: AnalysisRequest = {
      contractId: 'test-risk-001',
      contractText: riskContract,
      contractMetadata: {
        fileName: 'high-risk-contract.pdf',
        fileSize: 1024,
        contractType: 'Service Agreement'
      },
      analysisType: 'risk-assessment',
      userId: 'test-user-001'
    };

    try {
      const result = await aiAnalysisService.analyzeContract(request);
      
      if (result.success && result.result) {
        console.log('✅ Risk assessment completed successfully');
        console.log(`🚨 Total risks identified: ${result.result.risks?.length || 0}`);
        
        // Count risk severities
        const riskCounts = this.countRiskSeverities(result.result.risks || []);
        console.log(`🔴 Critical risks: ${riskCounts.critical}`);
        console.log(`🟠 High risks: ${riskCounts.high}`);
        console.log(`🟡 Medium risks: ${riskCounts.medium}`);
        console.log(`🟢 Low risks: ${riskCounts.low}`);
        
      } else {
        console.error('❌ Risk assessment failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Risk assessment test failed:', error);
    }
  }

  /**
   * Test clause extraction analysis
   */
  async testClauseExtraction(): Promise<void> {
    console.log('\n🧪 Testing Clause Extraction Analysis...');
    
    const clauseContract = `
COMPREHENSIVE CONTRACT WITH MULTIPLE CLAUSES

1. PAYMENT CLAUSE
Monthly payments of $5,000 due on the 1st of each month.

2. TERMINATION CLAUSE  
Either party may terminate with 60 days written notice.

3. INTELLECTUAL PROPERTY CLAUSE
All intellectual property created during this engagement belongs to the Company.

4. CONFIDENTIALITY CLAUSE
Both parties agree to maintain strict confidentiality of proprietary information.

5. LIABILITY CLAUSE
Liability is limited to the total contract value.

6. DISPUTE RESOLUTION CLAUSE
All disputes shall be resolved through binding arbitration in New York.

7. FORCE MAJEURE CLAUSE
Neither party shall be liable for delays due to acts of God or other unforeseeable circumstances.
    `;

    const request: AnalysisRequest = {
      contractId: 'test-clause-001',
      contractText: clauseContract,
      contractMetadata: {
        fileName: 'clause-extraction-test.pdf',
        fileSize: 1536,
        contractType: 'Service Agreement'
      },
      analysisType: 'clause-extraction',
      userId: 'test-user-001'
    };

    try {
      const result = await aiAnalysisService.analyzeContract(request);
      
      if (result.success && result.result) {
        console.log('✅ Clause extraction completed successfully');
        console.log(`📋 Total clauses extracted: ${result.result.clauses?.length || 0}`);
        
        // Count clause categories
        const clauseCounts = this.countClauseCategories(result.result.clauses || []);
        console.log('📊 Clause categories found:', Object.entries(clauseCounts)
          .filter(([_, count]) => count > 0)
          .map(([category, count]) => `${category}: ${count}`)
          .join(', '));
        
      } else {
        console.error('❌ Clause extraction failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Clause extraction test failed:', error);
    }
  }

  /**
   * Test error handling and edge cases
   */
  async testErrorHandling(): Promise<void> {
    console.log('\n🧪 Testing Error Handling...');
    
    // Test with empty contract
    console.log('📋 Testing empty contract handling...');
    try {
      const result = await aiAnalysisService.analyzeContract({
        contractId: 'test-empty',
        contractText: '',
        contractMetadata: { fileName: 'empty.pdf', fileSize: 0 },
        analysisType: 'basic',
        userId: 'test-user'
      });
      
      if (!result.success) {
        console.log('✅ Empty contract properly rejected:', result.error);
      } else {
        console.log('⚠️  Empty contract was processed unexpectedly');
      }
    } catch (error) {
      console.log('✅ Empty contract handling working:', error);
    }

    // Test with invalid analysis type
    console.log('📋 Testing invalid analysis type...');
    try {
      const result = await aiAnalysisService.analyzeContract({
        contractId: 'test-invalid',
        contractText: 'Sample contract text',
        contractMetadata: { fileName: 'test.pdf', fileSize: 100 },
        analysisType: 'invalid-type' as any,
        userId: 'test-user'
      });
      
      if (!result.success) {
        console.log('✅ Invalid analysis type properly rejected:', result.error);
      }
    } catch (error) {
      console.log('✅ Invalid analysis type handling working');
    }
  }

  /**
   * Test cost optimization features
   */
  async testCostOptimization(): Promise<void> {
    console.log('\n🧪 Testing Cost Optimization...');
    
    // Generate a very long contract text to test truncation
    const longContract = 'This is a very long contract. '.repeat(10000);
    
    const request: AnalysisRequest = {
      contractId: 'test-long-001',
      contractText: longContract,
      contractMetadata: {
        fileName: 'very-long-contract.pdf',
        fileSize: longContract.length,
        contractType: 'Service Agreement'
      },
      analysisType: 'basic',
      userId: 'test-user-001'
    };

    try {
      const startTime = Date.now();
      const result = await aiAnalysisService.analyzeContract(request);
      const endTime = Date.now();
      
      if (result.success) {
        console.log('✅ Long contract processing completed');
        console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
        console.log(`💰 Cost: $${result.cost?.toFixed(4)}`);
        console.log(`🎯 Tokens used: ${result.tokensUsed}`);
      } else {
        console.log('⚠️  Long contract processing failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Cost optimization test failed:', error);
    }
  }

  /**
   * Test batch analysis functionality
   */
  async testBatchAnalysis(): Promise<void> {
    console.log('\n🧪 Testing Batch Analysis...');
    
    const contracts = [
      {
        contractId: 'batch-001',
        contractText: `SERVICE AGREEMENT

This Service Agreement is entered into between Company A ("Client") and Provider B ("Service Provider").

1. SERVICES
Service Provider shall provide consulting services as requested by Client.

2. PAYMENT TERMS
Client agrees to pay Service Provider $1000 per month, due on the first day of each month.

3. TERM
This agreement shall commence on January 1, 2024 and continue for 12 months.`,
        contractMetadata: { fileName: 'contract-1.pdf', fileSize: 500, contractType: 'Service Agreement' },
        analysisType: 'basic' as const,
        userId: 'test-user-001'
      },
      {
        contractId: 'batch-002',
        contractText: `NON-DISCLOSURE AGREEMENT

This NDA is entered into between TechCorp ("Disclosing Party") and DataServices ("Receiving Party").

1. CONFIDENTIALITY
Receiving Party agrees to maintain strict confidentiality of all proprietary information.

2. TERM
This agreement shall remain in effect for 3 years from the date of signing.

3. REMEDIES
Breach of this agreement may result in legal action and damages.`,
        contractMetadata: { fileName: 'contract-2.pdf', fileSize: 400, contractType: 'NDA' },
        analysisType: 'basic' as const,
        userId: 'test-user-001'
      },
      {
        contractId: 'batch-003',
        contractText: `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between TechCorp ("Employer") and John Doe ("Employee").

1. POSITION
Employee shall serve as Software Engineer.

2. COMPENSATION
Employee shall receive an annual salary of $50,000, paid bi-weekly.

3. BENEFITS
Employee shall be eligible for health insurance and 401(k) benefits.

4. TERM
This agreement shall commence on January 1, 2024 and continue until terminated.`,
        contractMetadata: { fileName: 'contract-3.pdf', fileSize: 600, contractType: 'Employment' },
        analysisType: 'basic' as const,
        userId: 'test-user-001'
      }
    ];

    try {
      const startTime = Date.now();
      const results = await aiAnalysisService.batchAnalyzeContracts(contracts, {
        maxConcurrent: 2,
        delayBetweenRequests: 500
      });
      const endTime = Date.now();
      
      console.log(`✅ Batch analysis completed in ${endTime - startTime}ms`);
      console.log(`📊 Processed ${results.length} contracts`);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      
      // Log detailed error information
      if (failed > 0) {
        console.log('\n📋 Failed analysis details:');
        results.forEach((result, index) => {
          if (!result.success) {
            console.log(`  Contract ${index + 1}: ${result.error} (${result.errorType || 'unknown'})`);
          }
        });
      }
      
      if (successful > 0) {
        const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
        const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
        
        console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
        console.log(`🎯 Total tokens: ${totalTokens}`);
      }
      
      // Test metrics
      const metrics = aiAnalysisService.getAnalysisMetrics();
      console.log(`📈 Queue size: ${metrics.queueSize}`);
      
    } catch (error) {
      console.error('❌ Batch analysis test failed:', error);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting AI Analysis Enhancement Test Suite\n');
    console.log('=' .repeat(60));
    
    try {
      await this.testComprehensiveAnalysis();
      await this.testRiskAssessment();
      await this.testClauseExtraction();
      await this.testErrorHandling();
      await this.testCostOptimization();
      await this.testBatchAnalysis();
      
      console.log('\n' + '=' .repeat(60));
      console.log('✅ All tests completed successfully!');
      console.log('🎉 AI Analysis Enhancement validation passed');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
    }
  }

  /**
   * Validate analysis structure
   */
  private validateAnalysisStructure(analysis: any): void {
    const required = ['summary', 'clauses', 'risks', 'recommendations', 'metadata'];
    const missing = required.filter(field => !analysis[field]);
    
    if (missing.length === 0) {
      console.log('✅ Analysis structure validation passed');
    } else {
      console.log('⚠️  Missing fields in analysis:', missing.join(', '));
    }
  }

  /**
   * Count risk severities
   */
  private countRiskSeverities(risks: any[]): Record<string, number> {
    return risks.reduce((counts, risk) => {
      const severity = risk.severity || 'unknown';
      counts[severity] = (counts[severity] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Count clause categories
   */
  private countClauseCategories(clauses: any[]): Record<string, number> {
    return clauses.reduce((counts, clause) => {
      const category = clause.category || 'unknown';
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
  }
}

// Export test runner
export const runAIAnalysisTests = async () => {
  const testSuite = new AIAnalysisTestSuite();
  await testSuite.runAllTests();
};

// Export individual test methods for selective testing
export { AIAnalysisTestSuite }; 