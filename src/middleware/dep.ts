import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

/**
 * Dynamically resolves the active DeploySense AI ingest endpoint URL.
 * Checks process.env.DEPLOYSENSE_URL at request runtime to ensure .env settings take effect.
 */
export function getDeploySenseApiUrl(customUrl?: string): string {
  const baseUrl = customUrl || process.env.DEPLOYSENSE_URL || 'https://deploysense-ai.onrender.com';
  if (baseUrl.endsWith('/api/v1/logs/ingest')) {
    return baseUrl;
  }
  return `${baseUrl.replace(/\/+$/, '')}/api/v1/logs/ingest`;
}

/**
 * Sends a log entry to DeploySense AI ingest endpoint with concise error formatting and fallback
 */
export async function sendDeploySenseLog(
  errorLog: string,
  source = 'global-uncaught-handler',
  serviceName = process.env.SERVICE_NAME || 'universal-auth-helper',
  environment = process.env.NODE_ENV || 'production',
  customUrl?: string
) {
  const apiUrl = getDeploySenseApiUrl(customUrl);

  try {
    const payload = {
      serviceName,
      version: 'v1.0.0',
      environment,
      recipientEmail: process.env.ALERT_EMAIL || undefined, // 📧 Route alerts directly to your email
      logs: errorLog,
      source
    };

    const res = await axios.post(apiUrl, payload, { timeout: 10000 });
    console.log(`[DeploySense AI] Log sent successfully (${source}) to ${apiUrl} - Status: ${res.status}`);
    return true;
  } catch (e: any) {
    let errorDetail = e.message;
    if (e.response) {
      const status = e.response.status;
      const statusText = e.response.statusText || '';
      if (typeof e.response.data === 'string' && e.response.data.includes('<html')) {
        errorDetail = `HTTP ${status} ${statusText} (Service Endpoint Unavailable / Suspended)`;
      } else if (typeof e.response.data === 'object' && e.response.data?.message) {
        errorDetail = `HTTP ${status}: ${e.response.data.message}`;
      } else {
        errorDetail = `HTTP ${status} ${statusText}`;
      }
    }
    console.error(`⚠️ [DeploySense AI Ingest Warning] Endpoint (${apiUrl}) failed: ${errorDetail}`);
    return false;
  }
}

/**
 * 🚀 GLOBAL PROJECT-WIDE ERROR LISTENER
 * Catches ANY uncaught exception or unhandled promise rejection in your ENTIRE Node.js project!
 */
export function initDeploySenseGlobalLogger(
  serviceName = process.env.SERVICE_NAME || 'universal-auth-helper',
  environment = process.env.NODE_ENV || 'production',
  customUrl?: string
) {
  // 1. Catch all uncaught synchronous exceptions across the ENTIRE project
  process.on('uncaughtException', (error) => {
    console.error('🔥 Global Uncaught Exception Detected:', error);
    sendDeploySenseLog(
      `[GLOBAL UNCAUGHT EXCEPTION]\n${error.stack || error.message}`,
      'global-uncaught-handler',
      serviceName,
      environment,
      customUrl
    );
  });

  // 2. Catch all unhandled async promise rejections across the ENTIRE project
  process.on('unhandledRejection', (reason: any) => {
    console.error('🔥 Global Unhandled Rejection Detected:', reason);
    sendDeploySenseLog(
      `[GLOBAL UNHANDLED REJECTION]\n${reason?.stack || reason}`,
      'global-unhandled-rejection',
      serviceName,
      environment,
      customUrl
    );
  });

  const apiUrl = getDeploySenseApiUrl(customUrl);
  console.log(`🚀 DeploySense Global Error Monitor Active for [${serviceName}] (${environment}) -> Endpoint: ${apiUrl}`);
}

/**
 * 🚀 EXPRESS ERROR MIDDLEWARE
 * Supports flexible attachment styles:
 * - app.use(deploySenseExpressMiddleware())
 * - app.use(deploySenseExpressMiddleware("my-service", "production"))
 * - app.use(deploySenseExpressMiddleware({ serviceName: "my-service", customUrl: "http://..." }))
 * - app.use(deploySenseExpressMiddleware) -> direct Express error middleware
 */
export function deploySenseExpressMiddleware(
  serviceNameOrOptions?: string | { serviceName?: string; environment?: string; customUrl?: string },
  environmentParam?: string
): any {
  let serviceName = process.env.SERVICE_NAME || 'universal-auth-helper';
  let environment = process.env.NODE_ENV || 'production';
  let customUrl: string | undefined = undefined;

  if (typeof serviceNameOrOptions === 'string') {
    serviceName = serviceNameOrOptions;
    if (environmentParam) environment = environmentParam;
  } else if (typeof serviceNameOrOptions === 'object' && serviceNameOrOptions !== null) {
    if (serviceNameOrOptions.serviceName) serviceName = serviceNameOrOptions.serviceName;
    if (serviceNameOrOptions.environment) environment = serviceNameOrOptions.environment;
    if (serviceNameOrOptions.customUrl) customUrl = serviceNameOrOptions.customUrl;
  }

  const middlewareHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('🔥 Express Route Error Caught by DeploySense AI:', err);

    const logText = `[EXPRESS ROUTE ERROR] ${req.method} ${req.originalUrl || req.url}\n${err.stack || err.message}`;
    sendDeploySenseLog(logText, 'express-route-middleware', serviceName, environment, customUrl);

    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        message: err.message || 'Internal Server Error',
        source: 'DeploySense AI Monitored'
      });
    }
  };

  // Direct Express middleware attachment: app.use(deploySenseExpressMiddleware)
  if (arguments.length === 4 && typeof (arguments[2] as any)?.status === 'function') {
    const [err, req, res, next] = Array.from(arguments) as [any, Request, Response, NextFunction];
    return middlewareHandler(err, req, res, next);
  }

  return middlewareHandler;
}