const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, isSchoolAdmin } = require('../middleware/authMiddleware');

// Create Order (Protected)
router.post('/create-order', verifyToken, isSchoolAdmin, paymentController.createOrder);

// Verify Payment (Protected)
router.get('/verify/:orderId', verifyToken, isSchoolAdmin, paymentController.verifyPayment);

module.exports = router;
