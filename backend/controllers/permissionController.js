const { Op } = require('sequelize');
const { Permission, PermissionModule, Role } = require('../models');

const getAllPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', module = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (module) {
      whereClause.module = module;
    }

    const { count, rows: permissions } = await Permission.findAndCountAll({
      where: whereClause,
      include: [{
        model: PermissionModule,
        as: 'permissionModule',
        attributes: ['name', 'description', 'icon', 'color']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['module', 'ASC'], ['action', 'ASC']]
    });

    res.json({
      permissions: permissions.map(perm => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
        module: perm.module,
        action: perm.action,
        resource: perm.resource,
        is_active: perm.is_active,
        module_info: perm.permissionModule,
        created_at: perm.created_at,
        updated_at: perm.updated_at
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPermissionsByModule = async (req, res) => {
  try {
    const modules = await PermissionModule.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        where: { is_active: true }
      }],
      where: { is_active: true },
      order: [['order', 'ASC'], [{ model: Permission, as: 'permissions' }, 'action', 'ASC']]
    });

    const modulePermissions = modules.map(module => ({
      id: module.id,
      name: module.name,
      description: module.description,
      icon: module.icon,
      color: module.color,
      order: module.order,
      permissions: module.permissions.map(perm => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
        action: perm.action,
        resource: perm.resource
      }))
    }));

    res.json({ modules: modulePermissions });
  } catch (error) {
    console.error('Get permissions by module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPermissionModules = async (req, res) => {
  try {
    const modules = await PermissionModule.findAll({
      where: { is_active: true },
      order: [['order', 'ASC']]
    });

    res.json({
      modules: modules.map(module => ({
        id: module.id,
        name: module.name,
        description: module.description,
        icon: module.icon,
        color: module.color,
        order: module.order
      }))
    });
  } catch (error) {
    console.error('Get permission modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPermission = async (req, res) => {
  try {
    const { name, description, module, action, resource } = req.body;

    if (!name || !module || !action) {
      return res.status(400).json({ error: 'Name, module, and action are required' });
    }

    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(409).json({ error: 'Permission already exists' });
    }

    const permissionModule = await PermissionModule.findOne({ where: { name: module } });
    if (!permissionModule) {
      return res.status(400).json({ error: 'Invalid module' });
    }

    const permission = await Permission.create({
      name,
      description,
      module,
      action,
      resource
    });

    res.status(201).json({
      message: 'Permission created successfully',
      permission: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        module: permission.module,
        action: permission.action,
        resource: permission.resource,
        is_active: permission.is_active
      }
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, module, action, resource, is_active } = req.body;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (module !== undefined) updateData.module = module;
    if (action !== undefined) updateData.action = action;
    if (resource !== undefined) updateData.resource = resource;
    if (is_active !== undefined) updateData.is_active = is_active;

    await permission.update(updateData);

    res.json({
      message: 'Permission updated successfully',
      permission: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        module: permission.module,
        action: permission.action,
        resource: permission.resource,
        is_active: permission.is_active
      }
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    const rolesCount = await permission.countRoles();
    if (rolesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete permission assigned to roles',
        roles_count: rolesCount
      });
    }

    await permission.destroy();

    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionsByModule,
  getPermissionModules,
  createPermission,
  updatePermission,
  deletePermission
};
