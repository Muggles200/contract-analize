#!/usr/bin/env tsx


import { aiAnalysisService, AnalysisRequest } from '../lib/ai-analysis';

async function testBasicAI() {
  console.log('🧪 Testing Basic AI Analysis...\n');
  
  const sampleContract = `
SERVICE AGREEMENT

This Service Agreement is entered into between TechCorp Inc. and DataServices LLC.

1. SERVICES
DataServices LLC shall provide cloud infrastructure management services.

2. PAYMENT TERMS
TechCorp Inc. agrees to pay $10,000 monthly, due on the first day of each month.

3. TERMINATION
Either party may terminate with 30 days written notice.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.
  `;

  const request: AnalysisRequest = {
    contractId: 'test-basic',
    contractText: sampleContract,
    contractMetadata: {
      fileName: 'test-contract.pdf',
      fileSize: 1024,
      contractType: 'Service Agreement'
    },
    analysisType: 'basic',
    userId: 'test-user'
  };

  try {
    console.log('📋 Starting analysis...');
    const result = await aiAnalysisService.analyzeContract(request);
    
    if (result.success && result.result) {
      console.log('✅ Analysis completed successfully!');
      console.log(`📊 Processing time: ${result.processingTime}ms`);
      console.log(`💰 Cost: $${result.cost?.toFixed(4)}`);
      console.log(`🎯 Tokens used: ${result.tokensUsed}`);
      console.log(`📝 Summary: ${result.result.summary?.substring(0, 100)}...`);
      console.log(`📋 Clauses found: ${result.result.clauses?.length || 0}`);
      
      if (result.result.clauses && result.result.clauses.length > 0) {
        console.log('\n📋 Extracted Clauses:');
        result.result.clauses.forEach((clause: any, index: number) => {
          console.log(`  ${index + 1}. ${clause.title} (${clause.category})`);
        });
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

async function main() {
  console.log('🚀 Starting Simple AI Test...\n');
  console.log('=' .repeat(50));
  
  try {
    await testBasicAI();
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Simple test completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main(); 