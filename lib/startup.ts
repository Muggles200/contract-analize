import { analysisQueue } from './analysis-queue';

/**
 * Initialize application services on startup
 */
export async function initializeServices() {
  try {
    console.log('🚀 Initializing application services...');

    // Start the analysis queue processor
    analysisQueue.start();
    console.log('✅ Analysis queue processor started');

    // Set up periodic cleanup (every 24 hours)
    setInterval(async () => {
      try {
        const cleanedCount = await analysisQueue.cleanupOldJobs(30); // 30 days
        if (cleanedCount > 0) {
          console.log(`🧹 Cleaned up ${cleanedCount} old analysis jobs`);
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
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

    // Stop the analysis queue processor
    analysisQueue.stop();
    console.log('✅ Analysis queue processor stopped');

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