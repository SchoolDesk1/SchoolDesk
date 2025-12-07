// backend/diagnostic.js
// Run this to check if your backend is configured correctly
// Usage: node diagnostic.js

require('dotenv').config();

console.log('🔍 SchoolDesk Backend Diagnostic\n');

// Check 1: Environment Variables
console.log('1️⃣ Environment Variables:');
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY', // Changed from SUPABASE_SERVICE_ROLE_KEY to match user's .env
    'JWT_SECRET',
    'PORT'
];

let envVarsPassed = true;
requiredEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    console.log(`   ${exists ? '✅' : '❌'} ${varName}: ${exists ? 'SET' : 'MISSING'}`);
    if (!exists) envVarsPassed = false;
});

// Relaxed check for local testing if needed
// if (!envVarsPassed) {
//   console.log('\n❌ Missing environment variables! Fix this first.\n');
//   process.exit(1);
// }

// Check 2: Supabase Connection
console.log('\n2️⃣ Supabase Connection:');
(async () => {
    try {
        const { createClient } = require('@supabase/supabase-js');
        // Using SUPABASE_KEY to match standard setup
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );

        // Try to query schools table
        const { data, error } = await supabase
            .from('schools')
            .select('id')
            .limit(1);

        if (error) {
            console.log(`   ❌ Supabase query failed: ${error.message}`);
            console.log('   → Check if "schools" table exists in Supabase');
        } else {
            console.log('   ✅ Supabase connection successful');
            console.log(`   → Found ${data ? data.length : 0} school(s) in database`);
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }

    // Check 3: Dependencies
    console.log('\n3️⃣ Required Packages:');
    const requiredPackages = [
        'express',
        'cors',
        'bcryptjs',
        'jsonwebtoken',
        '@supabase/supabase-js'
    ];

    requiredPackages.forEach(pkg => {
        try {
            require.resolve(pkg);
            console.log(`   ✅ ${pkg}`);
        } catch {
            console.log(`   ❌ ${pkg} - NOT INSTALLED`);
            console.log(`      Run: npm install ${pkg}`);
        }
    });

    // Check 4: Server File Structure
    console.log('\n4️⃣ Recommended File Structure:');
    const fs = require('fs');
    const path = require('path');

    const checkFile = (filepath) => {
        const exists = fs.existsSync(path.join(__dirname, filepath));
        console.log(`   ${exists ? '✅' : '⚠️'}  ${filepath}`);
        return exists;
    };

    checkFile('index.js');
    checkFile('routes/auth.js');
    checkFile('supabase.js');
    checkFile('package.json');

    // Check 5: JWT Secret Strength
    console.log('\n5️⃣ JWT Secret:');
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
        console.log('   ⚠️  JWT_SECRET is too short (less than 32 characters)');
        console.log('   → Recommended: Use at least 32 characters');
    } else if (jwtSecret) {
        console.log('   ✅ JWT_SECRET length is adequate');
    } else {
        console.log('   ❌ JWT_SECRET is MISSING');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('   If all checks passed, your backend configuration is correct.');
    console.log('   If signup/login still fails, the issue is likely:');
    console.log('   → CORS configuration (check allowed origins)');
    console.log('   → Route not registered in Express app');
    console.log('   → Frontend using wrong API URL');
    console.log('\n   Next steps:');
    console.log('   1. Check Render deployment logs during failed request');
    console.log('   2. Test with Postman: POST /api/auth/register-school');
    console.log('   3. Verify CORS allows your production domain\n');

})();
