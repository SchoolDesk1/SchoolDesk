const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SCHOOL_EMAIL = 'greenvalley@school.com';
const SCHOOL_PASSWORD = 'School@123';

async function verifyChanges() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login-school`, {
            email: SCHOOL_EMAIL,
            password: SCHOOL_PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('Login successful.');

        // 2. Get a class
        console.log('Fetching classes...');
        const classesRes = await axios.get(`${API_URL}/school/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        let classId;
        if (classesRes.data.length > 0) {
            classId = classesRes.data[0].id;
        } else {
            // Create a class
            console.log('Creating a class...');
            const createClassRes = await axios.post(`${API_URL}/school/create-class`, {
                class_name: 'Test Class 101'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            classId = createClassRes.data.id;
        }
        console.log('Using Class ID:', classId);

        // 3. Create Student with Fee
        const studentName = `Test Student ${Date.now()}`;
        const studentPhone = `999${Date.now().toString().slice(-7)}`;
        const feeAmount = 500;

        console.log(`Creating student: ${studentName} with fee: ${feeAmount}`);
        const createStudentRes = await axios.post(`${API_URL}/school/create-user`, {
            name: studentName,
            phone: studentPhone,
            role: 'parent',
            class_id: classId,
            feeAmount: feeAmount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentId = createStudentRes.data.id;
        console.log('Student created. ID:', studentId);

        // 4. Verify Fee Record
        console.log('Verifying fee record...');
        const feesRes = await axios.get(`${API_URL}/school/fees/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentFees = feesRes.data.filter(f => f.parent_id === studentId);
        const paidFee = studentFees.find(f => f.status === 'PAID' && f.amount == feeAmount);

        if (paidFee) {
            console.log('SUCCESS: Paid fee record found:', paidFee);
        } else {
            console.error('FAILURE: Paid fee record NOT found. Fees:', studentFees);
        }

        // 5. Update Student Name
        const newName = studentName + ' Updated';
        console.log(`Updating student name to: ${newName}`);
        try {
            await axios.put(`${API_URL}/school/users/${studentId}`, {
                name: newName,
                phone: studentPhone,
                role: 'parent',
                class_id: classId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Update request successful.');
        } catch (err) {
            console.error('Update request failed:', err.response ? err.response.data : err.message);
        }

        // 6. Verify Update
        console.log('Verifying name update...');
        const studentsRes = await axios.get(`${API_URL}/school/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedStudent = studentsRes.data.find(s => s.id === studentId);

        if (updatedStudent && updatedStudent.name === newName) {
            console.log('SUCCESS: Student name updated correctly.');
        } else {
            console.error('FAILURE: Student name NOT updated. Found:', updatedStudent);
        }

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyChanges();
