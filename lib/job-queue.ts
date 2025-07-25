import Queue from 'bull';
import { prisma } from './db';

// Check if Upstash Redis is available
const isUpstashRedisAvailable = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// For Vercel/Upstash Redis, we'll use a different approach since Bull requires direct Redis connection
// We'll disable queues in production and use direct function calls instead
const isProduction = process.env.NODE_ENV === 'production';

// Redis configuration - only use for local development with actual Redis
const redisConfig = !isProduction && !isUpstashRedisAvailable ? {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
} : null;

// Job queue names
export const QUEUE_NAMES = {
  DATA_EXPORT: 'data-export',
  EMAIL_SENDING: 'email-sending',
  NOTIFICATION_DELIVERY: 'notification-delivery',
  CLEANUP_MAINTENANCE: 'cleanup-maintenance',
  CONTRACT_ANALYSIS: 'contract-analysis',
} as const;

// Job types
export const JOB_TYPES = {
  // Data Export Jobs
  EXPORT_USER_DATA: 'export-user-data',
  EXPORT_CONTRACTS: 'export-contracts',
  EXPORT_ANALYSES: 'export-analyses',
  EXPORT_SETTINGS: 'export-settings',
  EXPORT_GDPR_DATA: 'export-gdpr-data',

  // Email Jobs
  SEND_WELCOME_EMAIL: 'send-welcome-email',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_EMAIL_VERIFICATION: 'send-email-verification',
  SEND_EXPORT_READY: 'send-export-ready',
  SEND_ANALYSIS_COMPLETE: 'send-analysis-complete',
  SEND_WEEKLY_DIGEST: 'send-weekly-digest',
  SEND_BILLING_REMINDER: 'send-billing-reminder',

  // Notification Jobs
  SEND_PUSH_NOTIFICATION: 'send-push-notification',
  SEND_BROWSER_NOTIFICATION: 'send-browser-notification',
  SEND_IN_APP_NOTIFICATION: 'send-in-app-notification',

  // Cleanup Jobs
  CLEANUP_EXPIRED_EXPORTS: 'cleanup-expired-exports',
  CLEANUP_OLD_ANALYSES: 'cleanup-old-analyses',
  CLEANUP_ORPHANED_FILES: 'cleanup-orphaned-files',
  CLEANUP_OLD_ACTIVITY_LOGS: 'cleanup-old-activity-logs',
  CLEANUP_EXPIRED_SESSIONS: 'cleanup-expired-sessions',

  // Maintenance Jobs
  GENERATE_ANALYTICS_REPORTS: 'generate-analytics-reports',
  UPDATE_USER_STATISTICS: 'update-user-statistics',
  BACKUP_DATABASE: 'backup-database',
  HEALTH_CHECK: 'health-check',
} as const;

// Create queue instances - only create if we have a valid Redis configuration
export const dataExportQueue = redisConfig ? new Queue(QUEUE_NAMES.DATA_EXPORT, redisConfig) : null;
export const emailQueue = redisConfig ? new Queue(QUEUE_NAMES.EMAIL_SENDING, redisConfig) : null;
export const notificationQueue = redisConfig ? new Queue(QUEUE_NAMES.NOTIFICATION_DELIVERY, redisConfig) : null;
export const cleanupQueue = redisConfig ? new Queue(QUEUE_NAMES.CLEANUP_MAINTENANCE, redisConfig) : null;
export const analysisQueue = redisConfig ? new Queue(QUEUE_NAMES.CONTRACT_ANALYSIS, redisConfig) : null;

// Queue configuration
const queueConfig = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50, // Keep last 50 failed jobs
  attempts: 3, // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 seconds
  },
};

// Apply configuration to all queues
// Note: Bull v4 does not support defaultJobOptions, set options per .add() call
// [dataExportQueue, emailQueue, notificationQueue, cleanupQueue, analysisQueue].forEach(queue => {
//   queue.defaultJobOptions = queueConfig;
// });

// Job data interfaces
export interface DataExportJobData {
  exportId: string;
  userId: string;
  type: string;
  dataTypes: string[];
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface EmailJobData {
  userId: string;
  email: string;
  template: string;
  data: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationJobData {
  userId: string;
  type: 'push' | 'browser' | 'in-app';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface CleanupJobData {
  type: string;
  options?: Record<string, any>;
}

// Queue event handlers
export function setupQueueEventHandlers() {
  const queues = [dataExportQueue, emailQueue, notificationQueue, cleanupQueue, analysisQueue].filter(Boolean);

  if (queues.length === 0) {
    console.warn('⚠️ No Redis queues available - job processing will be disabled');
    return;
  }

  queues.forEach(queue => {
    if (!queue) return;
    
    queue.on('error', (error) => {
      console.error(`Queue ${queue.name} error:`, error);
    });

    queue.on('failed', (job, error) => {
      console.error(`Job ${job.id} in queue ${queue.name} failed:`, error);
      
      // Log failed job to database
      prisma.jobLog.create({
        data: {
          queueName: queue.name,
          jobId: String(job.id),
          jobType: job.name,
          status: 'failed',
          error: error.message,
          data: job.data,
          attempts: job.attemptsMade,
        },
      }).catch(console.error);
    });

    queue.on('completed', (job) => {
      console.log(`Job ${job.id} in queue ${queue.name} completed successfully`);
      
      // Log completed job to database
      prisma.jobLog.create({
        data: {
          queueName: queue.name,
          jobId: String(job.id),
          jobType: job.name,
          status: 'completed',
          data: job.data,
          attempts: job.attemptsMade,
          duration: job.processedOn ? job.processedOn - job.timestamp : undefined,
        },
      }).catch(console.error);
    });

    queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} in queue ${queue.name} stalled`);
    });
  });
}

// Queue health monitoring
export async function getQueueHealth() {
  const queues = [dataExportQueue, emailQueue, notificationQueue, cleanupQueue, analysisQueue].filter(Boolean);
  const health: Record<string, any> = {};

  if (queues.length === 0) {
    return { status: 'no_queues_available' };
  }

  for (const queue of queues) {
    if (!queue) continue;
    
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
      ]);

      health[queue.name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
      };
    } catch (error) {
      console.error(`Error getting health for queue ${queue.name}:`, error);
      health[queue.name] = { error: 'Failed to get queue health' };
    }
  }

  return health;
}

// Graceful shutdown
export async function shutdownQueues() {
  const queues = [dataExportQueue, emailQueue, notificationQueue, cleanupQueue, analysisQueue].filter(Boolean);
  
  if (queues.length === 0) {
    console.log('No queues to shut down');
    return;
  }
  
  console.log('Shutting down job queues...');
  
  await Promise.all(queues.map(async (queue) => {
    if (!queue) return;
    try {
      await queue.close();
      console.log(`Queue ${queue.name} closed`);
    } catch (error) {
      console.error(`Error closing queue ${queue.name}:`, error);
    }
  }));
  
  console.log('All job queues shut down');
}

// Initialize queues
export function initializeQueues() {
  setupQueueEventHandlers();
  console.log('Job queues initialized');
}

// Export queue instances for use in other modules
export default {
  dataExportQueue,
  emailQueue,
  notificationQueue,
  cleanupQueue,
  analysisQueue,
  initializeQueues,
  shutdownQueues,
  getQueueHealth,
}; 