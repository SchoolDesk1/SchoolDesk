/**
 * Load Shedding Middleware - Simplified Version
 * Monitors but doesn't block unless severely overloaded
 */

class LoadShedder {
    constructor() {
        this.metrics = {
            requestCount: 0,
            errorCount: 0,
            lastMinuteRequests: [],
            cpuUsage: 0,
            memoryUsage: 0
        };

        this.thresholds = {
            requestsPerMinute: 5000,  // Very high threshold
            errorRate: 0.5,           // 50% error rate
            memoryPercent: 95,        // 95% memory
            cpuPercent: 95            // 95% CPU
        };

        this.shedding = false;
        this.startMonitoring();
    }

    // Start monitoring system resources
    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
            this.checkThresholds();
        }, 10000); // Check every 10 seconds
    }

    // Update system metrics
    updateMetrics() {
        // Clean old requests (older than 1 minute)
        const oneMinuteAgo = Date.now() - 60000;
        this.metrics.lastMinuteRequests = this.metrics.lastMinuteRequests
            .filter(timestamp => timestamp > oneMinuteAgo);

        // Memory usage
        const usage = process.memoryUsage();
        this.metrics.memoryUsage = (usage.heapUsed / usage.heapTotal) * 100;

        // CPU usage (simplified)
        const start = Date.now();
        setImmediate(() => {
            const lag = Date.now() - start;
            this.metrics.cpuUsage = Math.min(lag * 10, 100);
        });
    }

    // Check if thresholds are exceeded
    checkThresholds() {
        const rpm = this.metrics.lastMinuteRequests.length;
        const errorRate = this.metrics.errorCount / Math.max(this.metrics.requestCount, 1);

        const shouldShed =
            rpm > this.thresholds.requestsPerMinute ||
            errorRate > this.thresholds.errorRate ||
            this.metrics.memoryUsage > this.thresholds.memoryPercent ||
            this.metrics.cpuUsage > this.thresholds.cpuPercent;

        if (shouldShed && !this.shedding) {
            console.warn('⚠️  LOAD SHEDDING ACTIVATED');
            this.shedding = true;
        } else if (!shouldShed && this.shedding) {
            console.log('✓ Load shedding deactivated - system recovered');
            this.shedding = false;
        }
    }

    // Record request
    recordRequest(isError = false) {
        this.metrics.requestCount++;
        this.metrics.lastMinuteRequests.push(Date.now());
        if (isError) this.metrics.errorCount++;
    }

    // Check if request should be shed (very conservative)
    shouldShedRequest(priority) {
        if (!this.shedding) return false;

        // Only shed low priority under severe load
        if (priority === 'low' && this.metrics.lastMinuteRequests.length > 4000) {
            return Math.random() < 0.3; // 30% chance
        }

        return false;
    }

    // Get current status
    getStatus() {
        return {
            shedding: this.shedding,
            metrics: {
                rpm: this.metrics.lastMinuteRequests.length,
                errorRate: ((this.metrics.errorCount / Math.max(this.metrics.requestCount, 1)) * 100).toFixed(2) + '%',
                memoryUsage: this.metrics.memoryUsage.toFixed(2) + '%',
                cpuUsage: this.metrics.cpuUsage.toFixed(2) + '%'
            },
            thresholds: this.thresholds
        };
    }
}

// Singleton instance
const loadShedder = new LoadShedder();

// Middleware - simplified to not block normal requests
const loadSheddingMiddleware = (req, res, next) => {
    // Record request
    loadShedder.recordRequest();

    // Track response status
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
        if (res.statusCode >= 400) {
            loadShedder.recordRequest(true);
        }
        return originalSend.call(this, data);
    };

    res.json = function (data) {
        if (res.statusCode >= 400) {
            loadShedder.recordRequest(true);
        }
        return originalJson.call(this, data);
    };

    // Pass through - don't block
    next();
};

module.exports = {
    loadShedder,
    loadSheddingMiddleware
};
