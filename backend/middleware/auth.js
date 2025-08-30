const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = [];
    req.user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        userPermissions.push(permission.name);
      });
    });

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermission,
        userPermissions: userPermissions
      });
    }

    next();
  };
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = req.user.roles.map(role => role.name);
    
    if (!userRoles.includes(requiredRole)) {
      return res.status(403).json({ 
        error: 'Insufficient role',
        required: requiredRole,
        userRoles: userRoles
      });
    }

    next();
  };
};

const requireMinimumRole = (minimumLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const maxUserLevel = Math.max(...req.user.roles.map(role => role.level));
    
    if (maxUserLevel < minimumLevel) {
      return res.status(403).json({ 
        error: 'Insufficient role level',
        required: minimumLevel,
        userLevel: maxUserLevel
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  requireMinimumRole
};
