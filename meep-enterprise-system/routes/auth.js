const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { generateToken, hashPassword, comparePassword } = require('../middleware/auth');

// Removendo express-validator para simplificar
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'operator'
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Account deactivated' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        res.json({
            message: 'Token refreshed',
            token: generateToken(req.user)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.json({ message: 'If user exists, password reset email sent' });
        }

        res.json({ message: 'If user exists, password reset email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process request' });
    }
});

module.exports = router;