#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🧪 Testing JSON Recovery Improvements\n');

async function testJSONRecovery() {
  try {
    console.log('📄 Running long contract analysis test...');
    const { stdout, stderr } = await execAsync('pnpm run test:long-contracts');
    
    console.log('📊 Test Results:');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️  Warnings/Errors:');
      console.log(stderr);
    }
    
    // Check for specific improvements
    const output = stdout + stderr;
    
    if (output.includes('JSON recovery succeeded')) {
      console.log('✅ JSON recovery mechanism is working');
    }
    
    if (output.includes('Main analysis JSON parsed successfully')) {
      console.log('✅ Main analysis JSON parsing is successful');
    }
    
    if (!output.includes('JSON parsing failed')) {
      console.log('✅ No JSON parsing failures detected');
    } else {
      console.log('⚠️  Some JSON parsing issues still exist');
    }
    
    // Count analysis quality improvements
    const qualityIssues = (output.match(/Analysis quality issues detected/g) || []).length;
    console.log(`📈 Analysis quality issues: ${qualityIssues}`);
    
    const successfulAnalyses = (output.match(/analysis completed successfully/g) || []).length;
    console.log(`✅ Successful analyses: ${successfulAnalyses}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testJSONRecovery(); 