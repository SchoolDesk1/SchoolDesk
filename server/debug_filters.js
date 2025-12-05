const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testFiltersAndNotices() {
    try {
        // Login first
        console.log('🔐 Logging in as School Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            phone: 'greenvalley@school.com',
            password: 'School@123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful!\n');

        // Get all classes
        console.log('📚 Fetching classes...');
        const classesRes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${classesRes.data.length} classes:`);
        classesRes.data.forEach(c => console.log(`  - ${c.class_name} (ID: ${c.id})`));

        // Test 1: Get all students (role=parent)
        console.log('\n📖 TEST 1: Fetching ALL students (role=parent)');
        const allStudentsRes = await axios.get(`${API_URL}/school/users?role=parent`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${allStudentsRes.data.length} students total`);
        allStudentsRes.data.forEach(s => {
            console.log(`  - ${s.name || s.phone} (Class: ${s.class_name}, class_id: ${s.class_id}, role: ${s.role})`);
        });

        // Test 2: Get filtered students for first class
        if (classesRes.data.length > 0) {
            const firstClassId = classesRes.data[0].id;
            const firstClassName = classesRes.data[0].class_name;
            console.log(`\n🔍 TEST 2: Fetching students for ${firstClassName} (class_id=${firstClassId})`);
            const filteredStudentsRes = await axios.get(`${API_URL}/school/users?role=parent&class_id=${firstClassId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Found ${filteredStudentsRes.data.length} students in ${firstClassName}`);
            filteredStudentsRes.data.forEach(s => {
                console.log(`  - ${s.name || s.phone} (Class: ${s.class_name}, class_id: ${s.class_id})`);
            });
        }

        // Test 3: Get all teachers (role=teacher)
        console.log('\n👨‍🏫 TEST 3: Fetching ALL teachers (role=teacher)');
        const allTeachersRes = await axios.get(`${API_URL}/school/users?role=teacher`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${allTeachersRes.data.length} teachers total`);
        allTeachersRes.data.forEach(t => {
            console.log(`  - ${t.name || t.phone} (Class: ${t.class_name}, role: ${t.role})`);
        });

        // Test 4: Get notices
        console.log('\n📢 TEST 4: Fetching notices');
        const noticesRes = await axios.get(`${API_URL}/school/notices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${noticesRes.data.length} notices`);
        if (noticesRes.data.length > 0) {
            noticesRes.data.forEach(n => {
                console.log(`  - "${n.notice_text.substring(0, 50)}..." (ID: ${n.id})`);
            });
        } else {
            console.log('  ⚠️ No notices found. Try creating one in the dashboard.');
        }

        console.log('\n✅ All tests completed!');
        console.log('\n📋 Summary:');
        console.log(`  - Students: ${allStudentsRes.data.length}`);
        console.log(`  - Teachers: ${allTeachersRes.data.length}`);
        console.log(`  - Notices: ${noticesRes.data.length}`);
        console.log(`  - Classes: ${classesRes.data.length}`);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testFiltersAndNotices();
