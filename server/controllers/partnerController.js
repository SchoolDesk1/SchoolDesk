// Partner Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Partner Login
 */
exports.loginPartner = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { data: partner, error } = await supabase
            .from('partners')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !partner) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (partner.status !== 'active') {
            return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, partner.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: partner.id,
                email: partner.email,
                role: 'partner',
                partnerCode: partner.unique_code
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            partner: {
                id: partner.id,
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                country: partner.country,
                uniqueCode: partner.unique_code,
                status: partner.status
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Partner Profile
 */
exports.getPartnerProfile = async (req, res) => {
    const partnerId = req.partnerId;

    try {
        const { data: partner, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();

        if (error || !partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        res.json({
            id: partner.id,
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            country: partner.country,
            uniqueCode: partner.unique_code,
            status: partner.status,
            createdAt: partner.created_at
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update Partner Profile
 */
exports.updatePartnerProfile = async (req, res) => {
    const partnerId = req.partnerId;
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    try {
        const { data, error } = await supabase
            .from('partners')
            .update({ name, phone })
            .eq('id', partnerId)
            .select();

        if (error) return res.status(500).json({ message: 'Server error' });
        if (!data || data.length === 0) return res.status(404).json({ message: 'Partner not found' });

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Change Partner Password
 */
exports.changePartnerPassword = async (req, res) => {
    const partnerId = req.partnerId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const { data: partner, error } = await supabase
            .from('partners')
            .select('password_hash')
            .eq('id', partnerId)
            .single();

        if (error || !partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, partner.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await supabase
            .from('partners')
            .update({ password_hash: hashedPassword })
            .eq('id', partnerId);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Partner Dashboard Stats
 */
exports.getPartnerDashboard = async (req, res) => {
    const partnerId = req.partnerId;

    try {
        const { data: partner } = await supabase
            .from('partners')
            .select('unique_code, name')
            .eq('id', partnerId)
            .single();

        if (!partner) return res.status(500).json({ message: 'Server error' });

        const { data: schoolData } = await supabase
            .from('partner_schools')
            .select('revenue, commission')
            .eq('partner_code', partner.unique_code);

        const totalSchools = schoolData?.length || 0;
        const totalRevenue = schoolData?.reduce((sum, s) => sum + (s.revenue || 0), 0) || 0;
        const totalCommission = schoolData?.reduce((sum, s) => sum + (s.commission || 0), 0) || 0;

        const { data: payoutData } = await supabase
            .from('payout_requests')
            .select('amount')
            .eq('partner_id', partnerId)
            .neq('status', 'rejected');

        const totalPayouts = payoutData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const pendingCommission = Math.max(0, totalCommission - totalPayouts);

        res.json({
            partnerCode: partner.unique_code,
            totalSchools,
            totalRevenue,
            totalCommission,
            pendingCommission
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Partner's Schools List
 */
exports.getPartnerSchools = async (req, res) => {
    const partnerId = req.partnerId;

    try {
        const { data: partner } = await supabase
            .from('partners')
            .select('unique_code')
            .eq('id', partnerId)
            .single();

        if (!partner) return res.status(500).json({ message: 'Server error' });

        const { data: schools, error } = await supabase
            .from('partner_schools')
            .select('*, schools (id, school_name, email, plan_type, status, created_at)')
            .eq('partner_code', partner.unique_code)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ message: 'Server error' });

        const transformed = (schools || []).map(s => ({
            id: s.schools?.id,
            school_name: s.schools?.school_name,
            email: s.schools?.email,
            plan_type: s.schools?.plan_type,
            status: s.schools?.status,
            created_at: s.schools?.created_at,
            revenue: s.revenue,
            commission: s.commission
        }));

        res.json({ schools: transformed });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Request Payout
 */
exports.requestPayout = async (req, res) => {
    const partnerId = req.partnerId;
    const { amount, paymentDetails } = req.body;

    if (!amount || !paymentDetails) {
        return res.status(400).json({ message: 'Amount and payment details are required' });
    }

    try {
        const { data: partner } = await supabase
            .from('partners')
            .select('unique_code, name')
            .eq('id', partnerId)
            .single();

        if (!partner) return res.status(500).json({ message: 'Server error' });

        // Calculate commission
        const { data: schoolData } = await supabase
            .from('partner_schools')
            .select('commission')
            .eq('partner_code', partner.unique_code);

        const totalCommission = schoolData?.reduce((sum, s) => sum + (s.commission || 0), 0) || 0;

        // Get total payouts
        const { data: payoutData } = await supabase
            .from('payout_requests')
            .select('amount')
            .eq('partner_id', partnerId)
            .neq('status', 'rejected');

        const totalPayouts = payoutData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const availableBalance = totalCommission - totalPayouts;

        if (amount > availableBalance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create payout request
        await supabase
            .from('payout_requests')
            .insert({
                partner_id: partnerId,
                amount,
                payment_details: paymentDetails,
                status: 'pending'
            });

        // Create notification
        await supabase
            .from('notifications')
            .insert({
                recipient_type: 'super_admin',
                title: 'New Payout Request',
                message: `Partner ${partner.name} requested a payout of ₹${amount}`,
                type: 'payout_request'
            });

        res.status(201).json({ message: 'Payout request submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Payout History
 */
exports.getPayouts = async (req, res) => {
    const partnerId = req.partnerId;

    try {
        const { data: payouts, error } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('partner_id', partnerId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ message: 'Server error' });
        res.json({ payouts: payouts || [] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Referral Link
 */
exports.getReferralLink = async (req, res) => {
    const partnerId = req.partnerId;

    try {
        const { data: partner } = await supabase
            .from('partners')
            .select('unique_code')
            .eq('id', partnerId)
            .single();

        if (!partner) return res.status(500).json({ message: 'Server error' });

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralLink = `${baseUrl}/signup?ref=${partner.unique_code}`;

        res.json({
            partnerCode: partner.unique_code,
            referralLink: referralLink
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = exports;
