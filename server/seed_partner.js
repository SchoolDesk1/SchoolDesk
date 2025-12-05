const db = require('./database');
const bcrypt = require('bcryptjs');
const { generatePartnerCode } = require('./utils/partnerCodeGenerator');

async function seedPartner() {
    console.log('Seeding test partner...');

    const passwordHash = await bcrypt.hash('partner123', 10);
    const uniqueCode = await generatePartnerCode();

    const partner = {
        name: 'Demo Partner',
        email: 'partner@demo.com',
        phone: '9876543210',
        country: 'India',
        unique_code: uniqueCode,
        password_hash: passwordHash
    };

    db.run(
        `INSERT INTO partners (name, email, phone, country, unique_code, password_hash) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partner.name, partner.email, partner.phone, partner.country, partner.unique_code, partner.password_hash],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.log('Test partner already exists.');
                } else {
                    console.error('Error creating partner:', err);
                }
            } else {
                console.log('Test partner created successfully!');
                console.log('--------------------------------');
                console.log(`Email: ${partner.email}`);
                console.log(`Password: partner123`);
                console.log(`Partner Code: ${partner.unique_code}`);
                console.log('--------------------------------');
            }
        }
    );
}

seedPartner();
