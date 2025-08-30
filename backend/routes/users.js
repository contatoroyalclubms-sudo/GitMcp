const express = require('express');
const { Op } = require('sequelize');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { User, Role } = require('../models');

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('usuarios.read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }],
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        last_login: user.last_login,
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          level: role.level
        })),
        created_at: user.created_at
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:userId/roles/:roleId', requirePermission('usuarios.update'), async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      return res.status(404).json({ error: 'User or role not found' });
    }
    
    await user.addRole(role);
    
    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:userId/roles/:roleId', requirePermission('usuarios.update'), async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    
    if (!user || !role) {
      return res.status(404).json({ error: 'User or role not found' });
    }
    
    await user.removeRole(role);
    
    res.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
