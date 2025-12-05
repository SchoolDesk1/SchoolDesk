const db = require('../database');

// --- Homework ---

exports.uploadHomework = (req, res) => {
    const { title, description } = req.body;
    const classId = req.classId;

    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run('INSERT INTO homework (class_id, title, description, file_url) VALUES (?, ?, ?, ?)',
        [classId, title, description, fileUrl],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Homework uploaded successfully', id: this.lastID, file_url: fileUrl });
        }
    );
};

exports.getHomework = (req, res) => {
    const classId = req.classId;
    db.all('SELECT * FROM homework WHERE class_id = ? ORDER BY created_at DESC', [classId], (err, homework) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(homework);
    });
};

exports.deleteHomework = (req, res) => {
    const { id } = req.params;
    const classId = req.classId;

    // Ensure teacher can only delete homework from their own class
    db.run('DELETE FROM homework WHERE id = ? AND class_id = ?', [id, classId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Homework not found or unauthorized.' });
        res.status(200).json({ message: 'Homework deleted.' });
    });
};

// --- Notices ---

exports.uploadNotice = (req, res) => {
    const { notice_text } = req.body;
    const classId = req.classId;
    const schoolId = req.schoolId;

    if (!notice_text) {
        return res.status(400).json({ message: 'Notice text is required.' });
    }

    // Teacher uploads class-specific notice
    db.run('INSERT INTO notices (school_id, class_id, notice_text) VALUES (?, ?, ?)',
        [schoolId, classId, notice_text],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Notice posted successfully', id: this.lastID });
        }
    );
};

exports.getNotices = (req, res) => {
    const classId = req.classId;
    db.all('SELECT * FROM notices WHERE class_id = ? ORDER BY created_at DESC', [classId], (err, notices) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(notices);
    });
};

exports.getStudents = (req, res) => {
    const classId = req.classId;

    // Find school ID from the teacher's class to ensure we get the correct school
    db.get('SELECT school_id FROM classes WHERE id = ?', [classId], (err, classRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!classRow) return res.status(404).json({ message: 'Class not found' });

        const schoolId = classRow.school_id;

        const sql = `
            SELECT u.id, u.name, u.phone, u.role, u.class_id, c.class_name 
            FROM users u
            JOIN classes c ON u.class_id = c.id
            WHERE c.school_id = ? AND u.role = 'parent'
        `;

        db.all(sql, [schoolId], (err, students) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(students);
        });
    });
};
