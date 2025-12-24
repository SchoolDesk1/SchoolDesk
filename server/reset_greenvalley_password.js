const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const email = 'greenvalley@school.com';
    const newPassword = 'demo123'; // Simple password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);

    console.log(`Resetting password for ${email}...`);

    const { data, error } = await supabase
        .from('schools')
        .update({ password_hash: hashedPassword })
        .eq('email', email)
        .select();

    if (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }

    if (!data || data.length === 0) {
        console.log('School not found in database');
        process.exit(1);
    }

    console.log('\n✅ PASSWORD RESET SUCCESSFUL!');
    console.log('========================================');
    console.log('Green Valley Institute Login:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log(`URL: http://127.0.0.1:5173/login`);
    console.log('========================================\n');
    process.exit(0);
}

resetPassword().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
