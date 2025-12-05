/**
 * Priority Queue Middleware - Simplified Version
 * Tracks priorities and metrics without blocking requests
 */

class PriorityQueue {
    constructor() {
        this.metrics = {
            processed: 0,
            dropped: 0,
            avgResponseTime: 0
        };
        this.currentLoad = 0;
        this.maxConcurrent = 1000; // High limit
    }

    getCurrentLoad() {
        return this.currentLoad / this.maxConcurrent;
    }

    shouldShedLoad() {
        return this.currentLoad >= this.maxConcurrent;
    }

    getStats() {
        return {
            currentLoad: this.currentLoad,
            loadPercentage: (this.getCurrentLoad() * 100).toFixed(2) + '%',
            isLoadShedding: this.shouldShedLoad(),
            metrics: {
                ...this.metrics,
                avgResponseTime: Math.round(this.metrics.avgResponseTime) + 'ms'
            }
        };
    }
}

// Singleton instance
const queue = new PriorityQueue();

// Middleware factory
const priorityMiddleware = (priority = 'medium') => {
    return (req, res, next) => {
        req.priority = priority;
        next();
    };
};

// Route priority configurations
const RoutePriorities = {
    // Critical - Always processed first
    CRITICAL: [
        '/api/auth/login',
        '/api/auth/register',
        '/api/payment/initiate',
        '/api/payment/verify',
        '/api/admin/block-school',
        '/api/admin/unblock-school'
    ],

    // High Priority - Core operations
    HIGH: [
        '/api/school/dashboard',
        '/api/teacher/dashboard',
        '/api/parent/dashboard',
        '/api/school/students',
        '/api/school/add-student',
        '/api/school/classes',
        '/api/teacher/attendance'
    ],

    // Medium Priority - Standard operations
    MEDIUM: [
        '/api/school/fees',
        '/api/school/notices',
        '/api/teacher/timetable',
        '/api/parent/student-details',
        '/api/school/teachers'
    ],

    // Low Priority - Analytics, logs, non-critical
    LOW: [
        '/api/admin/analytics',
        '/api/school/reports',
        '/api/admin/logs',
        '/api/partner/dashboard'
    ]
};

// Auto-priority assignment - simplified to not block requests
const autoPriority = (req, res, next) => {
    const url = req.url || req.path;

    let priority = 'medium'; // default

    // Check route priorities
    for (const [level, routes] of Object.entries(RoutePriorities)) {
        if (routes.some(route => url.includes(route))) {
            priority = level.toLowerCase();
            break;
        }
    }

    // POST/DELETE operations get higher priority
    if (req.method === 'POST' || req.method === 'DELETE') {
        if (priority === 'medium') priority = 'high';
        if (priority === 'low') priority = 'medium';
    }

    req.priority = priority;

    // Track metrics
    queue.currentLoad++;
    const startTime = Date.now();

    const originalJson = res.json;
    const originalSend = res.send;

    const trackCompletion = () => {
        queue.currentLoad--;
        queue.metrics.processed++;
        const responseTime = Date.now() - startTime;
        queue.metrics.avgResponseTime =
            (queue.metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    };

    res.json = function (...args) {
        trackCompletion();
        return originalJson.apply(res, args);
    };

    res.send = function (...args) {
        trackCompletion();
        return originalSend.apply(res, args);
    };

    // Pass through immediately - don't queue
    next();
};

module.exports = {
    priorityMiddleware,
    autoPriority,
    queue,
    RoutePriorities
};
