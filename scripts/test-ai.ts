#!/usr/bin/env tsx

import { runAIAnalysisTests } from '../lib/test-ai-improvements';

async function main() {
  console.log('🚀 Starting AI Analysis Testing...\n');
  console.log('=' .repeat(60));
  
  try {
    await runAIAnalysisTests();
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main(); 