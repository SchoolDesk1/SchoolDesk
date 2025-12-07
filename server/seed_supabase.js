const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function seedSupabase() {
    console.log('🌱 Seeding Supabase with initial accounts...\n');

    try {
        // 1. Super Admin
        const adminEmail = 'admin@schooldesk.com';
        const adminPassword = 'Admin@123';
        const adminHash = bcrypt.hashSync(adminPassword, 10);

        console.log(`Creating Super Admin: ${adminEmail}`);

        const { data: admin, error: adminError } = await supabase
            .from('super_admin')
            .upsert({
                id: 1,
                email: adminEmail,
                password_hash: adminHash
            }, { onConflict: 'email' })
            .select()
            .single();

        if (adminError) {
            console.error('❌ Error creating Super Admin:', adminError.message);
        } else {
            console.log('✅ Super Admin created successfully.');
        }

        // 2. Partner
        const partnerEmail = 'partner@schooldesk.com';
        const partnerPassword = 'partner123';
        const partnerHash = bcrypt.hashSync(partnerPassword, 10);
        const partnerCode = 'SDP001';

        console.log(`\nCreating Partner: ${partnerEmail}`);

        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .upsert({
                name: 'Demo Partner',
                email: partnerEmail,
                phone: '9876543210',
                country: 'India',
                unique_code: partnerCode,
                password_hash: partnerHash,
                status: 'active'
            }, { onConflict: 'email' })
            .select()
            .single();

        if (partnerError) {
            console.error('❌ Error creating Partner:', partnerError.message);
        } else {
            console.log('✅ Partner created successfully.');
        }

        console.log('\n✨ Seeding completed.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

seedSupabase();
