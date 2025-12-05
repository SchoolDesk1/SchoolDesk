const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login-super-admin', controller.loginSuperAdmin);
router.post('/login-school', controller.loginSchool);
router.post('/login-user', controller.loginUser);
router.post('/register-school', controller.registerSchool); // Public route for school signup
router.get('/me', verifyToken, controller.getProfile);

module.exports = router;
