const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function createTestAccounts() {
    console.log('Creating test accounts...\n');

    // 1. Create Test School
    const schoolEmail = 'demo@school.com';
    const schoolPassword = 'demo123';
    const hashedSchoolPassword = bcrypt.hashSync(schoolPassword, 8);

    // Check if school exists
    const { data: existingSchool } = await supabase
        .from('schools')
        .select('id')
        .eq('email', schoolEmail)
        .single();

    if (existingSchool) {
        console.log('✓ Test school already exists');
        console.log(`  Email: ${schoolEmail}`);
        console.log(`  Password: ${schoolPassword}\n`);
    } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 365); // 1 year trial

        const { data: newSchool, error } = await supabase
            .from('schools')
            .insert({
                school_name: 'Demo Institute',
                email: schoolEmail,
                password_hash: hashedSchoolPassword,
                contact_person: 'Demo Admin',
                contact_phone: '9876543210',
                address: 'Demo Address',
                plan_type: 'premium',
                plan_expiry_date: expiryDate.toISOString().split('T')[0],
                max_students: 500,
                max_classes: 50,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('✗ Error creating school:', error.message);
        } else {
            console.log('✓ Test school created successfully!');
            console.log(`  Email: ${schoolEmail}`);
            console.log(`  Password: ${schoolPassword}\n`);
        }
    }

    // 2. Create Test Partner
    const partnerEmail = 'demo@partner.com';
    const partnerPassword = 'demo123';
    const hashedPartnerPassword = await bcrypt.hash(partnerPassword, 10);

    const { data: existingPartner } = await supabase
        .from('partners')
        .select('id')
        .eq('email', partnerEmail)
        .single();

    if (existingPartner) {
        console.log('✓ Test partner already exists');
        console.log(`  Email: ${partnerEmail}`);
        console.log(`  Password: ${partnerPassword}\n`);
    } else {
        const { data: newPartner, error } = await supabase
            .from('partners')
            .insert({
                name: 'Demo Partner',
                email: partnerEmail,
                password_hash: hashedPartnerPassword,
                phone: '9876543210',
                country: 'India',
                unique_code: 'SDP999',
                status: 'active',
                commission_rate: 20
            })
            .select()
            .single();

        if (error) {
            console.error('✗ Error creating partner:', error.message);
        } else {
            console.log('✓ Test partner created successfully!');
            console.log(`  Email: ${partnerEmail}`);
            console.log(`  Password: ${partnerPassword}`);
            console.log(`  Referral Code: SDP999\n`);
        }
    }

    // 3. Super Admin (already exists via secret key)
    console.log('✓ Super Admin login available');
    console.log(`  Secret Key: SuperSecretAdmin2024!\n`);

    console.log('═══════════════════════════════════════');
    console.log('ALL TEST ACCOUNTS READY!');
    console.log('═══════════════════════════════════════');
    console.log('\n📝 TEST CREDENTIALS:\n');
    console.log('School Admin Login:');
    console.log(`  Email: ${schoolEmail}`);
    console.log(`  Password: ${schoolPassword}`);
    console.log(`  URL: http://127.0.0.1:5173/login\n`);

    console.log('Partner Login:');
    console.log(`  Email: ${partnerEmail}`);
    console.log(`  Password: ${partnerPassword}`);
    console.log(`  URL: http://127.0.0.1:5173/partner/login\n`);

    console.log('Super Admin Login:');
    console.log(`  Secret Key: SuperSecretAdmin2024!`);
    console.log(`  URL: http://127.0.0.1:5173/super-admin/login\n`);

    process.exit(0);
}

createTestAccounts().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
