const sequelize = require('../config/database');
const Role = require('./Role');
const Permission = require('./Permission');
const PermissionModule = require('./PermissionModule');
const RolePermission = require('./RolePermission');
const User = require('./User');
const UserRole = require('./UserRole');

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

Permission.belongsTo(PermissionModule, {
  foreignKey: 'module',
  targetKey: 'name',
  as: 'permissionModule'
});

PermissionModule.hasMany(Permission, {
  foreignKey: 'module',
  sourceKey: 'name',
  as: 'permissions'
});

RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });
UserRole.belongsTo(User, { foreignKey: 'user_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });

module.exports = {
  sequelize,
  Role,
  Permission,
  PermissionModule,
  RolePermission,
  User,
  UserRole,
};
