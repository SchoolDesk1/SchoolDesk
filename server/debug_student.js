const db = require('./database');

const phone = '5689412378';

db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    if (!user) {
        console.log('❌ User not found in database.');
    } else {
        console.log('✅ User found:');
        console.log(`  Name: ${user.name}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Class ID: ${user.class_id}`);

        // Check school of the class
        db.get('SELECT * FROM classes WHERE id = ?', [user.class_id], (err, cls) => {
            if (cls) {
                console.log(`  School ID: ${cls.school_id}`);
            } else {
                console.log('  ❌ Class not found!');
            }
        });
    }

    setTimeout(() => process.exit(0), 1000);
});
