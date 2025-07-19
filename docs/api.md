# API Documentation

## Overview

The Contract Analize API provides endpoints for contract management, AI analysis, user authentication, and billing. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

Most endpoints require authentication using Auth.js sessions. Include the session cookie in your requests.

### Authentication Headers
```http
Cookie: next-auth.session-token=your-session-token
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Authentication Endpoints

### POST /api/auth/[...nextauth]
NextAuth.js authentication endpoint.

**Supported Providers:**
- Google OAuth
- GitHub OAuth
- Email/Password (optional)

**Request:**
```http
POST /api/auth/signin
Content-Type: application/json

{
  "provider": "google",
  "callbackUrl": "/dashboard"
}
```

**Response:**
```json
{
  "url": "https://accounts.google.com/oauth/authorize?..."
}
```

### GET /api/auth/session
Get current session information.

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg"
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

## Contract Management

### POST /api/contracts/upload
Upload a new contract for analysis.

**Request:**
```http
POST /api/contracts/upload
Content-Type: multipart/form-data

Form Data:
- file: Contract file (PDF, DOCX, DOC, TXT, RTF)
- contractName: "Vendor Agreement 2024" (optional)
- contractType: "vendor" (optional)
- tags: ["important", "vendor"] (optional)
```

**Response:**
```json
{
  "success": true,
  "contractId": "contract-uuid",
  "fileName": "vendor-agreement.pdf",
  "fileSize": 1024000,
  "uploadUrl": "https://blob.vercel-storage.com/...",
  "analysisStatus": "pending",
  "estimatedTime": 120
}
```

### GET /api/contracts
Get list of user's contracts.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, processing, complete, error)
- `type`: Filter by contract type
- `search`: Search in contract names

**Response:**
```json
{
  "contracts": [
    {
      "id": "contract-uuid",
      "fileName": "vendor-agreement.pdf",
      "contractName": "Vendor Agreement 2024",
      "contractType": "vendor",
      "fileSize": 1024000,
      "status": "complete",
      "tags": ["important", "vendor"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### GET /api/contracts/{contractId}
Get specific contract details.

**Response:**
```json
{
  "id": "contract-uuid",
  "fileName": "vendor-agreement.pdf",
  "contractName": "Vendor Agreement 2024",
  "contractType": "vendor",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "blobUrl": "https://blob.vercel-storage.com/...",
  "status": "complete",
  "tags": ["important", "vendor"],
  "metadata": {
    "parties": ["Company A", "Vendor B"],
    "effectiveDate": "2024-01-01",
    "expirationDate": "2024-12-31"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /api/contracts/{contractId}
Delete a contract and its associated data.

**Response:**
```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

## AI Analysis

### POST /api/analysis/start
Start AI analysis of a contract.

**Request:**
```json
{
  "contractId": "contract-uuid",
  "analysisType": "comprehensive",
  "customParameters": {
    "focusAreas": ["payment", "termination", "liability"],
    "riskThreshold": "medium",
    "includeRecommendations": true
  }
}
```

**Response:**
```json
{
  "analysisId": "analysis-uuid",
  "status": "queued",
  "estimatedTime": 180,
  "message": "Analysis queued successfully"
}
```

### GET /api/analysis/{analysisId}/status
Get analysis status and progress.

**Response:**
```json
{
  "analysisId": "analysis-uuid",
  "status": "processing",
  "progress": 65,
  "estimatedTime": 60,
  "message": "Analyzing contract clauses..."
}
```

### GET /api/analysis/{analysisId}/results
Get analysis results.

**Response:**
```json
{
  "analysisId": "analysis-uuid",
  "contractId": "contract-uuid",
  "status": "complete",
  "results": {
    "clauses": [
      {
        "type": "payment",
        "title": "Payment Terms",
        "content": "Payment shall be made within 30 days...",
        "importance": "high",
        "summary": "30-day payment terms with late fees"
      }
    ],
    "risks": [
      {
        "type": "financial",
        "severity": "medium",
        "description": "Late payment penalties may be excessive",
        "impact": "Potential financial liability",
        "recommendation": "Negotiate more reasonable late fees"
      }
    ],
    "metadata": {
      "parties": ["Company A", "Vendor B"],
      "effectiveDate": "2024-01-01",
      "expirationDate": "2024-12-31",
      "totalValue": "$50,000",
      "jurisdiction": "California"
    },
    "summary": "This vendor agreement contains standard terms...",
    "recommendations": [
      {
        "category": "payment",
        "action": "Negotiate payment terms",
        "priority": "high",
        "rationale": "Current terms may impact cash flow"
      }
    ],
    "confidence": 0.92
  },
  "processingTime": 145,
  "modelUsed": "gpt-4-turbo-preview",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /api/analysis/{analysisId}
Cancel an ongoing analysis.

**Response:**
```json
{
  "success": true,
  "message": "Analysis cancelled successfully"
}
```

## Billing and Subscriptions

### GET /api/billing/subscription
Get current subscription information.

**Response:**
```json
{
  "subscription": {
    "id": "sub-uuid",
    "status": "active",
    "plan": "pro",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "usage": {
      "contractsThisMonth": 15,
      "contractsLimit": 50,
      "remainingContracts": 35
    }
  }
}
```

### POST /api/billing/create-checkout-session
Create Stripe checkout session for subscription.

**Request:**
```json
{
  "priceId": "price_pro_monthly",
  "successUrl": "https://your-domain.vercel.app/dashboard?success=true",
  "cancelUrl": "https://your-domain.vercel.app/pricing?canceled=true"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/billing/create-portal-session
Create Stripe customer portal session.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### GET /api/billing/usage
Get usage statistics.

**Response:**
```json
{
  "currentMonth": {
    "contractsAnalyzed": 15,
    "totalCost": 12.50,
    "averageProcessingTime": 145
  },
  "history": [
    {
      "month": "2024-01",
      "contractsAnalyzed": 15,
      "totalCost": 12.50
    }
  ]
}
```

## User Management

### GET /api/user/profile
Get current user profile.

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "emailVerified": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/user/profile
Update user profile.

**Request:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "john.smith@example.com",
    "name": "John Smith",
    "image": "https://example.com/avatar.jpg",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/user/change-password
Change user password.

**Request:**
```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Organization Management

### GET /api/organizations
Get user's organizations.

**Response:**
```json
{
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Technology company",
      "logoUrl": "https://example.com/logo.png",
      "role": "admin",
      "memberCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/organizations
Create new organization.

**Request:**
```json
{
  "name": "New Organization",
  "description": "Organization description"
}
```

**Response:**
```json
{
  "success": true,
  "organization": {
    "id": "org-uuid",
    "name": "New Organization",
    "slug": "new-organization",
    "description": "Organization description",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/organizations/{orgId}/members
Get organization members.

**Response:**
```json
{
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "email": "member@example.com",
      "name": "Jane Doe",
      "role": "member",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/organizations/{orgId}/invite
Invite user to organization.

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

## Analytics and Reporting

### GET /api/analytics/overview
Get analytics overview.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "period": "30d",
  "contractsAnalyzed": 45,
  "totalCost": 37.50,
  "averageProcessingTime": 142,
  "successRate": 0.98,
  "popularContractTypes": [
    { "type": "vendor", "count": 20 },
    { "type": "nda", "count": 15 },
    { "type": "employment", "count": 10 }
  ],
  "commonRisks": [
    { "risk": "payment_terms", "count": 25 },
    { "risk": "liability", "count": 18 },
    { "risk": "termination", "count": 12 }
  ]
}
```

### GET /api/analytics/usage
Get detailed usage analytics.

**Query Parameters:**
- `startDate`: Start date (ISO string)
- `endDate`: End date (ISO string)
- `groupBy`: Grouping (day, week, month)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "contractsAnalyzed": 3,
      "totalCost": 2.50,
      "averageProcessingTime": 145
    }
  ],
  "summary": {
    "totalContracts": 45,
    "totalCost": 37.50,
    "averageProcessingTime": 142
  }
}
```

## Webhooks

### POST /api/webhooks/stripe
Stripe webhook endpoint for billing events.

**Headers:**
```http
Stripe-Signature: t=timestamp,v1=signature
```

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### POST /api/webhooks/resend
Resend webhook endpoint for email events.

**Events Handled:**
- `email.delivered`
- `email.bounced`
- `email.complained`

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Contract upload**: 10 requests per hour
- **AI analysis**: 20 requests per hour
- **General API**: 100 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript SDK
```typescript
import { ContractAnalizeAPI } from '@contract-analize/sdk';

const api = new ContractAnalizeAPI({
  baseUrl: 'https://your-domain.vercel.app/api',
  apiKey: 'your-api-key'
});

// Upload contract
const contract = await api.contracts.upload(file, {
  contractName: 'Vendor Agreement',
  contractType: 'vendor'
});

// Start analysis
const analysis = await api.analysis.start(contract.id, {
  analysisType: 'comprehensive'
});

// Get results
const results = await api.analysis.getResults(analysis.id);
```

### cURL Examples

#### Upload Contract
```bash
curl -X POST https://your-domain.vercel.app/api/contracts/upload \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -F "file=@contract.pdf" \
  -F "contractName=Vendor Agreement" \
  -F "contractType=vendor"
```

#### Start Analysis
```bash
curl -X POST https://your-domain.vercel.app/api/analysis/start \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "contractId": "contract-uuid",
    "analysisType": "comprehensive"
  }'
```

#### Get Analysis Results
```bash
curl -X GET https://your-domain.vercel.app/api/analysis/analysis-uuid/results \
  -H "Cookie: next-auth.session-token=your-session-token"
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `CONTRACT_NOT_FOUND` | Contract not found |
| `ANALYSIS_NOT_FOUND` | Analysis not found |
| `FILE_TOO_LARGE` | File size exceeds limit |
| `INVALID_FILE_TYPE` | File type not supported |
| `QUOTA_EXCEEDED` | Monthly quota exceeded |
| `RATE_LIMITED` | Rate limit exceeded |
| `ANALYSIS_FAILED` | AI analysis failed |
| `BILLING_ERROR` | Billing operation failed |

## Support

For API support:
- **Documentation**: [https://docs.contractanalize.com](https://docs.contractanalize.com)
- **Email**: api-support@contractanalize.com
- **Status Page**: [https://status.contractanalize.com](https://status.contractanalize.com)

---

**Notes:**
- All timestamps are in ISO 8601 format (UTC)
- File uploads are limited to 25MB
- Analysis results are cached for 30 days
- Webhook retries follow exponential backoff
- API versioning is handled via Accept header 