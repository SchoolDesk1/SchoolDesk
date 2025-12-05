const http = require('http');

const postData = JSON.stringify({
    email: 'greenvalley@school.com',
    password: 'School@123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/login-school',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 Testing School Admin Login API');
console.log('Endpoint: POST http://localhost:5000/auth/login-school');
console.log('Body:', postData);
console.log('\nSending request...\n');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse Body:');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));

            if (res.statusCode === 200) {
                console.log('\n✅ SUCCESS! Login working!');
                console.log('Token received:', json.accessToken.substring(0, 30) + '...');
            } else {
                console.log('\n❌ FAILED! Status:', res.statusCode);
            }
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
});

req.write(postData);
req.end();
