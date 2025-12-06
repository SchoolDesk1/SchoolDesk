const supabase = require('../supabase');
const bcrypt = require('bcryptjs');

// Get All Schools (with basic info)
exports.getAllSchools = async (req, res) => {
    try {
        const { data: schools, error } = await supabase
            .from('schools')
            .select('id, school_name, email, address, contact_person, contact_phone, plan_type, status, plan_expiry_date, created_at');

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(schools || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new school (Demo or Manual)
exports.createSchool = async (req, res) => {
    const { school_name, email, password, address, contact_person, contact_phone, plan_type } = req.body;

    if (!school_name || !email || !password) {
        return res.status(400).json({ message: 'School name, email, and password are required.' });
    }

    const passwordHash = bcrypt.hashSync(password, 8);

    try {
        const { data, error } = await supabase
            .from('schools')
            .insert({
                school_name,
                email,
                password_hash: passwordHash,
                address,
                contact_person,
                contact_phone,
                plan_type: plan_type || 'basic'
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Email already exists.' });
            }
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'School created successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update School Status
exports.updateSchoolStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'trial', 'expired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        const { data, error } = await supabase
            .from('schools')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'School not found.' });
        res.status(200).json({ message: 'School status updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete School
exports.deleteSchool = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('schools')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'School not found.' });
        res.status(200).json({ message: 'School deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== ANALYTICS ENDPOINTS =====

// Get Platform-Wide Analytics
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const [
            { count: totalSchools },
            { count: activeSchools },
            { count: totalStudents },
            { count: totalTeachers },
            { count: totalClasses },
            { count: totalHomework },
            { count: totalNotices }
        ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
            supabase.from('classes').select('*', { count: 'exact', head: true }),
            supabase.from('homework').select('*', { count: 'exact', head: true }),
            supabase.from('notices').select('*', { count: 'exact', head: true })
        ]);

        // Get total fees
        const { data: feeData } = await supabase
            .from('fees')
            .select('amount')
            .eq('status', 'PAID');
        const totalFees = feeData?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

        res.status(200).json({
            totalSchools: totalSchools || 0,
            activeSchools: activeSchools || 0,
            totalStudents: totalStudents || 0,
            totalTeachers: totalTeachers || 0,
            totalClasses: totalClasses || 0,
            totalHomework: totalHomework || 0,
            totalNotices: totalNotices || 0,
            totalFees
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Detailed School Stats
exports.getSchoolDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: school, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Get counts
        const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', id);

        const { count: noticeCount } = await supabase
            .from('notices')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', id);

        // Get user counts via classes
        const { data: classes } = await supabase
            .from('classes')
            .select('id')
            .eq('school_id', id);

        const classIds = classes?.map(c => c.id) || [];

        let studentCount = 0, teacherCount = 0, homeworkCount = 0;
        if (classIds.length > 0) {
            const { count: students } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .in('class_id', classIds)
                .eq('role', 'parent');
            studentCount = students || 0;

            const { count: teachers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .in('class_id', classIds)
                .eq('role', 'teacher');
            teacherCount = teachers || 0;

            const { count: hw } = await supabase
                .from('homework')
                .select('*', { count: 'exact', head: true })
                .in('class_id', classIds);
            homeworkCount = hw || 0;
        }

        res.status(200).json({
            school,
            studentCount,
            teacherCount,
            classCount: classCount || 0,
            homeworkCount,
            noticeCount: noticeCount || 0,
            feesCollected: 0,
            feeCount: 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Users Overview
exports.getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                *,
                classes (class_name, school_id, schools (school_name))
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });

        const transformedUsers = (users || []).map(u => ({
            ...u,
            class_name: u.classes?.class_name,
            school_name: u.classes?.schools?.school_name,
            classes: undefined
        }));

        const teachers = transformedUsers.filter(u => u.role === 'teacher');
        const parents = transformedUsers.filter(u => u.role === 'parent');

        res.status(200).json({
            totalUsers: transformedUsers.length,
            totalTeachers: teachers.length,
            totalParents: parents.length,
            teachers: teachers.slice(0, 50),
            parents: parents.slice(0, 50),
            allUsers: transformedUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Homework (Platform-Wide)
exports.getAllHomework = async (req, res) => {
    try {
        const { data: homework, error } = await supabase
            .from('homework')
            .select(`*, classes (class_name, schools (school_name))`)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });

        const transformed = (homework || []).map(h => ({
            ...h,
            class_name: h.classes?.class_name,
            school_name: h.classes?.schools?.school_name,
            classes: undefined
        }));

        res.status(200).json(transformed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Notices (Platform-Wide)
exports.getAllNotices = async (req, res) => {
    try {
        const { data: notices, error } = await supabase
            .from('notices')
            .select(`*, schools (school_name), classes (class_name)`)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });

        const transformed = (notices || []).map(n => ({
            ...n,
            school_name: n.schools?.school_name,
            class_name: n.classes?.class_name,
            schools: undefined,
            classes: undefined
        }));

        res.status(200).json(transformed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Homework (Content Moderation)
exports.deleteHomework = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('homework')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Homework not found' });
        res.status(200).json({ message: 'Homework deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Notice (Content Moderation)
exports.deleteNoticeAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('notices')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Notice not found' });
        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== SUPER ADMIN CONTROL FEATURES =====

// Reset School Password
exports.resetSchoolPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 8);

    try {
        const { data, error } = await supabase
            .from('schools')
            .update({ password_hash: passwordHash })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'School not found' });
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Block/Unblock School
exports.toggleSchoolBlock = async (req, res) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const newStatus = blocked ? 'suspended' : 'active';

    try {
        const { data, error } = await supabase
            .from('schools')
            .update({ status: newStatus })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'School not found' });
        res.status(200).json({
            message: blocked ? 'School blocked successfully' : 'School unblocked successfully',
            newStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update School Plan
exports.updateSchoolPlan = async (req, res) => {
    const { id } = req.params;
    const { plan_type, plan_expiry_date, max_students, recordSale, saleAmount } = req.body;

    const updates = {};
    if (plan_type) updates.plan_type = plan_type;
    if (plan_expiry_date) updates.plan_expiry_date = plan_expiry_date;
    if (max_students) updates.max_students = max_students;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    try {
        const { data, error } = await supabase
            .from('schools')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'School not found' });

        // Record sale if requested
        if (recordSale && plan_type) {
            const amount = saleAmount || (plan_type === 'basic' ? 299 : plan_type === 'standard' ? 499 : plan_type === 'premium' ? 799 : 0);
            if (amount > 0) {
                await supabase.from('payments').insert({
                    school_id: id,
                    plan_id: plan_type,
                    amount,
                    payment_code: `MANUAL-${id}-${Date.now()}`,
                    transaction_id: 'MANUAL_ENTRY',
                    status: 'verified',
                    verified_at: new Date().toISOString()
                });
            }
        }

        res.status(200).json({ message: 'School plan updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get School Full Details
exports.getSchoolFullDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: school, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const { password_hash, ...schoolData } = school;

        const [
            { data: classes },
            { data: notices },
            { data: payments }
        ] = await Promise.all([
            supabase.from('classes').select('*').eq('school_id', id),
            supabase.from('notices').select('*').eq('school_id', id),
            supabase.from('payments').select('*').eq('school_id', id)
        ]);

        const classIds = classes?.map(c => c.id) || [];
        let users = [], homework = [];

        if (classIds.length > 0) {
            const { data: usersData } = await supabase
                .from('users')
                .select('*, classes (class_name)')
                .in('class_id', classIds);
            users = (usersData || []).map(u => ({ ...u, class_name: u.classes?.class_name }));

            const { data: hwData } = await supabase
                .from('homework')
                .select('*, classes (class_name)')
                .in('class_id', classIds);
            homework = (hwData || []).map(h => ({ ...h, class_name: h.classes?.class_name }));
        }

        res.status(200).json({
            ...schoolData,
            classes: classes || [],
            teachers: users.filter(u => u.role === 'teacher'),
            students: users.filter(u => u.role === 'parent'),
            homework,
            notices: notices || [],
            payments: payments || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Users with Detailed Info (Paginated)
exports.getAllUsersDetailed = async (req, res) => {
    const { page = 1, limit = 50, role, school_id } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = supabase
            .from('users')
            .select(`
                id, name, phone, role, address, contact_phone, created_at,
                classes!inner (class_name, school_id, schools (school_name, email, status))
            `, { count: 'exact' });

        if (role) query = query.eq('role', role);
        if (school_id) query = query.eq('classes.school_id', school_id);

        const { data: users, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) return res.status(500).json({ error: error.message });

        const transformed = (users || []).map(u => ({
            ...u,
            class_name: u.classes?.class_name,
            school_id: u.classes?.school_id,
            school_name: u.classes?.schools?.school_name,
            school_email: u.classes?.schools?.email,
            school_status: u.classes?.schools?.status,
            classes: undefined
        }));

        res.status(200).json({
            users: transformed,
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reset User Password
exports.resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 8);

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== NEW FEATURES =====

// Global Search
exports.getGlobalSearch = async (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) {
        return res.status(200).json({ schools: [], users: [], payments: [] });
    }

    try {
        const search = `%${query}%`;

        const [{ data: schools }, { data: users }, { data: payments }] = await Promise.all([
            supabase.from('schools').select('id, school_name, email, status').or(`school_name.ilike.${search},email.ilike.${search}`),
            supabase.from('users').select('id, name, phone, role, school_id').or(`name.ilike.${search},phone.ilike.${search}`),
            supabase.from('payments').select('*, schools (school_name)').or(`transaction_id.ilike.${search},payment_code.ilike.${search}`)
        ]);

        res.status(200).json({
            schools: schools || [],
            users: users || [],
            payments: (payments || []).map(p => ({ ...p, school_name: p.schools?.school_name }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Activity Logs
exports.getActivityLogs = async (req, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(logs || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Support Tickets
exports.getSupportTickets = async (req, res) => {
    try {
        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*, schools (school_name, email)')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const transformed = (tickets || []).map(t => ({
            ...t,
            school_name: t.schools?.school_name,
            email: t.schools?.email,
            schools: undefined
        }));

        res.status(200).json(transformed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reply to Support Ticket
exports.replySupportTicket = async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;

    try {
        const { error } = await supabase
            .from('support_tickets')
            .update({
                admin_response: response,
                status: 'closed',
                resolved_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: 'Reply sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Comprehensive Dashboard Overview
exports.getComprehensiveOverview = async (req, res) => {
    try {
        const [
            { count: totalSchools },
            { count: activeSchools },
            { count: suspendedSchools },
            { count: totalStudents },
            { count: totalTeachers },
            { count: totalHomework },
            { count: totalNotices }
        ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
            supabase.from('homework').select('*', { count: 'exact', head: true }),
            supabase.from('notices').select('*', { count: 'exact', head: true })
        ]);

        // Get revenue
        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'verified');
        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Get plan distribution
        const { data: planData } = await supabase
            .from('schools')
            .select('plan_type');
        const planSalesGraph = [];
        const planCounts = {};
        planData?.forEach(s => {
            planCounts[s.plan_type] = (planCounts[s.plan_type] || 0) + 1;
        });
        Object.entries(planCounts).forEach(([name, value]) => {
            planSalesGraph.push({ name, value });
        });

        res.status(200).json({
            totalSchools: totalSchools || 0,
            activeSchools: activeSchools || 0,
            suspendedSchools: suspendedSchools || 0,
            totalStudents: totalStudents || 0,
            totalTeachers: totalTeachers || 0,
            totalParents: totalStudents || 0,
            totalRevenue,
            todaySignups: 0,
            todayPayments: 0,
            monthlyRevenue: totalRevenue,
            totalHomework: totalHomework || 0,
            totalNotices: totalNotices || 0,
            activeSubscriptions: activeSchools || 0,
            graphs: {
                revenue: [],
                newSchools: [],
                activeUsers: [],
                planSales: planSalesGraph
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Download System Backup - Not available with Supabase
exports.downloadSystemBackup = (req, res) => {
    res.status(400).json({
        message: 'Database backup not available. Please use Supabase dashboard for backups.',
        supabaseUrl: 'https://supabase.com/dashboard'
    });
};

// ===== PARTNER MANAGEMENT =====

const { generatePartnerCode } = require('../utils/partnerCodeGenerator');

// Get All Partners
exports.getAllPartners = async (req, res) => {
    try {
        const { data: partners, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        // Get school counts for each partner
        const partnersWithStats = await Promise.all((partners || []).map(async (p) => {
            const { data: schoolData } = await supabase
                .from('partner_schools')
                .select('school_id, revenue')
                .eq('partner_code', p.unique_code);

            return {
                ...p,
                total_schools: schoolData?.length || 0,
                total_revenue: schoolData?.reduce((sum, s) => sum + (s.revenue || 0), 0) || 0
            };
        }));

        res.status(200).json({ partners: partnersWithStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add New Partner
exports.addPartner = async (req, res) => {
    const { name, email, phone, country, password } = req.body;

    if (!name || !email || !phone || !password || !country) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const uniqueCode = await generatePartnerCode();
        const passwordHash = bcrypt.hashSync(password, 10);

        const { data, error } = await supabase
            .from('partners')
            .insert({
                name,
                email,
                phone,
                country,
                unique_code: uniqueCode,
                password_hash: passwordHash
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: 'Partner created successfully',
            partner: { id: data.id, name, email, phone, country, uniqueCode, status: 'active' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Partner Details
exports.getPartnerDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: partner, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const { data: schools } = await supabase
            .from('partner_schools')
            .select('*, schools (id, school_name, email, plan_type, status, created_at)')
            .eq('partner_code', partner.unique_code);

        const { password_hash, ...partnerData } = partner;

        res.status(200).json({
            ...partnerData,
            schools: (schools || []).map(s => ({
                id: s.schools?.id,
                school_name: s.schools?.school_name,
                email: s.schools?.email,
                plan_type: s.schools?.plan_type,
                status: s.schools?.status,
                created_at: s.schools?.created_at,
                revenue: s.revenue,
                commission: s.commission
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Partner
exports.updatePartner = async (req, res) => {
    const { id } = req.params;
    const { name, phone, country, status } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (country) updates.country = country;
    if (status) updates.status = status;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    try {
        const { data, error } = await supabase
            .from('partners')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Partner not found' });
        res.status(200).json({ message: 'Partner updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Partner
exports.deletePartner = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('partners')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Partner not found' });
        res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Partner Analytics
exports.getPartnerAnalytics = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: partner } = await supabase
            .from('partners')
            .select('unique_code')
            .eq('id', id)
            .single();

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const { data: schoolData } = await supabase
            .from('partner_schools')
            .select('revenue, commission')
            .eq('partner_code', partner.unique_code);

        const totalRevenue = schoolData?.reduce((sum, s) => sum + (s.revenue || 0), 0) || 0;
        const totalCommission = schoolData?.reduce((sum, s) => sum + (s.commission || 0), 0) || 0;

        res.status(200).json({
            total_schools: schoolData?.length || 0,
            totalRevenue,
            totalCommission,
            avgRevenue: schoolData?.length ? totalRevenue / schoolData.length : 0,
            monthlyBreakdown: []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== PROMO CODE MANAGEMENT =====

// Get All Promo Codes
exports.getAllPromoCodes = async (req, res) => {
    try {
        const { data: codes, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ promoCodes: codes || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Promo Code
exports.createPromoCode = async (req, res) => {
    const { code, type, value, applicablePlans, validFrom, validTo, usageLimit } = req.body;

    if (!code || !type || !value || !applicablePlans || !validFrom || !validTo) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!['flat', 'percentage'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "flat" or "percentage"' });
    }

    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .insert({
                code,
                type,
                value,
                applicable_plans: JSON.stringify(applicablePlans),
                valid_from: validFrom,
                valid_to: validTo,
                usage_limit: usageLimit
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Promo code already exists' });
            }
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Promo code created successfully', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Promo Code
exports.deletePromoCode = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Promo code not found' });
        res.status(200).json({ message: 'Promo code deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===== PAYOUT MANAGEMENT =====

// Get All Payout Requests
exports.getPayoutRequests = async (req, res) => {
    try {
        const { data: requests, error } = await supabase
            .from('payout_requests')
            .select('*, partners (name, email, unique_code)')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const transformed = (requests || []).map(r => ({
            ...r,
            partner_name: r.partners?.name,
            partner_email: r.partners?.email,
            partner_code: r.partners?.unique_code,
            partners: undefined
        }));

        res.status(200).json({ payouts: transformed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Payout Status
exports.updatePayoutStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['completed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const { data, error } = await supabase
            .from('payout_requests')
            .update({
                status,
                processed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Payout request not found' });
        res.status(200).json({ message: `Payout marked as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = exports;
