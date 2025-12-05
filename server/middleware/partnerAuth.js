// Partner Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify partner JWT token
 */
const verifyPartnerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if the role is partner
        if (decoded.role !== 'partner') {
            return res.status(403).json({ message: 'Access denied. Partner authentication required.' });
        }

        // Attach partner info to request
        req.partnerId = decoded.id;
        req.partnerEmail = decoded.email;
        req.partnerCode = decoded.partnerCode;

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { verifyPartnerToken };
