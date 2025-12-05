const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testTeacherFeatures() {
    console.log('='.repeat(60));
    console.log('TESTING TEACHER HOMEWORK & NOTICE FEATURES');
    console.log('='.repeat(60));

    try {
        // 1. Login as Teacher
        console.log('\n[TEST 1] Logging in as Teacher...');
        const loginRes = await axios.post(`${API_URL}/auth/login-user`, {
            phone: '9876543210',  // From seed data
            class_password: 'C1ABC123'
        });
        const token = loginRes.data.accessToken;
        console.log('✅ Teacher login successful');

        // 2. Post Notice
        console.log('\n[TEST 2] Posting class notice...');
        const noticeRes = await axios.post(`${API_URL}/teacher/upload-notice`, {
            notice_text: 'TEST NOTICE: Tomorrow\'s homework - Complete Chapter 5 exercises 1-10'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Notice posted successfully');

        // 3. Get Notice List
        console.log('\n[TEST 3] Fetching notice list...');
        const noticesRes = await axios.get(`${API_URL}/teacher/notice-list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${noticesRes.data.length} notices`);
        if (noticesRes.data.length > 0) {
            console.log('   Latest notice:', noticesRes.data[0].notice_text.substring(0, 50) + '...');
        }

        // 4. Post Homework (without file for simplicity)
        console.log('\n[TEST 4] Uploading homework assignment...');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('title', 'Test Homework Assignment');
        form.append('description', 'Complete exercises from Chapter 5, pages 45-50');

        const hwRes = await axios.post(`${API_URL}/teacher/upload-homework`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Homework uploaded successfully');

        // 5. Get Homework List
        console.log('\n[TEST 5] Fetching homework list...');
        const hwListRes = await axios.get(`${API_URL}/teacher/homework-list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${hwListRes.data.length} homework assignments`);
        if (hwListRes.data.length > 0) {
            console.log('   Latest homework:', hwListRes.data[0].title);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('TEACHER FEATURES TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Teacher login - WORKING');
        console.log('✅ Post notice - WORKING');
        console.log('✅ Fetch notices - WORKING');
        console.log('✅ Upload homework - WORKING');
        console.log('✅ Fetch homework - WORKING');
        console.log('\n🎉 ALL TEACHER FEATURES FULLY FUNCTIONAL!\n');

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

testTeacherFeatures();
