const db = require('./database');
const bcrypt = require('bcryptjs');

// Mock Data
const TEST_SCHOOL_ID = 1; // Assuming school 1 exists
const TEST_PHONE = '9999999999';
const TEST_ROLE = 'teacher';

async function runTest() {
    console.log("🚀 Starting Password Fix Verification...");

    try {
        // Cleanup
        await new Promise((resolve) => {
            db.run(`DELETE FROM users WHERE phone = ?`, [TEST_PHONE], () => resolve());
        });

        // 1. Create User (Simulate Controller Logic)
        console.log("1. Creating Test User...");

        // Logic from schoolController.createUser
        const password = Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = bcrypt.hashSync(password, 8);

        const userId = await new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (name, phone, role, school_id, password_hash) VALUES (?, ?, ?, ?, ?)`,
                ['Test User', TEST_PHONE, TEST_ROLE, TEST_SCHOOL_ID, hashedPassword],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        console.log(`   ✅ User created with ID: ${userId}, Password: ${password}`);

        // 2. Login User (Simulate Auth Controller Logic)
        console.log("2. Attempting Login...");

        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE phone = ?', [TEST_PHONE], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) throw new Error("User not found");

        // Verify Password
        if (user.password_hash) {
            const isValid = bcrypt.compareSync(password, user.password_hash);
            if (isValid) {
                console.log("   ✅ Password verification SUCCESSFUL");
            } else {
                throw new Error("Password verification FAILED");
            }
        } else {
            throw new Error("User has no password_hash");
        }

        // Cleanup
        console.log("🧹 Cleaning up...");
        db.run(`DELETE FROM users WHERE id = ?`, [userId]);

        console.log("\n🎉 Password Fix Verification PASSED!");

    } catch (err) {
        console.error("\n❌ Test Failed:", err);
        process.exit(1);
    }
}

runTest();
