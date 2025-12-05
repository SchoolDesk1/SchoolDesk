/**
 * Performance Monitoring Routes
 * Real-time system health and performance metrics
 */

const express = require('express');
const router = express.Router();

// Import performance modules
const { queue } = require('../middleware/priorityQueue');
const { asyncQueue } = require('../utils/asyncQueue');
const { batchProcessor } = require('../utils/batchProcessor');
const { loadShedder } = require('../middleware/loadShedding');

/**
 * Get overall system health
 */
router.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            percentage: ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2) + '%'
        },
        performance: {
            priorityQueue: queue.getStats(),
            asyncQueue: asyncQueue.getStats(),
            batchProcessor: batchProcessor.getStats(),
            loadShedding: loadShedder.getStatus()
        }
    };

    // Determine overall health status
    const loadSheddingActive = loadShedder.getStatus().shedding;
    const queueLoad = queue.getCurrentLoad();

    if (loadSheddingActive || queueLoad > 0.9) {
        health.status = 'degraded';
    }

    res.json(health);
});

/**
 * Get priority queue statistics
 */
router.get('/queue-stats', (req, res) => {
    res.json(queue.getStats());
});

/**
 * Get async job queue statistics
 */
router.get('/async-stats', (req, res) => {
    res.json(asyncQueue.getStats());
});

/**
 * Get batch processor statistics
 */
router.get('/batch-stats', (req, res) => {
    res.json(batchProcessor.getStats());
});

/**
 * Get load shedding status
 */
router.get('/load-status', (req, res) => {
    res.json(loadShedder.getStatus());
});

/**
 * Get comprehensive performance metrics
 */
router.get('/metrics', (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        server: {
            uptime: Math.round(process.uptime()) + ' seconds',
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid
        },
        memory: {
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
        },
        priorityQueue: queue.getStats(),
        asyncQueue: asyncQueue.getStats(),
        batchProcessor: batchProcessor.getStats(),
        loadShedding: loadShedder.getStatus()
    };

    res.json(metrics);
});

/**
 * Force flush all pending batches (admin only)
 */
router.post('/flush-batches', async (req, res) => {
    try {
        await batchProcessor.flushAll();
        res.json({
            success: true,
            message: 'All pending batches flushed'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to flush batches',
            message: error.message
        });
    }
});

/**
 * Reset performance metrics (admin only)
 */
router.post('/reset-metrics', (req, res) => {
    // Reset all metrics
    queue.metrics = { processed: 0, dropped: 0, avgResponseTime: 0 };
    asyncQueue.metrics = { completed: 0, failed: 0, pending: asyncQueue.jobs.length };
    batchProcessor.metrics = { batchesProcessed: 0, itemsProcessed: 0, avgBatchSize: 0 };
    loadShedder.metrics = {
        requestCount: 0,
        errorCount: 0,
        lastMinuteRequests: [],
        cpuUsage: 0,
        memoryUsage: 0
    };

    res.json({
        success: true,
        message: 'Performance metrics reset'
    });
});

module.exports = router;
