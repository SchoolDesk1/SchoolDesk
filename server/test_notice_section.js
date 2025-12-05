const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testNoticeSection() {
    console.log('='.repeat(70));
    console.log('TESTING NOTICE SECTION');
    console.log('='.repeat(70));

    try {
        // Login
        console.log('\n[TEST 1] Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: 'greenvalley@school.com',
            password: 'School@123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // Test 2: Create Notice
        console.log('\n[TEST 2] Creating a notice...');
        try {
            const createRes = await axios.post(`${API_URL}/school/create-notice`, {
                notice_text: 'Test Notice - ' + new Date().toLocaleString(),
                class_id: null,  // School-wide
                duration: 30
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Notice created:', createRes.data);
        } catch (err) {
            console.error('❌ Notice creation failed:', err.response?.data || err.message);
        }

        // Test 3: Get Notices
        console.log('\n[TEST 3] Fetching notices...');
        try {
            const noticesRes = await axios.get(`${API_URL}/school/notices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Retrieved ${noticesRes.data.length} notices`);
            if (noticesRes.data.length > 0) {
                console.log('First notice:', noticesRes.data[0]);
            }
        } catch (err) {
            console.error('❌ Fetching notices failed:', err.response?.data || err.message);
        }

        // Test 4: Delete Notice
        console.log('\n[TEST 4] Testing notice delete...');
        try {
            // Create one to delete
            const createRes = await axios.post(`${API_URL}/school/create-notice`, {
                notice_text: 'DELETE TEST NOTICE',
                class_id: null,
                duration: 7
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const noticeId = createRes.data.id;
            console.log(`Created notice ID ${noticeId} for deletion test`);

            // Delete it
            const deleteRes = await axios.delete(`${API_URL}/school/notices/${noticeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Notice deleted:', deleteRes.data.message);
        } catch (err) {
            console.error('❌ Notice delete failed:', err.response?.data || err.message);
        }

        console.log('\n' + '='.repeat(70));
        console.log('NOTICE SECTION TEST COMPLETE');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Error:', error.response?.data || error.message);
    }
}

testNoticeSection();
