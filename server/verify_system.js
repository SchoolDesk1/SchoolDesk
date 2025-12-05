#!/usr/bin/env node
/**
 * SchoolDesk Pre-Launch Verification Script
 * Run this before deployment to ensure everything works
 */

const db = require('./database');
const fs = require('fs');
const path = require('path');

console.log('🚀 SchoolDesk Pre-Launch Verification\n');
console.log('='.repeat(50));

let errors = [];
let warnings = [];
let passed = [];

// 1. Check Database
console.log('\n📊 Checking Database...');
const tables = [
    'super_admin',
    'schools',
    'classes',
    'users',
    'homework',
    'notices',
    'fees',
    'payments',
    'analytics',
    'support_tickets'
];

tables.forEach(table => {
    db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, result) => {
        if (err) {
            errors.push(`❌ Table '${table}' error: ${err.message}`);
        } else {
            passed.push(`✅ Table '${table}': ${result.count} records`);
        }
    });
});

// 2. Check uploads directory
console.log('\n📁 Checking File System...');
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
    passed.push('✅ Uploads directory exists');
} else {
    errors.push('❌ Uploads directory missing');
}

// 3. Check environment variables
console.log('\n🔐 Checking Environment...');
const requiredEnv = ['JWT_SECRET'];
requiredEnv.forEach(envVar => {
    if (process.env[envVar]) {
        passed.push(`✅ ${envVar} is set`);
    } else {
        warnings.push(`⚠️  ${envVar} not set (using default)`);
    }
});

// 4. Verify critical routes exist
console.log('\n🛣️  Checking Routes...');
const routes = [
    './routes/auth.js',
    './routes/school.js',
    './routes/teacher.js',
    './routes/parent.js',
    './routes/superAdmin.js'
];

routes.forEach(route => {
    if (fs.existsSync(path.join(__dirname, route))) {
        passed.push(`✅ Route file: ${route}`);
    } else {
        errors.push(`❌ Missing route: ${route}`);
    }
});

// 5. Verify controllers
console.log('\n🎮 Checking Controllers...');
const controllers = [
    './controllers/authController.js',
    './controllers/schoolController.js',
    './controllers/teacherController.js',
    './controllers/parentController.js',
    './controllers/paymentController.js'
];

controllers.forEach(controller => {
    if (fs.existsSync(path.join(__dirname, controller))) {
        passed.push(`✅ Controller: ${controller}`);
    } else {
        errors.push(`❌ Missing controller: ${controller}`);
    }
});

// Wait for async operations
setTimeout(() => {
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 VERIFICATION RESULTS:\n');

    if (errors.length > 0) {
        console.log('❌ ERRORS FOUND:');
        errors.forEach(err => console.log('  ' + err));
        console.log('');
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        warnings.forEach(warn => console.log('  ' + warn));
        console.log('');
    }

    console.log('✅ PASSED CHECKS:');
    passed.forEach(pass => console.log('  ' + pass));

    console.log('\n' + '='.repeat(50));

    if (errors.length === 0) {
        console.log('\n🎉 ALL CRITICAL CHECKS PASSED!');
        console.log('✅ System is ready for launch!\n');
        process.exit(0);
    } else {
        console.log('\n❌ CRITICAL ERRORS FOUND!');
        console.log('⚠️  Please fix errors before launching.\n');
        process.exit(1);
    }

    db.close();
}, 2000);
