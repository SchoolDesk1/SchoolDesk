const express = require('express');
const router = express.Router();
const controller = require('../controllers/schoolController');
const backupController = require('../controllers/backupController');
const featuresController = require('../controllers/featuresController');
const { verifyToken, isSchoolAdmin } = require('../middleware/authMiddleware');

// All routes require School Admin privileges
router.use(verifyToken, isSchoolAdmin);

// Classes
router.post('/create-class', controller.createClass);
router.get('/classes', controller.getClasses);

// Notices
router.post('/create-notice', controller.createNotice);
router.get('/notices', controller.getNotices);
router.delete('/notices/:id', controller.deleteNotice);

// Fees
router.post('/fees/add', controller.addFee);
router.put('/fees/:id', controller.updateFeeStatus);
router.post('/fees/toggle', controller.toggleFeeStatus);
router.get('/fees/list', controller.getFees);

// Homework
router.get('/homework/all', controller.getAllHomework);

// Users
router.post('/create-user', controller.createUser);
router.get('/users', controller.getUsers);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

// Backup & Restore
router.get('/backup/download', backupController.downloadSchoolBackup);
router.post('/backup/restore', backupController.restoreSchoolBackup);

// ========== NEW FEATURES ==========

// Vehicles Management
router.post('/vehicles/create', featuresController.createVehicle);
router.get('/vehicles', featuresController.getVehicles);
router.put('/vehicles/:id', featuresController.updateVehicle);
router.delete('/vehicles/:id', featuresController.deleteVehicle);
router.post('/vehicles/assign', featuresController.assignVehicle);

// Events Calendar
router.post('/events/create', featuresController.createEvent);
router.get('/events', featuresController.getEvents);
router.delete('/events/:id', featuresController.deleteEvent);

// Marks/Performance
router.post('/marks/add', featuresController.addMarks);

module.exports = router;
