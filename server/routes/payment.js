const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, isSchoolAdmin } = require('../middleware/authMiddleware');

// Public endpoint for webhooks (no auth required)
router.post('/webhook', paymentController.handleWebhook);

// Public endpoint - get available plans
router.get('/plans', paymentController.getPlans);

// Protected routes - require authentication
// Create a new payment order
router.post('/create-order', verifyToken, isSchoolAdmin, paymentController.createOrder);

// Verify payment status
router.get('/verify/:orderId', verifyToken, isSchoolAdmin, paymentController.verifyPayment);

// Validate promo code
router.post('/validate-promo', verifyToken, isSchoolAdmin, paymentController.validatePromo);

module.exports = router;
