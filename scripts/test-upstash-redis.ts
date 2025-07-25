#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { Redis } from '@upstash/redis';
import Queue from 'bull';

async function testUpstashRedisConnection() {
  console.log('🔍 Testing Upstash Redis connection...\n');

  // Check environment variables
  const hasUpstashEnv = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!hasUpstashEnv) {
    console.log('❌ Upstash Redis environment variables not found');
    console.log('Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    return;
  }

  console.log('✅ Upstash Redis environment variables found');

  try {
    // Test direct Upstash Redis connection
    console.log('\n📡 Testing direct Upstash Redis connection...');
    const redis = Redis.fromEnv();
    
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    
    if (value === 'test-value') {
      console.log('✅ Direct Upstash Redis connection successful');
    } else {
      console.log('❌ Direct Upstash Redis connection failed');
      return;
    }

    // Note: Bull queues don't work with Upstash Redis REST API
    // For Vercel deployments, we'll use direct function calls instead
    console.log('\n📋 Bull queues are not compatible with Upstash Redis REST API');
    console.log('✅ For Vercel deployments, job processing will use direct function calls');
    console.log('✅ This is the recommended approach for serverless environments');
    
    // Clean up test data
    await redis.del('test-key');
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Upstash Redis connection failed:', error);
    process.exit(1);
  }
}

testUpstashRedisConnection(); 