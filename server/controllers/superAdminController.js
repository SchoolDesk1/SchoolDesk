const db = require('../database');
const bcrypt = require('bcryptjs');

// Get All Schools (with basic info)
exports.getAllSchools = (req, res) => {
    db.all('SELECT id, school_name, email, address, contact_person, contact_phone, plan_type, status, plan_expiry_date, created_at FROM schools', [], (err, schools) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(schools);
    });
};

// Create a new school (Demo or Manual)
exports.createSchool = (req, res) => {
    const { school_name, email, password, address, contact_person, contact_phone, plan_type } = req.body;

    if (!school_name || !email || !password) {
        return res.status(400).json({ message: 'School name, email, and password are required.' });
    }

    const passwordHash = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO schools (school_name, email, password_hash, address, contact_person, contact_phone, plan_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [school_name, email, passwordHash, address, contact_person, contact_phone, plan_type || 'basic'];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Email already exists.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'School created successfully', id: this.lastID });
    });
};

// Update School Status (Approve/Suspend)
exports.updateSchoolStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'suspended', 'trial', 'expired'

    if (!['active', 'suspended', 'trial', 'expired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    db.run('UPDATE schools SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'School not found.' });
        res.status(200).json({ message: 'School status updated successfully.' });
    });
};

// Delete School
exports.deleteSchool = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM schools WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'School not found.' });
        res.status(200).json({ message: 'School deleted successfully.' });
    });
};

// ===== ANALYTICS ENDPOINTS =====

// Get Platform-Wide Analytics
exports.getPlatformAnalytics = (req, res) => {
    const queries = {
        totalSchools: 'SELECT COUNT(*) as count FROM schools',
        activeSchools: 'SELECT COUNT(*) as count FROM schools WHERE status = "active"',
        totalStudents: 'SELECT COUNT(*) as count FROM users WHERE role = "parent"',
        totalTeachers: 'SELECT COUNT(*) as count FROM users WHERE role = "teacher"',
        totalClasses: 'SELECT COUNT(*) as count FROM classes',
        totalHomework: 'SELECT COUNT(*) as count FROM homework',
        totalNotices: 'SELECT COUNT(*) as count FROM notices',
        totalFees: 'SELECT SUM(amount) as total FROM fees WHERE status = "PAID"'
    };

    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.get(query, [], (err, row) => {
            if (!err) {
                results[key] = row?.count || row?.total || 0;
            }
            completed++;
            if (completed === total) {
                res.status(200).json(results);
            }
        });
    });
};

// Get Detailed School Stats
exports.getSchoolDetails = (req, res) => {
    const { id } = req.params;

    const stats = {};

    // Get school info
    db.get('SELECT * FROM schools WHERE id = ?', [id], (err, school) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!school) return res.status(404).json({ message: 'School not found' });

        stats.school = school;

        // Get student count
        db.get('SELECT COUNT(*) as count FROM users u JOIN classes c ON u.class_id = c.id WHERE c.school_id = ? AND u.role = "parent"', [id], (err, result) => {
            stats.studentCount = result?.count || 0;

            // Get teacher count
            db.get('SELECT COUNT(*) as count FROM users u JOIN classes c ON u.class_id = c.id WHERE c.school_id = ? AND u.role = "teacher"', [id], (err, result) => {
                stats.teacherCount = result?.count || 0;

                // Get class count
                db.get('SELECT COUNT(*) as count FROM classes WHERE school_id = ?', [id], (err, result) => {
                    stats.classCount = result?.count || 0;

                    // Get homework count
                    db.get('SELECT COUNT(*) as count FROM homework h JOIN classes c ON h.class_id = c.id WHERE c.school_id = ?', [id], (err, result) => {
                        stats.homeworkCount = result?.count || 0;

                        // Get notice count
                        db.get('SELECT COUNT(*) as count FROM notices WHERE school_id = ?', [id], (err, result) => {
                            stats.noticeCount = result?.count || 0;

                            // Get fee stats
                            db.get('SELECT SUM(amount) as total, COUNT(*) as count FROM fees f JOIN users u ON f.parent_id = u.id JOIN classes c ON u.class_id = c.id WHERE c.school_id = ? AND f.status = "PAID"', [id], (err, result) => {
                                stats.feesCollected = result?.total || 0;
                                stats.feeCount = result?.count || 0;

                                res.status(200).json(stats);
                            });
                        });
                    });
                });
            });
        });
    });
};

// Get All Users Overview
exports.getAllUsers = (req, res) => {
    const sql = `
        SELECT u.*, c.class_name, s.school_name 
        FROM users u
        JOIN classes c ON u.class_id = c.id
        JOIN schools s ON c.school_id = s.id
        ORDER BY u.created_at DESC
    `;

    db.all(sql, [], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });

        const teachers = users.filter(u => u.role === 'teacher');
        const parents = users.filter(u => u.role === 'parent');

        res.status(200).json({
            totalUsers: users.length,
            totalTeachers: teachers.length,
            totalParents: parents.length,
            teachers: teachers.slice(0, 50), // First 50
            parents: parents.slice(0, 50),    // First 50
            allUsers: users.slice(0, 100)     // First 100
        });
    });
};

// Get All Homework (Platform-Wide)
exports.getAllHomework = (req, res) => {
    const sql = `
        SELECT h.*, c.class_name, s.school_name 
        FROM homework h
        JOIN classes c ON h.class_id = c.id
        JOIN schools s ON c.school_id = s.id
        ORDER BY h.created_at DESC
        LIMIT 100
    `;

    db.all(sql, [], (err, homework) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(homework);
    });
};

// Get All Notices (Platform-Wide)
exports.getAllNotices = (req, res) => {
    const sql = `
        SELECT n.*, s.school_name, c.class_name 
        FROM notices n
        JOIN schools s ON n.school_id = s.id
        LEFT JOIN classes c ON n.class_id = c.id
        ORDER BY n.created_at DESC
        LIMIT 100
    `;

    db.all(sql, [], (err, notices) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(notices);
    });
};

// Delete Homework (Content Moderation)
exports.deleteHomework = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM homework WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Homework not found' });
        res.status(200).json({ message: 'Homework deleted successfully' });
    });
};

// Delete Notice (Content Moderation)
exports.deleteNoticeAdmin = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM notices WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Notice not found' });
        res.status(200).json({ message: 'Notice deleted successfully' });
    });
};

// ===== SUPER ADMIN CONTROL FEATURES =====

// Reset School Password
exports.resetSchoolPassword = (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 8);

    db.run('UPDATE schools SET password_hash = ? WHERE id = ?', [passwordHash, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'School not found' });
        res.status(200).json({ message: 'Password reset successfully' });
    });
};

// Block/Unblock School
exports.toggleSchoolBlock = (req, res) => {
    const { id } = req.params;
    const { blocked } = req.body; // true or false

    const newStatus = blocked ? 'suspended' : 'active';

    db.run('UPDATE schools SET status = ? WHERE id = ?', [newStatus, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'School not found' });
        res.status(200).json({
            message: blocked ? 'School blocked successfully' : 'School unblocked successfully',
            newStatus
        });
    });
};

// Update School Plan
exports.updateSchoolPlan = (req, res) => {
    const { id } = req.params;
    const { plan_type, plan_expiry_date, max_students, recordSale, saleAmount } = req.body;

    const updates = [];
    const params = [];

    if (plan_type) {
        updates.push('plan_type = ?');
        params.push(plan_type);
    }
    if (plan_expiry_date) {
        updates.push('plan_expiry_date = ?');
        params.push(plan_expiry_date);
    }
    if (max_students) {
        updates.push('max_students = ?');
        params.push(max_students);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    params.push(id);
    const sql = `UPDATE schools SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'School not found' });

        // If recordSale is true, create a verified payment record
        if (recordSale && plan_type) {
            const amount = saleAmount || (plan_type === 'basic' ? 299 : plan_type === 'standard' ? 499 : plan_type === 'premium' ? 799 : 0);

            if (amount > 0) {
                const paymentCode = `MANUAL-${id}-${Date.now()}`;
                db.run(
                    `INSERT INTO payments (school_id, plan_id, amount, payment_code, transaction_id, status, verified_at) 
                     VALUES (?, ?, ?, ?, 'MANUAL_ENTRY', 'verified', CURRENT_TIMESTAMP)`,
                    [id, plan_type, amount, paymentCode],
                    (err) => {
                        if (err) console.error('Error recording manual sale:', err);
                    }
                );
            }
        }

        res.status(200).json({ message: 'School plan updated successfully' });
    });
};

// Get School Full Details (including password info)
// Get School Full Details (including password info)
exports.getSchoolFullDetails = async (req, res) => {
    const { id } = req.params;

    // Helper for promise-based query
    const query = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const getOne = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    try {
        const school = await getOne('SELECT * FROM schools WHERE id = ?', [id]);
        if (!school) return res.status(404).json({ message: 'School not found' });

        const { password_hash, ...schoolData } = school;

        const [classes, users, homework, notices, payments] = await Promise.all([
            query('SELECT * FROM classes WHERE school_id = ?', [id]),
            query('SELECT u.*, c.class_name FROM users u JOIN classes c ON u.class_id = c.id WHERE c.school_id = ?', [id]),
            query('SELECT h.*, c.class_name FROM homework h JOIN classes c ON h.class_id = c.id WHERE c.school_id = ?', [id]),
            query('SELECT * FROM notices WHERE school_id = ?', [id]),
            query('SELECT * FROM payments WHERE school_id = ?', [id])
        ]);

        res.status(200).json({
            ...schoolData,
            classes,
            teachers: users.filter(u => u.role === 'teacher'),
            students: users.filter(u => u.role === 'parent'),
            homework,
            notices,
            payments
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Users with Detailed Info (Paginated)
exports.getAllUsersDetailed = (req, res) => {
    const { page = 1, limit = 50, role, school_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    if (role) {
        whereClauses.push('u.role = ?');
        params.push(role);
    }
    if (school_id) {
        whereClauses.push('c.school_id = ?');
        params.push(school_id);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const sql = `
        SELECT 
            u.id,
            u.name,
            u.phone,
            u.role,
            u.address,
            u.contact_phone,
            u.created_at,
            c.class_name,
            c.school_id,
            s.school_name,
            s.email as school_email,
            s.status as school_status
        FROM users u
        JOIN classes c ON u.class_id = c.id
        JOIN schools s ON c.school_id = s.id
        ${whereSQL}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.all(sql, [...params, limit, offset], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get total count
        const countSQL = `
            SELECT COUNT(*) as total
            FROM users u
            JOIN classes c ON u.class_id = c.id
            ${whereSQL}
        `;

        db.get(countSQL, params, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({
                users,
                total: result.total,
                page: parseInt(page),
                totalPages: Math.ceil(result.total / limit)
            });
        });
    });
};

// Delete User (with cascade options)
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    });
};

// Reset User Password
exports.resetUserPassword = (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 8);

    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User password reset successfully' });
    });
};

// ===== NEW FEATURES =====

// Global Search
exports.getGlobalSearch = (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) return res.status(200).json({ schools: [], users: [], payments: [] });

    const search = `%${query}%`;
    const results = { schools: [], users: [], payments: [] };

    // Search Schools
    db.all('SELECT id, school_name, email, status FROM schools WHERE school_name LIKE ? OR email LIKE ?', [search, search], (err, schools) => {
        if (!err) results.schools = schools;

        // Search Users
        db.all(`
            SELECT u.id, u.name, u.phone, u.role, s.school_name 
            FROM users u 
            JOIN classes c ON u.class_id = c.id 
            JOIN schools s ON c.school_id = s.id 
            WHERE u.name LIKE ? OR u.phone LIKE ?`, [search, search], (err, users) => {
            if (!err) results.users = users;

            // Search Payments
            db.all(`
                SELECT p.*, s.school_name 
                FROM payments p 
                JOIN schools s ON p.school_id = s.id 
                WHERE p.transaction_id LIKE ? OR p.payment_code LIKE ?`, [search, search], (err, payments) => {
                if (!err) results.payments = payments;

                res.status(200).json(results);
            });
        });
    });
};

// Get Activity Logs
exports.getActivityLogs = (req, res) => {
    db.all('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100', [], (err, logs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(logs);
    });
};

// Get Support Tickets
exports.getSupportTickets = (req, res) => {
    db.all(`
        SELECT t.*, s.school_name, s.email 
        FROM support_tickets t 
        JOIN schools s ON t.school_id = s.id 
        ORDER BY t.created_at DESC`, [], (err, tickets) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(tickets);
    });
};

// Reply to Support Ticket
exports.replySupportTicket = (req, res) => {
    const { id } = req.params;
    const { response } = req.body;

    db.run('UPDATE support_tickets SET admin_response = ?, status = "closed", resolved_at = CURRENT_TIMESTAMP WHERE id = ?', [response, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Reply sent successfully' });
    });
};

// Comprehensive Dashboard Overview
// Comprehensive Dashboard Overview
exports.getComprehensiveOverview = async (req, res) => {
    const getOne = (sql) => new Promise((resolve) => {
        db.get(sql, [], (err, row) => resolve(row?.count || row?.total || 0));
    });

    const getGraph = (sql) => new Promise((resolve) => {
        db.all(sql, [], (err, rows) => resolve(rows || []));
    });

    try {
        const [
            totalSchools, activeSchools, suspendedSchools,
            totalStudents, totalTeachers, totalParents,
            totalRevenue, todaySignups, todayPayments, monthlyRevenue,
            totalHomework, totalNotices, activeSubscriptions,
            revenueGraph, schoolGrowthGraph, userGrowthGraph, planSalesGraph
        ] = await Promise.all([
            getOne('SELECT COUNT(*) as count FROM schools'),
            getOne('SELECT COUNT(*) as count FROM schools WHERE status = "active"'),
            getOne('SELECT COUNT(*) as count FROM schools WHERE status = "suspended"'),
            getOne('SELECT COUNT(*) as count FROM users WHERE role = "parent"'),
            getOne('SELECT COUNT(*) as count FROM users WHERE role = "teacher"'),
            getOne('SELECT COUNT(*) as count FROM users WHERE role = "parent"'),
            getOne('SELECT SUM(amount) as total FROM payments WHERE status = "verified"'),
            getOne('SELECT COUNT(*) as count FROM schools WHERE date(created_at) = date("now")'),
            getOne('SELECT SUM(amount) as total FROM payments WHERE status = "verified" AND date(verified_at) = date("now")'),
            getOne('SELECT SUM(amount) as total FROM payments WHERE status = "verified" AND strftime("%Y-%m", verified_at) = strftime("%Y-%m", "now")'),
            getOne('SELECT COUNT(*) as count FROM homework'),
            getOne('SELECT COUNT(*) as count FROM notices'),
            getOne('SELECT COUNT(*) as count FROM schools WHERE plan_expiry_date > date("now")'),
            // Graphs
            getGraph(`SELECT strftime('%Y-%m', verified_at) as name, SUM(amount) as value FROM payments WHERE status = 'verified' AND verified_at >= date('now', '-6 months') GROUP BY name ORDER BY name`),
            getGraph(`SELECT strftime('%Y-%m', created_at) as name, COUNT(*) as value FROM schools WHERE created_at >= date('now', '-6 months') GROUP BY name ORDER BY name`),
            getGraph(`SELECT strftime('%Y-%m', created_at) as name, COUNT(*) as value FROM users WHERE created_at >= date('now', '-6 months') GROUP BY name ORDER BY name`),
            getGraph(`SELECT plan_type as name, COUNT(*) as value FROM schools GROUP BY plan_type`)
        ]);

        res.status(200).json({
            totalSchools, activeSchools, suspendedSchools,
            totalStudents, totalTeachers, totalParents,
            totalRevenue, todaySignups, todayPayments, monthlyRevenue,
            totalHomework, totalNotices, activeSubscriptions,
            graphs: {
                revenue: revenueGraph,
                newSchools: schoolGrowthGraph,
                activeUsers: userGrowthGraph,
                planSales: planSalesGraph
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download System Backup
exports.downloadSystemBackup = (req, res) => {
    const path = require('path');
    const dbPath = path.resolve(__dirname, '../school.db');
    res.download(dbPath, `school_desk_system_backup_${Date.now()}.db`, (err) => {
        if (err) {
            console.error('Backup download error:', err);
            res.status(500).json({ error: 'Could not download backup' });
        }
    });
};

// ===== PARTNER MANAGEMENT =====

const { generatePartnerCode } = require('../utils/partnerCodeGenerator');

// Get All Partners
exports.getAllPartners = (req, res) => {
    db.all(`
        SELECT 
            p.*,
            COUNT(DISTINCT ps.school_id) as total_schools,
            SUM(ps.revenue) as total_revenue
        FROM partners p
        LEFT JOIN partner_schools ps ON p.unique_code = ps.partner_code
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `, [], (err, partners) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ partners: partners || [] });
    });
};

// Add New Partner
exports.addPartner = async (req, res) => {
    const { name, email, phone, country, password } = req.body;

    if (!name || !email || !phone || !password || !country) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Generate unique partner code
        const uniqueCode = await generatePartnerCode();

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        db.run(
            `INSERT INTO partners (name, email, phone, country, unique_code, password_hash) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, phone, country, uniqueCode, passwordHash],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                    message: 'Partner created successfully',
                    partner: {
                        id: this.lastID,
                        name,
                        email,
                        phone,
                        country,
                        uniqueCode,
                        status: 'active'
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Partner Details
exports.getPartnerDetails = (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM partners WHERE id = ?', [id], (err, partner) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        // Get partner's schools
        db.all(`
            SELECT 
                s.id,
                s.school_name,
                s.email,
                s.plan_type,
                s.status,
                s.created_at,
                ps.revenue,
                ps.commission
            FROM partner_schools ps
            JOIN schools s ON ps.school_id = s.id
            WHERE ps.partner_code = ?
            ORDER BY ps.created_at DESC
        `, [partner.unique_code], (err, schools) => {
            if (err) return res.status(500).json({ error: err.message });

            const { password_hash, ...partnerData } = partner;

            res.status(200).json({
                ...partnerData,
                schools: schools || []
            });
        });
    });
};

// Update Partner
exports.updatePartner = (req, res) => {
    const { id } = req.params;
    const { name, phone, country, status } = req.body;

    const updates = [];
    const params = [];

    if (name) {
        updates.push('name = ?');
        params.push(name);
    }
    if (phone) {
        updates.push('phone = ?');
        params.push(phone);
    }
    if (country) {
        updates.push('country = ?');
        params.push(country);
    }
    if (status) {
        updates.push('status = ?');
        params.push(status);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    params.push(id);

    db.run(
        `UPDATE partners SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Partner not found' });
            res.status(200).json({ message: 'Partner updated successfully' });
        }
    );
};

// Delete Partner
exports.deletePartner = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM partners WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Partner not found' });
        res.status(200).json({ message: 'Partner deleted successfully' });
    });
};

// Get Partner Analytics
exports.getPartnerAnalytics = (req, res) => {
    const { id } = req.params;

    db.get('SELECT unique_code FROM partners WHERE id = ?', [id], (err, partner) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        // Get comprehensive analytics
        db.all(`
            SELECT 
                COUNT(*) as total_schools,
                SUM(revenue) as totalRevenue,
                SUM(commission) as totalCommission,
                AVG(revenue) as avgRevenue
            FROM partner_schools
            WHERE partner_code = ?
        `, [partner.unique_code], (err, stats) => {
            if (err) return res.status(500).json({ error: err.message });

            // Get monthly breakdown
            db.all(`
                SELECT 
                    strftime('%Y-%m', ps.created_at) as month,
                    COUNT(*) as schools,
                    SUM(ps.revenue) as revenue
                FROM partner_schools ps
                WHERE ps.partner_code = ?
                GROUP BY month
                ORDER BY month DESC
                LIMIT 12
            `, [partner.unique_code], (err, monthlyData) => {
                if (err) return res.status(500).json({ error: err.message });

                res.status(200).json({
                    ...stats[0],
                    monthlyBreakdown: monthlyData || []
                });
            });
        });
    });
};

// ===== PROMO CODE MANAGEMENT =====

// Get All Promo Codes
exports.getAllPromoCodes = (req, res) => {
    db.all(`
        SELECT * FROM promo_codes 
        ORDER BY created_at DESC
    `, [], (err, codes) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ promoCodes: codes || [] });
    });
};

// Create Promo Code
exports.createPromoCode = (req, res) => {
    const { code, type, value, applicablePlans, validFrom, validTo, usageLimit } = req.body;

    if (!code || !type || !value || !applicablePlans || !validFrom || !validTo) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!['flat', 'percentage'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "flat" or "percentage"' });
    }

    db.run(
        `INSERT INTO promo_codes (code, type, value, applicable_plans, valid_from, valid_to, usage_limit) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [code, type, value, JSON.stringify(applicablePlans), validFrom, validTo, usageLimit],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Promo code already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Promo code created successfully', id: this.lastID });
        }
    );
};

// Delete Promo Code
exports.deletePromoCode = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM promo_codes WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Promo code not found' });
        res.status(200).json({ message: 'Promo code deleted successfully' });
    });
};

// ===== PAYOUT MANAGEMENT =====

// Get All Payout Requests
exports.getPayoutRequests = (req, res) => {
    db.all(`
        SELECT 
            pr.*,
            p.name as partner_name,
            p.email as partner_email,
            p.unique_code as partner_code
        FROM payout_requests pr
        JOIN partners p ON pr.partner_id = p.id
        ORDER BY pr.created_at DESC
    `, [], (err, requests) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ payouts: requests || [] });
    });
};

// Update Payout Status
exports.updatePayoutStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'completed' or 'rejected'

    if (!['completed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.run(
        'UPDATE payout_requests SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Payout request not found' });

            // If rejected, we might want to notify the partner (optional enhancement)

            res.status(200).json({ message: `Payout marked as ${status}` });
        }
    );
};

module.exports = exports;


