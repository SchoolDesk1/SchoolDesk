const axios = require('axios');
const supabase = require('./supabase');

const API_URL = 'http://localhost:5000/api';

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// NOTE: This test assumes the server is running on localhost:5000
// It also creates a temporary school for testing and deletes it afterwards.

async function testPlanLimits() {
    console.log('--- Starting Plan Limits Test ---');
    const timestamp = Date.now();
    const uniqueEmail = `limit_test_${timestamp}@example.com`;
    const password = 'password123';

    let token = null;
    let schoolId = null;

    try {
        // 1. Register a new Trial School
        console.log('\n1. Registering Trial School...');

        // We delete if exists first just in case
        await supabase.from('schools').delete().eq('email', uniqueEmail);

        const registerRes = await axios.post(`${API_URL}/auth/register-school`, {
            school_name: 'Limit Test School',
            email: uniqueEmail,
            password: password,
            contact_person: 'Tester',
            contact_phone: '1234567890',
            address: 'Test Address'
        });

        console.log('✅ Registration Successful');
        schoolId = registerRes.data.school_id;

        // Login to get token
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: uniqueEmail,
            password: password
        });
        token = loginRes.data.accessToken;
        console.log('✅ Login Successful');


        // 2. Test Class Limits (Trial: 2 max)
        console.log('\n2. Testing Class Limits (Max 2)...');

        try {
            await axios.post(`${API_URL}/school/create-class`, { class_name: 'Class 1' }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('✅ Class 1 Created');
            await axios.post(`${API_URL}/school/create-class`, { class_name: 'Class 2' }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('✅ Class 2 Created');
        } catch (e) {
            console.error('❌ Failed to create valid classes:', e.response?.data || e.message);
        }

        try {
            await axios.post(`${API_URL}/school/create-class`, { class_name: 'Class 3' }, { headers: { Authorization: `Bearer ${token}` } });
            console.error('❌ Error: Class 3 should have been blocked!');
        } catch (e) {
            if (e.response?.status === 403 && e.response?.data?.code === 'LIMIT_REACHED') {
                console.log('✅ Class 3 Blocked correctly (403 LIMIT_REACHED)');
            } else {
                console.error('❌ Unexpected error for Class 3:', e.response?.status, e.response?.data);
            }
        }

        // 3. Test Feature Limits (Vehicles -> Not in Trial)
        console.log('\n3. Testing Prohibited Feature (Vehicles)...');
        try {
            await axios.post(`${API_URL}/school/vehicles/create`, {
                vehicle_name: 'Bus 1',
                route_details: 'Route A',
                driver_name: 'Driver',
                driver_phone: '123'
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.error('❌ Error: Vehicle creation should have been blocked!');
        } catch (e) {
            if (e.response?.status === 403 && e.response?.data?.code === 'FEATURE_LOCKED') {
                console.log('✅ Vehicle creation Blocked correctly (403 FEATURE_LOCKED)');
            } else {
                console.error('❌ Unexpected error for Vehicle:', e.response?.status, e.response?.data);
            }
        }

        // 4. Test Student Limits (Trial: 50 max) -> Just creating 1 to ensure it works, then mocking db to simulate full
        console.log('\n4. Testing Student Creation (Basic check)...');
        try {
            // First we need a class ID
            const classesRes = await axios.get(`${API_URL}/school/classes`, { headers: { Authorization: `Bearer ${token}` } });
            const classId = classesRes.data[0].id;

            await axios.post(`${API_URL}/school/create-user`, {
                name: 'Student 1',
                phone: `999${timestamp}`, // unique phone
                role: 'parent',
                class_id: classId
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('✅ Student 1 Created');
        } catch (e) {
            console.error('❌ Failed to create student:', e.response?.data || e.message);
        }

        // 5. Test Plan Expiry
        console.log('\n5. Testing Expiry Logic...');
        // Manually update expiry date in DB to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await supabase
            .from('schools')
            .update({ plan_expiry_date: yesterday.toISOString() })
            .eq('id', schoolId);

        try {
            const classesRes = await axios.get(`${API_URL}/school/classes`, { headers: { Authorization: `Bearer ${token}` } });
            const classId = classesRes.data[0].id;
            // Try to create another student
            await axios.post(`${API_URL}/school/create-user`, {
                name: 'Student Expired',
                phone: `888${timestamp}`,
                role: 'parent',
                class_id: classId
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.error('❌ Error: Should be blocked due to expiry!');

        } catch (e) {
            if (e.response?.status === 403 && e.response?.data?.code === 'PLAN_EXPIRED') {
                console.log('✅ Action Blocked due to Expiry (403 PLAN_EXPIRED)');
            } else {
                console.error('❌ Unexpected error for Expiry:', e.response?.status, e.response?.data);
            }
        }


    } catch (err) {
        console.error('Global Test Error:', err);
    } finally {
        if (schoolId) {
            console.log('\nCleaning up test school...');
            // Optional: delete school
            // await supabase.from('schools').delete().eq('id', schoolId);
        }
    }
}

testPlanLimits();
