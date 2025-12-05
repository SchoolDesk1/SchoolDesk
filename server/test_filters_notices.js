const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Test credentials
const schoolAdmin = {
    email: 'greenvalley@school.com',
    password: 'School@123'
};

async function testNoticesAndFilters() {
    try {
        console.log('🔐 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            phone: schoolAdmin.email,
            password: schoolAdmin.password
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful!');

        // Test 1: Get all students (no filter)
        console.log('\n📚 Test 1: Get all students');
        const allStudentsRes = await axios.get(`${API_URL}/school/users?role=parent`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${allStudentsRes.data.length} students`);
        allStudentsRes.data.forEach(s => {
            console.log(`  - ${s.name} (Class: ${s.class_name}, ID: ${s.class_id})`);
        });

        // Test 2: Get all teachers (no filter)
        console.log('\n👨‍🏫 Test 2: Get all teachers');
        const allTeachersRes = await axios.get(`${API_URL}/school/users?role=teacher`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${allTeachersRes.data.length} teachers`);
        allTeachersRes.data.forEach(t => {
            console.log(`  - ${t.name} (Class: ${t.class_name}, ID: ${t.class_id})`);
        });

        // Test 3: Get students for specific class
        if (allStudentsRes.data.length > 0) {
            const firstClassId = allStudentsRes.data[0].class_id;
            console.log(`\n🔍 Test 3: Get students for class_id=${firstClassId}`);
            const filteredStudentsRes = await axios.get(`${API_URL}/school/users?role=parent&class_id=${firstClassId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Found ${filteredStudentsRes.data.length} students in this class`);
            filteredStudentsRes.data.forEach(s => {
                console.log(`  - ${s.name} (Class: ${s.class_name})`);
            });
        }

        // Test 4: Get all notices
        console.log('\n📢 Test 4: Get all notices');
        const noticesRes = await axios.get(`${API_URL}/school/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${noticesRes.data.length} notices`);
        noticesRes.data.forEach(n => {
            console.log(`  - "${n.notice_text.substring(0, 50)}..." (ID: ${n.id}, Created: ${n.created_at})`);
        });

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Wait a bit for server to start then run tests
setTimeout(() => {
    testNoticesAndFilters();
}, 2000);
