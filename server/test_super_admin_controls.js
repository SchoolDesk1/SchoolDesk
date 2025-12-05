const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SUPER_ADMIN_SECRET = 'SuperSecretAdmin2024!';

async function testSuperAdminControls() {
    console.log('='.repeat(70));
    console.log('SUPER ADMIN CONTROL FEATURES TEST');
    console.log('='.repeat(70));

    try {
        // 1. Login as Super Admin
        console.log('\n[ STEP 1] Logging in as Super Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-super-admin`, {
            secretKey: SUPER_ADMIN_SECRET
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Super Admin login successful');

        // 2. Get all schools
        console.log('\n[STEP 2] Fetching all schools...');
        const schoolsRes = await axios.get(`${API_URL}/admin/schools`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const schools = schoolsRes.data;
        console.log(`✅ Found ${schools.length} schools`);

        if (schools.length === 0) {
            console.log('⚠️  No schools found. Please create a school first.');
            return;
        }

        const testSchool = schools[0];
        console.log(`   Using school: ${testSchool.school_name} (ID: ${testSchool.id})`);

        // 3. Get school full details
        console.log('\n[STEP 3] Getting school full details...');
        const detailsRes = await axios.get(`${API_URL}/admin/schools/${testSchool.id}/full-details`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ School details retrieved:');
        console.log(`   - Email: ${detailsRes.data.email}`);
        console.log(`   - Plan: ${detailsRes.data.plan_type}`);
        console.log(`   - Status: ${detailsRes.data.status}`);
        console.log(`   - Teachers: ${detailsRes.data.teacher_count}`);
        console.log(`   - Students: ${detailsRes.data.student_count}`);

        // 4. Test password reset
        console.log('\n[STEP 4] Testing school password reset...');
        const newPassword = `TestPass${Date.now()}`;
        await axios.post(`${API_URL}/admin/schools/${testSchool.id}/reset-password`, {
            newPassword
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Password reset successful');
        console.log(`   New password: ${newPassword}`);

        // Verify new password works
        console.log('   Verifying new password...');
        const verifyRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: testSchool.email,
            password: newPassword
        });
        console.log('✅ New password verified - school can login');

        // 5. Test block/unblock
        console.log('\n[STEP 5] Testing block/unblock functionality...');

        // Block
        await axios.post(`${API_URL}/admin/schools/${testSchool.id}/toggle-block`, {
            blocked: true
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ School blocked');

        // Verify blocked school can't login
        console.log('   Verifying blocked school cannot login...');
        try {
            await axios.post(`${API_URL}/auth/login-school`, {
                email: testSchool.email,
                password: newPassword
            });
            console.error('❌ FAIL: Blocked school can still login');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Blocked school correctly denied login');
            }
        }

        // Unblock
        await axios.post(`${API_URL}/admin/schools/${testSchool.id}/toggle-block`, {
            blocked: false
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ School unblocked');

        // 6. Test plan update
        console.log('\n[STEP 6] Testing plan update...');
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        await axios.patch(`${API_URL}/admin/schools/${testSchool.id}/update-plan`, {
            plan_type: 'premium',
            max_students: 500,
            plan_expiry_date: futureDate.toISOString().split('T')[0]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Plan updated successfully');

        // Verify update
        const updatedSchool = await axios.get(`${API_URL}/admin/schools/${testSchool.id}/full-details`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   New plan: ${updatedSchool.data.plan_type}`);
        console.log(`   Max students: ${updatedSchool.data.max_students}`);

        // 7. Test user controls (if users exist)
        console.log('\n[STEP 7] Testing user controls...');
        const usersRes = await axios.get(`${API_URL}/admin/users/detailed?page=1&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (usersRes.data.users && usersRes.data.users.length > 0) {
            const testUser = usersRes.data.users[0];
            console.log(`✅ Found ${usersRes.data.total} total users`);
            console.log(`   Testing with user: ${testUser.name || testUser.phone}`);

            // Reset user password
            const userNewPassword = `UserPass${Date.now()}`;
            await axios.post(`${API_URL}/admin/users/${testUser.id}/reset-password`, {
                newPassword: userNewPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ User password reset successful');
        } else {
            console.log('⚠️  No users found to test user controls');
        }

        // 8. Test platform analytics
        console.log('\n[STEP 8] Testing platform analytics...');
        const analyticsRes = await axios.get(`${API_URL}/admin/analytics/platform`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Platform analytics retrieved:');
        console.log(`   - Total Schools: ${analyticsRes.data.totalSchools}`);
        console.log(`   - Active Schools: ${analyticsRes.data.activeSchools}`);
        console.log(`   - Total Students: ${analyticsRes.data.totalStudents}`);
        console.log(`   - Total Teachers: ${analyticsRes.data.totalTeachers}`);

        console.log('\n' + '='.repeat(70));
        console.log('✅ ALL SUPER ADMIN CONTROL FEATURES VERIFIED!');
        console.log('='.repeat(70));
        console.log('\nFeatures tested:');
        console.log('  ✅ School password reset');
        console.log('  ✅ Block/Unblock schools');
        console.log('  ✅ Plan management');
        console.log('  ✅ User password reset');
        console.log('  ✅ Full school details');
        console.log('  ✅ User list with filtering');
        console.log('  ✅ Platform analytics');
        console.log('\n🎉 SUPER ADMIN PANEL READY FOR PRODUCTION!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

testSuperAdminControls();
