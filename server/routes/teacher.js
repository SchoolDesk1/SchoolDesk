const express = require('express');
const router = express.Router();
const controller = require('../controllers/teacherController');
const featuresController = require('../controllers/featuresController');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});
const upload = multer({ storage: storage });

// Middleware to ensure user is a teacher
const isTeacher = (req, res, next) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({ message: 'Require Teacher Role!' });
    }
    next();
};

router.use(verifyToken, isTeacher);

router.post('/upload-homework', upload.single('file'), controller.uploadHomework);
router.get('/homework-list', controller.getHomework);
router.delete('/homework/:id', controller.deleteHomework);

router.post('/upload-notice', controller.uploadNotice);
router.get('/notice-list', controller.getNotices);

// ========== NEW FEATURES ==========

// Timetable Management
router.post('/timetable/save', featuresController.saveTimetable);
router.get('/timetable/:class_id', featuresController.getTimetable);
router.delete('/timetable/:id', featuresController.deleteTimetableEntry);

// Marks Entry
router.post('/marks/add', featuresController.addMarks);

// Student List (for searching)
router.get('/students', controller.getStudents);

module.exports = router;
