import { prisma } from './db';
import { initializeQueues, shutdownQueues } from './job-queue';
import './job-worker'; // Import to start job workers

/**
 * Initialize application services on startup
 */
export async function initializeServices() {
  try {
    console.log('🚀 Initializing application services...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Initialize job queues
    initializeQueues();
    console.log('✅ Job queues initialized');

    // Set up periodic cleanup jobs (every 24 hours)
    setInterval(async () => {
      try {
        const { cleanupQueue, JOB_TYPES } = await import('./job-queue');
        
        // Schedule cleanup jobs only if queue is available
        if (cleanupQueue) {
          await cleanupQueue.add(JOB_TYPES.CLEANUP_EXPIRED_EXPORTS, {
            type: 'cleanup-expired-exports',
            options: { retentionDays: 30 },
          });

          await cleanupQueue.add(JOB_TYPES.CLEANUP_OLD_ACTIVITY_LOGS, {
            type: 'cleanup-old-activity-logs',
            options: { retentionDays: 90 },
          });

          console.log('🧹 Scheduled periodic cleanup jobs');
        } else {
          console.log('⚠️ Cleanup queue not available, skipping scheduled jobs');
        }
      } catch (error) {
        console.error('Error scheduling cleanup jobs:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('✅ Application services initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize application services:', error);
    throw error;
  }
}

/**
 * Graceful shutdown of application services
 */
export async function shutdownServices() {
  try {
    console.log('🛑 Shutting down application services...');

    // Shutdown job queues
    await shutdownQueues();
    console.log('✅ Job queues shut down');

    // Close database connection
    await prisma.$disconnect();
    console.log('✅ Database connection closed');

    console.log('✅ Application services shut down successfully');

  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await shutdownServices();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await shutdownServices();
  process.exit(0);
}); 