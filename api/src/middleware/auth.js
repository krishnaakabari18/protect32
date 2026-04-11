const JWTUtil = require('../utils/jwt');
const UserModel = require('../models/userModel');
const rateLimit = require('express-rate-limit');

// ── Rate limiters ─────────────────────────────────────────────────────────────

// Strict limiter for auth endpoints (login, register, OTP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.', data: null, error: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.', data: null, error: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── JWT Authentication ────────────────────────────────────────────────────────

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false, message: 'No token provided', data: null, error: 'NO_TOKEN',
        });
      }

      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false, message: 'Invalid or expired token', data: null, error: 'INVALID_TOKEN',
        });
      }

      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false, message: 'User not found or inactive', data: null, error: 'USER_INACTIVE',
        });
      }

      // Attach user — controllers use req.user.id, NEVER accept ID from request body/params for user-specific data
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false, message: 'Authentication failed', data: null, error: 'AUTH_FAILED',
      });
    }
  }

  // Role-based authorization
  static authorize(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false, message: 'Not authenticated', data: null, error: 'NOT_AUTHENTICATED',
        });
      }
      if (!allowedRoles.includes(req.user.user_type)) {
        return res.status(403).json({
          success: false, message: 'Access denied', data: null, error: 'FORBIDDEN',
        });
      }
      next();
    };
  }

  // Admin-only shorthand
  static adminOnly(req, res, next) {
    return AuthMiddleware.authorize('super_admin', 'admin')(req, res, next);
  }
}

module.exports = { AuthMiddleware, authLimiter, apiLimiter };
