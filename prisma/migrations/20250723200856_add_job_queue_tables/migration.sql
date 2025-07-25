-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "verificationToken" TEXT,
    "verificationExpires" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "authenticators" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "fileType" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contractName" TEXT,
    "contractType" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisType" TEXT NOT NULL DEFAULT 'basic',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "customParameters" JSONB,
    "results" JSONB,
    "summary" TEXT,
    "totalClauses" INTEGER,
    "totalRisks" INTEGER,
    "totalRecommendations" INTEGER,
    "highRiskCount" INTEGER,
    "criticalRiskCount" INTEGER,
    "processingTime" INTEGER,
    "tokensUsed" INTEGER,
    "estimatedCost" DECIMAL(10,4),
    "modelUsed" TEXT,
    "confidenceScore" DECIMAL(3,2),
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_files" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_metadata" (
    "id" TEXT NOT NULL,
    "contractFileId" TEXT NOT NULL,
    "extractedText" TEXT,
    "pageCount" INTEGER,
    "language" TEXT,
    "ocrConfidence" DECIMAL(3,2),
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "sessionId" TEXT,
    "pageUrl" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "activityType" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DECIMAL(10,4) NOT NULL,
    "metricUnit" TEXT,
    "context" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "timeOfDay" TEXT,
    "recipients" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "reportName" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "dateRange" JSONB,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_email_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketing" BOOLEAN NOT NULL DEFAULT true,
    "security" BOOLEAN NOT NULL DEFAULT true,
    "analysis" BOOLEAN NOT NULL DEFAULT true,
    "billing" BOOLEAN NOT NULL DEFAULT true,
    "weekly" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "timezone" TEXT DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "browser" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "analysisComplete" BOOLEAN NOT NULL DEFAULT true,
    "newFeatures" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "billingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "browserPermission" TEXT DEFAULT 'default',
    "browserPermissionUpdatedAt" TIMESTAMP(3),
    "quietHours" JSONB,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vibrationEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "showTutorials" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_privacy_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataSharing" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "dataRetention" INTEGER NOT NULL DEFAULT 365,
    "gdprCompliance" BOOLEAN NOT NULL DEFAULT true,
    "dataPortability" BOOLEAN NOT NULL DEFAULT true,
    "rightToBeForgotten" BOOLEAN NOT NULL DEFAULT true,
    "privacyPolicyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "privacyPolicyAcceptedAt" TIMESTAMP(3),
    "dataProcessingConsent" JSONB NOT NULL DEFAULT '{"necessary":true,"analytics":false,"marketing":false,"thirdParty":false}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_privacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dataTypes" JSONB NOT NULL,
    "dateRange" JSONB,
    "format" TEXT NOT NULL DEFAULT 'json',
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "data" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "scheduledFor" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_reports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_security_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorMethod" TEXT NOT NULL DEFAULT 'totp',
    "backupCodesGenerated" BOOLEAN NOT NULL DEFAULT false,
    "backupCodesRemaining" INTEGER NOT NULL DEFAULT 0,
    "loginNotifications" BOOLEAN NOT NULL DEFAULT true,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "requirePasswordForChanges" BOOLEAN NOT NULL DEFAULT true,
    "securityAuditLogs" BOOLEAN NOT NULL DEFAULT true,
    "lastSecurityReview" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceFingerprint" TEXT,
    "location" TEXT,
    "metadata" JSONB,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "deviceFingerprint" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'web',
    "deviceId" TEXT,
    "userAgent" TEXT,
    "appVersion" TEXT,
    "osVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_deletions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_deletions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_verificationToken_idx" ON "users"("verificationToken");

-- CreateIndex
CREATE INDEX "users_resetToken_idx" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "accounts_provider_providerAccountId_idx" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expires_idx" ON "sessions"("expires");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credentialID_key" ON "authenticators"("credentialID");

-- CreateIndex
CREATE INDEX "authenticators_userId_idx" ON "authenticators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_createdAt_idx" ON "organizations"("createdAt");

-- CreateIndex
CREATE INDEX "organizations_deletedAt_idx" ON "organizations"("deletedAt");

-- CreateIndex
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");

-- CreateIndex
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

-- CreateIndex
CREATE INDEX "organization_members_role_idx" ON "organization_members"("role");

-- CreateIndex
CREATE INDEX "organization_members_organizationId_role_idx" ON "organization_members"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_status_idx" ON "subscriptions"("organizationId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "contracts_userId_idx" ON "contracts"("userId");

-- CreateIndex
CREATE INDEX "contracts_organizationId_idx" ON "contracts"("organizationId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_contractType_idx" ON "contracts"("contractType");

-- CreateIndex
CREATE INDEX "contracts_createdAt_idx" ON "contracts"("createdAt");

-- CreateIndex
CREATE INDEX "contracts_deletedAt_idx" ON "contracts"("deletedAt");

-- CreateIndex
CREATE INDEX "contracts_userId_deletedAt_idx" ON "contracts"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "contracts_organizationId_deletedAt_idx" ON "contracts"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "contracts_userId_status_idx" ON "contracts"("userId", "status");

-- CreateIndex
CREATE INDEX "contracts_organizationId_status_idx" ON "contracts"("organizationId", "status");

-- CreateIndex
CREATE INDEX "contracts_userId_contractType_idx" ON "contracts"("userId", "contractType");

-- CreateIndex
CREATE INDEX "contracts_organizationId_contractType_idx" ON "contracts"("organizationId", "contractType");

-- CreateIndex
CREATE INDEX "contracts_userId_createdAt_idx" ON "contracts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "contracts_organizationId_createdAt_idx" ON "contracts"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "contracts_userId_status_deletedAt_idx" ON "contracts"("userId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "contracts_organizationId_status_deletedAt_idx" ON "contracts"("organizationId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "analysis_results_contractId_idx" ON "analysis_results"("contractId");

-- CreateIndex
CREATE INDEX "analysis_results_userId_idx" ON "analysis_results"("userId");

-- CreateIndex
CREATE INDEX "analysis_results_organizationId_idx" ON "analysis_results"("organizationId");

-- CreateIndex
CREATE INDEX "analysis_results_status_idx" ON "analysis_results"("status");

-- CreateIndex
CREATE INDEX "analysis_results_analysisType_idx" ON "analysis_results"("analysisType");

-- CreateIndex
CREATE INDEX "analysis_results_createdAt_idx" ON "analysis_results"("createdAt");

-- CreateIndex
CREATE INDEX "analysis_results_completedAt_idx" ON "analysis_results"("completedAt");

-- CreateIndex
CREATE INDEX "analysis_results_userId_status_idx" ON "analysis_results"("userId", "status");

-- CreateIndex
CREATE INDEX "analysis_results_organizationId_status_idx" ON "analysis_results"("organizationId", "status");

-- CreateIndex
CREATE INDEX "analysis_results_contractId_status_idx" ON "analysis_results"("contractId", "status");

-- CreateIndex
CREATE INDEX "analysis_results_userId_analysisType_idx" ON "analysis_results"("userId", "analysisType");

-- CreateIndex
CREATE INDEX "analysis_results_organizationId_analysisType_idx" ON "analysis_results"("organizationId", "analysisType");

-- CreateIndex
CREATE INDEX "analysis_results_userId_createdAt_idx" ON "analysis_results"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "analysis_results_organizationId_createdAt_idx" ON "analysis_results"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "analysis_results_contractId_createdAt_idx" ON "analysis_results"("contractId", "createdAt");

-- CreateIndex
CREATE INDEX "usage_logs_userId_idx" ON "usage_logs"("userId");

-- CreateIndex
CREATE INDEX "usage_logs_organizationId_idx" ON "usage_logs"("organizationId");

-- CreateIndex
CREATE INDEX "usage_logs_action_idx" ON "usage_logs"("action");

-- CreateIndex
CREATE INDEX "usage_logs_resourceType_idx" ON "usage_logs"("resourceType");

-- CreateIndex
CREATE INDEX "usage_logs_createdAt_idx" ON "usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "usage_logs_userId_action_idx" ON "usage_logs"("userId", "action");

-- CreateIndex
CREATE INDEX "usage_logs_organizationId_action_idx" ON "usage_logs"("organizationId", "action");

-- CreateIndex
CREATE INDEX "usage_logs_userId_createdAt_idx" ON "usage_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "usage_logs_organizationId_createdAt_idx" ON "usage_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "usage_logs_userId_action_createdAt_idx" ON "usage_logs"("userId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "usage_logs_organizationId_action_createdAt_idx" ON "usage_logs"("organizationId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "contract_files_contractId_idx" ON "contract_files"("contractId");

-- CreateIndex
CREATE INDEX "contract_files_isProcessed_idx" ON "contract_files"("isProcessed");

-- CreateIndex
CREATE INDEX "contract_files_mimeType_idx" ON "contract_files"("mimeType");

-- CreateIndex
CREATE INDEX "contract_files_createdAt_idx" ON "contract_files"("createdAt");

-- CreateIndex
CREATE INDEX "contract_files_contractId_isProcessed_idx" ON "contract_files"("contractId", "isProcessed");

-- CreateIndex
CREATE INDEX "contract_files_contractId_mimeType_idx" ON "contract_files"("contractId", "mimeType");

-- CreateIndex
CREATE UNIQUE INDEX "file_metadata_contractFileId_key" ON "file_metadata"("contractFileId");

-- CreateIndex
CREATE INDEX "file_metadata_processingStatus_idx" ON "file_metadata"("processingStatus");

-- CreateIndex
CREATE INDEX "file_metadata_language_idx" ON "file_metadata"("language");

-- CreateIndex
CREATE INDEX "file_metadata_createdAt_idx" ON "file_metadata"("createdAt");

-- CreateIndex
CREATE INDEX "file_metadata_contractFileId_processingStatus_idx" ON "file_metadata"("contractFileId", "processingStatus");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_organizationId_idx" ON "analytics_events"("organizationId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_userId_eventType_idx" ON "analytics_events"("userId", "eventType");

-- CreateIndex
CREATE INDEX "analytics_events_organizationId_eventType_idx" ON "analytics_events"("organizationId", "eventType");

-- CreateIndex
CREATE INDEX "analytics_events_userId_timestamp_idx" ON "analytics_events"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_organizationId_timestamp_idx" ON "analytics_events"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_userId_eventType_timestamp_idx" ON "analytics_events"("userId", "eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_organizationId_eventType_timestamp_idx" ON "analytics_events"("organizationId", "eventType", "timestamp");

-- CreateIndex
CREATE INDEX "user_activity_userId_idx" ON "user_activity"("userId");

-- CreateIndex
CREATE INDEX "user_activity_organizationId_idx" ON "user_activity"("organizationId");

-- CreateIndex
CREATE INDEX "user_activity_activityType_idx" ON "user_activity"("activityType");

-- CreateIndex
CREATE INDEX "user_activity_createdAt_idx" ON "user_activity"("createdAt");

-- CreateIndex
CREATE INDEX "user_activity_userId_activityType_idx" ON "user_activity"("userId", "activityType");

-- CreateIndex
CREATE INDEX "user_activity_organizationId_activityType_idx" ON "user_activity"("organizationId", "activityType");

-- CreateIndex
CREATE INDEX "user_activity_userId_createdAt_idx" ON "user_activity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activity_organizationId_createdAt_idx" ON "user_activity"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activity_activityType_createdAt_idx" ON "user_activity"("activityType", "createdAt");

-- CreateIndex
CREATE INDEX "user_activity_userId_activityType_createdAt_idx" ON "user_activity"("userId", "activityType", "createdAt");

-- CreateIndex
CREATE INDEX "user_activity_organizationId_activityType_createdAt_idx" ON "user_activity"("organizationId", "activityType", "createdAt");

-- CreateIndex
CREATE INDEX "performance_metrics_metricName_idx" ON "performance_metrics"("metricName");

-- CreateIndex
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "performance_metrics_metricName_timestamp_idx" ON "performance_metrics"("metricName", "timestamp");

-- CreateIndex
CREATE INDEX "scheduled_reports_userId_idx" ON "scheduled_reports"("userId");

-- CreateIndex
CREATE INDEX "scheduled_reports_organizationId_idx" ON "scheduled_reports"("organizationId");

-- CreateIndex
CREATE INDEX "scheduled_reports_frequency_idx" ON "scheduled_reports"("frequency");

-- CreateIndex
CREATE INDEX "scheduled_reports_isActive_idx" ON "scheduled_reports"("isActive");

-- CreateIndex
CREATE INDEX "scheduled_reports_nextRunAt_idx" ON "scheduled_reports"("nextRunAt");

-- CreateIndex
CREATE INDEX "scheduled_reports_userId_isActive_idx" ON "scheduled_reports"("userId", "isActive");

-- CreateIndex
CREATE INDEX "scheduled_reports_organizationId_isActive_idx" ON "scheduled_reports"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "report_history_userId_idx" ON "report_history"("userId");

-- CreateIndex
CREATE INDEX "report_history_organizationId_idx" ON "report_history"("organizationId");

-- CreateIndex
CREATE INDEX "report_history_template_idx" ON "report_history"("template");

-- CreateIndex
CREATE INDEX "report_history_status_idx" ON "report_history"("status");

-- CreateIndex
CREATE INDEX "report_history_createdAt_idx" ON "report_history"("createdAt");

-- CreateIndex
CREATE INDEX "report_history_userId_status_idx" ON "report_history"("userId", "status");

-- CreateIndex
CREATE INDEX "report_history_organizationId_status_idx" ON "report_history"("organizationId", "status");

-- CreateIndex
CREATE INDEX "report_history_userId_createdAt_idx" ON "report_history"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "report_history_organizationId_createdAt_idx" ON "report_history"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_preferences_userId_key" ON "user_email_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_email_preferences_userId_idx" ON "user_email_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_email_preferences_createdAt_idx" ON "user_email_preferences"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_userId_key" ON "user_notification_settings"("userId");

-- CreateIndex
CREATE INDEX "user_notification_settings_userId_idx" ON "user_notification_settings"("userId");

-- CreateIndex
CREATE INDEX "user_notification_settings_createdAt_idx" ON "user_notification_settings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_createdAt_idx" ON "user_preferences"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_privacy_settings_userId_key" ON "user_privacy_settings"("userId");

-- CreateIndex
CREATE INDEX "user_privacy_settings_userId_idx" ON "user_privacy_settings"("userId");

-- CreateIndex
CREATE INDEX "user_privacy_settings_createdAt_idx" ON "user_privacy_settings"("createdAt");

-- CreateIndex
CREATE INDEX "data_export_requests_userId_idx" ON "data_export_requests"("userId");

-- CreateIndex
CREATE INDEX "data_export_requests_status_idx" ON "data_export_requests"("status");

-- CreateIndex
CREATE INDEX "data_export_requests_createdAt_idx" ON "data_export_requests"("createdAt");

-- CreateIndex
CREATE INDEX "job_logs_queueName_idx" ON "job_logs"("queueName");

-- CreateIndex
CREATE INDEX "job_logs_jobType_idx" ON "job_logs"("jobType");

-- CreateIndex
CREATE INDEX "job_logs_status_idx" ON "job_logs"("status");

-- CreateIndex
CREATE INDEX "job_logs_createdAt_idx" ON "job_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_reports_type_idx" ON "analytics_reports"("type");

-- CreateIndex
CREATE INDEX "analytics_reports_generatedAt_idx" ON "analytics_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "health_checks_status_idx" ON "health_checks"("status");

-- CreateIndex
CREATE INDEX "health_checks_timestamp_idx" ON "health_checks"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "user_security_settings_userId_key" ON "user_security_settings"("userId");

-- CreateIndex
CREATE INDEX "user_security_settings_userId_idx" ON "user_security_settings"("userId");

-- CreateIndex
CREATE INDEX "user_security_settings_createdAt_idx" ON "user_security_settings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_backup_codes_code_key" ON "two_factor_backup_codes"("code");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_userId_idx" ON "two_factor_backup_codes"("userId");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_code_idx" ON "two_factor_backup_codes"("code");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_isUsed_idx" ON "two_factor_backup_codes"("isUsed");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_createdAt_idx" ON "two_factor_backup_codes"("createdAt");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_idx" ON "security_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "security_audit_logs_eventType_idx" ON "security_audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "security_audit_logs_riskLevel_idx" ON "security_audit_logs"("riskLevel");

-- CreateIndex
CREATE INDEX "security_audit_logs_createdAt_idx" ON "security_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_eventType_idx" ON "security_audit_logs"("userId", "eventType");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_riskLevel_idx" ON "security_audit_logs"("userId", "riskLevel");

-- CreateIndex
CREATE INDEX "security_audit_logs_userId_createdAt_idx" ON "security_audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "device_sessions_sessionToken_key" ON "device_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "device_sessions_userId_idx" ON "device_sessions"("userId");

-- CreateIndex
CREATE INDEX "device_sessions_sessionToken_idx" ON "device_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "device_sessions_deviceId_idx" ON "device_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "device_sessions_isActive_idx" ON "device_sessions"("isActive");

-- CreateIndex
CREATE INDEX "device_sessions_lastActive_idx" ON "device_sessions"("lastActive");

-- CreateIndex
CREATE INDEX "device_sessions_expiresAt_idx" ON "device_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "device_sessions_userId_isActive_idx" ON "device_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens"("userId");

-- CreateIndex
CREATE INDEX "push_tokens_token_idx" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_deviceId_idx" ON "push_tokens"("deviceId");

-- CreateIndex
CREATE INDEX "push_tokens_isActive_idx" ON "push_tokens"("isActive");

-- CreateIndex
CREATE INDEX "push_tokens_lastUsed_idx" ON "push_tokens"("lastUsed");

-- CreateIndex
CREATE INDEX "notification_history_userId_idx" ON "notification_history"("userId");

-- CreateIndex
CREATE INDEX "notification_history_type_idx" ON "notification_history"("type");

-- CreateIndex
CREATE INDEX "notification_history_status_idx" ON "notification_history"("status");

-- CreateIndex
CREATE INDEX "notification_history_sentAt_idx" ON "notification_history"("sentAt");

-- CreateIndex
CREATE INDEX "notification_history_userId_type_idx" ON "notification_history"("userId", "type");

-- CreateIndex
CREATE INDEX "notification_history_userId_status_idx" ON "notification_history"("userId", "status");

-- CreateIndex
CREATE INDEX "notification_history_userId_sentAt_idx" ON "notification_history"("userId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "account_deletions_userId_key" ON "account_deletions"("userId");

-- CreateIndex
CREATE INDEX "account_deletions_userId_idx" ON "account_deletions"("userId");

-- CreateIndex
CREATE INDEX "account_deletions_status_idx" ON "account_deletions"("status");

-- CreateIndex
CREATE INDEX "account_deletions_scheduledFor_idx" ON "account_deletions"("scheduledFor");

-- CreateIndex
CREATE INDEX "account_deletions_createdAt_idx" ON "account_deletions"("createdAt");

-- CreateIndex
CREATE INDEX "password_history_userId_idx" ON "password_history"("userId");

-- CreateIndex
CREATE INDEX "password_history_createdAt_idx" ON "password_history"("createdAt");

-- CreateIndex
CREATE INDEX "password_history_userId_createdAt_idx" ON "password_history"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_files" ADD CONSTRAINT "contract_files_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_contractFileId_fkey" FOREIGN KEY ("contractFileId") REFERENCES "contract_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_email_preferences" ADD CONSTRAINT "user_email_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "user_privacy_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_security_settings" ADD CONSTRAINT "user_security_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_backup_codes" ADD CONSTRAINT "two_factor_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_history" ADD CONSTRAINT "notification_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_deletions" ADD CONSTRAINT "account_deletions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
