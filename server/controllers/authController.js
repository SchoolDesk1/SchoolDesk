const supabase = require('../supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const PLAN_LIMITS = require('../config/plans');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// Helper to sign token
const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Super Admin Login
exports.loginSuperAdmin = async (req, res) => {
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
        try {
            const { data: user, error } = await supabase
                .from('super_admin')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(404).json({ message: 'Super Admin not found' });
            }

            const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
            if (!passwordIsValid) {
                return res.status(401).json({ token: null, message: 'Invalid Password' });
            }

            const token = signToken({ id: user.id, role: 'super_admin' });
            return res.status(200).json({
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
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(400).json({ message: 'Please provide either secretKey or email/password' });
};

// School Admin Login
exports.loginSchool = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    try {
        const { data: school, error } = await supabase
            .from('schools')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const passwordIsValid = bcrypt.compareSync(password, school.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ token: null, message: 'Invalid Password' });
        }

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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Import partner code validator
const { validatePartnerCode } = require('../utils/partnerCodeGenerator');

// School Self-Registration
exports.registerSchool = async (req, res) => {
    const { school_name, email, password, contact_person, contact_phone, address, partnerCode } = req.body;

    if (!school_name || !email || !password) {
        return res.status(400).json({ message: 'School name, email, and password are required' });
    }

    try {
        // Check if school already exists
        const { data: existing } = await supabase
            .from('schools')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(409).json({ message: 'School with this email already exists' });
        }

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
            }
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Calculate expiry date (14 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);
        const formattedExpiry = expiryDate.toISOString().split('T')[0];

        // Create school with trial plan
        const { data: newSchool, error: insertError } = await supabase
            .from('schools')
            .insert({
                school_name,
                email,
                password_hash: hashedPassword,
                contact_person,
                contact_phone,
                address,
                plan_type: 'trial',
                plan_expiry_date: formattedExpiry,
                max_students: PLAN_LIMITS.trial.max_students,
                max_classes: PLAN_LIMITS.trial.max_classes,
                status: 'active',
                partner_code: validPartnerCode
            })
            .select()
            .single();

        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

        const schoolId = newSchool.id;

        // Link to partner if code was valid
        if (validPartnerCode) {
            await supabase
                .from('partner_schools')
                .insert({
                    partner_code: validPartnerCode,
                    school_id: schoolId,
                    revenue: 0,
                    commission: 0
                });
        }

        res.status(201).json({
            message: 'School registered successfully! Your 14-day free trial has started.',
            school_id: schoolId,
            plan: 'trial',
            expiry_date: formattedExpiry
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Teacher/Parent Login
exports.loginUser = async (req, res) => {
    const { phone, password, class_password } = req.body;
    const pwd = password || class_password;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Try Individual Password
        if (user.password_hash) {
            const passwordIsValid = bcrypt.compareSync(pwd, user.password_hash);
            if (passwordIsValid) {
                return sendToken(user, res);
            }
        }

        // 2. Fallback to Class Password
        const classId = user.class_id;
        const { data: classRow, error: classError } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (classError || !classRow) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (classRow.class_password === pwd) {
            return sendToken(user, res);
        }

        return res.status(401).json({ message: 'Invalid Password' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
exports.getProfile = async (req, res) => {
    const { userId, userRole } = req;

    try {
        if (userRole === 'school_admin') {
            const { data: school, error } = await supabase
                .from('schools')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !school) {
                return res.status(404).json({ message: 'School not found' });
            }

            return res.status(200).json({
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
        } else if (userRole === 'super_admin') {
            return res.status(200).json({
                id: userId || 1,
                email: 'superadmin@schooldesk.com',
                role: 'super_admin'
            });
        } else {
            // Teacher or Parent
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                id: user.id,
                phone: user.phone,
                role: user.role,
                class_id: user.class_id
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
