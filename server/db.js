/**
 * Database Layer - Supabase PostgreSQL
 * Replaces the old SQLite database.js
 * 
 * This module provides helper functions that mimic the old SQLite API
 * to make migration easier for existing controllers.
 */

const supabase = require('./supabase');

// ============================================================
// HELPER FUNCTIONS FOR DATABASE OPERATIONS
// ============================================================

/**
 * Execute a SELECT query and get all rows
 * @param {string} table - Table name
 * @param {Object} options - Query options { select, filters, order, limit }
 * @returns {Promise<{data: Array, error: Object}>}
 */
async function dbAll(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*');

    // Apply filters
    if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        }
    }

    // Apply ordering
    if (options.order) {
        const { column, ascending = true } = options.order;
        query = query.order(column, { ascending });
    }

    // Apply limit
    if (options.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data: data || [], error };
}

/**
 * Execute a SELECT query and get a single row
 * @param {string} table - Table name
 * @param {Object} filters - Column filters { column: value }
 * @param {string} select - Columns to select
 * @returns {Promise<{data: Object, error: Object}>}
 */
async function dbGet(table, filters = {}, select = '*') {
    let query = supabase.from(table).select(select);

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    }

    const { data, error } = await query.single();
    return { data, error };
}

/**
 * Insert a new row
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<{data: Object, error: Object, lastID: number}>}
 */
async function dbInsert(table, data) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

    return {
        data: result,
        error,
        lastID: result?.id
    };
}

/**
 * Update existing rows
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {Object} filters - Which rows to update
 * @returns {Promise<{data: Object, error: Object, changes: number}>}
 */
async function dbUpdate(table, data, filters = {}) {
    let query = supabase.from(table).update(data);

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    }

    const { data: result, error, count } = await query.select();

    return {
        data: result,
        error,
        changes: result?.length || 0
    };
}

/**
 * Delete rows
 * @param {string} table - Table name
 * @param {Object} filters - Which rows to delete
 * @returns {Promise<{error: Object, changes: number}>}
 */
async function dbDelete(table, filters = {}) {
    let query = supabase.from(table).delete();

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    }

    const { data, error } = await query.select();

    return {
        error,
        changes: data?.length || 0
    };
}

/**
 * Execute raw SQL query (for complex queries with JOINs)
 * Uses Supabase's rpc function or direct query
 * @param {string} sql - SQL query (unused, for compatibility)
 * @param {Array} params - Parameters (unused, for compatibility)
 * @returns {Promise<{data: any, error: Object}>}
 */
async function dbRaw(functionName, params = {}) {
    const { data, error } = await supabase.rpc(functionName, params);
    return { data, error };
}

// Export the supabase client and helper functions
module.exports = {
    supabase,
    dbAll,
    dbGet,
    dbInsert,
    dbUpdate,
    dbDelete,
    dbRaw
};
