const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin';
const SECRET_KEY = 'SuperSecretAdmin2024!';

async function checkSystem() {
    console.log('🚀 Starting Final System Check...\n');

    try {
        // 1. Authentication
        console.log('1️⃣  Authenticating Super Admin...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login-super-admin', {
            secretKey: SECRET_KEY
        });
        const token = loginRes.data.accessToken;
        if (!token) throw new Error('No access token received');
        console.log('   ✅ Login Successful\n');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Overview & Graphs
        console.log('2️⃣  Checking Overview & Graphs...');
        const overviewRes = await axios.get(`${API_URL}/analytics/comprehensive`, { headers });
        const { graphs } = overviewRes.data;

        if (graphs && graphs.revenue && graphs.newSchools && graphs.activeUsers && graphs.planSales) {
            console.log('   ✅ Graphs Data Structure Valid');
            console.log(`      - Revenue Points: ${graphs.revenue.length}`);
            console.log(`      - New Schools Points: ${graphs.newSchools.length}`);
        } else {
            throw new Error('Missing graph data in overview response');
        }
        console.log('   ✅ Overview Stats Loaded\n');

        // 3. School Drill-Down
        console.log('3️⃣  Checking School Drill-Down...');
        const schoolsRes = await axios.get(`${API_URL}/schools`, { headers });
        const schools = schoolsRes.data;

        if (schools.length > 0) {
            const schoolId = schools[0].id;
            console.log(`   ℹ️  Fetching details for School ID: ${schoolId}`);

            const detailRes = await axios.get(`${API_URL}/schools/${schoolId}/full-details`, { headers });
            const detail = detailRes.data;

            const checks = [
                Array.isArray(detail.classes) ? 'Classes OK' : 'Classes Missing',
                Array.isArray(detail.students) ? 'Students OK' : 'Students Missing',
                Array.isArray(detail.teachers) ? 'Teachers OK' : 'Teachers Missing',
                Array.isArray(detail.payments) ? 'Payments OK' : 'Payments Missing',
                Array.isArray(detail.homework) ? 'Homework OK' : 'Homework Missing',
                Array.isArray(detail.notices) ? 'Notices OK' : 'Notices Missing'
            ];

            console.log(`   ✅ Drill-Down Data: ${checks.join(', ')}\n`);
        } else {
            console.log('   ⚠️  No schools to check drill-down for.\n');
        }

        // 4. System Backup
        console.log('4️⃣  Checking System Backup Endpoint...');
        try {
            const backupRes = await axios.get(`${API_URL}/backup/system`, {
                headers,
                responseType: 'stream'
            });
            if (backupRes.status === 200) {
                console.log('   ✅ Backup Download Initiated Successfully\n');
            } else {
                throw new Error(`Backup returned status ${backupRes.status}`);
            }
        } catch (err) {
            throw new Error(`Backup Check Failed: ${err.message}`);
        }

        // 5. Global Search
        console.log('5️⃣  Checking Global Search...');
        const searchRes = await axios.get(`${API_URL}/search?query=school`, { headers });
        if (searchRes.data.schools && searchRes.data.users) {
            console.log('   ✅ Search API Responding Correctly\n');
        } else {
            throw new Error('Invalid search response structure');
        }

        console.log('🎉 ALL SYSTEMS GO! The Super Admin Dashboard is fully operational.');

    } catch (error) {
        console.error('\n❌ SYSTEM CHECK FAILED');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

checkSystem();
