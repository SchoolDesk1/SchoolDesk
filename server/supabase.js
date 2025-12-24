const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing.');
    throw new Error('Missing Supabase environment variables');
}
supabase = createClient(supabaseUrl, supabaseKey);
console.log('Connected to Supabase PostgreSQL database.');


module.exports = supabase;
