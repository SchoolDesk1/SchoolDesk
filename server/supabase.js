const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://teeqllzjttnynbjjqtry.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZXFsbHpqdHRueW5iampxdHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjY4NzgsImV4cCI6MjA4MDYwMjg3OH0.NxzIDeftBvNoDWdgTkiBGixWozrWqYI339-O3IcI0Gs';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase PostgreSQL database.');

module.exports = supabase;
