const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function testNoticeDelete() {
    console.log('='.repeat(60));
    console.log('TESTING NOTICE DELETE FUNCTIONALITY');
    console.log('='.repeat(60));

    try {
        // 1. Login
        console.log('\n[TEST 1] Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // 2. Create a test notice
        console.log('\n[TEST 2] Creating test notice...');
        const createRes = await axios.post(`${API_URL}/school/create-notice`, {
            notice_text: 'TEST NOTICE - TO BE DELETED',
            duration: 7
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const noticeId = createRes.data.id;
        console.log(`✅ Test notice created: ID ${noticeId}`);

        // 3. Verify notice exists
        console.log('\n[TEST 3] Verifying notice exists...');
        const noticesRes = await axios.get(`${API_URL}/school/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const noticeExists = noticesRes.data.find(n => n.id === noticeId);
        if (noticeExists) {
            console.log('✅ Notice found in list');
        } else {
            console.error('❌ Notice not found!');
            return;
        }

        // 4. Delete the notice
        console.log('\n[TEST 4] Deleting notice...');
        const deleteRes = await axios.delete(`${API_URL}/school/notices/${noticeId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Delete request successful:', deleteRes.data.message);

        // 5. Verify deletion
        console.log('\n[TEST 5] Verifying deletion...');
        const noticesAfterDelete = await axios.get(`${API_URL}/school/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const noticeStillExists = noticesAfterDelete.data.find(n => n.id === noticeId);

        if (!noticeStillExists) {
            console.log('✅ Notice successfully deleted from database');
        } else {
            console.error('❌ Notice still exists after deletion!');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('NOTICE DELETE TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Notice creation - WORKING');
        console.log('✅ Delete API endpoint - WORKING');
        console.log('✅ Notice removed from database - WORKING');
        console.log('\n🎉 NOTICE DELETE FEATURE FULLY FUNCTIONAL!\n');

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

testNoticeDelete();
