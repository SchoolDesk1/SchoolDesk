const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function quickTest() {
    console.log('Testing Super Admin Analytics Endpoints...\n');

    try {
        // Login
        const loginRes = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful\n');

        // Test platform analytics
        console.log('Testing GET /super-admin/analytics/platform');
        const analytics = await axios.get(`${API_URL}/super-admin/analytics/platform`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Platform Analytics:', analytics.data);
        console.log('');

        // Test schools list
        console.log('Testing GET /super-admin/schools');
        const schools = await axios.get(`${API_URL}/super-admin/schools`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${schools.data.length} schools`);
        console.log('');

        if (schools.data[0]) {
            // Test school details
            console.log(`Testing GET /super-admin/analytics/schools/${schools.data[0].id}`);
            const details = await axios.get(`${API_URL}/super-admin/analytics/schools/${schools.data[0].id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ School Details:', details.data);
            console.log('');
        }

        // Test users
        console.log('Testing GET /super-admin/users/all');
        const users = await axios.get(`${API_URL}/super-admin/users/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Users: ${users.data.totalTeachers} teachers, ${users.data.totalParents} parents`);
        console.log('');

        // Test content
        console.log('Testing GET /super-admin/content/homework');
        const homework = await axios.get(`${API_URL}/super-admin/content/homework`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${homework.data.length} homework assignments`);
        console.log('');

        console.log('Testing GET /super-admin/content/notices');
        const notices = await axios.get(`${API_URL}/super-admin/content/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${notices.data.length} notices`);
        console.log('');

        console.log('🎉 ALL ENDPOINTS WORKING!\n');
        console.log('Next: Go to http://localhost:5173/admin-secret-login');
        console.log('Login: admin@example.com / password123');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

quickTest();
