const db = require('./database');

console.log('🔍 Checking vehicles table schema...\n');

db.all("PRAGMA table_info(vehicles)", [], (err, columns) => {
    if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }

    if (!columns || columns.length === 0) {
        console.log('❌ Vehicles table does NOT exist!');
        console.log('Run: node server/migrations/add_new_features.js');
        process.exit(1);
    }

    console.log('✅ Vehicles table exists with columns:');
    columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Try to insert a test vehicle
    console.log('\n🧪 Testing vehicle insertion...\n');

    const testVehicle = {
        school_id: 1,
        vehicle_name: 'Test Bus',
        route_details: 'Test Route',
        driver_name: 'Test Driver',
        driver_phone: '1234567890',
        pickup_time: '07:00',
        drop_time: '15:00'
    };

    const sql = `INSERT INTO vehicles (school_id, vehicle_name, route_details, driver_name, driver_phone, pickup_time, drop_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
        testVehicle.school_id,
        testVehicle.vehicle_name,
        testVehicle.route_details,
        testVehicle.driver_name,
        testVehicle.driver_phone,
        testVehicle.pickup_time,
        testVehicle.drop_time
    ], function (err) {
        if (err) {
            console.error('❌ Failed to insert test vehicle:');
            console.error('   Error:', err.message);
        } else {
            console.log('✅ Successfully inserted test vehicle!');
            console.log('   Vehicle ID:', this.lastID);

            // Delete the test vehicle
            db.run('DELETE FROM vehicles WHERE id = ?', [this.lastID], () => {
                console.log('✅ Cleaned up test vehicle\n');
                process.exit(0);
            });
        }
    });
});
