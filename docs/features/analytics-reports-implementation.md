# Analytics Reports Implementation

## Overview

The Analytics Reports system provides comprehensive reporting capabilities for contract analysis data, including multiple report templates, customizable date ranges, and various export formats.

## Features

### ✅ Completed Features

1. **API Endpoints**
   - `GET /api/analytics/reports` - Retrieve report history with pagination
   - `POST /api/analytics/reports` - Generate new reports asynchronously

2. **Report Templates**
   - Overview Report - High-level summary of all activities
   - Usage Report - Detailed usage statistics and patterns
   - Performance Report - Analysis performance and quality metrics
   - Cost Report - Cost analysis and billing insights
   - Risk Report - Risk assessment and mitigation insights
   - Custom Report - User-defined parameters

3. **Report Types**
   - Summary - High-level overview
   - Detailed - Comprehensive analysis
   - Comparison - Comparative analysis

4. **Export Formats**
   - JSON - Structured data format
   - CSV - Spreadsheet format
   - PDF - Document format (placeholder)

5. **Advanced Features**
   - Asynchronous report generation
   - Pagination support
   - Status tracking (processing, completed, failed)
   - Metadata storage
   - Activity logging

## API Usage

### Get Reports

```typescript
const response = await fetch('/api/analytics/reports?page=1&limit=10&status=completed');
const data = await response.json();

// Response format:
{
  reports: ReportHistory[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  },
  stats: {
    total: number,
    completed: number,
    failed: number,
    processing: number,
  },
  availableTemplates: Template[],
  filters: {
    template: string,
    reportType: string,
    dateRange: string,
    status: string,
  }
}
```

### Generate Report

```typescript
const response = await fetch('/api/analytics/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: 'overview',
    reportType: 'summary',
    dateRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z',
    },
    organizationId: 'org_id', // optional
    filters: { // optional
      contractType: 'service_agreement',
      analysisType: 'basic',
    },
    format: 'json', // json, csv, pdf
    includeCharts: true,
    includeRawData: false,
  })
});

// Response format:
{
  message: 'Report generation started',
  reportId: string,
  status: 'processing',
}
```

## Report Templates

### 1. Overview Report

**Purpose**: High-level summary of all activities

**Data Points**:
- Total contracts and analyses
- Period-specific metrics
- Usage statistics
- Recent activity

**Use Case**: Executive dashboards, monthly summaries

### 2. Usage Report

**Purpose**: Detailed usage statistics and patterns

**Data Points**:
- Usage by action type
- Time series data
- Contract type distribution
- Analysis type distribution

**Use Case**: Usage analysis, capacity planning

### 3. Performance Report

**Purpose**: Analysis performance and quality metrics

**Data Points**:
- Processing time metrics
- Confidence scores
- Error rates
- Success rates

**Use Case**: Performance optimization, quality assurance

### 4. Cost Report

**Purpose**: Cost analysis and billing insights

**Data Points**:
- Estimated costs
- Token usage
- Cost by analysis type
- Cost trends

**Use Case**: Cost management, billing optimization

### 5. Risk Report

**Purpose**: Risk assessment and mitigation insights

**Data Points**:
- Risk distribution
- High-risk items
- Risk trends
- Mitigation suggestions

**Use Case**: Risk management, compliance reporting

### 6. Custom Report

**Purpose**: User-defined parameters

**Data Points**: Configurable based on user requirements

**Use Case**: Specialized reporting needs

## Database Schema

### ReportHistory Table

```sql
model ReportHistory {
  id             String    @id @default(cuid())
  userId         String
  organizationId String?
  reportName     String
  description    String?
  template       String
  reportType     String
  frequency      String    // daily, weekly, monthly, quarterly
  dayOfWeek      Int?      // 0-6 for weekly reports
  dayOfMonth     Int?      // 1-31 for monthly reports
  timeOfDay      String?   // HH:MM format
  recipients     Json?     // Array of email addresses
  isActive       Boolean   @default(true)
  lastRunAt      DateTime?
  nextRunAt      DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([organizationId])
  @@index([frequency])
  @@index([isActive])
  @@index([nextRunAt])
  @@index([userId, isActive])
  @@index([organizationId, isActive])
  @@map("scheduled_reports")
}
```

## Report Generation Process

### 1. Request Validation

```typescript
const generateReportSchema = z.object({
  template: z.enum(['overview', 'usage', 'performance', 'cost', 'risk', 'custom']),
  reportType: z.enum(['summary', 'detailed', 'comparison']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  organizationId: z.string().optional(),
  filters: z.record(z.any()).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),
});
```

### 2. Report History Creation

```typescript
const reportHistory = await prisma.reportHistory.create({
  data: {
    userId: session.user.id,
    organizationId: validatedData.organizationId,
    reportName: reportTemplates[validatedData.template].name,
    template: validatedData.template,
    reportType: validatedData.reportType,
    dateRange: {
      start: validatedData.dateRange.start,
      end: validatedData.dateRange.end,
    },
    status: 'processing',
    metadata: {
      filters: validatedData.filters,
      format: validatedData.format,
      includeCharts: validatedData.includeCharts,
      includeRawData: validatedData.includeRawData,
    },
  },
});
```

### 3. Asynchronous Data Generation

```typescript
// Generate report data asynchronously
generateReportData(reportHistory.id, validatedData, session.user.id).catch(error => {
  console.error('Error generating report data:', error);
});
```

### 4. Data Processing

Each template has its own data generation function:

```typescript
async function generateOverviewData(where: any, data: ReportData) {
  const [
    totalContracts,
    totalAnalyses,
    contractsThisPeriod,
    analysesThisPeriod,
    usageStats,
    recentActivity,
  ] = await Promise.all([
    // Database queries for each data point
  ]);

  return {
    overview: { /* ... */ },
    usage: usageStats,
    recentActivity,
    dataPoints: ['contracts', 'analyses', 'usage', 'activity'],
  };
}
```

### 5. Status Updates

```typescript
await prisma.reportHistory.update({
  where: { id: reportId },
  data: {
    status: 'completed',
    filePath,
    fileSize: fileSize ? BigInt(fileSize) : null,
    metadata: {
      ...reportData.metadata,
      generatedAt: new Date().toISOString(),
      dataPoints: reportData.dataPoints || [],
    },
  },
});
```

## Query Parameters

### GET /api/analytics/reports

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `organizationId` | string | - | Filter by organization |
| `template` | string | 'overview' | Filter by template |
| `reportType` | string | 'summary' | Filter by report type |
| `dateRange` | string | 'month' | Filter by date range |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page |
| `status` | string | - | Filter by status (completed, failed, processing) |

### POST /api/analytics/reports

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template` | string | Yes | Report template |
| `reportType` | string | Yes | Report type |
| `dateRange` | object | Yes | Date range with start/end |
| `organizationId` | string | No | Organization ID |
| `filters` | object | No | Additional filters |
| `format` | string | No | Export format |
| `includeCharts` | boolean | No | Include chart data |
| `includeRawData` | boolean | No | Include raw data |

## Error Handling

### Validation Errors

```typescript
if (error instanceof z.ZodError) {
  return NextResponse.json(
    { error: 'Invalid request data', details: error.errors },
    { status: 400 }
  );
}
```

### Processing Errors

```typescript
await prisma.reportHistory.update({
  where: { id: reportId },
  data: {
    status: 'failed',
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
  },
});
```

## Activity Logging

All report generation activities are logged:

```typescript
await prisma.userActivity.create({
  data: {
    userId: session.user.id,
    organizationId: validatedData.organizationId,
    activityType: 'report_generated',
    description: `Generated ${validatedData.template} report`,
    metadata: {
      reportId: reportHistory.id,
      template: validatedData.template,
      reportType: validatedData.reportType,
    },
  },
});
```

## Testing

Run the test script to verify functionality:

```bash
npm run tsx scripts/test-analytics-reports.ts
```

## Performance Considerations

### 1. Asynchronous Processing

Reports are generated asynchronously to avoid blocking the API response:

```typescript
// Generate report data asynchronously
generateReportData(reportHistory.id, validatedData, session.user.id).catch(error => {
  console.error('Error generating report data:', error);
});
```

### 2. Database Optimization

- Use proper indexes on frequently queried fields
- Implement pagination for large datasets
- Use aggregation queries for performance metrics

### 3. Caching

Consider implementing caching for frequently requested reports:

```typescript
// Example caching strategy
const cacheKey = `report:${userId}:${template}:${dateRange}`;
const cachedReport = await cache.get(cacheKey);
if (cachedReport) {
  return cachedReport;
}
```

## Future Enhancements

1. **Real-time Report Generation** - WebSocket-based progress updates
2. **Advanced Filtering** - Complex filter combinations
3. **Report Scheduling** - Automated report generation
4. **Export Formats** - Excel, PowerPoint, Word
5. **Report Templates** - Drag-and-drop template builder
6. **Data Visualization** - Interactive charts and graphs
7. **Report Sharing** - Share reports with team members
8. **Report Comments** - Add notes and comments to reports

## Integration Points

### With Analytics Dashboard

```typescript
// Generate report from dashboard
const report = await fetch('/api/analytics/reports', {
  method: 'POST',
  body: JSON.stringify({
    template: 'overview',
    reportType: 'summary',
    dateRange: {
      start: dashboardStartDate,
      end: dashboardEndDate,
    },
  })
});
```

### With Email System

```typescript
// Send report via email
await sendEmailWithTemplate(
  'report-complete',
  user.email,
  {
    reportName: report.reportName,
    downloadUrl: report.downloadUrl,
  },
  user.id
);
```

## Troubleshooting

### Common Issues

1. **Reports not generating** - Check database connection and user permissions
2. **Slow report generation** - Optimize database queries and add indexes
3. **Memory issues** - Implement pagination and limit data size
4. **File generation errors** - Check file system permissions and storage

### Debug Mode

Enable debug logging:

```env
DEBUG_REPORTS=true
```

This will log all report generation steps to the console. 