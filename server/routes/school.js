const express = require('express');
const router = express.Router();
const controller = require('../controllers/schoolController');
const backupController = require('../controllers/backupController');
const featuresController = require('../controllers/featuresController');
const { verifyToken, isSchoolAdmin } = require('../middleware/authMiddleware');

const checkLimit = require('../middleware/checkPlanLimit');

// All routes require School Admin privileges
router.use(verifyToken, isSchoolAdmin);

// Classes
router.post('/create-class', checkLimit('classes'), controller.createClass);
router.get('/classes', controller.getClasses);

// Notices
router.post('/create-notice', checkLimit('notices_basic'), controller.createNotice);
router.get('/notices', controller.getNotices);
router.delete('/notices/:id', controller.deleteNotice);

// Fees
router.post('/fees/add', checkLimit('fee_manual'), controller.addFee);
router.put('/fees/:id', controller.updateFeeStatus);
router.post('/fees/toggle', controller.toggleFeeStatus);
router.get('/fees/list', controller.getFees);

// Homework
router.get('/homework/all', controller.getAllHomework);

// Users (Handling split between students and teachers inside the controller or wrapper? 
// For now applying a generic check on the route is tricky because the role is in the body.
// But we can apply a middleware that checks req.body.role. 
// Let's rely on the middleware to inspect req.body for users or use a wrapper.)
// Actually, let's create a specific middleware usage for this route or modify the route to have specific endpoints.
// Since the path is generic '/create-user', we can't easily pass 'students' or 'teachers' to the factory.
// We will modify the router to use a custom middleware wrapper here or update the controller.
// Better approach: Use a middleware that dynamically checks the role from body.
const checkUserLimit = (req, res, next) => {
    const role = req.body.role;
    if (role === 'parent') { // parent == student in this system
        return checkLimit('students')(req, res, next);
    } else if (role === 'teacher') {
        return checkLimit('teachers')(req, res, next);
    }
    next();
};

router.post('/create-user', checkUserLimit, controller.createUser);
router.get('/users', controller.getUsers);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

// Backup & Restore
router.get('/backup/download', checkLimit('backup_monthly'), backupController.downloadSchoolBackup); // Assuming basic has no backup, standard has monthly
router.post('/backup/restore', backupController.restoreSchoolBackup);

// ========== NEW FEATURES ==========

// Vehicles Management
router.post('/vehicles/create', checkLimit('vehicles'), featuresController.createVehicle);
router.get('/vehicles', featuresController.getVehicles);
router.put('/vehicles/:id', featuresController.updateVehicle);
router.delete('/vehicles/:id', featuresController.deleteVehicle);
router.post('/vehicles/assign', featuresController.assignVehicle);

// Events Calendar
router.post('/events/create', checkLimit('events'), featuresController.createEvent);
router.get('/events', featuresController.getEvents);
router.delete('/events/:id', featuresController.deleteEvent);

// Marks/Performance
router.post('/marks/add', checkLimit('report_cards_basic'), featuresController.addMarks);

module.exports = router;
