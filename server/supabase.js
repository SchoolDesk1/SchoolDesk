const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY is missing.');
    console.error('Server will start, but database operations will fail.');

    // Create a mock client that throws errors when used
    supabase = {
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ error: { message: 'Database not configured' } }) }) }),
            insert: async () => ({ error: { message: 'Database not configured' } }),
            update: async () => ({ error: { message: 'Database not configured' } }),
            delete: async () => ({ error: { message: 'Database not configured' } }),
        }),
        auth: {
            signUp: async () => ({ error: { message: 'Database not configured' } }),
            signInWithPassword: async () => ({ error: { message: 'Database not configured' } }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ error: { message: 'Database not configured' } }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        }
    };
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Connected to Supabase PostgreSQL database.');
}

module.exports = supabase;
