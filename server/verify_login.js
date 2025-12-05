const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function verifyLogin() {
    try {
        console.log('Logging in as School Admin...');
        const response = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });

        console.log('Login Successful!');
        console.log('Token:', response.data.accessToken ? 'Received' : 'Missing');
        console.log('Role:', response.data.role);

    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

verifyLogin();
