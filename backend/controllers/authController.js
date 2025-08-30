const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Role, Permission } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email, is_active: true },
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      }]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.update({ last_login: new Date() });

    const token = generateToken(user.id);

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        level: role.level,
        permissions: role.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          module: perm.module,
          action: perm.action
        }))
      }))
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_name = 'VENDAS' } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name
    });

    const defaultRole = await Role.findOne({ where: { name: role_name } });
    if (defaultRole) {
      await user.addRole(defaultRole);
    }

    const userWithRoles = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      }]
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userWithRoles.id,
        username: userWithRoles.username,
        email: userWithRoles.email,
        first_name: userWithRoles.first_name,
        last_name: userWithRoles.last_name,
        roles: userWithRoles.roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          level: role.level
        }))
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: user.last_login,
      roles: user.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        level: role.level,
        permissions: role.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          module: perm.module,
          action: perm.action,
          description: perm.description
        }))
      }))
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const user = req.user;
    const newToken = generateToken(user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  refreshToken
};
