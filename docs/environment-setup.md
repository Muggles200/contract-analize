# Environment Configuration Guide

## Overview

This guide covers the complete environment setup for the ContractAnalyze application. The application uses a centralized environment configuration system that validates all environment variables at startup and provides type-safe access throughout the codebase.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your environment variables** (see sections below)

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Configuration System

The application uses a centralized configuration system located in `lib/env.ts` that:

- **Validates** all environment variables at startup using Zod schemas
- **Provides type safety** with TypeScript
- **Groups related variables** into logical categories
- **Offers helper functions** for common checks (e.g., `isDevelopment`, `isProduction`)

### Usage in Code

```typescript
import { config } from '@/lib/env'

// Access grouped configuration
const dbUrl = config.database.url
const stripeKey = config.stripe.secretKey
const appName = config.app.name

// Use helper functions
import { isDevelopment, isProduction } from '@/lib/env'
if (isDevelopment) {
  // Development-only code
}
```

## Required Environment Variables

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `DIRECT_URL` | Direct database connection (optional) | `postgresql://user:pass@localhost:5432/db` |

**Setup:**
1. Create a PostgreSQL database (Neon, Supabase, or local)
2. Copy the connection string to your `.env.local`

### Authentication Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption | Generate with: `openssl rand -base64 32` |

**Setup:**
1. Generate a secret: `openssl rand -base64 32`
2. Set the URL to your application domain

### OAuth Providers

#### Google OAuth

| Variable | Description | Setup |
|----------|-------------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com) |

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth

| Variable | Description | Setup |
|----------|-------------|-------|
| `GITHUB_ID` | GitHub OAuth app client ID | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_SECRET` | GitHub OAuth app client secret | [GitHub Developer Settings](https://github.com/settings/developers) |

**Setup:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### AI Services

#### OpenAI

| Variable | Description | Setup |
|----------|-------------|-------|
| `OPENAI_API_KEY` | OpenAI API key | [OpenAI Platform](https://platform.openai.com/api-keys) |

**Setup:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Set usage limits and billing

### Payment Processing

#### Stripe

| Variable | Description | Setup |
|----------|-------------|-------|
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |

**Setup:**
1. Create a [Stripe account](https://stripe.com)
2. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Get webhook secret from webhook settings

### Email Services

#### Resend

| Variable | Description | Setup |
|----------|-------------|-------|
| `RESEND_API_KEY` | Resend API key | [Resend Dashboard](https://resend.com/api-keys) |

**Setup:**
1. Create a [Resend account](https://resend.com)
2. Verify your domain
3. Get API key from dashboard

### File Storage

#### Vercel Blob

| Variable | Description | Setup |
|----------|-------------|-------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

**Setup:**
1. Create Vercel Blob store in your Vercel project
2. Get the read-write token from Vercel dashboard

### Analytics & Monitoring

#### Google Analytics

| Variable | Description | Setup |
|----------|-------------|-------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID | [Google Analytics](https://analytics.google.com) |

**Setup:**
1. Create [Google Analytics](https://analytics.google.com) property
2. Get the measurement ID (G-XXXXXXXXXX format)

### Application Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ContractAnalyze` |
| `NEXT_PUBLIC_APP_DOMAIN` | Your domain | `contractanalize.com` |
| `NEXT_PUBLIC_APP_EMAIL_FROM` | From email address | `noreply@contractanalize.com` |
| `NEXT_PUBLIC_APP_EMAIL_SUPPORT` | Support email | `support@contractanalize.com` |
| `NEXT_PUBLIC_OG_IMAGE` | Open Graph image path | `/og-image.png` |
| `NEXT_PUBLIC_APP_YEAR` | Current year | `2024` |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console verification | `your-verification-code` |

### Time Constants

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `EMAIL_VERIFICATION_EXPIRY` | Email verification token expiry | `86400000` (24h) | Email verification links |
| `PASSWORD_RESET_EXPIRY` | Password reset token expiry | `3600000` (1h) | Password reset links |
| `ANALYTICS_DEFAULT_PERIOD` | Default analytics period | `604800000` (7d) | Analytics queries |

## Optional Environment Variables

### Error Tracking (Sentry)

| Variable | Description | Setup |
|----------|-------------|-------|
| `SENTRY_DSN` | Sentry DSN for error tracking | [Sentry](https://sentry.io) |

### Caching & Rate Limiting (Redis)

| Variable | Description | Setup |
|----------|-------------|-------|
| `REDIS_URL` | Redis connection URL | Local Redis or cloud provider |

### Additional Monitoring

| Variable | Description | Setup |
|----------|-------------|-------|
| `VERCEL_ANALYTICS_ID` | Vercel Analytics ID | [Vercel Analytics](https://vercel.com/analytics) |

## Environment-Specific Configuration

### Development Environment

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Environment

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Staging Environment

```env
NODE_ENV=production
NEXTAUTH_URL=https://staging.your-domain.com
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
```

## Security Best Practices

### 1. Never Commit Secrets

- Add `.env*` to your `.gitignore`
- Use different keys for each environment
- Regularly rotate API keys

### 2. Use Strong Secrets

```bash
# Generate strong secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -hex 32     # For other secrets
```

### 3. Environment Separation

- Use test keys for development
- Use production keys only in production
- Never use production keys in development

### 4. Access Control

- Limit API key permissions to minimum required
- Use environment-specific API keys
- Monitor API usage regularly

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

**Problem:** Environment variables not available in the application

**Solution:**
- Ensure `.env.local` exists in project root
- Restart the development server
- Check for typos in variable names

#### 2. Validation Errors

**Problem:** Zod validation errors on startup

**Solution:**
- Check that all required variables are set
- Verify variable formats (URLs, emails, etc.)
- Ensure no extra spaces or quotes

#### 3. OAuth Issues

**Problem:** OAuth providers not working

**Solution:**
- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure OAuth apps are properly configured

#### 4. Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
- Verify connection string format
- Check database is running and accessible
- Ensure credentials are correct

### Debug Mode

Enable debug mode to see detailed environment information:

```typescript
// In lib/env.ts, temporarily add:
console.log('Environment config:', JSON.stringify(config, null, 2))
```

## Deployment Configuration

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Use production values for all services
3. Set `NODE_ENV=production`
4. Configure custom domain if needed

### Other Platforms

- **Netlify:** Add environment variables in site settings
- **Railway:** Use Railway's environment variable system
- **Docker:** Use `.env` files or Docker secrets

## Monitoring and Maintenance

### Regular Tasks

1. **Monthly:**
   - Review API usage and costs
   - Check for unused environment variables
   - Update documentation

2. **Quarterly:**
   - Rotate API keys
   - Review security settings
   - Update dependencies

3. **Annually:**
   - Audit all environment variables
   - Review access permissions
   - Update security policies

### Monitoring Tools

- **API Usage:** Monitor usage in service dashboards
- **Error Tracking:** Use Sentry for error monitoring
- **Performance:** Use Vercel Analytics for performance monitoring

## Support

For issues with environment configuration:

1. Check this documentation
2. Review service-specific documentation
3. Check application logs for validation errors
4. Contact support with specific error messages

---

**Note:** Keep this documentation updated as you add new environment variables or change configurations. 