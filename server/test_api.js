const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing Payment Initiation...');
        const res = await axios.post('http://localhost:5000/api/payment/initiate', {
            schoolId: 1,
            planId: 'standard'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

testApi();
