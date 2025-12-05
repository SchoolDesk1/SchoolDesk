const db = require('../database');

console.log('🚀 Adding new features to database...');

db.serialize(() => {
    // 1. Weekly Timetable Table
    db.run(`CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        day TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        subject TEXT NOT NULL,
        timing TEXT NOT NULL,
        teacher_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`, (err) => {
        if (err) console.error('❌ Timetables table error:', err);
        else console.log('✅ Timetables table created');
    });

    // 2. Vehicles Table
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        vehicle_name TEXT NOT NULL,
        route_details TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_phone TEXT NOT NULL,
        pickup_time TEXT,
        drop_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(school_id) REFERENCES schools(id)
    )`, (err) => {
        if (err) console.error('❌ Vehicles table error:', err);
        else console.log('✅ Vehicles table created');
    });

    // Add vehicle_id to users table (for students/parents)
    db.run(`ALTER TABLE users ADD COLUMN vehicle_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Error adding vehicle_id:', err);
        } else {
            console.log('✅ Added vehicle_id to users table');
        }
    });

    // 3. Marks/Performance Table
    db.run(`CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        marks REAL NOT NULL,
        max_marks REAL NOT NULL,
        test_name TEXT,
        test_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('❌ Marks table error:', err);
        else console.log('✅ Marks table created');
    });

    // 4. Events Calendar Table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(school_id) REFERENCES schools(id)
    )`, (err) => {
        if (err) console.error('❌ Events table error:', err);
        else console.log('✅ Events table created');
    });

    console.log('\n✅ All new feature tables added successfully!');
    process.exit(0);
});
