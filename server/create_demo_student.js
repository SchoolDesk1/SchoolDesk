const db = require('./database');

const student = {
    name: 'Demo Student',
    phone: '5689412378',
    password: 'password123', // In real app this is hashed
    role: 'parent',
    class_id: 1, // Assign to Class 1
    school_id: 1 // Assign to School 1
};

console.log(`Creating student: ${student.name} (${student.phone})...`);

db.run(`INSERT INTO users (name, phone, password_hash, role, class_id, school_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [student.name, student.phone, 'hashed_password', student.role, student.class_id, student.school_id],
    function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                console.log('✅ Student already exists!');
            } else {
                console.error('❌ Error creating student:', err.message);
            }
        } else {
            console.log('✅ Student created successfully!');
            console.log('   ID:', this.lastID);
        }
        process.exit(0);
    }
);
