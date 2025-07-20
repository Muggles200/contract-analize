#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

function checkEnvironment() {
  console.log('🔍 Checking AI Testing Environment...\n');
  
  let allGood = true;
  
  // Check for .env.local file
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ Found .env.local file');
    const content = fs.readFileSync(envLocalPath, 'utf8');
    
    if (content.includes('OPENAI_API_KEY=')) {
      if (content.includes('OPENAI_API_KEY=your_openai_api_key_here')) {
        console.log('⚠️  OPENAI_API_KEY is set but needs to be updated with real key');
        allGood = false;
      } else {
        console.log('✅ OPENAI_API_KEY appears to be configured');
      }
    } else {
      console.log('❌ OPENAI_API_KEY not found in .env.local');
      allGood = false;
    }
  } else if (fs.existsSync(envPath)) {
    console.log('✅ Found .env file');
    const content = fs.readFileSync(envPath, 'utf8');
    
    if (content.includes('OPENAI_API_KEY=')) {
      if (content.includes('OPENAI_API_KEY=your_openai_api_key_here')) {
        console.log('⚠️  OPENAI_API_KEY is set but needs to be updated with real key');
        allGood = false;
      } else {
        console.log('✅ OPENAI_API_KEY appears to be configured');
      }
    } else {
      console.log('❌ OPENAI_API_KEY not found in .env file');
      allGood = false;
    }
  } else {
    console.log('❌ No .env.local or .env file found');
    allGood = false;
  }
  
  // Check if required files exist
  const requiredFiles = [
    'lib/ai-analysis.ts',
    'lib/test-ai-improvements.ts',
    'scripts/test-ai.ts',
    'scripts/test-ai-simple.ts'
  ];
  
  console.log('\n📁 Checking required files:');
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - missing`);
      allGood = false;
    }
  });
  
  // Check package.json scripts
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    console.log('\n📦 Checking package.json scripts:');
    const requiredScripts = ['test:ai', 'test:ai:simple', 'test:ai:setup'];
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        console.log(`✅ ${script}`);
      } else {
        console.log(`❌ ${script} - missing`);
        allGood = false;
      }
    });
  }
  
  return allGood;
}

function showInstructions() {
  console.log('\n📋 SETUP INSTRUCTIONS:');
  console.log('=' .repeat(60));
  console.log('1. Create a .env.local file in your project root:');
  console.log('   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env.local');
  console.log('');
  console.log('2. Get your OpenAI API key from:');
  console.log('   https://platform.openai.com/api-keys');
  console.log('');
  console.log('3. Make sure your OpenAI account has credits');
  console.log('');
  console.log('4. Test the setup:');
  console.log('   pnpm run test:ai:setup');
  console.log('');
  console.log('5. Run a simple test:');
  console.log('   pnpm run test:ai:simple');
  console.log('');
  console.log('6. Run full test suite:');
  console.log('   pnpm run test:ai');
  console.log('=' .repeat(60));
}

async function main() {
  console.log('🚀 AI Testing Environment Check\n');
  console.log('=' .repeat(50));
  
  const isReady = checkEnvironment();
  
  if (isReady) {
    console.log('\n🎉 Environment looks good!');
    console.log('You can now run:');
    console.log('  pnpm run test:ai:simple');
  } else {
    console.log('\n⚠️  Environment needs setup');
    showInstructions();
  }
  
  console.log('\n' + '=' .repeat(50));
}

main().catch(console.error); 