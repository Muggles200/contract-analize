# Redis Setup Guide

## Overview

This application uses Redis for job queues (Bull queues) to handle background tasks like email sending, data exports, and contract analysis.

## Setup Options

### Option 1: Upstash Redis Cloud (Recommended)

1. **Create Upstash Redis Cloud account:**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Sign up for a free account
   - Create a new Redis database (not KV)

2. **Get connection details:**
   - Copy the Redis URL from your database dashboard
   - It will look like: `redis://username:password@host:port`

3. **Set environment variables:**
   ```env
   REDIS_URL=redis://username:password@host:port
   REDIS_TLS=true
   ```

### Option 2: Redis Cloud

1. **Create Redis Cloud account:**
   - Go to [Redis Cloud](https://redis.com/try-free/)
   - Sign up for a free account
   - Create a new database

2. **Get connection details:**
   - Copy the connection string from your database dashboard

3. **Set environment variables:**
   ```env
   REDIS_URL=redis://username:password@host:port
   REDIS_TLS=true
   ```

### Option 3: Local Redis (Development)

1. **Install Redis locally:**
   ```bash
   # Using Docker
   docker run -d --name redis -p 6379:6379 redis:alpine
   
   # Or install directly on your system
   ```

2. **Set environment variables:**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_TLS=false
   ```

## Testing

Run the Redis test script to verify your setup:

```bash
npm run test:redis
```

## Vercel Deployment

1. **Add environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add `REDIS_URL` with your Redis connection string
   - Add `REDIS_TLS=true`

2. **Deploy your application:**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Check if Redis server is running
   - Verify connection string is correct
   - Ensure network connectivity

2. **TLS errors:**
   - Set `REDIS_TLS=true` for cloud Redis providers
   - Set `REDIS_TLS=false` for local Redis

3. **Authentication errors:**
   - Verify username and password in connection string
   - Check if Redis requires authentication

### Testing Commands

```bash
# Test Redis connection
npm run test:redis

# Check environment variables
echo $REDIS_URL

# Test with redis-cli (if available)
redis-cli -u $REDIS_URL ping
```

## Job Queue Types

The application uses the following job queues:

- **data-export**: User data export requests
- **email-sending**: Email notifications
- **notification-delivery**: Push and browser notifications
- **cleanup-maintenance**: System cleanup tasks
- **contract-analysis**: AI contract analysis jobs

## Monitoring

Monitor your job queues through the application's admin interface or by checking the database `jobLog` table for job execution history. 