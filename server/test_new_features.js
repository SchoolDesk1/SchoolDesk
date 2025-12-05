const db = require('./database');

console.log('🧪 Testing New Features APIs...\n');

// Test if tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('❌ Database error:', err);
        return;
    }

    console.log('📋 Available tables:');
    tables.forEach(t => console.log(`  - ${t.name}`));

    const requiredTables = ['timetables', 'vehicles', 'marks', 'events'];
    const missingTables = requiredTables.filter(t => !tables.find(table => table.name === t));

    if (missingTables.length > 0) {
        console.log('\n❌ Missing tables:', missingTables.join(', '));
        console.log('Run: node server/migrations/add_new_features.js');
    } else {
        console.log('\n✅ All required tables exist!');
    }

    // Check table structures
    console.log('\n🔍 Checking table structures...\n');

    db.all("PRAGMA table_info(vehicles)", [], (err, cols) => {
        if (!err) {
            console.log('✅ Vehicles table columns:', cols.map(c => c.name).join(', '));
        }
    });

    db.all("PRAGMA table_info(events)", [], (err, cols) => {
        if (!err) {
            console.log('✅ Events table columns:', cols.map(c => c.name).join(', '));
        }
    });

    db.all("PRAGMA table_info(timetables)", [], (err, cols) => {
        if (!err) {
            console.log('✅ Timetables table columns:', cols.map(c => c.name).join(', '));
        }
    });

    db.all("PRAGMA table_info(marks)", [], (err, cols) => {
        if (!err) {
            console.log('✅ Marks table columns:', cols.map(c => c.name).join(', '));

            setTimeout(() => process.exit(0), 1000);
        }
    });
});
