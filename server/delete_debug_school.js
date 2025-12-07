const supabase = require('./supabase');

async function deleteSchool(email) {
    console.log(`Attempting to delete school with email: ${email}`);

    // 1. Get School ID
    const { data: school, error: findError } = await supabase
        .from('schools')
        .select('id')
        .eq('email', email)
        .single();

    if (findError || !school) {
        console.log('School not found or error finding school:', findError?.message);
        return;
    }

    console.log(`Found school ID: ${school.id}. Deleting associated data...`);

    // 2. Delete related data (optional, depending on CASCADE rules, but good to be safe)
    // Deleting payments
    const { error: payError } = await supabase.from('payments').delete().eq('school_id', school.id);
    if (payError) console.error('Error deleting payments:', payError.message);

    // Deleting users (teachers/parents) if any - assuming they link to school_id or class_id
    // Providing simple cleanup for now.

    // 3. Delete School
    const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);

    if (deleteError) {
        console.error('Error deleting school:', deleteError.message);
    } else {
        console.log('Successfully deleted school.');
    }
}

// Check args or default
const email = process.argv[2] || 'greenvalley@school.com'; // Default from screenshot assumption
deleteSchool(email);
