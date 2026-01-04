import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Best Practice: Protect against brute force attacks and DDoS
 * Different rate limits for different endpoint types
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Best Practice: Skip successful requests from counting against rate limit for certain actions
  skipSuccessfulRequests: false,
  // Best Practice: Skip failed requests to prevent attackers from filling up the limit
  skipFailedRequests: false
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Best Practice: Use Redis or MongoDB for distributed systems
  // store: new RedisStore({ client: redisClient }),
});

/**
 * Password reset rate limiter
 * More restrictive to prevent abuse
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Best Practice: Skip successful requests for password reset
  skipSuccessfulRequests: true
});

/**
 * Email verification rate limiter
 * Prevents spam and abuse of email service
 * 5 requests per hour per IP
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many verification email requests, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload rate limiter
 * Prevents excessive file uploads
 * 10 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many file uploads, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Job posting rate limiter
 * Prevents spam job postings
 * 20 posts per day per IP (employers typically don't post many jobs at once)
 */
export const jobPostingLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: {
    success: false,
    message: 'Too many job postings, please try again tomorrow'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Application submission rate limiter
 * Prevents spam applications
 * 50 applications per day per IP
 */
export const applicationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50,
  message: {
    success: false,
    message: 'Too many application submissions, please try again tomorrow'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Search rate limiter
 * Prevents API abuse on search endpoints
 * 100 searches per hour per IP
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    success: false,
    message: 'Too many search requests, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful searches
});

/**
 * Create dynamic rate limiter based on user role
 * Best Practice: Different limits for different user types
 */
export const createDynamicLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxDefault = 100,
    maxEmployer = 200,
    maxAdmin = 1000
  } = options;

  return rateLimit({
    windowMs,
    max: (req) => {
      // Best Practice: Higher limits for authenticated and privileged users
      if (req.user) {
        if (req.user.role === 'admin') return maxAdmin;
        if (req.user.role === 'employer') return maxEmployer;
      }
      return maxDefault;
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};
