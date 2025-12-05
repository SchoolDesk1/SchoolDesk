const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../school.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing Timetable Schema - Adding UNIQUE Constraint\n');

db.serialize(() => {
    // First, let's see what's in the timetables table
    db.all('SELECT id, class_id, day, period_number, subject FROM timetables ORDER BY class_id, id', (err, rows) => {
        if (err) {
            console.error('Error querying timetables:', err);
            return;
        }

        console.log('Current timetable entries:');
        rows.forEach(row => {
            console.log(`ID: ${row.id}, Class: ${row.class_id}, Day: ${row.day}, Period: ${row.period_number}, Subject: ${row.subject}`);
        });

        console.log(`\nTotal entries: ${rows.length}\n`);

        // Recreate table with proper UNIQUE constraint
        console.log('Recreating timetables table with UNIQUE constraint...');

        db.run(`CREATE TABLE IF NOT EXISTS timetables_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            day TEXT NOT NULL,
            period_number INTEGER NOT NULL,
            subject TEXT NOT NULL,
            timing TEXT NOT NULL,
            teacher_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(class_id, day, period_number)
        )`, (err) => {
            if (err) {
                console.error('Error creating new table:', err);
                db.close();
                return;
            }

            console.log('✅ New table created with UNIQUE constraint');

            // Copy unique data
            db.run(`INSERT INTO timetables_new (class_id, day, period_number, subject, timing, teacher_name)
                    SELECT class_id, day, period_number, subject, timing, teacher_name
                    FROM timetables
                    GROUP BY class_id, day, period_number`, (err) => {
                if (err) {
                    console.error('Error copying data:', err);
                    db.close();
                    return;
                }

                console.log('✅ Unique data copied');

                // Drop old table and rename new one
                db.run('DROP TABLE timetables', (err) => {
                    if (err) {
                        console.error('Error dropping old table:', err);
                        db.close();
                        return;
                    }

                    db.run('ALTER TABLE timetables_new RENAME TO timetables', (err) => {
                        if (err) {
                            console.error('Error renaming table:', err);
                            db.close();
                            return;
                        }

                        console.log('✅ Table renamed successfully');

                        // Verify final state
                        db.all('SELECT class_id, COUNT(*) as count FROM timetables GROUP BY class_id', (err, counts) => {
                            if (err) {
                                console.error('Error verifying:', err);
                            } else {
                                console.log('\nFinal timetable entries per class:');
                                counts.forEach(c => {
                                    console.log(`Class ${c.class_id}: ${c.count} entries`);
                                });
                            }

                            console.log('\n🎉 Timetable schema fixed! Each class will now have its own unique timetable.');
                            db.close();
                            process.exit(0);
                        });
                    });
                });
            });
        });
    });
});
