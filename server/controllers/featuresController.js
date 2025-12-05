const db = require('../database');

// ==================== TIMETABLE MANAGEMENT ====================

// Create or Update Timetable Entry
exports.saveTimetable = (req, res) => {
    const { class_id, day, period_number, subject, timing, teacher_name } = req.body;

    if (!class_id || !day || !period_number || !subject || !timing) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if entry exists
    db.get('SELECT * FROM timetables WHERE class_id = ? AND day = ? AND period_number = ?',
        [class_id, day, period_number],
        (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });

            if (existing) {
                // Update existing
                db.run('UPDATE timetables SET subject = ?, timing = ?, teacher_name = ? WHERE id = ?',
                    [subject, timing, teacher_name, existing.id],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.status(200).json({ message: 'Timetable updated successfully' });
                    }
                );
            } else {
                // Create new
                db.run('INSERT INTO timetables (class_id, day, period_number, subject, timing, teacher_name) VALUES (?, ?, ?, ?, ?, ?)',
                    [class_id, day, period_number, subject, timing, teacher_name],
                    function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.status(201).json({ message: 'Timetable created successfully', id: this.lastID });
                    }
                );
            }
        }
    );

};

// Get Timetable by Class
exports.getTimetable = (req, res) => {
    const { class_id } = req.params;

    db.all('SELECT * FROM timetables WHERE class_id = ? ORDER BY day, period_number',
        [class_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(rows);
        }
    );
};

// Delete Timetable Entry
exports.deleteTimetableEntry = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM timetables WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json({ message: 'Timetable entry deleted' });
    });
};

// ==================== VEHICLE MANAGEMENT ====================

// Create Vehicle
exports.createVehicle = (req, res) => {
    const { vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time } = req.body;
    const schoolId = req.schoolId;

    if (!vehicle_name || !route_details || !driver_name || !driver_phone) {
        return res.status(400).json({ message: 'Vehicle name, route, driver name and phone are required' });
    }

    db.run('INSERT INTO vehicles (school_id, vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [schoolId, vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Vehicle added successfully', id: this.lastID });
        }
    );
};

// Get All Vehicles for School
exports.getVehicles = (req, res) => {
    const schoolId = req.schoolId;

    db.all('SELECT * FROM vehicles WHERE school_id = ? ORDER BY vehicle_name', [schoolId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

// Update Vehicle
exports.updateVehicle = (req, res) => {
    const { id } = req.params;
    const { vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time } = req.body;

    db.run('UPDATE vehicles SET vehicle_name = ?, route_details = ?, driver_name = ?, driver_phone = ?, pickup_time = ?, drop_time = ? WHERE id = ?',
        [vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Vehicle not found' });
            res.status(200).json({ message: 'Vehicle updated successfully' });
        }
    );
};

// Delete Vehicle
exports.deleteVehicle = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM vehicles WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Vehicle not found' });
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    });
};

// Assign Student to Vehicle
exports.assignVehicle = (req, res) => {
    const { student_id, vehicle_id } = req.body;

    db.run('UPDATE users SET vehicle_id = ? WHERE id = ?', [vehicle_id, student_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Vehicle assigned successfully' });
    });
};

// ==================== MARKS/PERFORMANCE ====================

// Add Marks
exports.addMarks = (req, res) => {
    const { student_id, subject, marks, max_marks, test_name, test_date } = req.body;

    if (!student_id || !subject || marks === undefined || !max_marks) {
        return res.status(400).json({ message: 'Student, subject, marks and max marks are required' });
    }

    db.run('INSERT INTO marks (student_id, subject, marks, max_marks, test_name, test_date) VALUES (?, ?, ?, ?, ?, ?)',
        [student_id, subject, marks, max_marks, test_name, test_date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Marks added successfully', id: this.lastID });
        }
    );
};

// Get Student Performance
exports.getStudentPerformance = (req, res) => {
    const { student_id } = req.params;

    db.all('SELECT * FROM marks WHERE student_id = ? ORDER BY test_date DESC', [student_id], (err, marks) => {
        if (err) return res.status(500).json({ error: err.message });

        // Also get homework completion stats
        db.get('SELECT COUNT(*) as total FROM homework h JOIN classes c ON h.class_id = c.id JOIN users u ON u.class_id = c.id WHERE u.id = ?',
            [student_id], (err, homework) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ marks, homework: homework || { total: 0 } });
            }
        );
    });
};

// ==================== EVENTS CALENDAR ====================

// Create Event
exports.createEvent = (req, res) => {
    const { title, event_date, description, category } = req.body;
    const schoolId = req.schoolId;

    if (!title || !event_date) {
        return res.status(400).json({ message: 'Title and date are required' });
    }

    db.run('INSERT INTO events (school_id, title, event_date, description, category) VALUES (?, ?, ?, ?, ?)',
        [schoolId, title, event_date, description, category],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Event created successfully', id: this.lastID });
        }
    );
};

// Get All Events for School
exports.getEvents = (req, res) => {
    const schoolId = req.schoolId;

    db.all('SELECT * FROM events WHERE school_id = ? ORDER BY event_date', [schoolId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

// Delete Event
exports.deleteEvent = (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    db.run('DELETE FROM events WHERE id = ? AND school_id = ?', [id, schoolId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    });
};
