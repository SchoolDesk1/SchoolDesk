const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let schoolToken = '';
let schoolId = '';

async function testMobileAPIs() {
    console.log('📱 Starting Mobile API Verification...');

    try {
        // 1. Test School Login (Critical for App)
        console.log('\n1. Testing School Login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login-school`, {
            email: 'greenvalley@school.com',
            password: 'School@123'
        });

        if (loginRes.status === 200 && loginRes.data.accessToken) {
            console.log('✅ School Login Successful');
            schoolToken = loginRes.data.accessToken;
            schoolId = loginRes.data.id;
        } else {
            throw new Error('Login failed');
        }

        const headers = { Authorization: `Bearer ${schoolToken}` };

        // 2. Test Fetch Classes (For Dropdowns)
        console.log('\n2. Testing Fetch Classes...');
        const classesRes = await axios.get(`${BASE_URL}/school/classes`, { headers });
        console.log(`✅ Fetched ${classesRes.data.length} classes`);

        // 3. Test Fetch Students (For Student List)
        console.log('\n3. Testing Fetch Students...');
        const studentsRes = await axios.get(`${BASE_URL}/school/users?role=parent`, { headers });
        console.log(`✅ Fetched ${studentsRes.data.length} students`);

        // 4. Test Fetch Notices (For Notice Board)
        console.log('\n4. Testing Fetch Notices...');
        const noticesRes = await axios.get(`${BASE_URL}/school/notices`, { headers });
        console.log(`✅ Fetched ${noticesRes.data.length} notices`);

        // 5. Test Fetch Fees (For Fee Table)
        console.log('\n5. Testing Fetch Fees...');
        const feesRes = await axios.get(`${BASE_URL}/school/fees/list`, { headers });
        console.log(`✅ Fetched ${feesRes.data.length} fee records`);

        console.log('\n✨ ALL MOBILE API ENDPOINTS VERIFIED & READY! ✨');
        console.log('The backend is fully prepared for the Android App integration.');

    } catch (error) {
        console.error('❌ API Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testMobileAPIs();
