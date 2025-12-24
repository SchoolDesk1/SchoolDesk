const supabase = require('../supabase');
const PLAN_LIMITS = require('../config/plans');

const checkLimit = (resourceType) => {
    return async (req, res, next) => {
        const schoolId = req.schoolId;

        try {
            // 1. Get School's Current Plan and Expiry
            const { data: school, error } = await supabase
                .from('schools')
                .select('plan_type, plan_expiry_date, created_at')
                .eq('id', schoolId)
                .single();

            if (error || !school) {
                return res.status(500).json({ error: 'Failed to fetch school plan details' });
            }

            const { plan_type, plan_expiry_date } = school;
            const currentPlan = PLAN_LIMITS[plan_type] || PLAN_LIMITS.trial; // Fallback to trial

            // 2. Check Expiry
            const now = new Date();
            const expiryDate = new Date(plan_expiry_date);

            // For trial, double check strict 14 days from creation if expiry is missing (safety net)
            if (plan_type === 'trial' && !plan_expiry_date) {
                const created = new Date(school.created_at);
                expiryDate.setDate(created.getDate() + 14);
            }

            if (now > expiryDate) {
                return res.status(403).json({
                    message: 'Your plan has expired. Please upgrade to continue.',
                    code: 'PLAN_EXPIRED'
                });
            }

            // 3. Feature Access Check (if resourceType is a feature string like 'vehicles')
            // We distinguish "countable resources" (classes, students) from "boolean features" (vehicles, backup)
            const countableResources = ['classes', 'students', 'teachers'];

            if (!countableResources.includes(resourceType)) {
                // It's a feature check
                if (!currentPlan.features.includes(resourceType)) {
                    return res.status(403).json({
                        message: `The '${resourceType}' feature is not available in your ${currentPlan.label}. Please upgrade.`,
                        code: 'FEATURE_LOCKED'
                    });
                }
                // If it's just a feature check and not a count check, we are done
                return next();
            }

            // 4. Quantity Limit Check
            let currentCount = 0;
            let limit = 0;

            if (resourceType === 'classes') {
                limit = currentPlan.max_classes;
                if (limit === Infinity) return next();

                const { count } = await supabase
                    .from('classes')
                    .select('*', { count: 'exact', head: true })
                    .eq('school_id', schoolId);
                currentCount = count;

            } else if (resourceType === 'students') {
                limit = currentPlan.max_students;
                if (limit === Infinity) return next();

                const { count } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('role', 'parent'); // Students exist as parents/users
                currentCount = count;

            } else if (resourceType === 'teachers') {
                limit = currentPlan.max_teachers;
                if (limit === Infinity) return next();

                const { count } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('role', 'teacher');
                currentCount = count;
            }

            if (currentCount >= limit) {
                return res.status(403).json({
                    message: `You have reached the ${resourceType} limit (${limit}) for your ${currentPlan.label}. Please upgrade.`,
                    code: 'LIMIT_REACHED'
                });
            }

            next();

        } catch (err) {
            console.error('Plan Limit Check Error:', err);
            res.status(500).json({ error: 'Internal Server Error during plan check' });
        }
    };
};

module.exports = checkLimit;
