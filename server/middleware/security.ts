
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Rate limiting
export const createRateLimit = (windowMs: number, max: number, message: string) => 
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API rate limit
export const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many API requests, please try again later'
);

// Strict rate limit for sensitive operations
export const strictLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many requests for this operation, please try again later'
);

// Review rate limit
export const reviewLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 review submissions per hour
  'Too many reviews submitted, please try again later'
);

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize all string inputs
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters and scripts
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
        .slice(0, 10000); // Limit string length
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  
  next();
};

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://cdnjs.cloudflare.com"], // Allow Stripe.js and Font Awesome
      connectSrc: ["'self'", "wss:", "ws:", "https:", "http:", "https://api.stripe.com"], // Allow Stripe API connections
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"], // Allow Stripe frames
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Discord embeds
});

// Validation middleware
export const validateServerData = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, inviteCode } = req.body;
  
  // Basic validation
  if (!name || name.length < 1 || name.length > 100) {
    return res.status(400).json({ message: "Invalid server name" });
  }
  
  if (!description || description.length < 10 || description.length > 2000) {
    return res.status(400).json({ message: "Description must be between 10 and 2000 characters" });
  }
  
  if (!inviteCode || !/^[a-zA-Z0-9]{6,}$/.test(inviteCode.split('/').pop() || '')) {
    return res.status(400).json({ message: "Invalid invite code format" });
  }
  
  next();
};

// Review validation
export const validateReview = (req: Request, res: Response, next: NextFunction) => {
  const { rating, review } = req.body;
  
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
  }
  
  if (review && (typeof review !== 'string' || review.length > 1000)) {
    return res.status(400).json({ message: "Review must be a string with maximum 1000 characters" });
  }
  
  next();
};

// Error handling middleware
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Security Error:', error);
  
  // Don't expose internal error details
  res.status(500).json({ 
    message: "Internal server error",
    timestamp: new Date().toISOString()
  });
};
