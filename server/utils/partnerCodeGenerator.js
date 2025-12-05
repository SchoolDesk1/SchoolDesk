// Partner Code Generator Utility
// Generates unique partner codes in format: SDP001, SDP002, etc.

const db = require('../database');

/**
 * Generate the next unique partner code
 * Format: SDP + 3-digit number (e.g., SDP001, SDP002)
 * @returns {Promise<string>} The generated partner code
 */
function generatePartnerCode() {
    return new Promise((resolve, reject) => {
        // Get the latest partner code
        db.get(
            'SELECT unique_code FROM partners ORDER BY id DESC LIMIT 1',
            (err, row) => {
                if (err) {
                    return reject(err);
                }

                let nextNumber = 1;

                if (row && row.unique_code) {
                    // Extract number from existing code (e.g., SDP001 -> 1)
                    const currentNumber = parseInt(row.unique_code.replace('SDP', ''));
                    nextNumber = currentNumber + 1;
                }

                // Format with leading zeros (e.g., 1 -> 001)
                const code = `SDP${String(nextNumber).padStart(3, '0')}`;

                resolve(code);
            }
        );
    });
}

/**
 * Validate if a partner code exists and is active
 * @param {string} code - The partner code to validate
 * @returns {Promise<object|null>} Partner object if valid, null otherwise
 */
function validatePartnerCode(code) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM partners WHERE unique_code = ? AND status = ?',
            [code, 'active'],
            (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            }
        );
    });
}

module.exports = {
    generatePartnerCode,
    validatePartnerCode
};
