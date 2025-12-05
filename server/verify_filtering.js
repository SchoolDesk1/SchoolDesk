const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let schoolToken = '';

async function verifyFiltering() {
    console.log('🔍 Verifying Class Filtering Logic...');

    try {
        // Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login-school`, {
            email: 'greenvalley@school.com',
            password: 'School@123'
        });
        schoolToken = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${schoolToken}` };

        // 1. Get All Classes
        const classesRes = await axios.get(`${BASE_URL}/school/classes`, { headers });
        const classes = classesRes.data;

        if (classes.length === 0) {
            console.log('⚠️ No classes found to test filtering.');
            return;
        }

        const testClass = classes[0];
        console.log(`Testing filter with Class: ${testClass.class_name} (ID: ${testClass.id})`);

        // 2. Filter Students by Class
        const studentsUrl = `${BASE_URL}/school/users?role=parent&class_id=${testClass.id}`;
        console.log(`Requesting: ${studentsUrl}`);

        const studentsRes = await axios.get(studentsUrl, { headers });
        const students = studentsRes.data;

        console.log(`Found ${students.length} students in class ${testClass.class_name}`);

        // Verify all returned students actually belong to this class
        const invalidStudents = students.filter(s => s.class_id != testClass.id);
        if (invalidStudents.length > 0) {
            console.error('❌ FILTERING FAILED! Found students from wrong class:', invalidStudents);
        } else {
            console.log('✅ Student filtering works correctly!');
        }

        // 3. Filter Teachers by Class
        const teachersUrl = `${BASE_URL}/school/users?role=teacher&class_id=${testClass.id}`;
        console.log(`Requesting: ${teachersUrl}`);

        const teachersRes = await axios.get(teachersUrl, { headers });
        const teachers = teachersRes.data;

        console.log(`Found ${teachers.length} teachers in class ${testClass.class_name}`);

        // Verify all returned teachers actually belong to this class
        const invalidTeachers = teachers.filter(t => t.class_id != testClass.id);
        if (invalidTeachers.length > 0) {
            console.error('❌ FILTERING FAILED! Found teachers from wrong class:', invalidTeachers);
        } else {
            console.log('✅ Teacher filtering works correctly!');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

verifyFiltering();
