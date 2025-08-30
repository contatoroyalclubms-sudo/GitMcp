const { 
  Role, 
  Permission, 
  PermissionModule, 
  RolePermission, 
  User, 
  UserRole,
  sequelize 
} = require('../models');

const permissionModules = [
  { name: 'dashboard', description: 'Dashboard e métricas gerais', icon: 'dashboard', color: '#1976d2', order: 1 },
  { name: 'eventos', description: 'Gestão de eventos', icon: 'event', color: '#388e3c', order: 2 },
  { name: 'usuarios', description: 'Gestão de usuários', icon: 'people', color: '#f57c00', order: 3 },
  { name: 'vendas', description: 'Sistema de vendas', icon: 'shopping_cart', color: '#7b1fa2', order: 4 },
  { name: 'cashless', description: 'Sistema cashless', icon: 'payment', color: '#00796b', order: 5 },
  { name: 'relatorios', description: 'Relatórios e analytics', icon: 'assessment', color: '#5d4037', order: 6 },
  { name: 'financeiro', description: 'Gestão financeira', icon: 'account_balance', color: '#c62828', order: 7 },
  { name: 'marketing', description: 'Marketing e promoções', icon: 'campaign', color: '#ad1457', order: 8 },
  { name: 'suporte', description: 'Suporte ao cliente', icon: 'support_agent', color: '#6a1b9a', order: 9 },
  { name: 'configuracoes', description: 'Configurações do sistema', icon: 'settings', color: '#455a64', order: 10 },
  { name: 'seguranca', description: 'Segurança e auditoria', icon: 'security', color: '#e65100', order: 11 },
  { name: 'integracao', description: 'Integrações externas', icon: 'sync', color: '#2e7d32', order: 12 },
  { name: 'notificacoes', description: 'Sistema de notificações', icon: 'notifications', color: '#1565c0', order: 13 },
  { name: 'backup', description: 'Backup e recuperação', icon: 'backup', color: '#424242', order: 14 },
  { name: 'logs', description: 'Logs do sistema', icon: 'list_alt', color: '#37474f', order: 15 },
  { name: 'api', description: 'Gestão de APIs', icon: 'api', color: '#00695c', order: 16 },
  { name: 'mobile', description: 'Aplicativo mobile', icon: 'phone_android', color: '#4527a0', order: 17 }
];

const roles = [
  { name: 'ADMIN', description: 'Administrador com acesso total', level: 4 },
  { name: 'GERENCIA', description: 'Gerência com acesso amplo', level: 3 },
  { name: 'PROMOTER', description: 'Promoter de eventos', level: 2 },
  { name: 'VENDAS', description: 'Equipe de vendas', level: 1 }
];

const generatePermissions = () => {
  const actions = ['create', 'read', 'update', 'delete', 'manage'];
  const permissions = [];
  
  permissionModules.forEach(module => {
    actions.forEach(action => {
      permissions.push({
        name: `${module.name}.${action}`,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.description.toLowerCase()}`,
        module: module.name,
        action: action,
        resource: module.name
      });
    });
  });
  
  return permissions;
};

const rolePermissions = {
  'ADMIN': 'all', // All permissions
  'GERENCIA': [
    'dashboard.read', 'dashboard.manage',
    'eventos.create', 'eventos.read', 'eventos.update', 'eventos.delete', 'eventos.manage',
    'usuarios.read', 'usuarios.update', 'usuarios.manage',
    'vendas.create', 'vendas.read', 'vendas.update', 'vendas.manage',
    'cashless.create', 'cashless.read', 'cashless.update', 'cashless.manage',
    'relatorios.read', 'relatorios.manage',
    'financeiro.read', 'financeiro.manage',
    'marketing.create', 'marketing.read', 'marketing.update', 'marketing.manage',
    'suporte.read', 'suporte.manage',
    'configuracoes.read', 'configuracoes.update',
    'seguranca.read',
    'integracao.read', 'integracao.manage',
    'notificacoes.create', 'notificacoes.read', 'notificacoes.update',
    'logs.read'
  ],
  'PROMOTER': [
    'dashboard.read',
    'eventos.create', 'eventos.read', 'eventos.update',
    'vendas.create', 'vendas.read', 'vendas.update',
    'cashless.read', 'cashless.update',
    'marketing.create', 'marketing.read', 'marketing.update',
    'suporte.read',
    'notificacoes.read'
  ],
  'VENDAS': [
    'dashboard.read',
    'eventos.read',
    'vendas.create', 'vendas.read', 'vendas.update',
    'cashless.read', 'cashless.update',
    'suporte.read',
    'notificacoes.read'
  ]
};

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    await PermissionModule.bulkCreate(permissionModules);
    console.log('Permission modules seeded');

    const permissions = generatePermissions();
    await Permission.bulkCreate(permissions);
    console.log('Permissions seeded');

    await Role.bulkCreate(roles);
    console.log('Roles seeded');

    for (const [roleName, rolePerms] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { name: roleName } });
      
      if (rolePerms === 'all') {
        const allPermissions = await Permission.findAll();
        await role.setPermissions(allPermissions);
      } else {
        const permissionInstances = await Permission.findAll({
          where: { name: rolePerms }
        });
        await role.setPermissions(permissionInstances);
      }
    }
    console.log('Role permissions assigned');

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@eventos-dashboard.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User'
    });

    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    await adminUser.addRole(adminRole);
    console.log('Default admin user created');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };
