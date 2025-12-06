// Partner Code Generator Utility
// Generates unique partner codes in format: SDP001, SDP002, etc.

const supabase = require('../supabase');

/**
 * Generate the next unique partner code
 * Format: SDP + 3-digit number (e.g., SDP001, SDP002)
 * @returns {Promise<string>} The generated partner code
 */
async function generatePartnerCode() {
    try {
        // Get the latest partner code
        const { data: row, error } = await supabase
            .from('partners')
            .select('unique_code')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        let nextNumber = 1;

        if (row && row.unique_code) {
            // Extract number from existing code (e.g., SDP001 -> 1)
            const currentNumber = parseInt(row.unique_code.replace('SDP', ''));
            nextNumber = currentNumber + 1;
        }

        // Format with leading zeros (e.g., 1 -> 001)
        const code = `SDP${String(nextNumber).padStart(3, '0')}`;

        return code;
    } catch (error) {
        // If no partners exist, return SDP001
        return 'SDP001';
    }
}

/**
 * Validate if a partner code exists and is active
 * @param {string} code - The partner code to validate
 * @returns {Promise<object|null>} Partner object if valid, null otherwise
 */
async function validatePartnerCode(code) {
    try {
        const { data: row, error } = await supabase
            .from('partners')
            .select('*')
            .eq('unique_code', code)
            .eq('status', 'active')
            .single();

        if (error || !row) {
            return null;
        }

        return row;
    } catch (error) {
        return null;
    }
}

module.exports = {
    generatePartnerCode,
    validatePartnerCode
};
