const JWTUtil = require('../utils/jwt');
const UserModel = require('../models/userModel');

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const user = await UserModel.findById(decoded.userId);
      
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  static authorize(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!allowedRoles.includes(req.user.user_type)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    };
  }
}

module.exports = AuthMiddleware;
