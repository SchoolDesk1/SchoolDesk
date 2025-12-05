const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');

console.log('Starting migration: Adding father_name column to users table...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database.');
});

// Add father_name column
db.run(`ALTER TABLE users ADD COLUMN father_name TEXT`, (err) => {
    if (err) {
        // Check if column already exists
        if (err.message.includes('duplicate column name')) {
            console.log('✅ Column father_name already exists. No migration needed.');
        } else {
            console.error('❌ Error adding father_name column:', err.message);
            db.close();
            process.exit(1);
        }
    } else {
        console.log('✅ Successfully added father_name column to users table.');
    }

    // Verify the change
    db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (err) {
            console.error('Error verifying table schema:', err.message);
        } else {
            console.log('\n📋 Current users table schema:');
            columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });
        }

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('\n✅ Migration completed successfully!');
            }
        });
    });
});
