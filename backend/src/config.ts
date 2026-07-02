import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-min-32-characters',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || String(7 * 24 * 60 * 60 * 1000), 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
  maxPageSize: 100,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

// Validation
// In production, refuse to boot on a missing/weak JWT_SECRET rather than
// silently falling back to the hardcoded dev secret (which would be a
// serious security hole if ever shipped to prod).
if (config.isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error(
    '❌ JWT_SECRET is missing or too short (< 32 chars) in production. Set a strong secret via the JWT_SECRET environment variable.',
  );
  process.exit(1);
}

if (!config.isProd && (!config.jwtSecret || config.jwtSecret.length < 32)) {
  console.warn('⚠️  JWT_SECRET is too short (< 32 chars) or missing. Using development secret.');
}
