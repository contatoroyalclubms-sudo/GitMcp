const { Op } = require('sequelize');
const { Role, Permission, User, RolePermission } = require('../models');

const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: roles } = await Role.findAndCountAll({
      where: whereClause,
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['level', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        level: role.level,
        is_active: role.is_active,
        permissions_count: role.permissions.length,
        created_at: role.created_at,
        updated_at: role.updated_at
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }, {
        model: User,
        as: 'users',
        through: { attributes: [] },
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }]
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        level: role.level,
        is_active: role.is_active,
        permissions: role.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          description: perm.description,
          module: perm.module,
          action: perm.action
        })),
        users: role.users,
        created_at: role.created_at,
        updated_at: role.updated_at
      }
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, level, permission_ids = [] } = req.body;

    if (!name || !description || level === undefined) {
      return res.status(400).json({ error: 'Name, description, and level are required' });
    }

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(409).json({ error: 'Role already exists' });
    }

    const role = await Role.create({
      name,
      description,
      level
    });

    if (permission_ids.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: permission_ids }
      });
      await role.setPermissions(permissions);
    }

    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: roleWithPermissions.id,
        name: roleWithPermissions.name,
        description: roleWithPermissions.description,
        level: roleWithPermissions.level,
        is_active: roleWithPermissions.is_active,
        permissions: roleWithPermissions.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          module: perm.module,
          action: perm.action
        }))
      }
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, level, permission_ids, is_active } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (level !== undefined) updateData.level = level;
    if (is_active !== undefined) updateData.is_active = is_active;

    await role.update(updateData);

    if (permission_ids !== undefined) {
      const permissions = await Permission.findAll({
        where: { id: permission_ids }
      });
      await role.setPermissions(permissions);
    }

    const updatedRole = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    res.json({
      message: 'Role updated successfully',
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        level: updatedRole.level,
        is_active: updatedRole.is_active,
        permissions: updatedRole.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          module: perm.module,
          action: perm.action
        }))
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const usersCount = await role.countUsers();
    if (usersCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role with assigned users',
        users_count: usersCount
      });
    }

    await role.destroy();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
