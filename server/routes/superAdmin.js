const express = require('express');
const router = express.Router();
const controller = require('../controllers/superAdminController');
const backupController = require('../controllers/backupController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes require Super Admin privileges
router.use(verifyToken, isAdmin);

// School Management
router.get('/schools', controller.getAllSchools);
router.post('/create-school', controller.createSchool);
router.patch('/schools/:id/status', controller.updateSchoolStatus);
router.delete('/schools/:id', controller.deleteSchool);

// Analytics
router.get('/analytics/platform', controller.getPlatformAnalytics);
router.get('/analytics/schools/:id', controller.getSchoolDetails);

// Users Overview
router.get('/users/all', controller.getAllUsers);

// Content Management
router.get('/content/homework', controller.getAllHomework);
router.get('/content/notices', controller.getAllNotices);
router.delete('/content/homework/:id', controller.deleteHomework);
router.delete('/content/notices/:id', controller.deleteNoticeAdmin);

// Backup & Restore (Super Admin can backup any school or full system)
router.get('/backup/download', backupController.downloadSchoolBackup);
router.post('/backup/restore', backupController.restoreSchoolBackup);
router.get('/backup/system', controller.downloadSystemBackup);

// ===== SUPER ADMIN CONTROL FEATURES =====

// School Control
router.post('/schools/:id/reset-password', controller.resetSchoolPassword);
router.post('/schools/:id/toggle-block', controller.toggleSchoolBlock);
router.patch('/schools/:id/update-plan', controller.updateSchoolPlan);
router.get('/schools/:id/full-details', controller.getSchoolFullDetails);

// User Control
router.get('/users/detailed', controller.getAllUsersDetailed);
router.delete('/users/:id', controller.deleteUser);
router.post('/users/:id/reset-password', controller.resetUserPassword);

// ===== NEW FEATURES ROUTES =====
router.get('/search', controller.getGlobalSearch);
router.get('/logs', controller.getActivityLogs);
router.get('/tickets', controller.getSupportTickets);
router.post('/tickets/:id/reply', controller.replySupportTicket);
router.get('/analytics/comprehensive', controller.getComprehensiveOverview);

// ===== PARTNER MANAGEMENT =====
router.get('/partners', controller.getAllPartners);
router.post('/partners', controller.addPartner);
router.get('/partners/:id', controller.getPartnerDetails);
router.put('/partners/:id', controller.updatePartner);
router.delete('/partners/:id', controller.deletePartner);
router.get('/partners/:id/analytics', controller.getPartnerAnalytics);

// ===== PROMO CODE MANAGEMENT =====
router.get('/promocodes', controller.getAllPromoCodes);
router.post('/promocodes', controller.createPromoCode);
// router.put('/promocodes/:id', controller.updatePromoCode); // Not implemented yet
router.delete('/promocodes/:id', controller.deletePromoCode);

// ===== PAYOUT MANAGEMENT =====
router.get('/payouts', controller.getPayoutRequests);
router.put('/payouts/:id', controller.updatePayoutStatus);

module.exports = router;
