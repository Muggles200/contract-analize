# Database Indexing Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing and maintaining the comprehensive database indexing strategy for the contract analysis application.

## Implementation Steps

### 1. Apply Database Indexes

The indexes have been added to the Prisma schema. To apply them to your database:

```bash
# Generate and apply the migration
npx prisma migrate dev --name add-performance-indexes

# For production deployment
npx prisma migrate deploy
```

### 2. Verify Index Creation

After running the migration, verify that all indexes were created successfully:

```sql
-- Check all indexes in the database
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 3. Test Index Performance

Run the performance testing script to validate index effectiveness:

```bash
npm run index:test
```

This script will:
- Test common query patterns
- Measure execution times
- Provide performance recommendations
- Identify potential bottlenecks

### 4. Monitor Index Usage

Regularly monitor index usage to ensure optimal performance:

```bash
# Analyze current index performance
npm run index:analyze

# Generate maintenance scripts
npm run index:maintenance
```

## Index Categories Implemented

### Primary Indexes
- All models have automatic primary key indexes
- Fastest lookup method for individual records

### Foreign Key Indexes
- **User-related**: `userId` fields across all related tables
- **Organization-related**: `organizationId` fields for multi-tenant queries
- **Contract-related**: `contractId` fields for analysis and file relationships

### Composite Indexes
- **Authentication**: OAuth provider lookups, session management
- **Contract Management**: User/org + status, type, date combinations
- **Analysis Results**: Contract + user + status combinations
- **Analytics**: User/org + event type + timestamp combinations
- **File Processing**: Contract + processing status combinations

### Partial Indexes (Soft Delete Optimization)
- Optimize queries that filter out soft-deleted records
- Include `deletedAt` in composite indexes for active record queries

### Temporal Indexes
- All `createdAt` and `updatedAt` fields indexed
- Support time-based queries and reporting

## Performance Testing

### Running Performance Tests

```bash
npm run index:test
```

### Expected Results

With proper indexing, you should see:
- **Authentication queries**: < 5ms
- **Contract lookups**: < 10ms
- **Analysis results**: < 15ms
- **Analytics queries**: < 20ms
- **File processing**: < 10ms

### Interpreting Results

The test script provides:
- Execution times for each query type
- Row counts returned
- Performance recommendations
- Identification of slow queries

## Maintenance Strategy

### Regular Monitoring

```bash
# Monthly index analysis
npm run index:analyze
```

### Maintenance Tasks

1. **VACUUM Operations**
   ```sql
   -- For tables with high dead tuple ratios
   VACUUM ANALYZE table_name;
   ```

2. **Statistics Updates**
   ```sql
   -- Update table statistics
   ANALYZE;
   ```

3. **Index Rebuilding** (if needed)
   ```sql
   -- Rebuild fragmented indexes
   REINDEX INDEX index_name;
   ```

### Unused Index Detection

The maintenance script identifies unused indexes that can be safely dropped:

```sql
-- Review before dropping
DROP INDEX IF EXISTS unused_index_name;
```

## Query Optimization Best Practices

### 1. Use Indexed Fields in WHERE Clauses

✅ **Good**:
```typescript
// Uses composite index [userId, status, deletedAt]
const contracts = await prisma.contract.findMany({
  where: {
    userId: session.user.id,
    status: 'completed',
    deletedAt: null
  }
})
```

❌ **Avoid**:
```typescript
// Doesn't use indexes effectively
const contracts = await prisma.contract.findMany({
  where: {
    OR: [
      { contractName: { contains: 'employment' } },
      { contractType: 'employment' }
    ]
  }
})
```

### 2. Leverage Composite Indexes

✅ **Good**:
```typescript
// Uses [userId, createdAt] index
const recentContracts = await prisma.contract.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

### 3. Optimize Pagination

✅ **Good**:
```typescript
// Uses indexed cursor for efficient pagination
const contracts = await prisma.contract.findMany({
  where: { userId: session.user.id },
  cursor: { id: lastId },
  take: 20,
  orderBy: { createdAt: 'desc' }
})
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Query Execution Times**
   - Set alerts for queries > 100ms
   - Monitor average response times

2. **Index Usage Statistics**
   - Track index hit rates
   - Identify unused indexes

3. **Table Bloat**
   - Monitor dead tuple ratios
   - Alert when > 10% dead tuples

### Performance Alerts

```sql
-- Query for slow queries
SELECT 
    query,
    calls,
    mean_time,
    total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

## Troubleshooting

### Common Issues

1. **Slow Queries Despite Indexes**
   - Check if queries use indexed fields
   - Verify index selectivity
   - Consider query plan analysis

2. **High Write Overhead**
   - Review index count per table
   - Consider dropping unused indexes
   - Use batch operations

3. **Index Fragmentation**
   - Monitor index bloat
   - Rebuild indexes periodically
   - Use VACUUM operations

### Debugging Queries

```sql
-- Analyze query execution plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM contracts 
WHERE userId = 'user-id' 
  AND status = 'completed';
```

## Production Considerations

### Deployment Checklist

- [ ] Run performance tests in staging
- [ ] Monitor query performance after deployment
- [ ] Set up index usage monitoring
- [ ] Configure maintenance schedules
- [ ] Document any custom indexes

### Scaling Considerations

1. **Large Tables (>1M rows)**
   - Consider table partitioning
   - Implement archive strategies
   - Monitor index maintenance overhead

2. **High Write Load**
   - Review index impact on writes
   - Consider deferring index creation
   - Use batch operations

3. **Multi-tenant Optimization**
   - Ensure organization-based indexes
   - Monitor tenant isolation
   - Consider tenant-specific optimizations

## Conclusion

This indexing strategy provides comprehensive coverage for the application's query patterns while maintaining good write performance. Regular monitoring and maintenance ensure optimal database performance as the application scales.

For questions or issues, refer to the main indexing strategy document or contact the development team. 