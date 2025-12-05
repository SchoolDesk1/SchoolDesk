// Partner Routes
const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { verifyPartnerToken } = require('../middleware/partnerAuth');

// Public routes
router.post('/login', partnerController.loginPartner);

// Protected routes (require partner authentication)
router.get('/profile', verifyPartnerToken, partnerController.getPartnerProfile);
router.put('/profile', verifyPartnerToken, partnerController.updatePartnerProfile);
router.put('/change-password', verifyPartnerToken, partnerController.changePartnerPassword);

// Dashboard routes
router.get('/dashboard', verifyPartnerToken, partnerController.getPartnerDashboard);
router.get('/schools', verifyPartnerToken, partnerController.getPartnerSchools);
router.get('/referral-link', verifyPartnerToken, partnerController.getReferralLink);
router.post('/request-payout', verifyPartnerToken, partnerController.requestPayout);
router.get('/payouts', verifyPartnerToken, partnerController.getPayouts);

module.exports = router;
