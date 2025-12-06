const supabase = require('../supabase');

// Download school's data as JSON backup
exports.downloadSchoolBackup = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const backup = {
            timestamp: new Date().toISOString(),
            schoolId: schoolId,
            data: {}
        };

        // Get school info
        const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single();

        if (schoolError || !school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Remove sensitive data
        const { password_hash, ...schoolData } = school;
        backup.data.school = schoolData;

        // Get classes
        const { data: classes } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', schoolId);

        backup.data.classes = classes || [];

        const classIds = (classes || []).map(c => c.id);

        if (classIds.length === 0) {
            backup.data.users = [];
            backup.data.fees = [];
            backup.data.homework = [];
            backup.data.notices = [];
            sendBackupFile(res, backup, schoolId);
            return;
        }

        // Get users
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .in('class_id', classIds);

        backup.data.users = users || [];

        // Get parent IDs for fees
        const userIds = (users || []).filter(u => u.role === 'parent').map(u => u.id);

        // Get fees
        if (userIds.length > 0) {
            const { data: fees } = await supabase
                .from('fees')
                .select('*')
                .in('parent_id', userIds);
            backup.data.fees = fees || [];
        } else {
            backup.data.fees = [];
        }

        // Get homework
        const { data: homework } = await supabase
            .from('homework')
            .select('*')
            .in('class_id', classIds);

        backup.data.homework = homework || [];

        // Get notices
        const { data: notices } = await supabase
            .from('notices')
            .select('*')
            .eq('school_id', schoolId);

        backup.data.notices = notices || [];

        sendBackupFile(res, backup, schoolId);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

function sendBackupFile(res, backup, schoolId) {
    const filename = `school_${schoolId}_backup_${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).json(backup);
}

// Restore school's data from JSON backup
exports.restoreSchoolBackup = async (req, res) => {
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

    try {
        // Get existing classes
        const { data: existingClasses } = await supabase
            .from('classes')
            .select('id')
            .eq('school_id', schoolId);

        const classIds = (existingClasses || []).map(c => c.id);

        if (classIds.length > 0) {
            // Get user IDs for deleting fees
            const { data: existingUsers } = await supabase
                .from('users')
                .select('id')
                .in('class_id', classIds);

            const userIds = (existingUsers || []).map(u => u.id);

            // Delete fees
            if (userIds.length > 0) {
                await supabase.from('fees').delete().in('parent_id', userIds);
            }

            // Delete homework
            await supabase.from('homework').delete().in('class_id', classIds);

            // Delete users
            await supabase.from('users').delete().in('class_id', classIds);

            // Delete classes
            await supabase.from('classes').delete().eq('school_id', schoolId);
        }

        // Delete notices
        await supabase.from('notices').delete().eq('school_id', schoolId);

        // Restore classes
        const classes = backup.data.classes || [];
        const classIdMapping = {};

        for (const cls of classes) {
            const { data: newClass } = await supabase
                .from('classes')
                .insert({
                    school_id: schoolId,
                    class_name: cls.class_name,
                    class_password: cls.class_password
                })
                .select()
                .single();

            if (newClass) {
                classIdMapping[cls.id] = newClass.id;
            }
        }

        // Restore users
        const users = backup.data.users || [];
        const userIdMapping = {};

        for (const user of users) {
            const newClassId = classIdMapping[user.class_id];
            const { data: newUser } = await supabase
                .from('users')
                .insert({
                    name: user.name,
                    phone: user.phone,
                    contact_phone: user.contact_phone,
                    address: user.address,
                    role: user.role,
                    class_id: newClassId,
                    school_id: schoolId,
                    father_name: user.father_name
                })
                .select()
                .single();

            if (newUser) {
                userIdMapping[user.id] = newUser.id;
            }
        }

        // Restore fees
        const fees = backup.data.fees || [];
        for (const fee of fees) {
            const newParentId = userIdMapping[fee.parent_id];
            if (newParentId) {
                await supabase.from('fees').insert({
                    parent_id: newParentId,
                    month: fee.month,
                    amount: fee.amount,
                    status: fee.status,
                    dismissed: fee.dismissed || 0
                });
            }
        }

        // Restore homework
        const homework = backup.data.homework || [];
        for (const hw of homework) {
            const newClassId = classIdMapping[hw.class_id];
            if (newClassId) {
                await supabase.from('homework').insert({
                    class_id: newClassId,
                    title: hw.title,
                    description: hw.description,
                    file_url: hw.file_url
                });
            }
        }

        // Restore notices
        const notices = backup.data.notices || [];
        for (const notice of notices) {
            const newClassId = notice.class_id ? classIdMapping[notice.class_id] : null;
            await supabase.from('notices').insert({
                school_id: schoolId,
                class_id: newClassId,
                notice_text: notice.notice_text,
                file_url: notice.file_url,
                expiry_date: notice.expiry_date
            });
        }

        res.status(200).json({ message: 'Backup restored successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
