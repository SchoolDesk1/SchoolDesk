const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function seedSupabase() {
    console.log('🌱 Seeding Supabase with initial accounts...\n');

    try {
        // 1. Super Admin (Legacy & New)
        const admins = [
            { email: 'admin@schooldesk.com', password: 'Admin@123' },
            { email: 'admin@schoolapp.com', password: 'Admin@123' } // User's preferred email
        ];

        for (const admin of admins) {
            const adminHash = bcrypt.hashSync(admin.password, 10);
            console.log(`Creating Super Admin: ${admin.email}`);

            const { error: adminError } = await supabase
                .from('super_admin')
                .upsert({
                    email: admin.email,
                    password_hash: adminHash
                }, { onConflict: 'email' })
                .select()
                .single();

            if (adminError) console.error(`❌ Error creating ${admin.email}:`, adminError.message);
            else console.log(`✅ Super Admin ${admin.email} ready.`);
        }

        // 2. Partner (Legacy & New)
        const partners = [
            { email: 'partner@schooldesk.com', password: 'partner123', code: 'SDP001' },
            { email: 'partner@demo.com', password: 'partner123', code: 'DEMO01' } // User's preferred email
        ];

        for (const p of partners) {
            const partnerHash = bcrypt.hashSync(p.password, 10);
            console.log(`\nCreating Partner: ${p.email}`);

            const { error: partnerError } = await supabase
                .from('partners')
                .upsert({
                    name: 'Demo Partner',
                    email: p.email,
                    phone: '9876543210',
                    country: 'India',
                    unique_code: p.code,
                    password_hash: partnerHash,
                    status: 'active'
                }, { onConflict: 'email' })
                .select()
                .single();

            if (partnerError) console.error(`❌ Error creating ${p.email}:`, partnerError.message);
            else console.log(`✅ Partner ${p.email} ready.`);
        }

        console.log('\n✨ Seeding completed.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

seedSupabase();
