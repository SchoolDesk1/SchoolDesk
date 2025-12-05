const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    // Bearer <token>
    const tokenString = token.split(' ')[1];

    if (!tokenString) {
        return res.status(403).json({ message: 'Malformed token.' });
    }

    jwt.verify(tokenString, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token.' });
        }

        // Save user id and role to request for use in other routes
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.schoolId = decoded.schoolId; // For school admins
        req.classId = decoded.classId;   // For teachers/parents
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Require Super Admin Role!' });
    }
    next();
};

const isSchoolAdmin = (req, res, next) => {
    if (req.userRole !== 'school_admin') {
        return res.status(403).json({ message: 'Require School Admin Role!' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isSchoolAdmin
};
