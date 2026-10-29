'use strict';

/**
 * Generates a 4-digit numeric pickup code matching the FoodLink design specification (e.g. "4729").
 * @returns {string} 4-digit numeric code
 */
const generatePickupCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = generatePickupCode;
