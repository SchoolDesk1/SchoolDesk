const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding expiry_date column to notices table...');

db.serialize(() => {
    // Check if column exists first
    db.all("PRAGMA table_info(notices)", (err, columns) => {
        if (err) {
            console.error('Error checking table:', err);
            return;
        }

        const hasExpiryDate = columns.some(col => col.name === 'expiry_date');

        if (hasExpiryDate) {
            console.log('✅ expiry_date column already exists!');
            db.close();
            return;
        }

        // Add the column
        db.run('ALTER TABLE notices ADD COLUMN expiry_date TEXT', (err) => {
            if (err) {
                console.error('❌ Error adding column:', err.message);
            } else {
                console.log('✅ Successfully added expiry_date column to notices table!');
            }

            // Verify the change
            db.all("PRAGMA table_info(notices)", (err, updatedColumns) => {
                if (err) {
                    console.error('Error verifying:', err);
                } else {
                    console.log('\n📋 Current notices table schema:');
                    updatedColumns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                    });
                }
                db.close();
            });
        });
    });
});
