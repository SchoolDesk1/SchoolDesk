const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testSuperAdminAnalytics() {
    console.log('='.repeat(70));
    console.log('TESTING SUPER ADMIN ANALYTICS & ENHANCED FEATURES');
    console.log('='.repeat(70));

    try {
        // 1. Login as Super Admin
        console.log('\n[TEST 1] Logging in as Super Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Super Admin login successful');

        // 2. Get Platform Analytics
        console.log('\n[TEST 2] Fetching platform-wide analytics...');
        const analyticsRes = await axios.get(`${API_URL}/super-admin/analytics/platform`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Platform Analytics:');
        console.log(`   - Total Schools: ${analyticsRes.data.totalSchools}`);
        console.log(`   - Active Schools: ${analyticsRes.data.activeSchools}`);
        console.log(`   - Total Students: ${analyticsRes.data.totalStudents}`);
        console.log(`   - Total Teachers: ${analyticsRes.data.totalTeachers}`);
        console.log(`   - Total Classes: ${analyticsRes.data.totalClasses}`);
        console.log(`   - Total Homework: ${analyticsRes.data.totalHomework}`);
        console.log(`   - Total Notices: ${analyticsRes.data.totalNotices}`);
        console.log(`   - Total Fees: ₹${analyticsRes.data.totalFees}`);

        // 3. Get Schools List
        console.log('\n[TEST 3] Fetching schools list...');
        const schoolsRes = await axios.get(`${API_URL}/super-admin/schools`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${schoolsRes.data.length} schools`);
        const firstSchool = schoolsRes.data[0];
        if (firstSchool) {
            console.log(`   First school: ${firstSchool.school_name} (ID: ${firstSchool.id})`);
        }

        // 4. Get School Details
        if (firstSchool) {
            console.log('\n[TEST 4] Fetching detailed school stats...');
            const schoolDetailsRes = await axios.get(
                `${API_URL}/super-admin/analytics/schools/${firstSchool.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('✅ School Details:');
            console.log(`   - Students: ${schoolDetailsRes.data.studentCount}`);
            console.log(`   - Teachers: ${schoolDetailsRes.data.teacherCount}`);
            console.log(`   - Classes: ${schoolDetailsRes.data.classCount}`);
            console.log(`   - Homework: ${schoolDetailsRes.data.homeworkCount}`);
            console.log(`   - Notices: ${schoolDetailsRes.data.noticeCount}`);
            console.log(`   - Fees Collected: ₹${schoolDetailsRes.data.feesCollected}`);
        }

        // 5. Get All Users
        console.log('\n[TEST 5] Fetching all users overview...');
        const usersRes = await axios.get(`${API_URL}/super-admin/users/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Users Overview:');
        console.log(`   - Total Users: ${usersRes.data.totalUsers}`);
        console.log(`   - Total Teachers: ${usersRes.data.totalTeachers}`);
        console.log(`   - Total Parents: ${usersRes.data.totalParents}`);

        // 6. Get All Homework
        console.log('\n[TEST 6] Fetching platform-wide homework...');
        const homeworkRes = await axios.get(`${API_URL}/super-admin/content/homework`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${homeworkRes.data.length} homework assignments across all schools`);

        // 7. Get All Notices
        console.log('\n[TEST 7] Fetching platform-wide notices...');
        const noticesRes = await axios.get(`${API_URL}/super-admin/content/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${noticesRes.data.length} notices across all schools`);

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('SUPER ADMIN ANALYTICS TEST SUMMARY');
        console.log('='.repeat(70));
        console.log('✅ Super Admin login - WORKING');
        console.log('✅ Platform analytics - WORKING');
        console.log('✅ Schools list - WORKING');
        console.log('✅ School detailed stats - WORKING');
        console.log('✅ Users overview - WORKING');
        console.log('✅ Content (Homework) overview - WORKING');
        console.log('✅ Content (Notices) overview - WORKING');
        console.log('\n🎉 ALL SUPER ADMIN FEATURES FULLY OPERATIONAL!\n');

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

testSuperAdminAnalytics();
