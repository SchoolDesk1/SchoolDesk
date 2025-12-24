import { useAuth } from '../context/AuthContext';
import PLAN_LIMITS from '../config/plans';

export const usePlanLimits = () => {
    const { user } = useAuth();

    // Default to trial if no user or plan
    const planType = user?.plan_type || 'trial';
    const currentPlan = PLAN_LIMITS[planType] || PLAN_LIMITS.trial;

    const checkAccess = (feature) => {
        // If plan is expired, access is denied (unless we want to allow read-only, but logic says strictly enforce)
        if (isExpired()) return false;

        return currentPlan.features.includes(feature);
    };

    const isLimitReached = (resourceType, currentCount) => {
        if (isExpired()) return true;

        let limit = 0;
        if (resourceType === 'classes') limit = currentPlan.max_classes;
        else if (resourceType === 'students') limit = currentPlan.max_students;
        else if (resourceType === 'teachers') limit = currentPlan.max_teachers;
        else return false; // Unknown resource

        if (limit === Infinity) return false;
        return currentCount >= limit;
    };

    const isExpired = () => {
        if (!user?.plan_expiry_date) return false; // Should not happen for valid users, but safety
        const expiry = new Date(user.plan_expiry_date);
        const now = new Date();
        return now > expiry;
    };

    const getLimit = (resourceType) => {
        if (resourceType === 'classes') return currentPlan.max_classes;
        if (resourceType === 'students') return currentPlan.max_students;
        if (resourceType === 'teachers') return currentPlan.max_teachers;
        return 0;
    };

    return {
        planType,
        planLabel: currentPlan.label,
        checkAccess,
        isLimitReached,
        isExpired,
        getLimit
    };
};
