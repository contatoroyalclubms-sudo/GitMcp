const express = require('express');
const router = express.Router();

// Mock team database
let teamMembers = [
    { id: 1, name: 'João Silva', email: 'joao@meep.com', role: 'gerente', department: 'Administração' },
    { id: 2, name: 'Maria Santos', email: 'maria@meep.com', role: 'vendedor', department: 'Vendas' }
];
let memberIdCounter = 3;

// GET all team members
router.get('/', (req, res) => {
    res.json({ success: true, team: teamMembers });
});

// GET member by ID
router.get('/members/:id', (req, res) => {
    const member = teamMembers.find(m => m.id == req.params.id);
    if (member) {
        res.json({ success: true, member });
    } else {
        res.status(404).json({ error: 'Team member not found' });
    }
});

// POST add team member
router.post('/members', (req, res) => {
    const newMember = {
        id: memberIdCounter++,
        ...req.body,
        status: 'active',
        joinedAt: new Date()
    };
    teamMembers.push(newMember);
    res.status(201).json({ success: true, member: newMember });
});

// PUT update member
router.put('/members/:id', (req, res) => {
    const index = teamMembers.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
        teamMembers[index] = { ...teamMembers[index], ...req.body };
        res.json({ success: true, member: teamMembers[index] });
    } else {
        res.status(404).json({ error: 'Team member not found' });
    }
});

// DELETE remove member
router.delete('/members/:id', (req, res) => {
    const index = teamMembers.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
        teamMembers.splice(index, 1);
        res.json({ success: true, message: 'Team member removed' });
    } else {
        res.status(404).json({ error: 'Team member not found' });
    }
});

// GET departments
router.get('/departments', (req, res) => {
    const departments = [...new Set(teamMembers.map(m => m.department))];
    res.json({ success: true, departments });
});

module.exports = router;