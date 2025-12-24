const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function createGreenValleySchool() {
    const email = 'greenvalley@school.com';
    const password = 'greenvalley123'; // You can change this
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Check if exists
    const { data: existing } = await supabase
        .from('schools')
        .select('id')
        .eq('email', email)
        .single();

    if (existing) {
        console.log('✓ School already exists!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    }

    // Create school
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);

    const { data, error } = await supabase
        .from('schools')
        .insert({
            school_name: 'Green Valley Institute',
            email: email,
            password_hash: hashedPassword,
            contact_person: 'Admin',
            contact_phone: '9876543210',
            address: 'Green Valley',
            plan_type: 'premium',
            plan_expiry_date: expiryDate.toISOString().split('T')[0],
            max_students: 500,
            max_classes: 50,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }

    console.log('✅ GREEN VALLEY SCHOOL CREATED!');
    console.log('================================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`URL: http://127.0.0.1:5173/login`);
    console.log('================================');
    process.exit(0);
}

createGreenValleySchool();
