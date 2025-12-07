const { Cashfree } = require('cashfree-pg');
const supabase = require('../supabase');
const crypto = require('crypto');

// Initialize Cashfree
Cashfree.XClientId = process.env.CF_CLIENT_ID;
Cashfree.XClientSecret = process.env.CF_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION; // As per user request

const PLANS = {
    basic: {
        name: 'Basic Plan',
        price: 499,
        max_students: 100,
        max_classes: 8,
        duration_days: 30
    },
    standard: {
        name: 'Standard Plan',
        price: 799,
        max_students: 300,
        max_classes: 15,
        duration_days: 30
    },
    premium: {
        name: 'Premium Plan',
        price: 999,
        max_students: 9999,
        max_classes: 9999,
        duration_days: 30
    }
};

/**
 * Create Order
 * POST /api/payment/create-order
 */
exports.createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const schoolId = req.schoolId;
        const userEmail = req.userEmail;

        if (!PLANS[planId]) {
            return res.status(400).json({ success: false, message: 'Invalid plan selected' });
        }

        const plan = PLANS[planId];

        // Fetch School Details for Customer Info
        const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single();

        if (schoolError || !school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }

        const orderId = `ORDER_${schoolId}_${Date.now()}`;
        const returnUrl = process.env.CF_RETURN_URL || "https://schooldesk.co.in/payment-return";

        const request = {
            order_amount: plan.price,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: String(schoolId),
                customer_name: school.school_name || "School Admin",
                customer_email: school.email || userEmail,
                customer_phone: school.contact_phone || "9999999999"
            },
            order_meta: {
                return_url: `${returnUrl}?order_id=${orderId}`
            },
            order_note: `Subscription for ${plan.name}`
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        if (response.data) {
            // Save Order to DB (Pending)
            await supabase.from('payments').insert({
                school_id: schoolId,
                plan_id: planId,
                amount: plan.price,
                payment_code: orderId, // storing orderId in payment_code column based on existing schema
                status: 'pending',
                created_at: new Date()
            });

            return res.json({
                success: true,
                payment_session_id: response.data.payment_session_id,
                order_id: response.data.order_id
            });
        } else {
            throw new Error("No data in response from Cashfree");
        }

    } catch (error) {
        console.error("Create Order Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

/**
 * Verify Payment
 * GET /api/payment/verify/:orderId
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const schoolId = req.schoolId;

        // Fetch Order Status from Cashfree
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        // Find a successful transaction
        const successTransaction = response.data.find(txn => txn.payment_status === "SUCCESS");

        if (successTransaction) {
            // Get Plan ID from our DB using orderId
            const { data: paymentRecord } = await supabase
                .from('payments')
                .select('*')
                .eq('payment_code', orderId)
                .single();

            if (!paymentRecord) {
                return res.json({ success: false, status: 'FAILED', message: "Order record not found" });
            }

            if (paymentRecord.status === 'verified') {
                return res.json({ success: true, status: 'PAID', message: "Already verified" });
            }

            const plan = PLANS[paymentRecord.plan_id];
            // Calculate expiry
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

            // Update Payment Status
            await supabase.from('payments')
                .update({
                    status: 'verified',
                    transaction_id: successTransaction.cf_payment_id,
                    verified_at: new Date()
                })
                .eq('payment_code', orderId);

            // Activate Plan for School
            await supabase.from('schools')
                .update({
                    plan_type: paymentRecord.plan_id,
                    plan_expiry_date: expiryDate.toISOString(),
                    max_students: plan.max_students,
                    max_classes: plan.max_classes
                })
                .eq('id', schoolId); // Ensure we are updating the correct school

            return res.json({
                success: true,
                status: "PAID",
                planName: plan.name
            });

        } else {
            // Check for failed/pending
            return res.json({
                success: false,
                status: "PENDING",
                message: "Payment not verified yet"
            });
        }

    } catch (error) {
        console.error("Verify Payment Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Verification failed"
        });
    }
};
