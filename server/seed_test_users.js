const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedTestUsers() {
    console.log('🌱 Seeding test users and data...\n');

    try {
        // 1. Super Admin
        const superAdminPassword = bcrypt.hashSync('Admin@123', 8);
        db.run(`INSERT OR REPLACE INTO super_admin (id, email, password_hash) VALUES (1, 'admin@schoolapp.com', ?)`,
            [superAdminPassword],
            () => console.log('✓ Super Admin created: admin@schoolapp.com / Admin@123')
        );

        // 2. School 1 - Trial
        const school1Password = bcrypt.hashSync('School@123', 8);
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);

        db.run(`INSERT OR REPLACE INTO schools (id, school_name, email, password_hash, contact_person, contact_phone, plan_type, plan_expiry_date, max_students, max_classes, status) 
            VALUES (1, 'Green Valley School', 'greenvalley@school.com', ?, 'Mr. Sharma', '9876543200', 'trial', ?, 20, 2, 'active')`,
            [school1Password, trialExpiry.toISOString().split('T')[0]],
            function (err) {
                if (err) console.error('Error creating School 1:', err.message);
                else console.log('✓ School 1 created: greenvalley@school.com / School@123 (Trial)');
            }
        );

        // 3. School 2 - Paid Standard Plan
        const school2Password = bcrypt.hashSync('School@456', 8);
        const paidExpiry = new Date();
        paidExpiry.setMonth(paidExpiry.getMonth() + 1);

        db.run(`INSERT OR REPLACE INTO schools (id, school_name, email, password_hash, contact_person, contact_phone, plan_type, plan_expiry_date, max_students, max_classes, status, revenue_paid) 
            VALUES (2, 'Sunrise Academy', 'sunrise@academy.com', ?, 'Mrs. Patel', '9876543201', 'standard', ?, 150, 10, 'active', 499)`,
            [school2Password, paidExpiry.toISOString().split('T')[0]],
            function () {
                console.log('✓ School 2 created: sunrise@academy.com / School@456 (Standard ₹499)');
            }
        );

        // Wait a bit for schools to be created
        setTimeout(() => {
            // 4. Classes for Green Valley School
            db.run(`INSERT OR REPLACE INTO classes (id, school_id, class_name, class_password) VALUES (1, 1, 'Class 1', 'C1ABC123')`,
                () => console.log('✓ Class 1 created with password: C1ABC123'));

            db.run(`INSERT OR REPLACE INTO classes (id, school_id, class_name, class_password) VALUES (2, 1, 'Class 2', 'C2DEF456')`,
                () => console.log('✓ Class 2 created with password: C2DEF456'));

            // 5. Classes for Sunrise Academy
            db.run(`INSERT OR REPLACE INTO classes (id, school_id, class_name, class_password) VALUES (3, 2, 'Grade 5', 'G5XYZ789')`,
                () => console.log('✓ Grade 5 created with password: G5XYZ789'));

            setTimeout(() => {
                // 6. Teacher for Class 1
                db.run(`INSERT OR REPLACE INTO users (id, name, phone, contact_phone, address, role, class_id, school_id) VALUES (1, 'Rajesh Kumar', '9876543210', '9876543220', '123 MG Road, Delhi', 'teacher', 1, 1)`,
                    () => console.log('✓ Teacher created: Rajesh Kumar / 9876543210 / C1ABC123'));

                // 7. Parent 1 with unpaid fees
                db.run(`INSERT OR REPLACE INTO users (id, name, phone, contact_phone, address, role, class_id, school_id) VALUES (2, 'Priya Sharma', '9876543211', '9876543221', '456 Park Street, Delhi', 'parent', 1, 1)`,
                    function () {
                        console.log('✓ Parent 1 created: Priya Sharma / 9876543211 / C1ABC123 (has unpaid fees)');

                        // Add unpaid fees for January and February
                        db.run(`INSERT OR REPLACE INTO fees (id, parent_id, month, amount, status) VALUES (1, 2, 'Jan', 500, 'UNPAID')`,
                            () => console.log('  - Unpaid fee: Jan ₹500'));
                        db.run(`INSERT OR REPLACE INTO fees (id, parent_id, month, amount, status) VALUES (2, 2, 'Feb', 500, 'UNPAID')`,
                            () => console.log('  - Unpaid fee: Feb ₹500'));
                    }
                );

                // 8. Parent 2 with all fees paid
                db.run(`INSERT OR REPLACE INTO users (id, name, phone, contact_phone, address, role, class_id, school_id) VALUES (3, 'Amit Patel', '9876543212', '9876543222', '789 Lake View, Delhi', 'parent', 1, 1)`,
                    function () {
                        console.log('✓ Parent 2 created: Amit Patel / 9876543212 / C1ABC123 (all fees paid)');

                        db.run(`INSERT OR REPLACE INTO fees (id, parent_id, month, amount, status) VALUES (3, 3, 'Jan', 500, 'PAID')`,
                            () => console.log('  - Paid fee: Jan ₹500'));
                    }
                );

                // 9. Teacher for Grade 5
                db.run(`INSERT OR REPLACE INTO users (id, name, phone, contact_phone, address, role, class_id, school_id) VALUES (4, 'Sunita Verma', '9876543213', '9876543223', '321 Hill Road, Mumbai', 'teacher', 3, 2)`,
                    () => console.log('✓ Teacher created: Sunita Verma / 9876543213 / G5XYZ789'));

                setTimeout(() => {
                    console.log('\n✅ Test data seeded successfully!');
                    console.log('\n📝 Test Credentials Summary:');
                    console.log('═══════════════════════════════════════════════════════════');
                    console.log('🔐 Super Admin:');
                    console.log('   Email: admin@schoolapp.com');
                    console.log('   Password: Admin@123');
                    console.log('');
                    console.log('🏫 School 1 (Trial - Green Valley):');
                    console.log('   Email: greenvalley@school.com');
                    console.log('   Password: School@123');
                    console.log('   Plan: Trial (14 days)');
                    console.log('');
                    console.log('🏫 School 2 (Paid - Sunrise Academy):');
                    console.log('   Email: sunrise@academy.com');
                    console.log('   Password: School@456');
                    console.log('   Plan: Standard (₹499/month)');
                    console.log('');
                    console.log('👨‍🏫 Teacher (Green Valley, Class 1):');
                    console.log('   Phone: 9876543210');
                    console.log('   Class Password: C1ABC123');
                    console.log('');
                    console.log('👪 Parent 1 (with unpaid fees):');
                    console.log('   Phone: 9876543211');
                    console.log('   Class Password: C1ABC123');
                    console.log('   Unpaid: January & February (₹500 each)');
                    console.log('');
                    console.log('👪 Parent 2 (all fees paid):');
                    console.log('   Phone: 9876543212');
                    console.log('   Class Password: C1ABC123');
                    console.log('');
                    console.log('👨‍🏫 Teacher (Sunrise, Grade 5):');
                    console.log('   Phone: 9876543213');
                    console.log('   Class Password: G5XYZ789');
                    console.log('═══════════════════════════════════════════════════════════');

                    process.exit(0);
                }, 500);
            }, 500);
        }, 500);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedTestUsers();
