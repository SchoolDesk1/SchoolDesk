const db = require('../database');

// --- Homework ---
exports.getHomework = (req, res) => {
    const classId = req.classId; // From JWT token

    db.all('SELECT * FROM homework WHERE class_id = ? ORDER BY created_at DESC',
        [classId],
        (err, homework) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(homework);
        }
    );
};

// --- Notices ---
exports.getNotices = (req, res) => {
    const classId = req.classId;
    const schoolId = req.schoolId;

    // Get both class-specific and school-wide notices
    const sql = `
        SELECT * FROM notices 
        WHERE (class_id = ? OR (class_id IS NULL AND school_id = ?))
        ORDER BY created_at DESC
    `;

    db.all(sql, [classId, schoolId], (err, notices) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(notices);
    });
};

// --- Fees ---
exports.getFees = (req, res) => {
    const userId = req.userId; // Parent's user ID

    db.all('SELECT * FROM fees WHERE parent_id = ? ORDER BY created_at DESC',
        [userId],
        (err, fees) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(fees);
        }
    );
};

// ========== NEW FEATURES ==========

// --- Vehicle Info ---
exports.getVehicleInfo = (req, res) => {
    const userId = req.userId; // Parent's user ID

    const sql = `
        SELECT v.* FROM vehicles v
        JOIN users u ON u.vehicle_id = v.id
        WHERE u.id = ?
    `;

    db.get(sql, [userId], (err, vehicle) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!vehicle) return res.status(200).json({ message: 'No vehicle assigned' });
        res.status(200).json(vehicle);
    });
};

// --- Events Calendar ---
exports.getSchoolEvents = (req, res) => {
    const schoolId = req.schoolId;

    db.all('SELECT * FROM events WHERE school_id = ? ORDER BY event_date', [schoolId], (err, events) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(events);
    });
};
