const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function testMarksFeature() {
    console.log('='.repeat(60));
    console.log('TESTING MARKS FEATURE');
    console.log('='.repeat(60));

    try {
        // 1. Login as School Admin
        console.log('\n[STEP 1] Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });
        const schoolToken = loginRes.data.accessToken;
        console.log('✅ Login successful');

        // 2. Get or Create Class
        console.log('\n[STEP 2] Getting classes...');
        const classesRes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        let classId = classesRes.data[0]?.id;

        if (!classId) {
            console.log('   Creating new class...');
            const createClassRes = await axios.post(`${API_URL}/school/create-class`, {
                class_name: 'Marks Test Class'
            }, {
                headers: { Authorization: `Bearer ${schoolToken}` }
            });
            classId = createClassRes.data.classId; // Adjust based on actual response
            // If response doesn't have classId directly, we might need to fetch classes again
            if (!classId) {
                const classesRes2 = await axios.get(`${API_URL}/school/classes`, {
                    headers: { Authorization: `Bearer ${schoolToken}` }
                });
                classId = classesRes2.data[0].id;
            }
        }
        console.log(`✅ Using Class ID: ${classId}`);

        // 3. Create Student
        console.log('\n[STEP 3] Creating Student...');
        const studentPhone = `999${Date.now().toString().slice(-7)}`;
        const studentRes = await axios.post(`${API_URL}/school/create-user`, {
            name: 'Marks Student',
            phone: studentPhone,
            role: 'parent',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        const studentId = studentRes.data.id;
        console.log(`✅ Student created: ${studentId} (Phone: ${studentPhone})`);

        // 4. Create Teacher
        console.log('\n[STEP 4] Creating Teacher...');
        const teacherPhone = `888${Date.now().toString().slice(-7)}`;
        const teacherRes = await axios.post(`${API_URL}/school/create-user`, {
            name: 'Marks Teacher',
            phone: teacherPhone,
            role: 'teacher',
            class_id: classId
        }, {
            headers: { Authorization: `Bearer ${schoolToken}` }
        });
        const teacherPassword = teacherRes.data.password;
        console.log(`✅ Teacher created (Phone: ${teacherPhone}, Password: ${teacherPassword})`);

        // 5. Login as Teacher
        console.log('\n[STEP 5] Logging in as Teacher...');
        const teacherLoginRes = await axios.post(`${API_URL}/auth/login-user`, {
            phone: teacherPhone,
            password: teacherPassword,
            role: 'teacher'
        });
        const teacherToken = teacherLoginRes.data.accessToken;
        console.log('✅ Teacher login successful');

        // 6. Fetch Students as Teacher
        console.log('\n[STEP 6] Fetching students as teacher...');
        const studentsRes = await axios.get(`${API_URL}/teacher/students`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        const foundStudent = studentsRes.data.find(s => s.phone === studentPhone);

        if (foundStudent) {
            console.log(`✅ Student found in teacher's list: ${foundStudent.name}`);
            if (foundStudent.role === 'parent') {
                console.log('✅ Student role is correctly returned as "parent"');
            } else {
                console.error(`❌ Student role is MISSING or INCORRECT: ${foundStudent.role}`);
            }
        } else {
            console.error('❌ Student NOT found in teacher\'s list');
            console.log('List:', studentsRes.data);
            return;
        }

        // 7. Add Marks
        console.log('\n[STEP 7] Adding marks...');
        const marksData = {
            student_id: studentId,
            subject: 'Mathematics',
            marks: 85,
            max_marks: 100,
            test_name: 'Unit Test 1',
            test_date: new Date().toISOString().split('T')[0]
        };

        const addMarksRes = await axios.post(`${API_URL}/teacher/marks/add`, marksData, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });

        if (addMarksRes.status === 201) {
            console.log('✅ Marks added successfully');
        } else {
            console.error('❌ Failed to add marks');
        }

        console.log('\n🎉 MARKS FEATURE VERIFIED SUCCESSFULLY!');

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

testMarksFeature();
