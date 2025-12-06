const { Cashfree } = require('cashfree-pg');
const supabase = require('../supabase');
const crypto = require('crypto');

// Plan configuration with actual pricing
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
        max_students: 9999, // Unlimited
        max_classes: 9999,  // Unlimited
        duration_days: 30
    }
};

// Initialize Cashfree SDK
const initCashfree = () => {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        console.error('Cashfree credentials not configured in .env file');
        console.error('Required: CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
        throw new Error('Payment gateway credentials not configured. Please contact support.');
    }

    const environment = process.env.CASHFREE_ENVIRONMENT === 'production'
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX;

    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = environment;

    console.log(`Cashfree initialized in ${process.env.CASHFREE_ENVIRONMENT || 'sandbox'} mode`);

    return Cashfree;
};

// Validate promo code and calculate discount
const validatePromoCode = async (promoCode, planId) => {
    if (!promoCode) return { valid: false, discount: 0 };

    try {
        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode.toUpperCase())
            .eq('status', 'active')
            .lte('valid_from', new Date().toISOString().split('T')[0])
            .gte('valid_to', new Date().toISOString().split('T')[0])
            .single();

        if (error || !promo) {
            return { valid: false, discount: 0, message: 'Invalid or expired promo code' };
        }

        // Check usage limit
        if (promo.usage_limit && promo.current_usage >= promo.usage_limit) {
            return { valid: false, discount: 0, message: 'Promo code usage limit exceeded' };
        }

        // Check if plan is applicable
        const applicablePlans = promo.applicable_plans.split(',').map(p => p.trim().toLowerCase());
        if (!applicablePlans.includes('all') && !applicablePlans.includes(planId.toLowerCase())) {
            return { valid: false, discount: 0, message: 'Promo code not valid for this plan' };
        }

        const plan = PLANS[planId.toLowerCase()];
        let discount = 0;

        if (promo.type === 'percentage') {
            discount = Math.round((plan.price * promo.value) / 100);
        } else {
            discount = promo.value;
        }

        return {
            valid: true,
            discount,
            promoId: promo.id,
            message: `Promo applied! You save ₹${discount}`
        };
    } catch (error) {
        console.error('Promo validation error:', error);
        return { valid: false, discount: 0, message: 'Error validating promo code' };
    }
};

/**
 * Create a new payment order
 */
exports.createOrder = async (req, res) => {
    try {
        const { planId, promoCode } = req.body;
        const schoolId = req.schoolId;
        const userEmail = req.userEmail;

        // Validate plan
        const plan = PLANS[planId?.toLowerCase()];
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        // Get school details
        const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single();

        if (schoolError || !school) {
            return res.status(404).json({
                success: false,
                message: 'School not found'
            });
        }

        // Validate promo code
        const promoResult = await validatePromoCode(promoCode, planId);
        const discount = promoResult.valid ? promoResult.discount : 0;
        const finalAmount = Math.max(plan.price - discount, 1);

        // Generate unique order ID
        const orderId = `SD_${schoolId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // Initialize Cashfree
        initCashfree();

        // Create order request
        const orderRequest = {
            order_id: orderId,
            order_amount: finalAmount,
            order_currency: 'INR',
            customer_details: {
                customer_id: `school_${schoolId}`,
                customer_name: school.school_name || 'School Admin',
                customer_email: school.email || userEmail,
                customer_phone: school.contact_phone || '9999999999'
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify?order_id=${orderId}`,
                notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/webhook`
            },
            order_note: `${plan.name} subscription for ${school.school_name}`
        };

        // Create order via Cashfree API
        const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);

        if (!response?.data?.payment_session_id) {
            console.error('Cashfree order creation failed:', response);
            return res.status(500).json({
                success: false,
                message: 'Failed to create payment order'
            });
        }

        // Store order in database
        await supabase
            .from('payments')
            .insert({
                school_id: schoolId,
                plan_id: planId,
                amount: finalAmount,
                payment_code: orderId,
                cashfree_order_id: orderId,
                status: 'pending'
            });

        // If promo code was used, increment usage
        if (promoResult.valid && promoResult.promoId) {
            await supabase
                .from('promo_codes')
                .update({ current_usage: (await supabase.from('promo_codes').select('current_usage').eq('id', promoResult.promoId).single()).data?.current_usage + 1 || 1 })
                .eq('id', promoResult.promoId);
        }

        res.json({
            success: true,
            orderId: orderId,
            paymentSessionId: response.data.payment_session_id,
            orderAmount: finalAmount,
            originalAmount: plan.price,
            discount: discount,
            planName: plan.name,
            promoMessage: promoResult.message
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Verify payment status
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const schoolId = req.schoolId;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Get payment record from database
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_code', orderId)
            .eq('school_id', schoolId)
            .single();

        if (paymentError || !payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // If already verified, return cached result
        if (payment.status === 'verified') {
            return res.json({
                success: true,
                status: 'PAID',
                message: 'Payment already verified',
                planId: payment.plan_id
            });
        }

        // Initialize Cashfree and verify order status
        initCashfree();

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        if (!response?.data || response.data.length === 0) {
            return res.json({
                success: false,
                status: 'PENDING',
                message: 'Payment not yet completed'
            });
        }

        // Find successful payment
        const successfulPayment = response.data.find(p => p.payment_status === 'SUCCESS');

        if (successfulPayment) {
            const plan = PLANS[payment.plan_id.toLowerCase()];
            if (!plan) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid plan in payment record'
                });
            }

            // Calculate new expiry date
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);
            const expiryDateStr = expiryDate.toISOString().split('T')[0];

            // Update payment status
            await supabase
                .from('payments')
                .update({
                    status: 'verified',
                    transaction_id: successfulPayment.cf_payment_id,
                    verified_at: new Date().toISOString()
                })
                .eq('payment_code', orderId);

            // Update school plan
            await supabase
                .from('schools')
                .update({
                    plan_type: payment.plan_id,
                    plan_expiry_date: expiryDateStr,
                    max_students: plan.max_students,
                    max_classes: plan.max_classes
                })
                .eq('id', schoolId);

            // Log the activity
            await supabase
                .from('activity_logs')
                .insert({
                    actor_type: 'school_admin',
                    actor_id: schoolId,
                    action_type: 'PAYMENT',
                    description: `Upgraded to ${plan.name} - ₹${payment.amount}`,
                    target_type: 'payment',
                    target_id: payment.id
                });

            return res.json({
                success: true,
                status: 'PAID',
                message: 'Payment verified successfully!',
                planId: payment.plan_id,
                planName: plan.name,
                expiryDate: expiryDateStr,
                transactionId: successfulPayment.cf_payment_id
            });
        }

        // Check for failed payment
        const failedPayment = response.data.find(p =>
            p.payment_status === 'FAILED' || p.payment_status === 'CANCELLED'
        );

        if (failedPayment) {
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('payment_code', orderId);

            return res.json({
                success: false,
                status: 'FAILED',
                message: failedPayment.payment_message || 'Payment failed'
            });
        }

        return res.json({
            success: false,
            status: 'PENDING',
            message: 'Payment is still being processed'
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Webhook handler for Cashfree notifications
 */
exports.handleWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        console.log('Cashfree Webhook received:', JSON.stringify(webhookData, null, 2));

        if (webhookData.data?.order?.order_id) {
            const orderId = webhookData.data.order.order_id;
            const paymentStatus = webhookData.data.payment?.payment_status;

            if (paymentStatus === 'SUCCESS') {
                const { data: payment } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('payment_code', orderId)
                    .single();

                if (payment && payment.status !== 'verified') {
                    const plan = PLANS[payment.plan_id.toLowerCase()];

                    if (plan) {
                        const expiryDate = new Date();
                        expiryDate.setDate(expiryDate.getDate() + plan.duration_days);
                        const expiryDateStr = expiryDate.toISOString().split('T')[0];

                        await supabase
                            .from('payments')
                            .update({
                                status: 'verified',
                                transaction_id: webhookData.data.payment?.cf_payment_id,
                                verified_at: new Date().toISOString()
                            })
                            .eq('payment_code', orderId);

                        await supabase
                            .from('schools')
                            .update({
                                plan_type: payment.plan_id,
                                plan_expiry_date: expiryDateStr,
                                max_students: plan.max_students,
                                max_classes: plan.max_classes
                            })
                            .eq('id', payment.school_id);

                        console.log(`Payment verified via webhook for order: ${orderId}`);
                    }
                }
            }
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook handling error:', error);
        res.status(200).json({ received: true, error: 'Processing error' });
    }
};

/**
 * Get available plans
 */
exports.getPlans = (req, res) => {
    const plans = Object.entries(PLANS).map(([id, plan]) => ({
        id,
        ...plan,
        priceFormatted: `₹${plan.price}/mo`
    }));

    res.json({
        success: true,
        plans
    });
};

/**
 * Validate promo code endpoint
 */
exports.validatePromo = async (req, res) => {
    try {
        const { promoCode, planId } = req.body;

        if (!promoCode || !planId) {
            return res.status(400).json({
                success: false,
                message: 'Promo code and plan ID are required'
            });
        }

        const result = await validatePromoCode(promoCode, planId);

        res.json({
            success: result.valid,
            discount: result.discount,
            message: result.message
        });

    } catch (error) {
        console.error('Validate promo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate promo code'
        });
    }
};
