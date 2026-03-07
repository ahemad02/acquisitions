import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid token format',
      });
    }

    const decoded = jwttoken.verify(token);

    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token verification failed',
    });
  }
};

export const requireRole = allowedRoles => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.email} with role ${req.user.role}`
        );

        return res.status(403).json({
          error: 'Access denied',
          message: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      logger.error('Role middleware error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'Error checking permissions',
      });
    }
  };
};
