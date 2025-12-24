const PLAN_LIMITS = {
    trial: {
        max_classes: 2,
        max_students: 50,
        max_teachers: 5,
        features: [
            'attendance',
            'notices_basic',
            'fee_manual',
            'homework_limited'
        ],
        label: 'Trial Plan'
    },
    basic: {
        max_classes: 8,
        max_students: 300,
        max_teachers: 20,
        features: [
            'attendance',
            'notices_full',
            'fee_manual',
            'fee_gateway',
            'homework_full',
            'report_cards_basic'
        ],
        label: 'Basic Plan'
    },
    standard: {
        max_classes: 18,
        max_students: 700,
        max_teachers: 40,
        features: [
            'attendance',
            'notices_full',
            'fee_manual',
            'fee_gateway',
            'homework_full',
            'report_cards_advanced',
            'vehicles',
            'events',
            'backup_monthly',
            'branding'
        ],
        label: 'Standard Plan'
    },
    premium: {
        max_classes: Infinity,
        max_students: Infinity,
        max_teachers: Infinity,
        features: [
            'attendance',
            'notices_full',
            'fee_manual',
            'fee_gateway',
            'homework_full',
            'report_cards_advanced',
            'vehicles',
            'events',
            'backup_unlimited',
            'branding',
            'priority_support',
            'account_manager'
        ],
        label: 'Premium Plan'
    }
};

export default PLAN_LIMITS;
