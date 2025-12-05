const axios = require('axios');

async function testRoutes() {
    const token = 'Bearer test123'; // dummy token

    console.log('Testing if routes are registered...\n');

    const tests = [
        '/super-admin/schools',
        '/super-admin/analytics/platform',
        '/super-admin/users/all',
    ];

    for (const route of tests) {
        try {
            const res = await axios.get(`http://localhost:5000${route}`, {
                headers: { Authorization: token },
                validateStatus: () => true  // Don't throw on any status
            });
            console.log(`${route}: Status ${res.status} - ${res.headers['content-type']}`);
        } catch (err) {
            console.log(`${route}: ERROR - ${err.message}`);
        }
    }
}

testRoutes();
