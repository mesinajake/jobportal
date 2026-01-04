import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

/**
 * Security Middleware Configuration
 * Best Practice: Comprehensive security setup following OWASP guidelines
 */

/**
 * Configure Helmet for HTTP header security
 * Best Practice: Protect against common web vulnerabilities
 */
export const configureHelmet = () => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    // Prevent clickjacking
    frameguard: {
      action: 'deny'
    },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Enable HSTS
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Enable XSS filter
    xssFilter: true,
    // Referrer policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  });
};

/**
 * MongoDB injection prevention
 * Best Practice: Sanitize user input to prevent NoSQL injection
 */
export const configureSanitize = () => {
  return mongoSanitize({
    // Replace prohibited characters with _
    replaceWith: '_',
    // Remove any keys that start with $
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  Sanitized key: ${key} from request`);
    }
  });
};

/**
 * Input validation middleware
 * Best Practice: Validate and sanitize all user inputs
 */
export const validateInput = (req, res, next) => {
  // Remove any null bytes
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.replace(/\0/g, '');
    }
    return str;
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remove dangerous keys
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`⚠️  Blocked dangerous key: ${key}`);
        continue;
      }
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

/**
 * CORS configuration with security best practices
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Best Practice: Whitelist allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
};

/**
 * Security headers middleware
 * Best Practice: Add additional custom security headers
 */
export const securityHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Request logging for security auditing
 * Best Practice: Log security-relevant events
 */
export const securityLogger = (req, res, next) => {
  const securityInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || 'anonymous'
  };

  // Log sensitive operations
  const sensitivePaths = ['/api/auth/', '/api/users/', '/api/employer/'];
  if (sensitivePaths.some(path => req.path.startsWith(path))) {
    console.log('🔒 Security Log:', JSON.stringify(securityInfo));
  }

  next();
};

/**
 * File upload validation
 * Best Practice: Validate file types and sizes
 */
export const validateFileUpload = (allowedTypes, maxSize) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!file) continue;

      // Validate file type
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Validate file size
      if (maxSize && file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
        });
      }

      // Validate file name (prevent path traversal)
      if (file.originalname.includes('..') || file.originalname.includes('/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file name'
        });
      }
    }

    next();
  };
};

/**
 * IP whitelisting middleware (optional, for admin routes)
 * Best Practice: Restrict admin access to specific IPs
 */
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      next();
    } else {
      console.warn(`⚠️  Blocked access from IP: ${clientIP}`);
      res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
  };
};

/**
 * Suspicious activity detection
 * Best Practice: Monitor and block suspicious patterns
 */
export const detectSuspiciousActivity = (req, res, next) => {
  // Check for common attack patterns in URL
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /w*((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
    /(\.\.)|(\.\/)/i, // Path traversal
    /(union|select|insert|update|delete|drop|create|alter)/i // SQL keywords
  ];

  const fullUrl = req.originalUrl || req.url;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      console.error('🚨 Suspicious activity detected:', {
        ip: req.ip,
        url: fullUrl,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Forbidden request detected'
      });
    }
  }

  next();
};
