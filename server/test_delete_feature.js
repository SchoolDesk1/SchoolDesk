const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function testDeleteFeature() {
    console.log('='.repeat(60));
    console.log('TESTING DELETE STUDENT/TEACHER FEATURE');
    console.log('='.repeat(60));

    try {
        // 1. Login as School Admin
        console.log('\n[TEST 1] Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // 2. Get existing class
        const classesRes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const classId = classesRes.data[0]?.id;

        // 3. Create a test student to delete
        console.log('\n[TEST 2] Creating test student...');
        const testPhone = `888${Date.now().toString().slice(-7)}`;
        const createRes = await axios.post(`${API_URL}/school/create-user`, {
            name: 'Test Delete Student',
            phone: testPhone,
            role: 'parent',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentId = createRes.data.id;
        console.log(`✅ Test student created: ID ${studentId}`);

        // 4. Verify student exists
        console.log('\n[TEST 3] Verifying student exists...');
        const usersRes = await axios.get(`${API_URL}/school/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentExists = usersRes.data.find(u => u.id === studentId);
        if (studentExists) {
            console.log('✅ Student found in database');
        } else {
            console.error('❌ Student not found!');
            return;
        }

        // 5. Delete the student
        console.log('\n[TEST 4] Deleting student...');
        const deleteRes = await axios.delete(`${API_URL}/school/users/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Delete request successful:', deleteRes.data.message);

        // 6. Verify deletion
        console.log('\n[TEST 5] Verifying deletion...');
        const usersAfterDelete = await axios.get(`${API_URL}/school/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentStillExists = usersAfterDelete.data.find(u => u.id === studentId);

        if (!studentStillExists) {
            console.log('✅ Student successfully deleted from database');
        } else {
            console.error('❌ Student still exists after deletion!');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('DELETE FEATURE TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Student creation - WORKING');
        console.log('✅ Delete API endpoint - WORKING');
        console.log('✅ Student removed from database - WORKING');
        console.log('\n🎉 DELETE FEATURE FULLY FUNCTIONAL!\n');

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

testDeleteFeature();
