const db = require('./database');
const bcrypt = require('bcryptjs');

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function seed() {
    console.log('🌱 Seeding data...');
    try {
        // School 1
        const password = bcrypt.hashSync('School@123', 8);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 14);

        // Delete existing if any to avoid conflicts
        await run('DELETE FROM schools WHERE email = ?', ['greenvalley@school.com']);

        await run(`INSERT INTO schools (school_name, email, password_hash, contact_person, contact_phone, plan_type, plan_expiry_date, max_students, max_classes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Green Valley School', 'greenvalley@school.com', password, 'Mr. Sharma', '9876543200', 'trial', expiry.toISOString().split('T')[0], 20, 2, 'active']
        );
        console.log('✓ Created Green Valley School');

        // Verify immediately
        db.get('SELECT * FROM schools WHERE email = ?', ['greenvalley@school.com'], (err, row) => {
            if (err) console.error('Verification error:', err);
            else console.log('Verification result:', row ? 'Found' : 'Not Found');
        });

    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seed();
