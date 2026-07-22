import { env } from '#/config/server-config.js';
import helmet from 'helmet';

const isDevelopment = env.NODE_ENV === 'development';

export const securityMiddleware = helmet({
  // 1. Content Security Policy (CSP) - Most important & restrictive
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // Allows self-hosted assets and scripts
      'default-src': ["'self'"],

      // Relaxes script restrictions in development for tools like bundlers/Vite
      'script-src': isDevelopment ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'"],

      // Allows connecting to your own server API endpoints
      'connect-src': ["'self'"],

      // Upgrade insecure HTTP requests to HTTPS in production
      'upgrade-insecure-requests': isDevelopment ? null : [],
    },
  },

  // 2. Hide backend framework fingerprints completely
  xPoweredBy: false,

  // 3. Prevent clickjacking attacks (only allow framing on your own domain)
  frameguard: {
    action: 'sameorigin',
  },

  // 4. Strict Transport Security (HSTS) - Forces HTTPS
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // 5. Prevent browsers from sniffing MIME types away from declared headers
  noSniff: true,

  // 6. Control how much referrer information is shared when navigating away
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});
