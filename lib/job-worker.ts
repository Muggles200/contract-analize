import { 
  dataExportQueue, 
  emailQueue, 
  notificationQueue, 
  cleanupQueue, 
  analysisQueue,
  JOB_TYPES 
} from './job-queue';
import { dataExportProcessors } from './jobs/data-export-processor';
import { emailProcessors } from './jobs/email-processor';
import { notificationProcessors } from './jobs/notification-processor';
import { cleanupProcessors } from './jobs/cleanup-processor';

// Data Export Queue Worker
if (dataExportQueue) {
  dataExportQueue.process(JOB_TYPES.EXPORT_USER_DATA, dataExportProcessors[JOB_TYPES.EXPORT_USER_DATA]);
  dataExportQueue.process(JOB_TYPES.EXPORT_CONTRACTS, dataExportProcessors[JOB_TYPES.EXPORT_CONTRACTS]);
  dataExportQueue.process(JOB_TYPES.EXPORT_ANALYSES, dataExportProcessors[JOB_TYPES.EXPORT_ANALYSES]);
  dataExportQueue.process(JOB_TYPES.EXPORT_SETTINGS, dataExportProcessors[JOB_TYPES.EXPORT_SETTINGS]);
  dataExportQueue.process(JOB_TYPES.EXPORT_GDPR_DATA, dataExportProcessors[JOB_TYPES.EXPORT_GDPR_DATA]);
}

// Email Queue Worker
if (emailQueue) {
  emailQueue.process(JOB_TYPES.SEND_WELCOME_EMAIL, emailProcessors[JOB_TYPES.SEND_WELCOME_EMAIL]);
  emailQueue.process(JOB_TYPES.SEND_PASSWORD_RESET, emailProcessors[JOB_TYPES.SEND_PASSWORD_RESET]);
  emailQueue.process(JOB_TYPES.SEND_EMAIL_VERIFICATION, emailProcessors[JOB_TYPES.SEND_EMAIL_VERIFICATION]);
  emailQueue.process(JOB_TYPES.SEND_EXPORT_READY, emailProcessors[JOB_TYPES.SEND_EXPORT_READY]);
  emailQueue.process(JOB_TYPES.SEND_ANALYSIS_COMPLETE, emailProcessors[JOB_TYPES.SEND_ANALYSIS_COMPLETE]);
  emailQueue.process(JOB_TYPES.SEND_WEEKLY_DIGEST, emailProcessors[JOB_TYPES.SEND_WEEKLY_DIGEST]);
  emailQueue.process(JOB_TYPES.SEND_BILLING_REMINDER, emailProcessors[JOB_TYPES.SEND_BILLING_REMINDER]);
}

// Notification Queue Worker
if (notificationQueue) {
  notificationQueue.process(JOB_TYPES.SEND_PUSH_NOTIFICATION, notificationProcessors[JOB_TYPES.SEND_PUSH_NOTIFICATION]);
  notificationQueue.process(JOB_TYPES.SEND_BROWSER_NOTIFICATION, notificationProcessors[JOB_TYPES.SEND_BROWSER_NOTIFICATION]);
  notificationQueue.process(JOB_TYPES.SEND_IN_APP_NOTIFICATION, notificationProcessors[JOB_TYPES.SEND_IN_APP_NOTIFICATION]);
}

// Cleanup Queue Worker
if (cleanupQueue) {
  cleanupQueue.process(JOB_TYPES.CLEANUP_EXPIRED_EXPORTS, cleanupProcessors[JOB_TYPES.CLEANUP_EXPIRED_EXPORTS]);
  cleanupQueue.process(JOB_TYPES.CLEANUP_OLD_ANALYSES, cleanupProcessors[JOB_TYPES.CLEANUP_OLD_ANALYSES]);
  cleanupQueue.process(JOB_TYPES.CLEANUP_ORPHANED_FILES, cleanupProcessors[JOB_TYPES.CLEANUP_ORPHANED_FILES]);
  cleanupQueue.process(JOB_TYPES.CLEANUP_OLD_ACTIVITY_LOGS, cleanupProcessors[JOB_TYPES.CLEANUP_OLD_ACTIVITY_LOGS]);
  cleanupQueue.process(JOB_TYPES.CLEANUP_EXPIRED_SESSIONS, cleanupProcessors[JOB_TYPES.CLEANUP_EXPIRED_SESSIONS]);
  cleanupQueue.process(JOB_TYPES.GENERATE_ANALYTICS_REPORTS, cleanupProcessors[JOB_TYPES.GENERATE_ANALYTICS_REPORTS]);
  cleanupQueue.process(JOB_TYPES.UPDATE_USER_STATISTICS, cleanupProcessors[JOB_TYPES.UPDATE_USER_STATISTICS]);
  cleanupQueue.process(JOB_TYPES.BACKUP_DATABASE, cleanupProcessors[JOB_TYPES.BACKUP_DATABASE]);
  cleanupQueue.process(JOB_TYPES.HEALTH_CHECK, cleanupProcessors[JOB_TYPES.HEALTH_CHECK]);
}

// Analysis Queue Worker (for contract analysis jobs)
if (analysisQueue) {
  analysisQueue.process('analyze-contract', async (job) => {
    console.log(`Processing contract analysis job ${job.id}`);
    
    // This would integrate with your existing AI analysis system
    // For now, we'll just simulate the process
    
    try {
      const { contractId, userId } = job.data;
      
      // Simulate analysis processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log(`Contract analysis ${job.id} completed successfully`);
      return { success: true, contractId };
      
    } catch (error) {
      console.error(`Error processing contract analysis job ${job.id}:`, error);
      throw error;
    }
  });
}

// Queue event handlers for monitoring
[dataExportQueue, emailQueue, notificationQueue, cleanupQueue, analysisQueue].forEach(queue => {
  if (queue) {
    queue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed in queue ${queue.name}`);
    });

    queue.on('failed', (job, error) => {
      console.error(`❌ Job ${job.id} failed in queue ${queue.name}:`, error.message);
    });

    queue.on('stalled', (job) => {
      console.warn(`⚠️ Job ${job.id} stalled in queue ${queue.name}`);
    });

    queue.on('error', (error) => {
      console.error(`🚨 Queue ${queue.name} error:`, error);
    });
  }
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down job workers...');
  
  await Promise.all([
    dataExportQueue?.close(),
    emailQueue?.close(),
    notificationQueue?.close(),
    cleanupQueue?.close(),
    analysisQueue?.close(),
  ].filter(Boolean));
  
  console.log('✅ All job workers shut down');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down job workers...');
  
  await Promise.all([
    dataExportQueue?.close(),
    emailQueue?.close(),
    notificationQueue?.close(),
    cleanupQueue?.close(),
    analysisQueue?.close(),
  ].filter(Boolean));
  
  console.log('✅ All job workers shut down');
  process.exit(0);
});

console.log('🚀 Job workers started successfully');

export default {
  dataExportQueue,
  emailQueue,
  notificationQueue,
  cleanupQueue,
  analysisQueue,
}; 