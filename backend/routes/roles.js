const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} = require('../controllers/roleController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', requirePermission('usuarios.read'), getAllRoles);

router.get('/:id', requirePermission('usuarios.read'), getRoleById);

router.post('/', requirePermission('usuarios.create'), createRole);

router.put('/:id', requirePermission('usuarios.update'), updateRole);

router.delete('/:id', requirePermission('usuarios.delete'), deleteRole);

module.exports = router;
