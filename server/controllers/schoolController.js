const supabase = require('../supabase');
const bcrypt = require('bcryptjs');

// Helper to generate random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
};

// --- Classes ---

exports.createClass = async (req, res) => {
    const { class_name } = req.body;
    const schoolId = req.schoolId;

    if (!class_name) {
        return res.status(400).json({ message: 'Class name is required.' });
    }

    // Auto-generate password: C{SchoolID}{Random}
    const class_password = `C${schoolId}${generatePassword()}`;

    try {
        const { data, error } = await supabase
            .from('classes')
            .insert({
                school_id: schoolId,
                class_name,
                class_password
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Class created successfully',
            id: data.id,
            class_password
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClasses = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const { data: classes, error } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', schoolId);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(classes || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Notices ---

// Create Notice
exports.createNotice = async (req, res) => {
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

    try {
        const { data, error } = await supabase
            .from('notices')
            .insert({
                school_id: schoolId,
                class_id: class_id || null,
                notice_text,
                file_url,
                expiry_date: expiryDate
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Notice created successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Notices (filter out expired ones)
exports.getNotices = async (req, res) => {
    const schoolId = req.schoolId;
    const today = new Date().toISOString().split('T')[0];

    console.log('getNotices called - schoolId:', schoolId, 'today:', today);

    try {
        const { data: notices, error } = await supabase
            .from('notices')
            .select('*')
            .eq('school_id', schoolId)
            .or(`expiry_date.is.null,expiry_date.gte.${today}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getNotices error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        console.log('getNotices success - found', notices?.length || 0, 'notices');
        res.status(200).json(notices || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    try {
        const { data, error } = await supabase
            .from('notices')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Notice not found or unauthorized' });
        }

        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Fees ---

// Add fee record for a parent (User)
exports.addFee = async (req, res) => {
    const { parent_id, month, amount } = req.body;

    if (!parent_id || !month) {
        return res.status(400).json({ message: 'Parent ID and Month are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('fees')
            .insert({
                parent_id,
                month,
                amount: amount || 0,
                status: 'UNPAID'
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Fee record added', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFeeStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('fees')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        res.status(200).json({ message: 'Fee status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle fee status for a student-month-year combination
exports.toggleFeeStatus = async (req, res) => {
    const { student_id, month, year } = req.body;

    if (!student_id || !month) {
        return res.status(400).json({ message: 'Student ID and month are required' });
    }

    const feeYear = year || new Date().getFullYear();

    try {
        // First check if a fee record exists
        const { data: fee, error: fetchError } = await supabase
            .from('fees')
            .select('*')
            .eq('parent_id', student_id)
            .eq('month', month)
            .eq('year', feeYear)
            .single();

        if (fee) {
            // Toggle existing record
            const newStatus = fee.status === 'PAID' ? 'UNPAID' : 'PAID';
            const { error: updateError } = await supabase
                .from('fees')
                .update({ status: newStatus })
                .eq('id', fee.id);

            if (updateError) {
                return res.status(500).json({ error: updateError.message });
            }

            res.status(200).json({ message: 'Fee status updated', status: newStatus });
        } else {
            // Create new record as PAID
            const { data: newFee, error: insertError } = await supabase
                .from('fees')
                .insert({
                    parent_id: student_id,
                    month,
                    year: feeYear,
                    amount: 0,
                    status: 'PAID'
                })
                .select()
                .single();

            if (insertError) {
                return res.status(500).json({ error: insertError.message });
            }

            res.status(201).json({ message: 'Fee record created', status: 'PAID', id: newFee.id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFees = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        // Get all fees for students in this school using Supabase joins
        const { data: fees, error } = await supabase
            .from('fees')
            .select(`
                *,
                users!inner (
                    phone,
                    class_id,
                    classes!inner (
                        class_name,
                        school_id
                    )
                )
            `)
            .eq('users.classes.school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) {
            // Fallback to simpler query if join fails
            const { data: simpleFees, error: simpleError } = await supabase
                .from('fees')
                .select('*')
                .order('created_at', { ascending: false });

            if (simpleError) {
                return res.status(500).json({ error: simpleError.message });
            }
            return res.status(200).json(simpleFees || []);
        }

        // Transform joined data to match expected format
        const transformedFees = (fees || []).map(fee => ({
            ...fee,
            phone: fee.users?.phone,
            class_name: fee.users?.classes?.class_name,
            users: undefined
        }));

        res.status(200).json(transformedFees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Homework (View Only) ---
exports.getAllHomework = async (req, res) => {
    const schoolId = req.schoolId;

    try {
        const { data: homework, error } = await supabase
            .from('homework')
            .select(`
                *,
                classes!inner (
                    class_name,
                    school_id
                )
            `)
            .eq('classes.school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Transform to match expected format
        const transformedHomework = (homework || []).map(hw => ({
            ...hw,
            class_name: hw.classes?.class_name,
            classes: undefined
        }));

        res.status(200).json(transformedHomework);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Users (Teachers/Parents) ---

// Create User (Parent/Teacher)
exports.createUser = async (req, res) => {
    const { name, phone, contact_phone, address, role, class_id, feeAmount, father_name, password } = req.body;
    const schoolId = req.schoolId;

    if (!phone || !role) {
        return res.status(400).json({ message: 'Phone and role are required' });
    }

    // Generate password if not provided
    const userPassword = password || Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = bcrypt.hashSync(userPassword, 8);

    try {
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                name: name || null,
                phone,
                contact_phone: contact_phone || null,
                address: address || null,
                role,
                class_id: class_id || null,
                school_id: schoolId,
                father_name: father_name || null,
                password_hash: hashedPassword
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const userId = newUser.id;

        // If feeAmount is provided, create a PAID fee record for the current month
        if (feeAmount && role === 'parent') {
            const currentMonth = new Date().toLocaleString('default', { month: 'short' });
            const currentYear = new Date().getFullYear();

            await supabase
                .from('fees')
                .insert({
                    parent_id: userId,
                    month: currentMonth,
                    year: currentYear,
                    amount: feeAmount,
                    status: 'PAID',
                    dismissed: 1
                });
        }

        res.status(201).json({
            message: 'User created successfully',
            id: userId,
            password: userPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Users with optional filters
exports.getUsers = async (req, res) => {
    const schoolId = req.schoolId;
    const { class_id, role } = req.query;

    console.log('getUsers called - schoolId:', schoolId, 'class_id:', class_id, 'role:', role);

    try {
        // First get all class IDs for this school
        const { data: schoolClasses, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('school_id', schoolId);

        if (classError) {
            console.error('getUsers - Error fetching classes:', classError.message);
            return res.status(500).json({ error: classError.message });
        }

        const classIds = (schoolClasses || []).map(c => c.id);
        console.log('getUsers - Found classIds:', classIds.length);

        if (classIds.length === 0) {
            // No classes, return empty array
            console.log('getUsers - No classes found, returning empty array');
            return res.status(200).json([]);
        }

        // Query users in those classes
        let query = supabase
            .from('users')
            .select('*, classes(class_name)')
            .in('class_id', classIds);

        if (class_id) {
            query = query.eq('class_id', class_id);
        }

        if (role) {
            query = query.eq('role', role);
        }

        const { data: users, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('getUsers - Supabase error:', error.message);
            return res.status(500).json({ error: error.message });
        }

        console.log('getUsers - Found users:', (users || []).length);

        // Transform to match expected format
        const transformedUsers = (users || []).map(user => ({
            ...user,
            class_name: user.classes?.class_name,
            classes: undefined
        }));

        res.status(200).json(transformedUsers);
    } catch (err) {
        console.error('getUsers - Catch error:', err.message);
        res.status(500).json({ error: err.message });
    }
};


// Update user/student
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, phone, contact_phone, address, class_id, father_name } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                name,
                phone,
                contact_phone,
                address,
                class_id,
                father_name
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Update user error:', error);
            if (error.message.includes('unique') || error.code === '23505') {
                return res.status(400).json({ message: 'Phone number already exists.' });
            }
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete user/student
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // First delete associated fees
        await supabase
            .from('fees')
            .delete()
            .eq('parent_id', id);

        // Then delete the user
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
