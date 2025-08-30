const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { login, register, getProfile, refreshToken } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.get('/profile', authenticateToken, getProfile);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
