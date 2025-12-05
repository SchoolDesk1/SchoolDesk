const db = require('./database');

console.log('🏫 Creating test school for debugging...\n');

// Check existing schools
db.all('SELECT * FROM schools', [], (err, schools) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }

    console.log('📋 Existing schools:');
    if (schools.length === 0) {
        console.log('  None found.\n');
    } else {
        schools.forEach(s => {
            console.log(`  - ${s.school_name} (${s.email}) - Plan: ${s.plan_type}, Status: ${s.status}`);
        });
        console.log('');
    }

    // Create a test school
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 8);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14);
    const formattedExpiry = expiryDate.toISOString().split('T')[0];

    const sql = `INSERT INTO schools 
        (school_name, email, password_hash, plan_type, plan_expiry_date, max_students, max_classes, status) 
        VALUES (?, ?, ?, 'trial', ?, 50, 5, 'active')`;

    db.run(sql, ['Test School', 'admin@test.com', hashedPassword, formattedExpiry], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                console.log('✅ Test school already exists. You can login with:');
                console.log('   Email: admin@test.com');
                console.log('   Password: admin123\n');
            } else {
                console.error('❌ Error creating test school:', err.message);
            }
        } else {
            console.log('✅ Test school created successfully!');
            console.log('   Email: admin@test.com');
            console.log('   Password: admin123');
            console.log('   Plan: Trial (14 days)');
            console.log('   School ID:', this.lastID, '\n');
        }

        setTimeout(() => process.exit(0), 500);
    });
});
