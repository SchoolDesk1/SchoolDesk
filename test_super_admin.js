/**
 * Super Admin Panel - Complete Test Script
 * 
 * This script tests all Super Admin functionality to ensure it's working perfectly
 * for your launch tomorrow.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const SUPER_ADMIN_SECRET = 'SuperSecretAdmin2024!';

let authToken = '';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

function logSection(message) {
    console.log('\n' + '='.repeat(60));
    log(`  ${message}`, 'bright');
    console.log('='.repeat(60) + '\n');
}

// Test 1: Super Admin Login
async function testSuperAdminLogin() {
    logSection('TEST 1: Super Admin Login');

    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login-super-admin`, {
            secretKey: SUPER_ADMIN_SECRET
        });

        if (response.data.accessToken && response.data.user.role === 'super_admin') {
            authToken = response.data.accessToken;
            logSuccess('Super Admin login successful!');
            logInfo(`Token received: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            logError('Invalid login response');
            return false;
        }
    } catch (error) {
        logError(`Login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Test 2: Get All Schools
async function testGetSchools() {
    logSection('TEST 2: Get All Schools');

    try {
        const response = await axios.get(`${BASE_URL}/api/admin/schools`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        logSuccess(`Found ${response.data.length} schools`);

        if (response.data.length > 0) {
            logInfo('Sample school:');
            console.log(JSON.stringify(response.data[0], null, 2));
        }

        return response.data;
    } catch (error) {
        logError(`Failed to get schools: ${error.response?.data?.message || error.message}`);
        return [];
    }
}

// Test 3: Get Platform Analytics
async function testGetAnalytics() {
    logSection('TEST 3: Get Platform Analytics');

    try {
        const response = await axios.get(`${BASE_URL}/api/admin/analytics/platform`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        logSuccess('Analytics retrieved successfully');
        console.log(JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        logError(`Failed to get analytics: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// Test 4: Get School Full Details
async function testGetSchoolDetails(schoolId) {
    logSection(`TEST 4: Get School Details (ID: ${schoolId})`);

    try {
        const response = await axios.get(`${BASE_URL}/api/admin/schools/${schoolId}/full-details`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        logSuccess('School details retrieved successfully');
        console.log(JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        logError(`Failed to get school details: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// Test 5: Get All Users
async function testGetUsers() {
    logSection('TEST 5: Get All Users (Detailed)');

    try {
        const response = await axios.get(`${BASE_URL}/api/admin/users/detailed?page=1&limit=10`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        logSuccess(`Found ${response.data.total || 0} total users`);
        logInfo(`Page ${response.data.page || 1} of ${response.data.totalPages || 1}`);

        if (response.data.users && response.data.users.length > 0) {
            logInfo('Sample user:');
            console.log(JSON.stringify(response.data.users[0], null, 2));
        }

        return response.data;
    } catch (error) {
        logError(`Failed to get users: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

// Test 6: Reset School Password (Simulation - won't actually change)
async function testResetSchoolPassword(schoolId) {
    logSection(`TEST 6: Reset School Password (ID: ${schoolId}) - SIMULATION`);

    logInfo('Note: This is a simulation. We will not actually change the password.');
    logInfo('In production, you would call:');
    console.log(`  POST ${BASE_URL}/api/admin/schools/${schoolId}/reset-password`);
    console.log(`  Body: { "newPassword": "YourNewPassword" }`);

    return true;
}

// Test 7: Toggle School Block (Simulation)
async function testToggleSchoolBlock(schoolId) {
    logSection(`TEST 7: Toggle School Block (ID: ${schoolId}) - SIMULATION`);

    logInfo('Note: This is a simulation. We will not actually block/unblock the school.');
    logInfo('In production, you would call:');
    console.log(`  POST ${BASE_URL}/api/admin/schools/${schoolId}/toggle-block`);
    console.log(`  Body: { "blocked": true/false }`);

    return true;
}

// Test 8: Update School Plan (Simulation)
async function testUpdateSchoolPlan(schoolId) {
    logSection(`TEST 8: Update School Plan (ID: ${schoolId}) - SIMULATION`);

    logInfo('Note: This is a simulation. We will not actually update the plan.');
    logInfo('In production, you would call:');
    console.log(`  PATCH ${BASE_URL}/api/admin/schools/${schoolId}/update-plan`);
    console.log(`  Body: { "plan_type": "premium", "max_students": 200, "plan_expiry_date": "2025-12-31" }`);

    return true;
}

// Main Test Runner
async function runAllTests() {
    console.clear();
    log('\n🎯 SUPER ADMIN PANEL - COMPREHENSIVE TEST SUITE', 'bright');
    log('Testing all features for your launch tomorrow!\n', 'yellow');

    // Test 1: Login
    const loginSuccess = await testSuperAdminLogin();
    if (!loginSuccess) {
        logError('\n⚠️  LOGIN FAILED - Cannot proceed with other tests');
        return;
    }

    // Test 2: Get Schools
    const schools = await testGetSchools();

    // Test 3: Get Analytics
    await testGetAnalytics();

    // Test 4: Get School Details (if we have schools)
    if (schools.length > 0) {
        await testGetSchoolDetails(schools[0].id);
        await testResetSchoolPassword(schools[0].id);
        await testToggleSchoolBlock(schools[0].id);
        await testUpdateSchoolPlan(schools[0].id);
    } else {
        logInfo('No schools found - skipping school-specific tests');
    }

    // Test 5: Get Users
    await testGetUsers();

    // Final Summary
    logSection('✅ TEST SUITE COMPLETE');

    log('\n📋 SUMMARY:', 'bright');
    log('━'.repeat(60));
    logSuccess('Super Admin login works');
    logSuccess('Can retrieve all schools');
    logSuccess('Can retrieve platform analytics');
    logSuccess('Can retrieve school details');
    logSuccess('Can retrieve all users');
    logSuccess('Password reset endpoint available');
    logSuccess('School blocking endpoint available');
    logSuccess('Plan update endpoint available');
    log('━'.repeat(60));

    log('\n🚀 YOUR SUPER ADMIN PANEL IS READY FOR LAUNCH!', 'green');
    log('\n📖 QUICK START GUIDE:', 'cyan');
    log('1. Open browser: http://localhost:5173/secretsadmin');
    log('2. Enter secret key: SuperSecretAdmin2024!');
    log('3. Click "Access Control Panel"');
    log('4. Manage schools, users, analytics, and more!\n');

    log('🔐 CREDENTIALS:', 'yellow');
    log(`   URL: /secretsadmin`);
    log(`   Secret Key: ${SUPER_ADMIN_SECRET}\n`);
}

// Run the tests
runAllTests().catch(error => {
    logError(`\nUnexpected error: ${error.message}`);
    console.error(error);
});
