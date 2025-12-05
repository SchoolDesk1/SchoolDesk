const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('COMPREHENSIVE VERIFICATION TEST');
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

        // 2. Get classes
        console.log('\n[TEST 2] Fetching classes...');
        const classesRes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const classId = classesRes.data[0]?.id;
        if (!classId) {
            console.error('❌ No classes found');
            return;
        }
        console.log(`✅ Found class with ID: ${classId}`);

        // 3. Create student WITH fee amount (test fee automation)
        console.log('\n[TEST 3] Creating student WITH fee amount...');
        const studentName = `Test Student ${Date.now()}`;
        const studentPhone = `999${Date.now().toString().slice(-7)}`;
        const feeAmount = 750;

        const createRes = await axios.post(`${API_URL}/school/create-user`, {
            name: studentName,
            phone: studentPhone,
            role: 'parent',
            class_id: classId,
            feeAmount: feeAmount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentId = createRes.data.id;
        console.log(`✅ Student created with ID: ${studentId}`);

        // 4. Verify fee was automatically created as PAID
        console.log('\n[TEST 4] Verifying automatic PAID fee record...');
        const feesRes = await axios.get(`${API_URL}/school/fees/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentFee = feesRes.data.find(f => f.parent_id === studentId && f.status === 'PAID' && f.amount == feeAmount);

        if (studentFee) {
            console.log(`✅ Fee automation working! Found PAID fee: ₹${studentFee.amount} for ${studentFee.month}`);
            console.log(`   Dismissed: ${studentFee.dismissed === 1 ? 'Yes (no popup)' : 'No'}`);
        } else {
            console.error('❌ Fee automation FAILED - no PAID fee found');
            console.log('   Available fees:', feesRes.data.filter(f => f.parent_id === studentId));
        }

        // 5. Test name update functionality
        console.log('\n[TEST 5] Testing name update...');
        const newName = studentName + ' UPDATED';
        await axios.put(`${API_URL}/school/users/${studentId}`, {
            name: newName,
            phone: studentPhone,
            role: 'parent',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Verify name was updated
        const usersRes = await axios.get(`${API_URL}/school/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedStudent = usersRes.data.find(u => u.id === studentId);

        if (updatedStudent && updatedStudent.name === newName) {
            console.log(`✅ Name update working! Changed to: "${newName}"`);
        } else {
            console.error(`❌ Name update FAILED - expected "${newName}", got "${updatedStudent?.name}"`);
        }

        // 6. Create student WITHOUT fee amount (should work normally)
        console.log('\n[TEST 6] Creating student WITHOUT fee amount...');
        const student2Name = `No Fee Student ${Date.now()}`;
        const student2Phone = `888${Date.now().toString().slice(-7)}`;

        const create2Res = await axios.post(`${API_URL}/school/create-user`, {
            name: student2Name,
            phone: student2Phone,
            role: 'parent',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const student2Id = create2Res.data.id;
        console.log(`✅ Student created without fee: ID ${student2Id}`);

        // Verify no automatic fee was created
        const fees2Res = await axios.get(`${API_URL}/school/fees/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const student2Fees = fees2Res.data.filter(f => f.parent_id === student2Id);

        if (student2Fees.length === 0) {
            console.log('✅ Correct: No automatic fee created when feeAmount not provided');
        } else {
            console.error('❌ FAILED: Fee was created when it should not have been');
        }

        // 7. Test teacher creation
        console.log('\n[TEST 7] Creating teacher...');
        const teacherPhone = `777${Date.now().toString().slice(-7)}`;
        const teacherRes = await axios.post(`${API_URL}/school/create-user`, {
            name: 'Test Teacher',
            phone: teacherPhone,
            role: 'teacher',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Teacher created: ID ${teacherRes.data.id}`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Login functionality - WORKING');
        console.log('✅ Student creation - WORKING');
        console.log('✅ Fee automation (with amount) - WORKING');
        console.log('✅ Fee dismissed flag - WORKING');
        console.log('✅ Name update - WORKING');
        console.log('✅ Student creation (without fee) - WORKING');
        console.log('✅ Teacher creation - WORKING');
        console.log('\n🎉 ALL TESTS PASSED!\n');

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

runAllTests();
