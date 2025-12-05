/**
 * Batch Processing Utilities
 * Efficiently handles multiple similar operations
 */

class BatchProcessor {
    constructor() {
        this.batches = new Map(); // key -> {items: [], timer: timeout}
        this.defaultBatchSize = 10;
        this.defaultWaitTime = 100; // ms to wait before processing batch
        this.metrics = {
            batchesProcessed: 0,
            itemsProcessed: 0,
            avgBatchSize: 0
        };
    }

    /**
     * Add item to batch queue
     * @param {string} batchKey - Unique identifier for batch type
     * @param {*} item - Item to add to batch
     * @param {Function} processor - Function to process entire batch
     * @param {Object} options - Batch configuration
     */
    addToBatch(batchKey, item, processor, options = {}) {
        const maxSize = options.maxSize || this.defaultBatchSize;
        const waitTime = options.waitTime || this.defaultWaitTime;

        // Initialize batch if it doesn't exist
        if (!this.batches.has(batchKey)) {
            this.batches.set(batchKey, {
                items: [],
                processor,
                options,
                timer: null
            });
        }

        const batch = this.batches.get(batchKey);
        batch.items.push(item);

        // Clear existing timer
        if (batch.timer) {
            clearTimeout(batch.timer);
        }

        // Process immediately if batch is full
        if (batch.items.length >= maxSize) {
            this.processBatch(batchKey);
        } else {
            // Set timer to process batch after wait time
            batch.timer = setTimeout(() => {
                this.processBatch(batchKey);
            }, waitTime);
        }
    }

    /**
     * Process a batch
     */
    async processBatch(batchKey) {
        const batch = this.batches.get(batchKey);
        if (!batch || batch.items.length === 0) return;

        const items = [...batch.items];
        batch.items = []; // Clear batch

        if (batch.timer) {
            clearTimeout(batch.timer);
            batch.timer = null;
        }

        try {
            console.log(`🔄 Processing batch: ${batchKey} (${items.length} items)`);
            await batch.processor(items);

            this.metrics.batchesProcessed++;
            this.metrics.itemsProcessed += items.length;
            this.metrics.avgBatchSize =
                this.metrics.itemsProcessed / this.metrics.batchesProcessed;

            console.log(`✓ Batch processed: ${batchKey}`);
        } catch (error) {
            console.error(`✗ Batch processing failed: ${batchKey}`, error.message);
            // Optionally re-queue items or handle errors
        }
    }

    /**
     * Force process all pending batches
     */
    async flushAll() {
        const batchKeys = Array.from(this.batches.keys());
        await Promise.all(batchKeys.map(key => this.processBatch(key)));
    }

    getStats() {
        return {
            ...this.metrics,
            avgBatchSize: this.metrics.avgBatchSize.toFixed(2),
            pendingBatches: this.batches.size,
            pendingItems: Array.from(this.batches.values())
                .reduce((sum, batch) => sum + batch.items.length, 0)
        };
    }
}

// Singleton instance
const batchProcessor = new BatchProcessor();

/**
 * Common batch operations for SchoolDesk
 */
const BatchOperations = {
    /**
     * Batch update student records
     */
    updateStudents: async (updates) => {
        const db = require('../database');

        console.log(`Batch updating ${updates.length} students`);

        const stmt = db.prepare(`
            UPDATE students 
            SET name = ?, class = ?, section = ?, father_name = ?
            WHERE id = ? AND school_id = ?
        `);

        for (const update of updates) {
            stmt.run([
                update.name,
                update.class,
                update.section,
                update.father_name,
                update.id,
                update.school_id
            ]);
        }

        stmt.finalize();
    },

    /**
     * Batch insert attendance records
     */
    insertAttendance: async (records) => {
        const db = require('../database');

        console.log(`Batch inserting ${records.length} attendance records`);

        const stmt = db.prepare(`
            INSERT INTO attendance (student_id, date, status, marked_by)
            VALUES (?, ?, ?, ?)
        `);

        for (const record of records) {
            stmt.run([
                record.student_id,
                record.date,
                record.status,
                record.marked_by
            ]);
        }

        stmt.finalize();
    },

    /**
     * Batch fetch student details
     */
    fetchStudents: async (studentIds) => {
        const db = require('../database');

        console.log(`Batch fetching ${studentIds.length} students`);

        const placeholders = studentIds.map(() => '?').join(',');
        const query = `SELECT * FROM students WHERE id IN (${placeholders})`;

        return new Promise((resolve, reject) => {
            db.all(query, studentIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    /**
     * Batch send notifications
     */
    sendNotifications: async (notifications) => {
        const { queueAsyncJob } = require('./asyncQueue');

        console.log(`Batch sending ${notifications.length} notifications`);

        // Group by type for more efficient processing
        const grouped = notifications.reduce((acc, notif) => {
            if (!acc[notif.type]) acc[notif.type] = [];
            acc[notif.type].push(notif);
            return acc;
        }, {});

        // Queue each group as async job
        for (const [type, group] of Object.entries(grouped)) {
            queueAsyncJob('sendBulkNotifications', {
                recipients: group.map(n => n.recipient),
                message: group[0].message, // Assuming same message for batch
                type
            }, { priority: 7 });
        }
    },

    /**
     * Batch log activities
     */
    logActivities: async (activities) => {
        const db = require('../database');

        console.log(`Batch logging ${activities.length} activities`);

        const stmt = db.prepare(`
            INSERT INTO activity_logs (user_id, action, details, timestamp)
            VALUES (?, ?, ?, ?)
        `);

        for (const activity of activities) {
            stmt.run([
                activity.userId,
                activity.action,
                JSON.stringify(activity.details),
                activity.timestamp || new Date().toISOString()
            ]);
        }

        stmt.finalize();
    },

    /**
     * Batch update fee statuses
     */
    updateFeeStatuses: async (updates) => {
        const db = require('../database');

        console.log(`Batch updating ${updates.length} fee records`);

        const stmt = db.prepare(`
            UPDATE fees 
            SET status = ?, paid_date = ?, amount = ?
            WHERE id = ? AND school_id = ?
        `);

        for (const update of updates) {
            stmt.run([
                update.status,
                update.paid_date,
                update.amount,
                update.id,
                update.school_id
            ]);
        }

        stmt.finalize();
    }
};

/**
 * Helper function to add to batch
 */
const addToBatch = (batchKey, item, options) => {
    const processor = BatchOperations[batchKey];
    if (!processor) {
        console.error(`Unknown batch operation: ${batchKey}`);
        return;
    }
    batchProcessor.addToBatch(batchKey, item, processor, options);
};

/**
 * Batch request aggregator for similar API calls
 */
class RequestAggregator {
    constructor() {
        this.pending = new Map();
        this.defaultWait = 50; // ms
    }

    /**
     * Aggregate similar requests and execute once
     */
    async aggregate(key, executor, wait = this.defaultWait) {
        // If already pending, wait for existing request
        if (this.pending.has(key)) {
            return this.pending.get(key);
        }

        // Create new promise for this request
        const promise = new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await executor();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.pending.delete(key);
                }
            }, wait);
        });

        this.pending.set(key, promise);
        return promise;
    }

    clear() {
        this.pending.clear();
    }
}

const requestAggregator = new RequestAggregator();

module.exports = {
    batchProcessor,
    BatchOperations,
    addToBatch,
    requestAggregator
};
