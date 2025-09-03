const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authorizeRole, hashPassword } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/collaborators', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (role) {
            whereClause.role = role;
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            collaborators: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('List collaborators error:', error);
        res.status(500).json({ error: 'Failed to list collaborators' });
    }
});

router.get('/collaborators/:id', authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get collaborator error:', error);
        res.status(500).json({ error: 'Failed to get collaborator' });
    }
});

router.post('/collaborators', authorizeRole(['admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'operator'
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Create collaborator error:', error);
        res.status(500).json({ error: 'Failed to create collaborator' });
    }
});

router.put('/collaborators/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        const updates = { ...req.body };
        delete updates.password;
        
        if (req.body.password) {
            updates.password = await hashPassword(req.body.password);
        }

        await user.update(updates);
        
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Update collaborator error:', error);
        res.status(500).json({ error: 'Failed to update collaborator' });
    }
});

router.delete('/collaborators/:id', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        await user.destroy();
        res.json({ message: 'Collaborator deleted successfully' });
    } catch (error) {
        console.error('Delete collaborator error:', error);
        res.status(500).json({ error: 'Failed to delete collaborator' });
    }
});

router.put('/collaborators/:id/toggle-status', authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        user.active = !user.active;
        await user.save();

        res.json({
            message: `Collaborator ${user.active ? 'activated' : 'deactivated'}`,
            active: user.active
        });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

router.get('/roles', async (req, res) => {
    try {
        const roles = [
            { 
                id: 'admin', 
                name: 'Administrator',
                permissions: ['all'],
                description: 'Full system access'
            },
            { 
                id: 'manager', 
                name: 'Manager',
                permissions: ['read', 'write', 'manage_team'],
                description: 'Manage operations and team'
            },
            { 
                id: 'operator', 
                name: 'Operator',
                permissions: ['read', 'write'],
                description: 'Operate POS and sales'
            },
            { 
                id: 'viewer', 
                name: 'Viewer',
                permissions: ['read'],
                description: 'View only access'
            }
        ];

        res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ error: 'Failed to get roles' });
    }
});

router.get('/permissions', authorizeRole(['admin']), async (req, res) => {
    try {
        const permissions = [
            { id: 'all', name: 'All Permissions', module: 'System' },
            { id: 'read', name: 'Read', module: 'General' },
            { id: 'write', name: 'Write', module: 'General' },
            { id: 'delete', name: 'Delete', module: 'General' },
            { id: 'manage_team', name: 'Manage Team', module: 'HR' },
            { id: 'manage_finance', name: 'Manage Finance', module: 'Finance' },
            { id: 'manage_events', name: 'Manage Events', module: 'Events' },
            { id: 'manage_inventory', name: 'Manage Inventory', module: 'Inventory' },
            { id: 'view_reports', name: 'View Reports', module: 'Reports' },
            { id: 'export_data', name: 'Export Data', module: 'Data' }
        ];

        res.json(permissions);
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ error: 'Failed to get permissions' });
    }
});

module.exports = router;