const express = require('express');
const router = express.Router();
const controller = require('../controllers/parentController');
const featuresController = require('../controllers/featuresController');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware to ensure user is a parent
const isParent = (req, res, next) => {
    if (req.userRole !== 'parent') {
        return res.status(403).json({ message: 'Require Parent Role!' });
    }
    next();
};

router.use(verifyToken, isParent);

// Routes
router.get('/homework', controller.getHomework);
router.get('/notices', controller.getNotices);
router.get('/fees', controller.getFees);

// ========== NEW FEATURES ==========

// Timetable (view only)
router.get('/timetable/:class_id', featuresController.getTimetable);

// Vehicle Info (get own vehicle details)
router.get('/vehicle', controller.getVehicleInfo);

// Performance/Marks
router.get('/performance/:student_id', featuresController.getStudentPerformance);

// Events Calendar
router.get('/events', controller.getSchoolEvents);

module.exports = router;
