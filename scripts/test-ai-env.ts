#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import * as fs from 'fs';

// Now import the AI service after environment is loaded
import { aiAnalysisService, AnalysisRequest } from '../lib/ai-analysis';

async function testAIWithEnvCheck() {
  console.log('🧪 Testing AI Analysis with Environment Check...\n');
  
  // Check if API key is loaded
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check if .env.local exists:');
    console.log(`   ${fs.existsSync('.env.local') ? '✅ .env.local exists' : '❌ .env.local missing'}`);
    
    if (fs.existsSync('.env.local')) {
      const content = fs.readFileSync('.env.local', 'utf8');
      console.log('2. .env.local content:');
      console.log(content.split('\n').map(line => `   ${line}`).join('\n'));
    }
    
    console.log('\n3. Try setting the key directly:');
    console.log('   export OPENAI_API_KEY=sk-your-key-here');
    console.log('   pnpm run test:ai:simple');
    
    return;
  }
  
  if (apiKey === 'your_openai_api_key_here' || apiKey.includes('your_')) {
    console.error('❌ OPENAI_API_KEY is set to placeholder value');
    console.log('Please update .env.local with your actual API key');
    return;
  }
  
  console.log('✅ OPENAI_API_KEY is properly configured');
  console.log(`🔑 Key starts with: ${apiKey.substring(0, 7)}...`);
  
  // Test with a simple contract
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
    contractId: 'test-env',
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
    console.log('\n📋 Starting AI analysis...');
    const startTime = Date.now();
    
    const result = await aiAnalysisService.analyzeContract(request);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    if (result.success && result.result) {
      console.log('✅ Analysis completed successfully!');
      console.log(`📊 Processing time: ${processingTime}ms`);
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
      
      console.log('\n🎉 AI testing successful!');
      
    } else {
      console.error('❌ Analysis failed:', result.error);
      if (result.refusal) {
        console.error('🚫 AI refused analysis:', result.refusal);
      }
      if (result.errorType) {
        console.error('🔍 Error type:', result.errorType);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    // Provide helpful error information
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n🔧 API Key Issues:');
        console.log('1. Make sure your API key is valid');
        console.log('2. Check if your OpenAI account has credits');
        console.log('3. Verify the key format: sk-...');
      } else if (error.message.includes('rate limit')) {
        console.log('\n⏱️  Rate Limit Issues:');
        console.log('1. Wait a few minutes and try again');
        console.log('2. Check your OpenAI usage limits');
      } else if (error.message.includes('network')) {
        console.log('\n🌐 Network Issues:');
        console.log('1. Check your internet connection');
        console.log('2. Try again in a few moments');
      }
    }
  }
}

async function main() {
  console.log('🚀 AI Environment Test\n');
  console.log('=' .repeat(50));
  
  try {
    await testAIWithEnvCheck();
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main(); 