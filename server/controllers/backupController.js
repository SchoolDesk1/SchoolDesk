const db = require('../database');

// Download school's data as JSON backup
exports.downloadSchoolBackup = (req, res) => {
    const schoolId = req.schoolId;

    const backup = {
        timestamp: new Date().toISOString(),
        schoolId: schoolId,
        data: {}
    };

    // Get school info
    db.get('SELECT * FROM schools WHERE id = ?', [schoolId], (err, school) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!school) return res.status(404).json({ message: 'School not found' });

        backup.data.school = school;

        // Get classes
        db.all('SELECT * FROM classes WHERE school_id = ?', [schoolId], (err, classes) => {
            if (err) return res.status(500).json({ error: err.message });
            backup.data.classes = classes;

            // Get class IDs for filtering related data
            const classIds = classes.map(c => c.id);
            if (classIds.length === 0) {
                // No classes, return empty backup
                backup.data.users = [];
                backup.data.fees = [];
                backup.data.homework = [];
                backup.data.notices = [];

                sendBackupFile(res, backup, schoolId);
                return;
            }

            const classPlaceholders = classIds.map(() => '?').join(',');

            // Get users (students and teachers)
            db.all(`SELECT * FROM users WHERE class_id IN (${classPlaceholders})`, classIds, (err, users) => {
                if (err) return res.status(500).json({ error: err.message });
                backup.data.users = users;

                const userIds = users.filter(u => u.role === 'parent').map(u => u.id);
                const userPlaceholders = userIds.length > 0 ? userIds.map(() => '?').join(',') : '';

                // Get fees
                if (userIds.length > 0) {
                    db.all(`SELECT * FROM fees WHERE parent_id IN (${userPlaceholders})`, userIds, (err, fees) => {
                        if (err) return res.status(500).json({ error: err.message });
                        backup.data.fees = fees;
                        getHomeworkAndNotices();
                    });
                } else {
                    backup.data.fees = [];
                    getHomeworkAndNotices();
                }

                function getHomeworkAndNotices() {
                    // Get homework
                    db.all(`SELECT * FROM homework WHERE class_id IN (${classPlaceholders})`, classIds, (err, homework) => {
                        if (err) return res.status(500).json({ error: err.message });
                        backup.data.homework = homework;

                        // Get notices
                        db.all('SELECT * FROM notices WHERE school_id = ?', [schoolId], (err, notices) => {
                            if (err) return res.status(500).json({ error: err.message });
                            backup.data.notices = notices;

                            sendBackupFile(res, backup, schoolId);
                        });
                    });
                }
            });
        });
    });
};

function sendBackupFile(res, backup, schoolId) {
    const filename = `school_${schoolId}_backup_${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).json(backup);
}

// Restore school's data from JSON backup
exports.restoreSchoolBackup = (req, res) => {
    const schoolId = req.schoolId;
    const backup = req.body;

    // Validate backup structure
    if (!backup.data || !backup.schoolId) {
        return res.status(400).json({ message: 'Invalid backup file format' });
    }

    // Ensure backup is for this school
    if (backup.schoolId !== schoolId) {
        return res.status(403).json({ message: 'Backup file is for a different school' });
    }

    db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION');

        try {
            // Delete existing data for this school
            // 1. Get class IDs
            db.all('SELECT id FROM classes WHERE school_id = ?', [schoolId], (err, classes) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                const classIds = classes.map(c => c.id);
                const classPlaceholders = classIds.length > 0 ? classIds.map(() => '?').join(',') : '';

                // Delete notices
                db.run('DELETE FROM notices WHERE school_id = ?', [schoolId], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    if (classIds.length === 0) {
                        // No classes to delete, proceed to restoration
                        restoreData();
                        return;
                    }

                    // Delete homework
                    db.run(`DELETE FROM homework WHERE class_id IN (${classPlaceholders})`, classIds, (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }

                        // Get user IDs to delete fees
                        db.all(`SELECT id FROM users WHERE class_id IN (${classPlaceholders})`, classIds, (err, users) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            const userIds = users.map(u => u.id);
                            const userPlaceholders = userIds.length > 0 ? userIds.map(() => '?').join(',') : '';

                            if (userIds.length > 0) {
                                // Delete fees
                                db.run(`DELETE FROM fees WHERE parent_id IN (${userPlaceholders})`, userIds, (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ error: err.message });
                                    }
                                    deleteUsersAndClasses();
                                });
                            } else {
                                deleteUsersAndClasses();
                            }

                            function deleteUsersAndClasses() {
                                // Delete users
                                db.run(`DELETE FROM users WHERE class_id IN (${classPlaceholders})`, classIds, (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ error: err.message });
                                    }

                                    // Delete classes
                                    db.run('DELETE FROM classes WHERE school_id = ?', [schoolId], (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return res.status(500).json({ error: err.message });
                                        }

                                        restoreData();
                                    });
                                });
                            }
                        });
                    });
                });
            });

            function restoreData() {
                // Restore classes
                const classes = backup.data.classes || [];
                let classCount = 0;

                if (classes.length === 0) {
                    restoreUsersAndOthers({});
                    return;
                }

                const classIdMapping = {}; // old ID -> new ID

                classes.forEach((cls, index) => {
                    const { class_name, class_password } = cls;
                    db.run('INSERT INTO classes (school_id, class_name, class_password) VALUES (?, ?, ?)',
                        [schoolId, class_name, class_password],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            classIdMapping[cls.id] = this.lastID;
                            classCount++;

                            if (classCount === classes.length) {
                                restoreUsersAndOthers(classIdMapping);
                            }
                        }
                    );
                });
            }

            function restoreUsersAndOthers(classIdMapping) {
                // Restore users
                const users = backup.data.users || [];
                let userCount = 0;
                const userIdMapping = {}; // old ID -> new ID

                if (users.length === 0) {
                    restoreFeesAndOthers({}, classIdMapping);
                    return;
                }

                users.forEach((user) => {
                    const { name, phone, contact_phone, address, role, father_name } = user;
                    const newClassId = classIdMapping[user.class_id];

                    db.run('INSERT INTO users (name, phone, contact_phone, address, role, class_id, school_id, father_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [name, phone, contact_phone, address, role, newClassId, schoolId, father_name],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            userIdMapping[user.id] = this.lastID;
                            userCount++;

                            if (userCount === users.length) {
                                restoreFeesAndOthers(userIdMapping, classIdMapping);
                            }
                        }
                    );
                });
            }

            function restoreFeesAndOthers(userIdMapping, classIdMapping) {
                // Restore fees
                const fees = backup.data.fees || [];
                let feeCount = 0;

                if (fees.length === 0) {
                    restoreHomeworkAndNotices(classIdMapping);
                    return;
                }

                fees.forEach((fee) => {
                    const newParentId = userIdMapping[fee.parent_id];
                    db.run('INSERT INTO fees (parent_id, month, amount, status, dismissed) VALUES (?, ?, ?, ?, ?)',
                        [newParentId, fee.month, fee.amount, fee.status, fee.dismissed || 0],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            feeCount++;
                            if (feeCount === fees.length) {
                                restoreHomeworkAndNotices(classIdMapping);
                            }
                        }
                    );
                });
            }

            function restoreHomeworkAndNotices(classIdMapping) {
                // Restore homework
                const homework = backup.data.homework || [];
                let hwCount = 0;

                if (homework.length === 0) {
                    restoreNotices(classIdMapping);
                    return;
                }

                homework.forEach((hw) => {
                    const newClassId = classIdMapping[hw.class_id];
                    db.run('INSERT INTO homework (class_id, title, description, file_url) VALUES (?, ?, ?, ?)',
                        [newClassId, hw.title, hw.description, hw.file_url],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            hwCount++;
                            if (hwCount === homework.length) {
                                restoreNotices(classIdMapping);
                            }
                        }
                    );
                });
            }

            function restoreNotices(classIdMapping) {
                // Restore notices
                const notices = backup.data.notices || [];
                let noticeCount = 0;

                if (notices.length === 0) {
                    finalizeRestore();
                    return;
                }

                notices.forEach((notice) => {
                    const newClassId = notice.class_id ? classIdMapping[notice.class_id] : null;
                    db.run('INSERT INTO notices (school_id, class_id, notice_text, file_url, expiry_date) VALUES (?, ?, ?, ?, ?)',
                        [schoolId, newClassId, notice.notice_text, notice.file_url, notice.expiry_date],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }

                            noticeCount++;
                            if (noticeCount === notices.length) {
                                finalizeRestore();
                            }
                        }
                    );
                });
            }

            function finalizeRestore() {
                // Commit transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(200).json({ message: 'Backup restored successfully' });
                });
            }

        } catch (error) {
            db.run('ROLLBACK');
            res.status(500).json({ error: error.message });
        }
    });
};
