import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieSession from "cookie-session";
import { storage } from "./storage";
import { startDiscordBot } from "./discord-bot";
import { 
  securityHeaders, 
  sanitizeInput, 
  apiLimiter,
  errorHandler 
} from "./middleware/security";

// SSL certificates are handled properly by the system

// Extend Express Request type for cookie-session
declare global {
  namespace Express {
    interface Request {
      session?: {
        userId?: string;
        rememberMe?: boolean;
        loginTime?: number;
        oauthState?: string;
        oauthTimestamp?: number;
        pendingRememberMe?: boolean;
      } | null;
    }
  }
}

// Set default Discord Client ID if not provided
if (!process.env.DISCORD_CLIENT_ID) {
  process.env.DISCORD_CLIENT_ID = "1418600262938923220";
}

const app = express();
// Security middleware
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use('/api/', apiLimiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));


  // Error handling
  app.use(errorHandler);


// Require strong session secret in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

// Configure trust proxy for proper protocol detection
app.set('trust proxy', 1);

// Cookie-based session middleware for truly persistent login (survives server restarts)
app.use(cookieSession({
  name: 'smartserve.sid',
  keys: [process.env.SESSION_SECRET || 'smartserve-static-secret-key-for-persistent-sessions-v1'],
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year for truly persistent login
  secure: process.env.NODE_ENV === 'production', // Auto-secure in production
  httpOnly: true, // Better security - prevents XSS attacks  
  sameSite: 'lax', // CSRF protection
  overwrite: true // Allow overwriting
}));

// Enhanced user authentication middleware with auto-login
app.use(async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
          avatar: user.avatar ?? undefined,
          isAdmin: user.isAdmin ?? undefined
        };

        // Update last activity for security tracking
        if (!req.session.loginTime) {
          req.session.loginTime = Date.now();
        }

        // Cookie-session handles expiration automatically via maxAge
      } else {
        // User no longer exists, clear session  
        req.session = null;
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear invalid session on error
      req.session = null;
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Truncate the JSON response if it's too long
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 80 ? jsonString.slice(0, 77) + "…" : jsonString}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Start Discord bot for economy rewards
  startDiscordBot();
  
  // Start Quest Bot for notifications and channel management
  try {
    import('./quest-bot');
    console.log('🎯 Quest Bot starting...');
  } catch (error) {
    console.error('❌ Failed to start Quest Bot:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Log the error for debugging purposes
    console.error(err);
    // Rethrowing the error might not be necessary here as we've already sent a response.
    // Depending on the desired behavior, you might want to remove the throw.
    // For now, keeping it to potentially allow higher-level error handling if any.
    // throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
