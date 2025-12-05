const db = require('../database');
const bcrypt = require('bcryptjs');

// Helper to generate random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
};

// --- Classes ---

exports.createClass = (req, res) => {
    const { class_name } = req.body;
    const schoolId = req.schoolId;

    if (!class_name) {
        return res.status(400).json({ message: 'Class name is required.' });
    }

    // Auto-generate password: C{SchoolID}{Random}
    const class_password = `C${schoolId}${generatePassword()}`;

    db.run('INSERT INTO classes (school_id, class_name, class_password) VALUES (?, ?, ?)',
        [schoolId, class_name, class_password],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Class created successfully',
                id: this.lastID,
                class_password
            });
        }
    );
};

exports.getClasses = (req, res) => {
    const schoolId = req.schoolId;
    db.all('SELECT * FROM classes WHERE school_id = ?', [schoolId], (err, classes) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(classes);
    });
};

// --- Notices ---

// Create Notice
exports.createNotice = (req, res) => {
    const { notice_text, class_id, file_url, duration } = req.body;
    const schoolId = req.schoolId;

    if (!notice_text) {
        return res.status(400).json({ message: 'Notice text is required.' });
    }

    // Calculate expiry date if duration is provided
    let expiryDate = null;
    if (duration) {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(duration));
        expiryDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    db.run('INSERT INTO notices (school_id, class_id, notice_text, file_url, expiry_date) VALUES (?, ?, ?, ?, ?)',
        [schoolId, class_id || null, notice_text, file_url, expiryDate],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Notice created successfully', id: this.lastID });
        }
    );
};

// Get Notices (filter out expired ones)
exports.getNotices = (req, res) => {
    const schoolId = req.schoolId;
    const today = new Date().toISOString().split('T')[0];

    console.log('getNotices called - schoolId:', schoolId, 'today:', today);

    // Only show notices that haven't expired
    db.all('SELECT * FROM notices WHERE school_id = ? AND (expiry_date IS NULL OR expiry_date >= ?) ORDER BY created_at DESC',
        [schoolId, today],
        (err, notices) => {
            if (err) {
                console.error('getNotices error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('getNotices success - found', notices.length, 'notices');
            res.status(200).json(notices);
        }
    );
};

// Delete Notice
exports.deleteNotice = (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    // Ensure notice belongs to this school before deleting
    db.run('DELETE FROM notices WHERE id = ? AND school_id = ?', [id, schoolId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Notice not found or unauthorized' });
        res.status(200).json({ message: 'Notice deleted successfully' });
    });
};

// --- Fees ---

// Add fee record for a parent (User)
exports.addFee = (req, res) => {
    const { parent_id, month, amount } = req.body;

    if (!parent_id || !month) {
        return res.status(400).json({ message: 'Parent ID and Month are required.' });
    }

    db.run('INSERT INTO fees (parent_id, month, amount, status) VALUES (?, ?, ?, ?)',
        [parent_id, month, amount || 0, 'UNPAID'],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Fee record added', id: this.lastID });
        }
    );
};

exports.updateFeeStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'PAID' or 'UNPAID'

    db.run('UPDATE fees SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Fee record not found' });
        res.status(200).json({ message: 'Fee status updated' });
    });
};

// Toggle fee status for a student-month-year combination
exports.toggleFeeStatus = (req, res) => {
    const { student_id, month, year } = req.body;

    if (!student_id || !month) {
        return res.status(400).json({ message: 'Student ID and month are required' });
    }

    const feeYear = year || new Date().getFullYear();

    // First check if a fee record exists
    db.get('SELECT * FROM fees WHERE parent_id = ? AND month = ? AND year = ?', [student_id, month, feeYear], (err, fee) => {
        if (err) return res.status(500).json({ error: err.message });

        if (fee) {
            // Toggle existing record
            const newStatus = fee.status === 'PAID' ? 'UNPAID' : 'PAID';
            db.run('UPDATE fees SET status = ? WHERE id = ?', [newStatus, fee.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Fee status updated', status: newStatus });
            });
        } else {
            // Create new record as PAID
            db.run('INSERT INTO fees (parent_id, month, year, amount, status) VALUES (?, ?, ?, ?, ?)',
                [student_id, month, feeYear, 0, 'PAID'],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: 'Fee record created', status: 'PAID', id: this.lastID });
                }
            );
        }
    });
};

exports.getFees = (req, res) => {
    // Get all fees for students in this school
    // Complex query joining users and classes
    const schoolId = req.schoolId;
    const sql = `
    SELECT f.*, u.phone, c.class_name 
    FROM fees f
    JOIN users u ON f.parent_id = u.id
    JOIN classes c ON u.class_id = c.id
    WHERE c.school_id = ?
    ORDER BY f.created_at DESC
  `;

    db.all(sql, [schoolId], (err, fees) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(fees);
    });
};

// --- Homework (View Only) ---
exports.getAllHomework = (req, res) => {
    const schoolId = req.schoolId;
    const sql = `
    SELECT h.*, c.class_name 
    FROM homework h
    JOIN classes c ON h.class_id = c.id
    WHERE c.school_id = ?
    ORDER BY h.created_at DESC
  `;
    db.all(sql, [schoolId], (err, homework) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(homework);
    });
};

// --- Users (Teachers/Parents) ---

// Create User (Parent/Teacher)
exports.createUser = (req, res) => {
    const { name, phone, contact_phone, address, role, class_id, feeAmount, father_name, password } = req.body;
    const schoolId = req.schoolId;

    if (!phone || !role) {
        return res.status(400).json({ message: 'Phone and role are required' });
    }

    // Generate password if not provided
    const userPassword = password || Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = bcrypt.hashSync(userPassword, 8);

    const sql = `INSERT INTO users (name, phone, contact_phone, address, role, class_id, school_id, father_name, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name || null, phone, contact_phone || null, address || null, role, class_id || null, schoolId, father_name || null, hashedPassword], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const userId = this.lastID;

        // If feeAmount is provided, create a PAID fee record for the current month
        if (feeAmount && role === 'parent') {
            const currentMonth = new Date().toLocaleString('default', { month: 'short' });
            const currentYear = new Date().getFullYear();
            db.run('INSERT INTO fees (parent_id, month, year, amount, status, dismissed) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, currentMonth, currentYear, feeAmount, 'PAID', 1],
                (feeErr) => {
                    if (feeErr) console.error('Error creating initial fee:', feeErr);
                }
            );
        }

        res.status(201).json({
            message: 'User created successfully',
            id: userId,
            password: userPassword // Return password so admin can share it
        });
    });
};

// Get Users with optional filters
exports.getUsers = (req, res) => {
    const schoolId = req.schoolId;
    const { class_id, role } = req.query; // Optional class and role filters

    let sql = `
    SELECT u.*, c.class_name 
    FROM users u
    JOIN classes c ON u.class_id = c.id
    WHERE c.school_id = ?`;

    const params = [schoolId];

    // Add class filter if provided
    if (class_id) {
        sql += ` AND u.class_id = ?`;
        params.push(class_id);
    }

    // Add role filter if provided
    if (role) {
        sql += ` AND u.role = ?`;
        params.push(role);
    }

    sql += ` ORDER BY u.created_at DESC`;

    db.all(sql, params, (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(users);
    });
};

// Update user/student
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, phone, contact_phone, address, class_id, father_name } = req.body;

    db.run('UPDATE users SET name = ?, phone = ?, contact_phone = ?, address = ?, class_id = ?, father_name = ? WHERE id = ?',
        [name, phone, contact_phone, address, class_id, father_name, id],
        function (err) {
            if (err) {
                console.error('Update user error:', err);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Phone number already exists.' });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'User updated successfully' });
        }
    );
};

// Delete user/student
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    // First delete associated fees
    db.run('DELETE FROM fees WHERE parent_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Then delete the user
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'User deleted successfully' });
        });
    });
};
