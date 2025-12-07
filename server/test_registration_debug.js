const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register-school', {
            school_name: "Test School " + Date.now(),
            email: `test${Date.now()}@test.com`,
            password: "password123",
            address: "123 Test St",
            contact_phone: "1234567890"
        });
        console.log('Success:', response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegistration();
