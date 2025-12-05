const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO schools (id, school_name, email, password_hash, plan_type) 
            VALUES (1, 'Demo School', 'demo@school.com', 'hashed_password', 'trial')`, (err) => {
        if (err) {
            console.error('Error seeding school:', err);
        } else {
            console.log('Seeded school with ID 1');
        }
    });
});

db.close();
