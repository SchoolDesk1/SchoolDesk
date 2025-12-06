const supabase = require('../supabase');

// ==================== TIMETABLE MANAGEMENT ====================

// Create or Update Timetable Entry
exports.saveTimetable = async (req, res) => {
    const { class_id, day, period_number, subject, timing, teacher_name } = req.body;

    if (!class_id || !day || !period_number || !subject || !timing) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if entry exists
        const { data: existing, error: fetchError } = await supabase
            .from('timetables')
            .select('*')
            .eq('class_id', class_id)
            .eq('day', day)
            .eq('period_number', period_number)
            .single();

        if (existing) {
            // Update existing
            const { error: updateError } = await supabase
                .from('timetables')
                .update({ subject, timing, teacher_name })
                .eq('id', existing.id);

            if (updateError) {
                return res.status(500).json({ error: updateError.message });
            }

            res.status(200).json({ message: 'Timetable updated successfully' });
        } else {
            // Create new
            const { data, error: insertError } = await supabase
                .from('timetables')
                .insert({
                    class_id,
                    day,
                    period_number,
                    subject,
                    timing,
                    teacher_name
                })
                .select()
                .single();

            if (insertError) {
                return res.status(500).json({ error: insertError.message });
            }

            res.status(201).json({ message: 'Timetable created successfully', id: data.id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Timetable by Class
exports.getTimetable = async (req, res) => {
    const { class_id } = req.params;

    try {
        const { data: rows, error } = await supabase
            .from('timetables')
            .select('*')
            .eq('class_id', class_id)
            .order('day', { ascending: true })
            .order('period_number', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Timetable Entry
exports.deleteTimetableEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('timetables')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.status(200).json({ message: 'Timetable entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== VEHICLE MANAGEMENT ====================

// Create Vehicle
exports.createVehicle = async (req, res) => {
    const { vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time } = req.body;
    const schoolId = req.schoolId;

    if (!vehicle_name || !route_details || !driver_name || !driver_phone) {
        return res.status(400).json({ message: 'Vehicle name, route, driver name and phone are required' });
    }

    try {
        const { data, error } = await supabase
            .from('vehicles')
            .insert({
                school_id: schoolId,
                vehicle_name,
                route_details,
                driver_name,
                driver_phone,
                pickup_time,
                drop_time
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Vehicle added successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Vehicles for School
exports.getVehicles = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const { data: rows, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('school_id', schoolId)
            .order('vehicle_name', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time } = req.body;

    try {
        const { data, error } = await supabase
            .from('vehicles')
            .update({
                vehicle_name,
                route_details,
                driver_name,
                driver_phone,
                pickup_time,
                drop_time
            })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json({ message: 'Vehicle updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Assign Student to Vehicle
exports.assignVehicle = async (req, res) => {
    const { student_id, vehicle_id } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ vehicle_id })
            .eq('id', student_id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Vehicle assigned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== MARKS/PERFORMANCE ====================

// Add Marks
exports.addMarks = async (req, res) => {
    const { student_id, subject, marks, max_marks, test_name, test_date } = req.body;

    if (!student_id || !subject || marks === undefined || !max_marks) {
        return res.status(400).json({ message: 'Student, subject, marks and max marks are required' });
    }

    try {
        const { data, error } = await supabase
            .from('marks')
            .insert({
                student_id,
                subject,
                marks,
                max_marks,
                test_name,
                test_date
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Marks added successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Student Performance
exports.getStudentPerformance = async (req, res) => {
    const { student_id } = req.params;

    try {
        const { data: marks, error } = await supabase
            .from('marks')
            .select('*')
            .eq('student_id', student_id)
            .order('test_date', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Get homework count - simplified query
        const { count: homeworkCount } = await supabase
            .from('homework')
            .select('*', { count: 'exact', head: true });

        res.status(200).json({
            marks: marks || [],
            homework: { total: homeworkCount || 0 }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== EVENTS CALENDAR ====================

// Create Event
exports.createEvent = async (req, res) => {
    const { title, event_date, description, category } = req.body;
    const schoolId = req.schoolId;

    if (!title || !event_date) {
        return res.status(400).json({ message: 'Title and date are required' });
    }

    try {
        const { data, error } = await supabase
            .from('events')
            .insert({
                school_id: schoolId,
                title,
                event_date,
                description,
                category
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Event created successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Events for School
exports.getEvents = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const { data: rows, error } = await supabase
            .from('events')
            .select('*')
            .eq('school_id', schoolId)
            .order('event_date', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    try {
        const { data, error } = await supabase
            .from('events')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
