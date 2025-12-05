const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../school.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Directly creating tables in school.db...\n');

db.serialize(() => {
    // Vehicles Table
    db.run(`DROP TABLE IF EXISTS vehicles`, (err) => {
        if (err) console.error('Error dropping vehicles:', err);
    });

    db.run(`CREATE TABLE vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        vehicle_name TEXT NOT NULL,
        route_details TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_phone TEXT NOT NULL,
        pickup_time TEXT,
        drop_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating vehicles table:', err.message);
        } else {
            console.log('✅ Vehicles table created successfully');
        }
    });

    // Events Table
    db.run(`DROP TABLE IF EXISTS events`, (err) => {
        if (err) console.error('Error dropping events:', err);
    });

    db.run(`CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating events table:', err.message);
        } else {
            console.log('✅ Events table created successfully');
        }
    });

    // Timetables Table
    db.run(`DROP TABLE IF EXISTS timetables`, (err) => {
        if (err) console.error('Error dropping timetables:', err);
    });

    db.run(`CREATE TABLE timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        day TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        subject TEXT NOT NULL,
        timing TEXT NOT NULL,
        teacher_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating timetables table:', err.message);
        } else {
            console.log('✅ Timetables table created successfully');
        }
    });

    // Marks Table
    db.run(`DROP TABLE IF EXISTS marks`, (err) => {
        if (err) console.error('Error dropping marks:', err);
    });

    db.run(`CREATE TABLE marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        marks REAL NOT NULL,
        max_marks REAL NOT NULL,
        test_name TEXT,
        test_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating marks table:', err.message);
        } else {
            console.log('✅ Marks table created successfully');
        }

        // Add vehicle_id column
        db.run(`ALTER TABLE users ADD COLUMN vehicle_id INTEGER`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('❌ Error adding vehicle_id column:', err.message);
            } else {
                console.log('✅ Added vehicle_id column to users table');
            }

            setTimeout(() => {
                console.log('\n🎉 All tables created successfully!');
                db.close();
                process.exit(0);
            }, 500);
        });
    });
});
