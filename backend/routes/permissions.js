const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { 
  getAllPermissions, 
  getPermissionsByModule, 
  getPermissionModules,
  createPermission, 
  updatePermission, 
  deletePermission 
} = require('../controllers/permissionController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('seguranca.read'), getAllPermissions);

router.get('/by-module', requirePermission('seguranca.read'), getPermissionsByModule);

router.get('/modules', requirePermission('seguranca.read'), getPermissionModules);

router.post('/', requirePermission('seguranca.create'), createPermission);

router.put('/:id', requirePermission('seguranca.update'), updatePermission);

router.delete('/:id', requirePermission('seguranca.delete'), deletePermission);

module.exports = router;
