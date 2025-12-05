const axios = require('axios');

const API_URL = 'http://localhost:5000';
const CREDENTIALS = {
    phone: 'greenvalley@school.com',
    password: 'School@123'
};

async function testAllFeatures() {
    console.log('🚀 Starting comprehensive test...\n');

    try {
        // Step 1: Login
        console.log('1️⃣ Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const token = loginRes.data.token;
        console.log('✅ Login successful!\n');

        const headers = { Authorization: `Bearer ${token}` };

        // Step 2: Get all classes
        console.log('2️⃣ Fetching Classes...');
        const classesRes = await axios.get(`${API_URL}/school/classes`, { headers });
        console.log(`✅ Found ${classesRes.data.length} classes:`);
        classesRes.data.forEach(c => console.log(`   - ${c.class_name} (ID: ${c.id})`));
        console.log('');

        // Step 3: Test Students - All
        console.log('3️⃣ Testing Students Filter...');
        const allStudentsUrl = `${API_URL}/school/users?role=parent`;
        console.log(`   URL: ${allStudentsUrl}`);
        const allStudentsRes = await axios.get(allStudentsUrl, { headers });
        console.log(`✅ All students: ${allStudentsRes.data.length}`);
        allStudentsRes.data.forEach(s => {
            console.log(`   - ${s.name || s.phone} | Class: ${s.class_name} (${s.class_id}) | Role: ${s.role}`);
        });
        console.log('');

        // Step 4: Test Students - Filter by Class
        if (classesRes.data.length > 0) {
            const testClassId = classesRes.data[0].id;
            const testClassName = classesRes.data[0].class_name;
            console.log(`4️⃣ Testing Students Filter for ${testClassName}...`);
            const filteredUrl = `${API_URL}/school/users?role=parent&class_id=${testClassId}`;
            console.log(`   URL: ${filteredUrl}`);
            const filteredStudentsRes = await axios.get(filteredUrl, { headers });
            console.log(`✅ Students in ${testClassName}: ${filteredStudentsRes.data.length}`);
            filteredStudentsRes.data.forEach(s => {
                console.log(`   - ${s.name || s.phone} | Class: ${s.class_name}`);
            });
            console.log('');
        }

        // Step 5: Test Teachers - All
        console.log('5️⃣ Testing Teachers Filter...');
        const allTeachersUrl = `${API_URL}/school/users?role=teacher`;
        console.log(`   URL: ${allTeachersUrl}`);
        const allTeachersRes = await axios.get(allTeachersUrl, { headers });
        console.log(`✅ All teachers: ${allTeachersRes.data.length}`);
        allTeachersRes.data.forEach(t => {
            console.log(`   - ${t.name || t.phone} | Class: ${t.class_name} (${t.class_id}) | Role: ${t.role}`);
        });
        console.log('');

        // Step 6: Test Notices
        console.log('6️⃣ Testing Notices...');
        const noticesUrl = `${API_URL}/school/notices`;
        console.log(`   URL: ${noticesUrl}`);
        const noticesRes = await axios.get(noticesUrl, { headers });
        console.log(`✅ Notices: ${noticesRes.data.length}`);
        if (noticesRes.data.length > 0) {
            noticesRes.data.forEach(n => {
                const preview = n.notice_text.length > 50
                    ? n.notice_text.substring(0, 50) + '...'
                    : n.notice_text;
                console.log(`   - "${preview}" (ID: ${n.id})`);
            });
        } else {
            console.log('   ⚠️ No notices found. Create one to test!');
        }
        console.log('');

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 TEST SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Login: Working`);
        console.log(`✅ Classes: ${classesRes.data.length} found`);
        console.log(`✅ All Students: ${allStudentsRes.data.length} (role=parent)`);
        console.log(`✅ All Teachers: ${allTeachersRes.data.length} (role=teacher)`);
        console.log(`✅ Notices: ${noticesRes.data.length}`);

        // Check for issues
        const hasStudentsInTeachers = allTeachersRes.data.some(t => t.role !== 'teacher');
        const hasTeachersInStudents = allStudentsRes.data.some(s => s.role !== 'parent');

        if (hasStudentsInTeachers) {
            console.log('❌ ERROR: Teachers list contains non-teacher users!');
        }
        if (hasTeachersInStudents) {
            console.log('❌ ERROR: Students list contains non-parent users!');
        }

        if (!hasStudentsInTeachers && !hasTeachersInStudents) {
            console.log('\n🎉 All filters working correctly!');
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.config?.url);
        }
    }
}

testAllFeatures();
