const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase PostgreSQL database.');

module.exports = supabase;
