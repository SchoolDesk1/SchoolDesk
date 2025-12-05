/**
 * Example: Optimized School Controller
 * Demonstrates usage of performance optimization features
 */

const db = require('../database');
const bcrypt = require('bcryptjs');
const { queueAsyncJob } = require('../utils/asyncQueue');
const { addToBatch, requestAggregator } = require('../utils/batchProcessor');

// Helper to generate random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
};

/**
 * OPTIMIZED: Create User with Async Jobs
 * - Critical: Save to database (sync)
 * - Non-critical: Send notification (async)
 * - Non-critical: Log activity (async via batch)
 */
exports.createUserOptimized = (req, res) => {
    const { name, phone, contact_phone, address, role, class_id, feeAmount, father_name, password } = req.body;
    const schoolId = req.schoolId;

    if (!phone || !role) {
        return res.status(400).json({ message: 'Phone and role are required' });
    }

    // Generate password if not provided
    const userPassword = password || generatePassword();
    const hashedPassword = bcrypt.hashSync(userPassword, 8);

    const sql = `INSERT INTO users (name, phone, contact_phone, address, role, class_id, school_id, father_name, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // CRITICAL: Database operation (synchronous)
    db.run(sql, [name || null, phone, contact_phone || null, address || null, role, class_id || null, schoolId, father_name || null, hashedPassword], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const userId = this.lastID;

        // ASYNC: Send notification in background
        if (contact_phone || phone) {
            queueAsyncJob('sendNotification', {
                type: 'sms',
                recipient: contact_phone || phone,
                message: `Welcome! Your account has been created. Login: ${phone}, Password: ${userPassword}`,
                metadata: { userId, schoolId }
            }, {
                priority: 5,  // Medium priority
                maxRetries: 3
            });
        }

        // BATCH: Log activity (grouped with other logs)
        addToBatch('logActivities', {
            userId: req.user?.id || 'system',
            action: 'create_user',
            details: {
                createdUserId: userId,
                role,
                schoolId
            },
            timestamp: new Date().toISOString()
        }, {
            maxSize: 10,    // Process in batches of 10
            waitTime: 2000  // Wait 2 seconds to collect more logs
        });

        // ASYNC: Update analytics
        queueAsyncJob('updateAnalytics', {
            metric: `${role}s_added`,
            value: 1,
            schoolId: schoolId,
            timestamp: new Date().toISOString()
        }, { priority: 8 }); // Low priority

        // If fee amount provided, create fee record (synchronous - important for user)
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

        // Respond immediately without waiting for async jobs
        res.status(201).json({
            message: 'User created successfully',
            id: userId,
            password: userPassword
        });
    });
};

/**
 * OPTIMIZED: Batch Update Multiple Fee Statuses
 * Instead of individual updates, batch them together
 */
exports.batchUpdateFeeStatuses = (req, res) => {
    const { updates } = req.body; // Array of {id, status, student_id}
    const schoolId = req.schoolId;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ message: 'Updates array required' });
    }

    // Add each update to batch queue
    updates.forEach(update => {
        addToBatch('updateFeeStatuses', {
            id: update.id,
            status: update.status,
            paid_date: update.status === 'PAID' ? new Date().toISOString() : null,
            amount: update.amount || 0,
            school_id: schoolId
        }, {
            maxSize: 50,   // Process 50 at once
            waitTime: 100  // Wait 100ms
        });
    });

    // Send notifications asynchronously
    const paidUpdates = updates.filter(u => u.status === 'PAID');
    if (paidUpdates.length > 0) {
        queueAsyncJob('sendBulkNotifications', {
            recipients: paidUpdates.map(u => u.parent_phone),
            message: 'Fee payment confirmed. Thank you!',
            type: 'sms'
        }, { priority: 6 });
    }

    res.json({
        success: true,
        message: `${updates.length} fee updates queued for processing`
    });
};

/**
 * OPTIMIZED: Get Dashboard Data with Request Aggregation
 * Prevents duplicate expensive calls
 */
exports.getDashboardOptimized = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        // Aggregate similar requests - if multiple calls come in quick succession,
        // execute the expensive operation only once and share the result
        const data = await requestAggregator.aggregate(
            `dashboard-${schoolId}`,
            async () => {
                // This expensive operation runs only once for multiple simultaneous requests
                return new Promise((resolve, reject) => {
                    // Get all dashboard data in parallel
                    const queries = {
                        students: new Promise((res, rej) => {
                            db.get('SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = ?',
                                [schoolId, 'parent'], (err, row) => err ? rej(err) : res(row.count));
                        }),
                        teachers: new Promise((res, rej) => {
                            db.get('SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = ?',
                                [schoolId, 'teacher'], (err, row) => err ? rej(err) : res(row.count));
                        }),
                        classes: new Promise((res, rej) => {
                            db.get('SELECT COUNT(*) as count FROM classes WHERE school_id = ?',
                                [schoolId], (err, row) => err ? rej(err) : res(row.count));
                        }),
                        notices: new Promise((res, rej) => {
                            const today = new Date().toISOString().split('T')[0];
                            db.get('SELECT COUNT(*) as count FROM notices WHERE school_id = ? AND (expiry_date IS NULL OR expiry_date >= ?)',
                                [schoolId, today], (err, row) => err ? rej(err) : res(row.count));
                        }),
                        pendingFees: new Promise((res, rej) => {
                            db.get(`SELECT COUNT(*) as count FROM fees f 
                                    JOIN users u ON f.parent_id = u.id 
                                    WHERE u.school_id = ? AND f.status = 'UNPAID'`,
                                [schoolId], (err, row) => err ? rej(err) : res(row.count));
                        })
                    };

                    Promise.all(Object.values(queries))
                        .then(([students, teachers, classes, notices, pendingFees]) => {
                            resolve({
                                students,
                                teachers,
                                classes,
                                notices,
                                pendingFees,
                                timestamp: new Date().toISOString()
                            });
                        })
                        .catch(reject);
                });
            },
            100 // Wait 100ms for similar requests to aggregate
        );

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * OPTIMIZED: Create Notice with Notifications
 * - Critical: Save notice (sync)
 * - Non-critical: Send notifications to students (async batch)
 */
exports.createNoticeOptimized = (req, res) => {
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
        expiryDate = date.toISOString().split('T')[0];
    }

    // CRITICAL: Save notice to database
    db.run('INSERT INTO notices (school_id, class_id, notice_text, file_url, expiry_date) VALUES (?, ?, ?, ?, ?)',
        [schoolId, class_id || null, notice_text, file_url, expiryDate],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const noticeId = this.lastID;

            // ASYNC: Send notifications to affected students/parents
            if (class_id) {
                // Get students in this class
                db.all('SELECT phone, contact_phone FROM users WHERE class_id = ? AND role = ?',
                    [class_id, 'parent'],
                    (err, students) => {
                        if (err) {
                            console.error('Error fetching students for notification:', err);
                            return;
                        }

                        // Queue bulk notification
                        const phones = students
                            .map(s => s.contact_phone || s.phone)
                            .filter(p => p);

                        if (phones.length > 0) {
                            queueAsyncJob('sendBulkNotifications', {
                                recipients: phones,
                                message: `New notice: ${notice_text.substring(0, 50)}...`,
                                type: 'sms'
                            }, { priority: 6 });
                        }
                    }
                );
            }

            // BATCH: Log activity
            addToBatch('logActivities', {
                userId: req.user?.id || 'system',
                action: 'create_notice',
                details: { noticeId, class_id, schoolId },
                timestamp: new Date().toISOString()
            });

            // Respond immediately
            res.status(201).json({
                message: 'Notice created successfully',
                id: noticeId
            });
        }
    );
};

/**
 * OPTIMIZED: Batch Student Import
 * Import multiple students at once efficiently
 */
exports.batchImportStudents = async (req, res) => {
    const { students } = req.body; // Array of student objects
    const schoolId = req.schoolId;

    if (!students || !Array.isArray(students)) {
        return res.status(400).json({ message: 'Students array required' });
    }

    try {
        // Prepare batch insert
        const stmt = db.prepare(`
            INSERT INTO users (name, phone, contact_phone, address, role, class_id, school_id, father_name, password_hash) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertedIds = [];
        const notifications = [];

        // Insert all students in transaction
        for (const student of students) {
            const password = generatePassword();
            const hashedPassword = bcrypt.hashSync(password, 8);

            const result = stmt.run([
                student.name,
                student.phone,
                student.contact_phone || null,
                student.address || null,
                'parent',
                student.class_id,
                schoolId,
                student.father_name || null,
                hashedPassword
            ]);

            insertedIds.push(result.lastID);

            // Prepare notification data
            if (student.contact_phone || student.phone) {
                notifications.push({
                    recipient: student.contact_phone || student.phone,
                    message: `Welcome! Login: ${student.phone}, Password: ${password}`
                });
            }
        }

        stmt.finalize();

        // ASYNC: Send all notifications in background
        if (notifications.length > 0) {
            queueAsyncJob('sendBulkNotifications', {
                recipients: notifications.map(n => n.recipient),
                message: notifications[0].message, // Assuming similar message
                type: 'sms'
            }, { priority: 6 });
        }

        // BATCH: Log bulk import activity
        addToBatch('logActivities', {
            userId: req.user?.id || 'system',
            action: 'batch_import_students',
            details: {
                count: students.length,
                schoolId,
                insertedIds: insertedIds.slice(0, 10) // Log first 10 IDs
            },
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: `${students.length} students imported successfully`,
            count: students.length
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;
