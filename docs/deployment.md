# Deployment Guide

## Overview

This guide covers the complete deployment process for the AI-Powered Contract Review Tool on Vercel, including all necessary services and configurations.

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account
- [ ] Neon database account
- [ ] Stripe account
- [ ] OpenAI API key
- [ ] Resend account
- [ ] Google/GitHub OAuth applications (for authentication)

## Step 1: Repository Setup

### 1.1 Initialize Git Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/contract-analize.git
cd contract-analize

# Set up remote origin
git remote add origin https://github.com/yourusername/contract-analize.git
git branch -M main
git push -u origin main
```

### 1.2 Configure Branch Protection
- Go to GitHub repository settings
- Navigate to "Branches" section
- Add rule for `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date
  - Restrict pushes to matching branches

## Step 2: Database Setup (Neon)

### 2.1 Create Neon Project
1. Sign up/login to [Neon](https://neon.tech)
2. Create new project
3. Choose region closest to your users
4. Note down the connection string

### 2.2 Configure Database
```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 2.3 Set Up Connection Pooling
- Configure connection pooling in Neon dashboard
- Set pool size based on expected load
- Enable connection monitoring

## Step 3: Vercel Project Setup

### 3.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3.2 Configure Environment Variables
Add the following environment variables in Vercel:

#### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
```

#### Authentication
```
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### OAuth Providers
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### External Services
```
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
OPENAI_API_KEY=sk-your-openai-api-key
RESEND_API_KEY=re_your-resend-api-key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your-token
```

#### Application
```
NODE_ENV=production
APP_URL=https://your-domain.vercel.app
APP_NAME=Contract Analize
```

### 3.3 Configure Custom Domain (Optional)
1. Go to project settings in Vercel
2. Navigate to "Domains" section
3. Add your custom domain
4. Configure DNS records as instructed
5. Update `NEXTAUTH_URL` to use custom domain

## Step 4: External Services Configuration

### 4.1 Stripe Setup
1. Create Stripe account and get API keys
2. Set up products and pricing plans:
   - Free: $0/month (2 reviews)
   - Basic: $29/month (10 reviews)
   - Pro: $49/month (50 reviews)
   - Enterprise: $99/month (unlimited)
3. Configure webhook endpoint:
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Test webhook delivery

### 4.2 OpenAI Configuration
1. Create OpenAI account
2. Generate API key
3. Set up usage limits and billing
4. Test API connectivity

### 4.3 Resend Email Setup
1. Create Resend account
2. Verify your domain
3. Create email templates:
   - Welcome email
   - Password reset
   - Analysis complete
   - Billing updates
4. Test email delivery

### 4.4 Vercel Blob Storage
1. Create Vercel Blob store
2. Configure access permissions
3. Set up file retention policies
4. Test file upload functionality

### 4.5 OAuth Applications

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy Client ID and Secret

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://your-domain.vercel.app/api/auth/callback/github`
4. Copy Client ID and Secret

## Step 5: Database Migrations

### 5.1 Initial Migration
```bash
# Generate Prisma client
npm run db:generate

# Apply migrations to production
npm run db:migrate
```

### 5.2 Seed Data (Optional)
```bash
# Run seed script
npm run db:seed
```

## Step 6: Monitoring and Analytics

### 6.1 Vercel Built-in Analytics
1. Enable Vercel Analytics in project settings
2. Configure event tracking in your app
3. View analytics in Vercel dashboard

### 6.2 Vercel Built-in Monitoring
1. Enable Vercel Speed Insights in project settings
2. Monitor Core Web Vitals automatically
3. View performance metrics in Vercel dashboard
4. Set up performance alerts (optional)

### 6.3 Error Tracking (Optional - Sentry)
1. Create Sentry account (only if you need advanced error tracking)
2. Set up project for Next.js
3. Install `@sentry/nextjs` package
4. Add DSN to environment variables
5. Configure error reporting

## Step 7: Security Configuration

### 7.1 Security Headers
Configure security headers in `next.config.ts`:
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### 7.2 Rate Limiting
1. Install rate limiting middleware
2. Configure limits for API endpoints
3. Set up monitoring and alerts

### 7.3 CORS Configuration
Configure CORS for production domains only:
```typescript
const corsOptions = {
  origin: ['https://your-domain.vercel.app'],
  credentials: true
};
```

## Step 8: CI/CD Pipeline

### 8.1 GitHub Actions Setup
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.2 Environment Secrets
Add the following secrets to GitHub:
- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Vercel organization ID
- `PROJECT_ID`: Vercel project ID

## Step 9: Testing Deployment

### 9.1 Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] External services connected
- [ ] OAuth applications configured
- [ ] Security headers set up
- [ ] Monitoring configured

### 9.2 Post-deployment Testing
1. **Authentication Flow**
   - Test user registration
   - Test OAuth login
   - Test password reset
   - Test session management

2. **Core Features**
   - Test file upload
   - Test AI analysis
   - Test billing integration
   - Test email notifications

3. **Performance Testing**
   - Test page load times
   - Test API response times
   - Test file upload speeds
   - Test concurrent users

4. **Security Testing**
   - Test authentication security
   - Test file upload security
   - Test API security
   - Test data protection

## Step 10: Production Optimization

### 10.1 Performance Optimization
1. Enable Next.js optimizations:
   - Image optimization
   - Code splitting
   - Static generation
   - Incremental Static Regeneration

2. Configure caching:
   - API response caching
   - Static asset caching
   - Database query caching

3. Optimize bundle size:
   - Tree shaking
   - Code splitting
   - Dynamic imports

### 10.2 Monitoring Setup
1. Set up uptime monitoring
2. Configure performance alerts
3. Set up error rate monitoring
4. Configure business metrics tracking

### 10.3 Backup and Recovery
1. Set up database backups
2. Configure file storage backups
3. Test recovery procedures
4. Document disaster recovery plan

## Step 11: Maintenance

### 11.1 Regular Maintenance Tasks
- [ ] Monitor application performance
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Monitor costs and usage
- [ ] Backup verification
- [ ] Performance optimization

### 11.2 Update Procedures
1. **Dependency Updates**
   ```bash
   npm audit
   npm update
   npm run test
   ```

2. **Database Migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Deployment Updates**
   - Create feature branch
   - Test changes locally
   - Create pull request
   - Deploy to staging
   - Deploy to production

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify connection string format
- Check network connectivity
- Verify database credentials
- Check connection pooling settings

#### Authentication Issues
- Verify OAuth application settings
- Check redirect URIs
- Verify environment variables
- Test OAuth flow

#### File Upload Issues
- Check Vercel Blob configuration
- Verify file size limits
- Check file type restrictions
- Test upload functionality

#### Billing Issues
- Verify Stripe webhook configuration
- Check subscription status
- Verify payment method
- Test billing flow

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Auth.js Documentation](https://next-auth.js.org)

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest and in transit
- Implement proper access controls
- Regular security audits
- GDPR compliance measures

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Security headers

### Monitoring
- Real-time security monitoring
- Automated threat detection
- Regular security assessments
- Incident response procedures

---

**Notes:**
- Always test in staging environment first
- Keep backups of all configurations
- Monitor costs and usage regularly
- Document all changes and procedures
- Have a rollback plan ready
- Regular security reviews and updates 