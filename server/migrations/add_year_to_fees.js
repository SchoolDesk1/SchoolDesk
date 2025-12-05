const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../school.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking fees table schema...');

    db.all("PRAGMA table_info(fees)", (err, rows) => {
        if (err) {
            console.error('Error getting table info:', err);
            return;
        }

        const hasYear = rows.some(row => row.name === 'year');

        if (!hasYear) {
            console.log('Adding year column to fees table...');
            db.run("ALTER TABLE fees ADD COLUMN year INTEGER DEFAULT 2025", (err) => {
                if (err) {
                    console.error('Error adding column:', err);
                } else {
                    console.log('Successfully added year column.');
                }
            });
        } else {
            console.log('Year column already exists.');
        }
    });
});

db.close();
