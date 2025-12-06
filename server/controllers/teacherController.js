const supabase = require('../supabase');

// --- Homework ---

exports.uploadHomework = async (req, res) => {
    const { title, description } = req.body;
    const classId = req.classId;

    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const { data, error } = await supabase
            .from('homework')
            .insert({
                class_id: classId,
                title,
                description,
                file_url: fileUrl
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Homework uploaded successfully',
            id: data.id,
            file_url: fileUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

exports.deleteHomework = async (req, res) => {
    const { id } = req.params;
    const classId = req.classId;

    try {
        const { data, error } = await supabase
            .from('homework')
            .delete()
            .eq('id', id)
            .eq('class_id', classId)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Homework not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Homework deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Notices ---

exports.uploadNotice = async (req, res) => {
    const { notice_text } = req.body;
    const classId = req.classId;
    const schoolId = req.schoolId;

    if (!notice_text) {
        return res.status(400).json({ message: 'Notice text is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('notices')
            .insert({
                school_id: schoolId,
                class_id: classId,
                notice_text
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Notice posted successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNotices = async (req, res) => {
    const classId = req.classId;

    try {
        const { data: notices, error } = await supabase
            .from('notices')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(notices || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudents = async (req, res) => {
    const classId = req.classId;

    try {
        // Find school ID from the teacher's class
        const { data: classRow, error: classError } = await supabase
            .from('classes')
            .select('school_id')
            .eq('id', classId)
            .single();

        if (classError || !classRow) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const schoolId = classRow.school_id;

        const { data: students, error } = await supabase
            .from('users')
            .select(`
                id, name, phone, role, class_id,
                classes (class_name)
            `)
            .eq('classes.school_id', schoolId)
            .eq('role', 'parent');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Transform to match expected format
        const transformedStudents = (students || []).map(s => ({
            ...s,
            class_name: s.classes?.class_name,
            classes: undefined
        }));

        res.status(200).json(transformedStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
