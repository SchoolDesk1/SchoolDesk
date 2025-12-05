const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function testAllDeleteFunctionality() {
    console.log('='.repeat(70));
    console.log('TESTING ALL DELETE FUNCTIONALITIES');
    console.log('='.repeat(70));

    try {
        // 1. Login as School Admin
        console.log('\n[TEST 1] Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // 2. Test Student Delete
        console.log('\n[TEST 2] Testing Student Delete...');
        try {
            // Get students first
            const studentsRes = await axios.get(`${API_URL}/school/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const testStudent = studentsRes.data.find(u => u.role === 'parent');

            if (testStudent) {
                console.log(`Found student ID ${testStudent.id} to test delete`);
                const deleteRes = await axios.delete(`${API_URL}/school/users/${testStudent.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`✅ Student delete: ${deleteRes.data.message}`);
            } else {
                console.log('⚠️  No students found to test delete');
            }
        } catch (err) {
            console.error(`❌ Student delete failed: ${err.response?.data?.message || err.message}`);
        }

        // 3. Test Notice Delete
        console.log('\n[TEST 3] Testing Notice Delete...');
        try {
            // Create a test notice first
            const createRes = await axios.post(`${API_URL}/school/create-notice`, {
                notice_text: 'TEST DELETE NOTICE',
                duration: 7
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const noticeId = createRes.data.id;
            console.log(`Created test notice ID ${noticeId}`);

            // Try to delete it
            const deleteRes = await axios.delete(`${API_URL}/school/notices/${noticeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Notice delete: ${deleteRes.data.message}`);
        } catch (err) {
            console.error(`❌ Notice delete failed: ${err.response?.data?.message || err.message}`);
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('DELETE FUNCTIONALITY TEST COMPLETE');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testAllDeleteFunctionality();
