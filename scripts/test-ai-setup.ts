#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import * as fs from 'fs';
import * as path from 'path';

function checkEnvironmentSetup() {
  console.log('🔧 Checking AI Testing Environment Setup...\n');
  
  // Check for .env.local file
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');
  
  let envFileExists = false;
  let envFileContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envFileExists = true;
    envFileContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('✅ Found .env.local file');
  } else if (fs.existsSync(envPath)) {
    envFileExists = true;
    envFileContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found .env file');
  } else {
    console.log('❌ No .env.local or .env file found');
  }
  
  // Check for OPENAI_API_KEY
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  const envFileHasKey = envFileContent.includes('OPENAI_API_KEY=') && !envFileContent.includes('OPENAI_API_KEY=your_openai_api_key_here');
  
  if (hasOpenAIKey) {
    console.log('✅ OPENAI_API_KEY is set in environment');
  } else if (envFileHasKey) {
    console.log('✅ OPENAI_API_KEY is found in environment file');
  } else {
    console.log('❌ OPENAI_API_KEY is missing or not properly configured');
  }
  
  // Provide setup instructions
  if (!envFileExists || (!hasOpenAIKey && !envFileHasKey)) {
    console.log('\n📋 SETUP INSTRUCTIONS:');
    console.log('=' .repeat(50));
    console.log('1. Create a .env.local file in your project root:');
    console.log('   touch .env.local');
    console.log('');
    console.log('2. Add your OpenAI API key to .env.local:');
    console.log('   OPENAI_API_KEY=sk-your-actual-api-key-here');
    console.log('');
    console.log('3. Get your API key from: https://platform.openai.com/api-keys');
    console.log('');
    console.log('4. Make sure your OpenAI account has credits');
    console.log('');
    console.log('5. Run the test again:');
    console.log('   pnpm run test:ai:simple');
    console.log('=' .repeat(50));
    
    return false;
  }
  
  console.log('\n✅ Environment setup looks good!');
  return true;
}

function createSampleEnvFile() {
  const envContent = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (if needed for testing)
DATABASE_URL="postgresql://username:password@localhost:5432/contract_analyze"

# NextAuth Configuration (if needed for testing)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (if needed for testing)
RESEND_API_KEY=your_resend_api_key_here

# Other Configuration
NODE_ENV=development
`;
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Created .env.local file with template');
    console.log('⚠️  Please edit .env.local and add your actual API keys');
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🚀 AI Testing Environment Setup\n');
  console.log('=' .repeat(50));
  
  const isSetup = checkEnvironmentSetup();
  
  if (!isSetup) {
    const created = createSampleEnvFile();
    if (created) {
      console.log('\n📝 Next steps:');
      console.log('1. Edit .env.local and replace "your_openai_api_key_here" with your actual API key');
      console.log('2. Run: pnpm run test:ai:simple');
    }
  } else {
    console.log('\n🎉 Ready to test! Run:');
    console.log('   pnpm run test:ai:simple');
  }
  
  console.log('\n' + '=' .repeat(50));
}

main().catch(console.error); 