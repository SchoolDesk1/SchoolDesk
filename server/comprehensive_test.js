const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function comprehensiveTest() {
    console.log('='.repeat(80));
    console.log('COMPREHENSIVE SYSTEM TEST');
    console.log('='.repeat(80));

    let passCount = 0;
    let failCount = 0;

    // Test 1: Server Health
    console.log('\n[TEST 1/6] Server Health Check...');
    try {
        await axios.get(`${API_URL}/`);
        console.log('✅ Server is running');
        passCount++;
    } catch (err) {
        console.log('❌ Server is not running! Start with: node server/index.js');
        failCount++;
        return;
    }

    // Test 2: School Admin Login
    console.log('\n[TEST 2/6] School Admin Login...');
    let schoolToken;
    try {
        const res = await axios.post(`${API_URL}/auth/login-school`, {
            email: 'greenvalley@school.com',
            password: 'School@123'
        });
        schoolToken = res.data.accessToken;
        console.log('✅ School Admin login successful');
        passCount++;
    } catch (err) {
        console.log(`❌ School Admin login failed: ${err.response?.data?.message || err.message}`);
        failCount++;
    }

    if (!schoolToken) return;

    // Test 3: Student Create
    console.log('\n[TEST 3/6] Student Creation...');
    let studentId;
    try {
        const classes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });

        if (classes.data.length === 0) {
            console.log('⚠️  No classes found, creating one...');
            const classRes = await axios.post(`${API_URL}/school/create-class`,
                { class_name: 'Test Class' },
                { headers: { Authorization: `Bearer ${schoolToken}` } }
            );
        }

        const classesUpdated = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });

        const res = await axios.post(`${API_URL}/school/create-user`, {
            name: 'Test Student DELETE',
            phone: '9999999999',
            role: 'parent',
            class_id: classesUpdated.data[0].id
        }, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        studentId = res.data.id;
        console.log(`✅ Student created with ID: ${studentId}`);
        passCount++;
    } catch (err) {
        console.log(`❌ Student creation failed: ${err.response?.data?.message || err.message}`);
        failCount++;
    }

    // Test 4: Student Delete
    console.log('\n[TEST 4/6] Student Delete...');
    if (studentId) {
        try {
            const res = await axios.delete(`${API_URL}/school/users/${studentId}`, {
                headers: { Authorization: `Bearer ${schoolToken}` }
            });
            console.log(`✅ Student deleted: ${res.data.message}`);
            passCount++;
        } catch (err) {
            console.log(`❌ Student delete failed: ${err.response?.data?.message || err.message}`);
            failCount++;
        }
    } else {
        console.log('⏭️  Skipped (no student ID)');
    }

    // Test 5: Notice Create and Delete
    console.log('\n[TEST 5/6] Notice Create & Delete...');
    try {
        const createRes = await axios.post(`${API_URL}/school/create-notice`, {
            notice_text: 'TEST DELETE NOTICE',
            duration: 7
        }, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        const noticeId = createRes.data.id;
        console.log(`✅ Notice created with ID: ${noticeId}`);

        const deleteRes = await axios.delete(`${API_URL}/school/notices/${noticeId}`, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        console.log(`✅ Notice deleted: ${deleteRes.data.message}`);
        passCount++;
    } catch (err) {
        console.log(`❌ Notice test failed: ${err.response?.data?.message || err.message}`);
        failCount++;
    }

    // Test 6: Get All Data
    console.log('\n[TEST 6/6] Data Retrieval...');
    try {
        const [students, classes, notices] = await Promise.all([
            axios.get(`${API_URL}/school/users`, { headers: { Authorization: `Bearer ${schoolToken}` } }),
            axios.get(`${API_URL}/school/classes`, { headers: { Authorization: `Bearer ${schoolToken}` } }),
            axios.get(`${API_URL}/school/notices`, { headers: { Authorization: `Bearer ${schoolToken}` } })
        ]);
        console.log(`✅ Retrieved ${students.data.length} users, ${classes.data.length} classes, ${notices.data.length} notices`);
        passCount++;
    } catch (err) {
        console.log(`❌ Data retrieval failed: ${err.response?.data?.message || err.message}`);
        failCount++;
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ PASSED: ${passCount} tests`);
    console.log(`❌ FAILED: ${failCount} tests`);
    console.log(`📊 SUCCESS RATE: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);

    if (failCount === 0) {
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('\nNext: Test UI at http://localhost:5173');
        console.log('Login: greenvalley@school.com / School@123');
    } else {
        console.log('\n⚠️  Some tests failed. Check errors above.');
    }
    console.log('='.repeat(80) + '\n');
}

comprehensiveTest();
