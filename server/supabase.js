const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing.');
    throw new Error('Missing Supabase environment variables');
}
supabase = createClient(supabaseUrl, supabaseKey);
console.log('Connected to Supabase PostgreSQL database.');


module.exports = supabase;
