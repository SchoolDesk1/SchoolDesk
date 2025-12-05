const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// Helper to sign token
const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Super Admin Login
exports.loginSuperAdmin = (req, res) => {
    const { secretKey, email, password } = req.body;

    // Method 1: Secret Key (preferred for super admin)
    if (secretKey) {
        const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || 'SuperSecretAdmin2024!';

        if (secretKey !== SUPER_ADMIN_SECRET) {
            return res.status(401).json({ message: 'Invalid secret key' });
        }

        const token = signToken({ id: 1, role: 'super_admin' });
        return res.status(200).json({
            id: 1,
            email: 'superadmin@schooldesk.com',
            role: 'super_admin',
            user: {
                id: 1,
                role: 'super_admin',
                email: 'superadmin@schooldesk.com'
            },
            accessToken: token
        });
    }

    // Method 2: Email/Password (legacy)
    if (email && password) {
        db.get('SELECT * FROM super_admin WHERE email = ?', [email], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ message: 'Super Admin not found' });

            const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
            if (!passwordIsValid) return res.status(401).json({ token: null, message: 'Invalid Password' });

            const token = signToken({ id: user.id, role: 'super_admin' });
            res.status(200).json({
                id: user.id,
                email: user.email,
                role: 'super_admin',
                user: {
                    id: user.id,
                    role: 'super_admin',
                    email: user.email
                },
                accessToken: token
            });
        });
        return;
    }

    res.status(400).json({ message: 'Please provide either secretKey or email/password' });
};

// School Admin Login
exports.loginSchool = (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email, 'Password:', password);

    db.get('SELECT * FROM schools WHERE email = ?', [email], (err, school) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!school) return res.status(404).json({ message: 'School not found' });

        const passwordIsValid = bcrypt.compareSync(password, school.password_hash);
        if (!passwordIsValid) return res.status(401).json({ token: null, message: 'Invalid Password' });

        const token = signToken({ id: school.id, role: 'school_admin', schoolId: school.id });
        res.status(200).json({
            id: school.id,
            school_name: school.school_name,
            email: school.email,
            plan_type: school.plan_type,
            plan_expiry_date: school.plan_expiry_date,
            max_students: school.max_students,
            max_classes: school.max_classes,
            role: 'school_admin',
            schoolId: school.id,
            accessToken: token
        });
    });
};

// Import partner code validator
const { validatePartnerCode } = require('../utils/partnerCodeGenerator');

// School Self-Registration
exports.registerSchool = async (req, res) => {
    const { school_name, email, password, contact_person, contact_phone, address, partnerCode } = req.body;

    if (!school_name || !email || !password) {
        return res.status(400).json({ message: 'School name, email, and password are required' });
    }

    // Check if school already exists
    db.get('SELECT * FROM schools WHERE email = ?', [email], async (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing) return res.status(409).json({ message: 'School with this email already exists' });

        // Validate Partner Code if provided
        let validPartnerCode = null;
        if (partnerCode) {
            try {
                const partner = await validatePartnerCode(partnerCode);
                if (partner) {
                    validPartnerCode = partnerCode;
                }
            } catch (error) {
                console.error('Error validating partner code:', error);
                // Continue without partner code if validation fails
            }
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Calculate expiry date (14 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);
        const formattedExpiry = expiryDate.toISOString().split('T')[0];

        // Create school with trial plan
        const sql = `INSERT INTO schools 
            (school_name, email, password_hash, contact_person, contact_phone, address, plan_type, plan_expiry_date, max_students, max_classes, status, partner_code) 
            VALUES (?, ?, ?, ?, ?, ?, 'trial', ?, 20, 2, 'active', ?)`;

        db.run(sql, [school_name, email, hashedPassword, contact_person, contact_phone, address, formattedExpiry, validPartnerCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const schoolId = this.lastID;

            // Link to partner if code was valid
            if (validPartnerCode) {
                db.run(
                    `INSERT INTO partner_schools (partner_code, school_id, revenue, commission) VALUES (?, ?, 0, 0)`,
                    [validPartnerCode, schoolId],
                    (err) => {
                        if (err) console.error('Error linking school to partner:', err);
                    }
                );
            }

            res.status(201).json({
                message: 'School registered successfully! Your 14-day free trial has started.',
                school_id: schoolId,
                plan: 'trial',
                expiry_date: formattedExpiry
            });
        });
    });
};

// Teacher/Parent Login
exports.loginUser = (req, res) => {
    const { phone, password, class_password } = req.body;

    // Allow password field to act as class_password for backward compatibility if needed
    const pwd = password || class_password;

    db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Try Individual Password
        if (user.password_hash) {
            const passwordIsValid = bcrypt.compareSync(pwd, user.password_hash);
            if (passwordIsValid) {
                return sendToken(user, res);
            }
        }

        // 2. Fallback to Class Password (if individual password failed or didn't exist)
        // Only if we want to allow class password login. 
        // Given the user request, let's support it if the individual password check failed/didn't exist.

        const classId = user.class_id;
        db.get('SELECT * FROM classes WHERE id = ?', [classId], (err2, classRow) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (!classRow) return res.status(404).json({ message: 'Class not found' });

            if (classRow.class_password === pwd) {
                return sendToken(user, res);
            }

            return res.status(401).json({ message: 'Invalid Password' });
        });
    });
};

const sendToken = (user, res) => {
    const token = signToken({
        id: user.id,
        role: user.role,
        classId: user.class_id,
        schoolId: user.school_id
    });

    res.status(200).json({
        id: user.id,
        phone: user.phone,
        role: user.role,
        class_id: user.class_id,
        accessToken: token
    });
};

// Get Current User Profile
exports.getProfile = (req, res) => {
    const { userId, userRole } = req;

    if (userRole === 'school_admin') {
        db.get('SELECT * FROM schools WHERE id = ?', [userId], (err, school) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!school) return res.status(404).json({ message: 'School not found' });

            res.status(200).json({
                id: school.id,
                school_name: school.school_name,
                email: school.email,
                plan_type: school.plan_type,
                plan_expiry_date: school.plan_expiry_date,
                max_students: school.max_students,
                max_classes: school.max_classes,
                role: 'school_admin',
                schoolId: school.id
            });
        });
    } else if (userRole === 'super_admin') {
        // Return static super admin data (no database needed)
        res.status(200).json({
            id: userId || 1,
            email: 'superadmin@schooldesk.com',
            role: 'super_admin'
        });
    } else {
        // Teacher or Parent
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ message: 'User not found' });

            res.status(200).json({
                id: user.id,
                phone: user.phone,
                role: user.role,
                class_id: user.class_id
            });
        });
    }
};
