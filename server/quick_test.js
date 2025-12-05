const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function quickTest() {
    try {
        // 1. Login as Super Admin
        console.log('1. Testing Super Admin login...');
        const adminLogin = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        console.log('✓ Super Admin login successful');
        const adminToken = adminLogin.data.accessToken;

        // 2. Create a test school
        console.log('\n2. Creating test school...');
        const schoolRes = await axios.post(`${API_URL}/super-admin/create-school`, {
            school_name: 'Demo School for Testing',
            email: 'test@demo.com',
            password: 'demo123'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✓ School created:', schoolRes.data);

        // 3. Login as School Admin
        console.log('\n3. Testing School Admin login...');
        const schoolLogin = await axios.post(`${API_URL}/auth/login-school`, {
            email: 'test@demo.com',
            password: 'demo123'
        });
        console.log('✓ School Admin login successful');
        const schoolToken = schoolLogin.data.accessToken;

        // 4. Create a class
        console.log('\n4. Creating class...');
        const classRes = await axios.post(`${API_URL}/school/create-class`, {
            class_name: 'Class 5-A'
        }, { headers: { Authorization: `Bearer ${schoolToken}` } });
        console.log('✓ Class created:', classRes.data);

        // 5. Create a teacher
        console.log('\n5. Creating teacher user...');
        await axios.post(`${API_URL}/school/create-user`, {
            phone: '9876543210',
            role: 'teacher',
            class_id: classRes.data.id
        }, { headers: { Authorization: `Bearer ${schoolToken}` } });
        console.log('✓ Teacher user created');

        // 6. Login as Teacher
        console.log('\n6. Testing Teacher login...');
        const teacherLogin = await axios.post(`${API_URL}/auth/login-user`, {
            phone: '9876543210',
            class_password: classRes.data.class_password
        });
        console.log('✓ Teacher login successful');

        // 7. Create a parent
        console.log('\n7. Creating parent user...');
        await axios.post(`${API_URL}/school/create-user`, {
            phone: '9876543211',
            role: 'parent',
            class_id: classRes.data.id
        }, { headers: { Authorization: `Bearer ${schoolToken}` } });
        console.log('✓ Parent user created');

        // 8. Login as Parent
        console.log('\n8. Testing Parent login...');
        const parentLogin = await axios.post(`${API_URL}/auth/login-user`, {
            phone: '9876543211',
            class_password: classRes.data.class_password
        });
        console.log('✓ Parent login successful');

        console.log('\n✅ ALL TESTS PASSED! Backend is fully functional.');
        console.log('\nCredentials for testing:');
        console.log('==========================================');
        console.log('School Admin: test@demo.com / demo123');
        console.log('Teacher: 9876543210 + password:', classRes.data.class_password);
        console.log('Parent: 9876543211 + password:', classRes.data.class_password);
        console.log('==========================================');

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

quickTest();
