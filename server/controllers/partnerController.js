// Partner Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Partner Login
 */
exports.loginPartner = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM partners WHERE email = ?', [email], async (err, partner) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!partner) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if partner is active
        if (partner.status !== 'active') {
            return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, partner.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
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
    });
};

/**
 * Get Partner Profile
 */
exports.getPartnerProfile = (req, res) => {
    const partnerId = req.partnerId;

    db.get('SELECT * FROM partners WHERE id = ?', [partnerId], (err, partner) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!partner) {
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
    });
};

/**
 * Update Partner Profile
 */
exports.updatePartnerProfile = (req, res) => {
    const partnerId = req.partnerId;
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    db.run(
        'UPDATE partners SET name = ?, phone = ? WHERE id = ?',
        [name, phone, partnerId],
        function (err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Partner not found' });
            }

            res.json({ message: 'Profile updated successfully' });
        }
    );
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

    db.get('SELECT password_hash FROM partners WHERE id = ?', [partnerId], async (err, partner) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, partner.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.run(
            'UPDATE partners SET password_hash = ? WHERE id = ?',
            [hashedPassword, partnerId],
            function (err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ message: 'Password changed successfully' });
            }
        );
    });
};

/**
 * Get Partner Dashboard Stats
 */
exports.getPartnerDashboard = (req, res) => {
    const partnerId = req.partnerId;

    // Get partner code first
    db.get('SELECT unique_code, name FROM partners WHERE id = ?', [partnerId], (err, partner) => {
        if (err || !partner) {
            return res.status(500).json({ message: 'Server error' });
        }

        const partnerCode = partner.unique_code;

        // Get stats
        db.all(
            `SELECT 
        COUNT(*) as totalSchools,
        SUM(revenue) as totalRevenue,
        SUM(commission) as totalCommission
       FROM partner_schools 
       WHERE partner_code = ?`,
            [partnerCode],
            (err, stats) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const result = stats[0] || { totalSchools: 0, totalRevenue: 0, totalCommission: 0 };

                // Get total payouts (completed and pending)
                db.get(
                    `SELECT SUM(amount) as totalPayouts FROM payout_requests WHERE partner_id = ? AND status != 'rejected'`,
                    [partnerId],
                    (err, payoutStats) => {
                        const totalPayouts = payoutStats?.totalPayouts || 0;
                        const pendingCommission = (result.totalCommission || 0) - totalPayouts;

                        res.json({
                            partnerCode: partnerCode,
                            totalSchools: result.totalSchools || 0,
                            totalRevenue: result.totalRevenue || 0,
                            totalCommission: result.totalCommission || 0,
                            pendingCommission: Math.max(0, pendingCommission)
                        });
                    }
                );
            }
        );
    });
};

/**
 * Get Partner's Schools List
 */
exports.getPartnerSchools = (req, res) => {
    const partnerId = req.partnerId;

    // Get partner code first
    db.get('SELECT unique_code FROM partners WHERE id = ?', [partnerId], (err, partner) => {
        if (err || !partner) {
            return res.status(500).json({ message: 'Server error' });
        }

        const partnerCode = partner.unique_code;

        db.all(
            `SELECT 
        s.id,
        s.school_name,
        s.email,
        s.plan_type,
        s.status,
        s.created_at,
        ps.revenue,
        ps.commission
       FROM partner_schools ps
       JOIN schools s ON ps.school_id = s.id
       WHERE ps.partner_code = ?
       ORDER BY ps.created_at DESC`,
            [partnerCode],
            (err, schools) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ schools: schools || [] });
            }
        );
    });
};

/**
 * Request Payout
 */
exports.requestPayout = (req, res) => {
    const partnerId = req.partnerId;
    const { amount, paymentDetails } = req.body;

    if (!amount || !paymentDetails) {
        return res.status(400).json({ message: 'Amount and payment details are required' });
    }

    // 1. Calculate pending commission
    db.get('SELECT unique_code, name FROM partners WHERE id = ?', [partnerId], (err, partner) => {
        if (err || !partner) return res.status(500).json({ message: 'Server error' });

        db.get(
            `SELECT SUM(commission) as totalCommission FROM partner_schools WHERE partner_code = ?`,
            [partner.unique_code],
            (err, commissionStats) => {
                if (err) return res.status(500).json({ message: 'Server error' });

                db.get(
                    `SELECT SUM(amount) as totalPayouts FROM payout_requests WHERE partner_id = ? AND status != 'rejected'`,
                    [partnerId],
                    (err, payoutStats) => {
                        if (err) return res.status(500).json({ message: 'Server error' });

                        const totalCommission = commissionStats?.totalCommission || 0;
                        const totalPayouts = payoutStats?.totalPayouts || 0;
                        const availableBalance = totalCommission - totalPayouts;

                        if (amount > availableBalance) {
                            return res.status(400).json({ message: 'Insufficient balance' });
                        }

                        // 2. Create payout request
                        db.run(
                            `INSERT INTO payout_requests (partner_id, amount, payment_details, status) VALUES (?, ?, ?, 'pending')`,
                            [partnerId, amount, paymentDetails],
                            function (err) {
                                if (err) return res.status(500).json({ message: 'Server error' });

                                // 3. Create notification for Super Admin
                                const notificationTitle = 'New Payout Request';
                                const notificationMessage = `Partner ${partner.name} requested a payout of ₹${amount}`;

                                db.run(
                                    `INSERT INTO notifications (recipient_type, title, message, type) VALUES ('super_admin', ?, ?, 'payout_request')`,
                                    [notificationTitle, notificationMessage],
                                    (err) => {
                                        if (err) console.error('Error creating notification:', err);
                                    }
                                );

                                res.status(201).json({ message: 'Payout request submitted successfully' });
                            }
                        );
                    }
                );
            }
        );
    });
};

/**
 * Get Payout History
 */
exports.getPayouts = (req, res) => {
    const partnerId = req.partnerId;

    db.all(
        `SELECT * FROM payout_requests WHERE partner_id = ? ORDER BY created_at DESC`,
        [partnerId],
        (err, payouts) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            res.json({ payouts: payouts || [] });
        }
    );
};

/**
 * Get Referral Link (Deprecated but kept for backward compatibility)
 */
exports.getReferralLink = (req, res) => {
    const partnerId = req.partnerId;

    db.get('SELECT unique_code FROM partners WHERE id = ?', [partnerId], (err, partner) => {
        if (err || !partner) {
            return res.status(500).json({ message: 'Server error' });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralLink = `${baseUrl}/signup?ref=${partner.unique_code}`;

        res.json({
            partnerCode: partner.unique_code,
            referralLink: referralLink
        });
    });
};

module.exports = exports;
