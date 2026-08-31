import axios from 'axios';

// 🚀 GLOBAL PROJECT-WIDE ERROR LISTENER (Place in index.ts / server.js / main.ts)
// Catches ANY uncaught exception or unhandled promise rejection in your ENTIRE Node.js project!
export function initDeploySenseGlobalLogger(serviceName = 'my-node-app', environment = 'production') {
  const API_URL = 'https://deploysense-ai.onrender.com/logs/ingest';

  const sendLog = async (errorLog: string) => {
    try {
      await axios.post(API_URL, {
        serviceName,
        version: 'v1.0.0',
        environment,
        recipientEmail: process.env.ALERT_EMAIL, // 📧 Route alerts directly to your email
        logs: errorLog,
        source: 'global-uncaught-handler'
      });
    } catch (e: any) {
      console.error('DeploySense Ingest Error:', e.message);
    }
  };

  // 1. Catch all uncaught synchronous exceptions across the ENTIRE project
  process.on('uncaughtException', (error) => {
    console.error('🔥 Global Uncaught Exception Detected:', error);
    sendLog(`[GLOBAL UNCAUGHT EXCEPTION]\n${error.stack || error.message}`);
  });

  // 2. Catch all unhandled async promise rejections across the ENTIRE project
  process.on('unhandledRejection', (reason: any) => {
    console.error('🔥 Global Unhandled Rejection Detected:', reason);
    sendLog(`[GLOBAL UNHANDLED REJECTION]\n${reason?.stack || reason}`);
  });

  console.log('🚀 DeploySense Global Project-Wide Error Monitor Active.');
}