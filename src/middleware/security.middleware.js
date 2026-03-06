import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin Request Limit Exceeded(20 per minute). Slow down';
        break;
      case 'user':
        limit = 10;
        message = 'User Request Limit Exceeded(10 per minute). Slow down';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest Request Limit Exceeded(5 per minute). Slow down';
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}rateLimit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request Blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated request blocked',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request Blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by Shield',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate Limit request Blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Too many requests',
      });
    }

    next();
  } catch (error) {
    console.error('Arcject middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default securityMiddleware;
