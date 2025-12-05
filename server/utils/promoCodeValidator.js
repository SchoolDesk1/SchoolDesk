// Promo Code Validator and Discount Calculator
const db = require('../database');

/**
 * Validate a promo code
 * @param {string} code - The promo code to validate
 * @param {string} planType - The plan type (basic, standard, premium)
 * @returns {Promise<object>} Validation result with discount info
 */
function validatePromoCode(code, planType) {
    return new Promise((resolve, reject) => {
        const today = new Date().toISOString().split('T')[0];

        db.get(
            `SELECT * FROM promo_codes 
       WHERE code = ? 
       AND status = 'active' 
       AND valid_from <= ? 
       AND valid_to >= ?`,
            [code, today, today],
            (err, promo) => {
                if (err) {
                    return reject(err);
                }

                if (!promo) {
                    return resolve({
                        valid: false,
                        message: 'Invalid or expired promo code'
                    });
                }

                // Check if applicable to the plan
                const applicablePlans = promo.applicable_plans.toLowerCase();
                if (applicablePlans !== 'all' && !applicablePlans.includes(planType.toLowerCase())) {
                    return resolve({
                        valid: false,
                        message: `This promo code is not applicable to ${planType} plan`
                    });
                }

                // Check usage limit
                if (promo.usage_limit && promo.current_usage >= promo.usage_limit) {
                    return resolve({
                        valid: false,
                        message: 'Promo code usage limit exceeded'
                    });
                }

                resolve({
                    valid: true,
                    promoCode: promo,
                    message: 'Promo code is valid'
                });
            }
        );
    });
}

/**
 * Apply discount to amount
 * @param {number} amount - Original amount
 * @param {object} promoCode - Promo code object
 * @returns {object} Discount details
 */
function applyDiscount(amount, promoCode) {
    let discountAmount = 0;

    if (promoCode.type === 'percentage') {
        discountAmount = (amount * promoCode.value) / 100;
    } else if (promoCode.type === 'flat') {
        discountAmount = promoCode.value;
    }

    // Ensure discount doesn't exceed the original amount
    discountAmount = Math.min(discountAmount, amount);

    const finalAmount = amount - discountAmount;

    return {
        originalAmount: amount,
        discountType: promoCode.type,
        discountValue: promoCode.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        savedAmount: Math.round(discountAmount * 100) / 100
    };
}

/**
 * Increment promo code usage count
 * @param {string} code - The promo code
 * @returns {Promise<void>}
 */
function incrementPromoCodeUsage(code) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE promo_codes SET current_usage = current_usage + 1 WHERE code = ?',
            [code],
            (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        );
    });
}

module.exports = {
    validatePromoCode,
    applyDiscount,
    incrementPromoCodeUsage
};
