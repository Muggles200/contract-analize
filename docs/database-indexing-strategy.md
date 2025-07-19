# Database Indexing Strategy

## Overview

This document outlines the comprehensive indexing strategy implemented for the contract analysis application database. The indexes are designed to optimize the most common query patterns while maintaining good write performance.

## Index Categories

### 1. Primary Indexes (Already Present)
- All models have `@id` fields which automatically create primary indexes
- These are the fastest lookup indexes for individual records

### 2. Foreign Key Indexes
All foreign key relationships have been indexed to optimize JOIN operations:

**User-related foreign keys:**
- `Account.userId`
- `Session.userId`
- `Authenticator.userId`
- `OrganizationMember.userId`
- `Subscription.userId`
- `Contract.userId`
- `AnalysisResult.userId`
- `UsageLog.userId`
- `AnalyticsEvent.userId`
- `UserActivity.userId`

**Organization-related foreign keys:**
- `OrganizationMember.organizationId`
- `Subscription.organizationId`
- `Contract.organizationId`
- `AnalysisResult.organizationId`
- `UsageLog.organizationId`
- `AnalyticsEvent.organizationId`
- `UserActivity.organizationId`

**Contract-related foreign keys:**
- `AnalysisResult.contractId`
- `ContractFile.contractId`
- `FileMetadata.contractFileId`

### 3. Unique Constraints
- `User.email` - Ensures unique email addresses
- `Organization.slug` - Ensures unique organization slugs
- `OrganizationMember.[organizationId, userId]` - Ensures unique membership
- `Account.[provider, providerAccountId]` - Ensures unique OAuth accounts
- `Session.sessionToken` - Ensures unique session tokens
- `Authenticator.credentialID` - Ensures unique WebAuthn credentials
- `FileMetadata.contractFileId` - Ensures one metadata record per file

### 4. Composite Indexes

#### Authentication & Session Management
- `Account.[provider, providerAccountId]` - OAuth provider lookups
- `Authenticator.[userId, credentialID]` - WebAuthn credential lookups

#### Contract Management
- `Contract.[userId, deletedAt]` - User's active contracts
- `Contract.[organizationId, deletedAt]` - Organization's active contracts
- `Contract.[userId, status]` - User's contracts by status
- `Contract.[organizationId, status]` - Organization's contracts by status
- `Contract.[userId, contractType]` - User's contracts by type
- `Contract.[organizationId, contractType]` - Organization's contracts by type
- `Contract.[userId, createdAt]` - User's contracts by creation date
- `Contract.[organizationId, createdAt]` - Organization's contracts by creation date
- `Contract.[userId, status, deletedAt]` - User's active contracts by status
- `Contract.[organizationId, status, deletedAt]` - Organization's active contracts by status

#### Analysis Results
- `AnalysisResult.[userId, status]` - User's analysis results by status
- `AnalysisResult.[organizationId, status]` - Organization's analysis results by status
- `AnalysisResult.[contractId, status]` - Contract's analysis results by status
- `AnalysisResult.[userId, analysisType]` - User's analysis results by type
- `AnalysisResult.[organizationId, analysisType]` - Organization's analysis results by type
- `AnalysisResult.[userId, createdAt]` - User's analysis results by date
- `AnalysisResult.[organizationId, createdAt]` - Organization's analysis results by date
- `AnalysisResult.[contractId, createdAt]` - Contract's analysis results by date

#### Usage & Analytics
- `UsageLog.[userId, action]` - User's actions
- `UsageLog.[organizationId, action]` - Organization's actions
- `UsageLog.[userId, createdAt]` - User's activity timeline
- `UsageLog.[organizationId, createdAt]` - Organization's activity timeline
- `UsageLog.[userId, action, createdAt]` - User's specific actions over time
- `UsageLog.[organizationId, action, createdAt]` - Organization's specific actions over time

- `AnalyticsEvent.[userId, eventType]` - User's event types
- `AnalyticsEvent.[organizationId, eventType]` - Organization's event types
- `AnalyticsEvent.[userId, timestamp]` - User's event timeline
- `AnalyticsEvent.[organizationId, timestamp]` - Organization's event timeline
- `AnalyticsEvent.[eventType, timestamp]` - Global event types over time
- `AnalyticsEvent.[userId, eventType, timestamp]` - User's specific events over time
- `AnalyticsEvent.[organizationId, eventType, timestamp]` - Organization's specific events over time

- `UserActivity.[userId, activityType]` - User's activity types
- `UserActivity.[organizationId, activityType]` - Organization's activity types
- `UserActivity.[userId, createdAt]` - User's activity timeline
- `UserActivity.[organizationId, createdAt]` - Organization's activity timeline
- `UserActivity.[activityType, createdAt]` - Global activity types over time
- `UserActivity.[userId, activityType, createdAt]` - User's specific activities over time
- `UserActivity.[organizationId, activityType, createdAt]` - Organization's specific activities over time

#### File Management
- `ContractFile.[contractId, isProcessed]` - Contract's processed files
- `ContractFile.[contractId, mimeType]` - Contract's files by type
- `FileMetadata.[contractFileId, processingStatus]` - File processing status

#### Billing & Subscriptions
- `Subscription.[userId, status]` - User's subscription status
- `Subscription.[organizationId, status]` - Organization's subscription status

#### Organization Management
- `OrganizationMember.[organizationId, role]` - Organization members by role

### 5. Partial Indexes (Soft Delete Optimization)
The following indexes include `deletedAt` to optimize queries that filter out soft-deleted records:
- `Contract.[userId, deletedAt]`
- `Contract.[organizationId, deletedAt]`
- `Contract.[userId, status, deletedAt]`
- `Contract.[organizationId, status, deletedAt]`

### 6. Temporal Indexes
All models with `createdAt` timestamps have indexes to support time-based queries:
- `User.createdAt`
- `Organization.createdAt`
- `Contract.createdAt`
- `AnalysisResult.createdAt`
- `UsageLog.createdAt`
- `ContractFile.createdAt`
- `FileMetadata.createdAt`
- `AnalyticsEvent.timestamp`
- `UserActivity.createdAt`
- `PerformanceMetric.timestamp`

## Query Pattern Optimization

### 1. Authentication Queries
- **User lookup by email**: `@@index([email])` on User model
- **Session validation**: `@@index([expires])` on Session model
- **OAuth account lookup**: `@@index([provider, providerAccountId])` on Account model

### 2. Contract Management Queries
- **User's contracts with pagination**: `@@index([userId, createdAt])`
- **Organization's contracts**: `@@index([organizationId, createdAt])`
- **Contracts by status**: `@@index([userId, status])` and `@@index([organizationId, status])`
- **Active contracts only**: `@@index([userId, deletedAt])` and `@@index([organizationId, deletedAt])`

### 3. Analysis Results Queries
- **User's analysis results**: `@@index([userId, createdAt])`
- **Contract's analysis results**: `@@index([contractId, createdAt])`
- **Results by status**: `@@index([userId, status])` and `@@index([contractId, status])`

### 4. Analytics & Usage Tracking
- **User activity timeline**: `@@index([userId, createdAt])`
- **Event tracking**: `@@index([userId, eventType, timestamp])`
- **Action logging**: `@@index([userId, action, createdAt])`

### 5. File Processing
- **File processing status**: `@@index([contractId, isProcessed])`
- **File type filtering**: `@@index([contractId, mimeType])`

## Performance Considerations

### Write Performance
- Indexes add overhead to INSERT, UPDATE, and DELETE operations
- The most critical write operations (user registration, contract upload) are optimized
- Batch operations should be used for bulk data insertion

### Read Performance
- Most common queries are covered by composite indexes
- Time-based queries are optimized with temporal indexes
- Soft delete filtering is optimized with partial indexes

### Storage Impact
- Indexes consume additional storage space
- Estimated 20-30% storage overhead for the current index strategy
- Regular monitoring of index usage is recommended

## Maintenance Strategy

### Index Monitoring
```sql
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

### Index Maintenance
- PostgreSQL automatically maintains indexes
- Regular VACUUM operations help maintain index efficiency
- Consider REINDEX for heavily fragmented indexes

### Performance Testing
- Use `EXPLAIN ANALYZE` to verify query plans
- Monitor query execution times
- Test with realistic data volumes

## Migration Commands

To apply these indexes to your database:

```bash
# Generate and apply migration
npx prisma migrate dev --name add-performance-indexes

# For production deployment
npx prisma migrate deploy
```

## Future Considerations

### Potential Additional Indexes
- Full-text search indexes on contract content (when implemented)
- GIN indexes for JSON field queries (if needed)
- Partial indexes for specific business rules

### Monitoring & Optimization
- Regular review of query performance
- Analysis of slow query logs
- Index usage statistics monitoring
- Consider dropping unused indexes

## Conclusion

This indexing strategy provides comprehensive coverage for the application's query patterns while maintaining good write performance. The indexes are designed to scale with the application's growth and support the most common user interactions efficiently. 