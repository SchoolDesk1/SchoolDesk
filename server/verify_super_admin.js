const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function verifySuperAdmin() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login-super-admin`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('Login successful. Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Create School
        console.log('Creating School...');
        const createRes = await axios.post(`${API_URL}/super-admin/create-school`, {
            school_name: 'Test School',
            email: 'test@school.com',
            password: 'schoolpass123',
            address: '123 Test St',
            contact_person: 'Principal Skinner',
            contact_phone: '555-1234'
        }, config);
        console.log('School created:', createRes.data);
        const schoolId = createRes.data.id;

        // 3. List Schools
        console.log('Listing Schools...');
        const listRes = await axios.get(`${API_URL}/super-admin/schools`, config);
        console.log('Schools found:', listRes.data.length);
        const createdSchool = listRes.data.find(s => s.id === schoolId);
        if (!createdSchool) throw new Error('Created school not found in list');

        // 4. Update Status
        console.log('Updating Status to suspended...');
        await axios.put(`${API_URL}/super-admin/school/${schoolId}/status`, { status: 'suspended' }, config);
        console.log('Status updated.');

        // 5. Delete School
        console.log('Deleting School...');
        await axios.delete(`${API_URL}/super-admin/school/${schoolId}`, config);
        console.log('School deleted.');

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifySuperAdmin();
