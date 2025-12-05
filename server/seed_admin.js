const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

const email = 'admin@example.com';
const password = 'password123';
const passwordHash = bcrypt.hashSync(password, 8);

db.run(`INSERT INTO super_admin (email, password_hash) VALUES (?, ?)`, [email, passwordHash], function (err) {
    if (err) {
        console.error(err.message);
    } else {
        console.log(`Super Admin created with ID: ${this.lastID}`);
    }
    db.close();
});
