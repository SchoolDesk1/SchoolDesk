const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initSchema();
  }
});

function initSchema() {
  db.serialize(() => {
    // Super Admin Table
    db.run(`CREATE TABLE IF NOT EXISTS super_admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )`);

    // Plans Table
    db.run(`CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      max_students INTEGER,
      max_classes INTEGER,
      features TEXT
    )`);

    // Schools Table
    db.run(`CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      contact_person TEXT,
      contact_phone TEXT,
      address TEXT,
      plan_type TEXT DEFAULT 'trial',
      plan_expiry_date DATE,
      max_students INTEGER DEFAULT 20,
      max_classes INTEGER DEFAULT 2,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Classes Table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      class_name TEXT NOT NULL,
      class_password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(school_id) REFERENCES schools(id)
    )`);

    // Users Table (Teachers & Parents)
    db.run(`CREATE TABLE IF NOT EXISTS users(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              phone TEXT UNIQUE NOT NULL,
              contact_phone TEXT,
              address TEXT,
              role TEXT NOT NULL CHECK(role IN('teacher', 'parent')),
              class_id INTEGER,
              school_id INTEGER,
              password_hash TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(class_id) REFERENCES classes(id),
              FOREIGN KEY(school_id) REFERENCES schools(id)
            )`);

    // Homework Table
    db.run(`CREATE TABLE IF NOT EXISTS homework(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              class_id INTEGER NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              file_url TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(class_id) REFERENCES classes(id)
            )`);

    // Notices Table
    db.run(`CREATE TABLE IF NOT EXISTS notices(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              school_id INTEGER NOT NULL,
              class_id INTEGER,
              notice_text TEXT NOT NULL,
              file_url TEXT,
              expiry_date DATE,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(school_id) REFERENCES schools(id),
              FOREIGN KEY(class_id) REFERENCES classes(id)
            )`);

    // Fees Table (Enhanced with popup control)
    db.run(`CREATE TABLE IF NOT EXISTS fees(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              parent_id INTEGER NOT NULL,
              month TEXT NOT NULL,
              amount REAL,
              status TEXT DEFAULT 'UNPAID',
              dismissed INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(parent_id) REFERENCES users(id)
            )`);

    // Analytics Table
    db.run(`CREATE TABLE IF NOT EXISTS analytics(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date DATE DEFAULT CURRENT_DATE,
              metric_name TEXT NOT NULL,
              metric_value INTEGER NOT NULL,
              school_id INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

    // Support Tickets Table
    db.run(`CREATE TABLE IF NOT EXISTS support_tickets(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              school_id INTEGER NOT NULL,
              subject TEXT NOT NULL,
              message TEXT NOT NULL,
              status TEXT DEFAULT 'open',
              admin_response TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              resolved_at DATETIME,
              FOREIGN KEY(school_id) REFERENCES schools(id)
            )`);

    // Payments Table
    db.run(`CREATE TABLE IF NOT EXISTS payments(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              school_id INTEGER NOT NULL,
              plan_id TEXT NOT NULL,
              amount REAL NOT NULL,
              payment_code TEXT UNIQUE NOT NULL,
              transaction_id TEXT,
              status TEXT DEFAULT 'pending',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              verified_at DATETIME,
              FOREIGN KEY(school_id) REFERENCES schools(id)
            )`);

    // Activity Logs Table
    db.run(`CREATE TABLE IF NOT EXISTS activity_logs(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              actor_type TEXT NOT NULL, -- 'super_admin', 'school_admin', 'system'
              actor_id INTEGER,
              action_type TEXT NOT NULL, -- 'LOGIN', 'CREATE', 'DELETE', 'UPDATE', 'PAYMENT'
              description TEXT NOT NULL,
              target_type TEXT, -- 'school', 'user', 'payment'
              target_id INTEGER,
              ip_address TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

    // Partners Table
    db.run(`CREATE TABLE IF NOT EXISTS partners(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              phone TEXT NOT NULL,
              country TEXT NOT NULL,
              unique_code TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

    // Partner-Schools Mapping Table
    db.run(`CREATE TABLE IF NOT EXISTS partner_schools(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              partner_code TEXT NOT NULL,
              school_id INTEGER NOT NULL,
              revenue REAL DEFAULT 0,
              commission REAL DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(school_id) REFERENCES schools(id),
              FOREIGN KEY(partner_code) REFERENCES partners(unique_code)
            )`);

    // Promo Codes Table
    db.run(`CREATE TABLE IF NOT EXISTS promo_codes(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              code TEXT UNIQUE NOT NULL,
              type TEXT NOT NULL CHECK(type IN('flat', 'percentage')),
              value REAL NOT NULL,
              applicable_plans TEXT NOT NULL,
              valid_from DATE NOT NULL,
              valid_to DATE NOT NULL,
              usage_limit INTEGER,
              current_usage INTEGER DEFAULT 0,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

    // Payout Requests Table
    db.run(`CREATE TABLE IF NOT EXISTS payout_requests(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              partner_id INTEGER NOT NULL,
              amount REAL NOT NULL,
              payment_details TEXT NOT NULL,
              status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              processed_at DATETIME,
              FOREIGN KEY(partner_id) REFERENCES partners(id)
            )`);

    // Notifications Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              recipient_type TEXT NOT NULL, -- 'super_admin', 'partner', 'school'
              recipient_id INTEGER, -- NULL for super_admin
              title TEXT NOT NULL,
              message TEXT NOT NULL,
              type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'payout_request'
              is_read INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

    // Add partner_code column to schools table if it doesn't exist
    db.run(`ALTER TABLE schools ADD COLUMN partner_code TEXT`, (err) => {
      // Ignore error if column already exists
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding partner_code column:', err.message);
      }
    });
  });
}

module.exports = db;
