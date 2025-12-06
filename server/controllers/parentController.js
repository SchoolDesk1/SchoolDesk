const supabase = require('../supabase');

// --- Homework ---
exports.getHomework = async (req, res) => {
    const classId = req.classId;

    try {
        const { data: homework, error } = await supabase
            .from('homework')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(homework || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Notices ---
exports.getNotices = async (req, res) => {
    const classId = req.classId;
    const schoolId = req.schoolId;

    try {
        // Get both class-specific and school-wide notices
        const { data: notices, error } = await supabase
            .from('notices')
            .select('*')
            .or(`class_id.eq.${classId},and(class_id.is.null,school_id.eq.${schoolId})`)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(notices || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Fees ---
exports.getFees = async (req, res) => {
    const userId = req.userId;

    try {
        const { data: fees, error } = await supabase
            .from('fees')
            .select('*')
            .eq('parent_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(fees || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== NEW FEATURES ==========

// --- Vehicle Info ---
exports.getVehicleInfo = async (req, res) => {
    const userId = req.userId;

    try {
        // Get user's vehicle_id first
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('vehicle_id')
            .eq('id', userId)
            .single();

        if (userError || !user || !user.vehicle_id) {
            return res.status(200).json({ message: 'No vehicle assigned' });
        }

        const { data: vehicle, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', user.vehicle_id)
            .single();

        if (error || !vehicle) {
            return res.status(200).json({ message: 'No vehicle assigned' });
        }

        res.status(200).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Events Calendar ---
exports.getSchoolEvents = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('school_id', schoolId)
            .order('event_date', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(events || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
