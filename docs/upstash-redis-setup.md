# Upstash Redis Setup Guide

This guide will help you set up Upstash Redis for your ContractAnalyze application on Vercel.

## Prerequisites

- Vercel account with your project deployed
- Upstash Redis database created in Vercel

## Step 1: Get Your Upstash Redis Credentials

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Storage" tab
4. Find your Upstash Redis database
5. Copy the following values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Step 2: Configure Environment Variables

### For Local Development

Create a `.env.local` file in your project root with:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here

# Other required environment variables...
DATABASE_URL="postgresql://username:password@localhost:5432/contract_analyze"
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
# ... add other required variables
```

### For Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following variables:
   - `UPSTASH_REDIS_REST_URL` = your Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN` = your Upstash Redis REST token

## Step 3: Test the Connection

Run the test script to verify your Upstash Redis connection:

```bash
npm run test:upstash-redis
```

Expected output:
```
🔍 Testing Upstash Redis connection...

✅ Upstash Redis environment variables found

📡 Testing direct Upstash Redis connection...
✅ Direct Upstash Redis connection successful

📋 Testing Bull queue with Upstash Redis...
✅ Successfully added job to queue: 1
✅ Successfully processed job: { message: 'Hello Upstash Redis!' }
✅ Bull queue with Upstash Redis test completed successfully!
🧹 Test data cleaned up
```

## Step 4: Verify Job Queues Are Working

Start your development server:

```bash
npm run dev
```

You should no longer see Redis connection errors in your console. The job queues will now use Upstash Redis instead of trying to connect to a local Redis instance.

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure `.env.local` exists in your project root
   - Check that variable names are exactly as shown
   - Restart your development server after adding variables

2. **Connection Refused Errors**
   - Verify your Upstash Redis credentials are correct
   - Check that your Upstash Redis database is active
   - Ensure you're using the REST URL and token (not the regular Redis URL)

3. **Bull Queue Errors**
   - Bull queues require specific Redis configuration for Upstash
   - The configuration is already set up in `lib/job-queue.ts`
   - Make sure the `@upstash/redis` package is installed

### Testing Individual Components

You can test specific parts of the Redis setup:

```bash
# Test direct Redis connection
npm run test:upstash-redis

# Test the full application
npm run dev
```

## Production Deployment

When deploying to Vercel:

1. Ensure environment variables are set in Vercel dashboard
2. The application will automatically use Upstash Redis in production
3. Job queues will work seamlessly with your Vercel deployment

## Monitoring

You can monitor your Redis usage in the Upstash dashboard:

1. Go to your Upstash Redis database in Vercel
2. Check the "Usage" tab for metrics
3. Monitor queue performance in your application logs

## Cost Optimization

- Upstash Redis free tier includes 10,000 requests per day
- Monitor your usage to avoid unexpected charges
- Consider upgrading if you exceed the free tier limits 