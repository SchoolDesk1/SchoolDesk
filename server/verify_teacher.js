const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function verifyTeacher() {
    try {
        console.log('Logging in as Super Admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const adminToken = adminLogin.data.accessToken;

        // Create School
        const schoolEmail = `school_t${Date.now()}@test.com`;
        const schoolPass = 'school123';
        await axios.post(`${API_URL}/super-admin/create-school`, {
            school_name: 'Teacher Test School',
            email: schoolEmail,
            password: schoolPass
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        // Login School
        const schoolLogin = await axios.post(`${API_URL}/auth/login-school`, {
            email: schoolEmail,
            password: schoolPass
        });
        const schoolToken = schoolLogin.data.accessToken;

        // Create Class
        const classRes = await axios.post(`${API_URL}/school/create-class`, {
            class_name: '5-B'
        }, { headers: { Authorization: `Bearer ${schoolToken}` } });
        const classId = classRes.data.id;
        const classPass = classRes.data.class_password;
        console.log(`Class Created. ID: ${classId}, Pass: ${classPass}`);

        // Create Teacher User
        const teacherPhone = `999${Date.now().toString().slice(-7)}`;
        console.log(`Creating Teacher: ${teacherPhone}`);
        await axios.post(`${API_URL}/school/create-user`, {
            phone: teacherPhone,
            role: 'teacher',
            class_id: classId
        }, { headers: { Authorization: `Bearer ${schoolToken}` } });

        // Login Teacher
        console.log('Logging in as Teacher...');
        const teacherLogin = await axios.post(`${API_URL}/auth/login-user`, {
            phone: teacherPhone,
            class_password: classPass
        });
        const teacherToken = teacherLogin.data.accessToken;
        const teacherConfig = { headers: { Authorization: `Bearer ${teacherToken}` } };
        console.log('Teacher Login Successful');

        // Upload Homework
        console.log('Uploading Homework...');
        // Create a dummy file
        fs.writeFileSync('test_hw.txt', 'This is a test homework file.');

        const form = new FormData();
        form.append('title', 'Math Homework');
        form.append('description', 'Solve page 10');
        form.append('file', fs.createReadStream('test_hw.txt'));

        const uploadRes = await axios.post(`${API_URL}/teacher/upload-homework`, form, {
            headers: {
                ...teacherConfig.headers,
                ...form.getHeaders()
            }
        });
        console.log('Homework Uploaded successfully');

        // Upload Notice
        console.log('Uploading Notice...');
        await axios.post(`${API_URL}/teacher/upload-notice`, {
            notice_text: 'Bring geometry box tomorrow.'
        }, teacherConfig);
        console.log('Notice Uploaded');

        // List Homework
        const hwList = await axios.get(`${API_URL}/teacher/homework-list`, teacherConfig);
        console.log('Homework found:', hwList.data.length);

        // Cleanup
        fs.unlinkSync('test_hw.txt');
        console.log('VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('Verification Failed:', error.response ? JSON.stringify(error.response.data) : error);
    }
}

verifyTeacher();
