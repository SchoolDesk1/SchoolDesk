const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function verifySchoolAdmin() {
    try {
        // 1. Login as Super Admin
        console.log('Logging in as Super Admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const adminToken = adminLogin.data.accessToken;

        // 2. Create a Test School
        const schoolEmail = `school${Date.now()}@test.com`;
        const schoolPass = 'school123';
        console.log(`Creating School: ${schoolEmail}`);

        await axios.post(`${API_URL}/super-admin/create-school`, {
            school_name: 'Verification School',
            email: schoolEmail,
            password: schoolPass,
            address: '123 Edu Lane',
            contact_person: 'Mr. Verify',
            contact_phone: '555-9999'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        // 3. Login as School Admin
        console.log('Logging in as School Admin...');
        const schoolLogin = await axios.post(`${API_URL}/auth/login-school`, {
            email: schoolEmail,
            password: schoolPass
        });
        const schoolToken = schoolLogin.data.accessToken;
        const schoolConfig = { headers: { Authorization: `Bearer ${schoolToken}` } };
        console.log('School Login Successful');

        // 4. Create Class
        console.log('Creating Class 10-A...');
        const classRes = await axios.post(`${API_URL}/school/create-class`, {
            class_name: '10-A'
        }, schoolConfig);
        console.log('Class Created:', classRes.data);
        const classId = classRes.data.id;

        // 5. Create Notice
        console.log('Creating School Notice...');
        await axios.post(`${API_URL}/school/create-notice`, {
            notice_text: 'Welcome to the new term!',
            class_id: null // School-wide
        }, schoolConfig);
        console.log('Notice Created');

        // 6. List Classes
        console.log('Listing Classes...');
        const classes = await axios.get(`${API_URL}/school/classes`, schoolConfig);
        console.log('Classes found:', classes.data.length);

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifySchoolAdmin();
