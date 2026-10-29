/**
 * Escapes common HTML entities to prevent XSS attacks.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Recursively sanitizes string values in an object or array.
 * @param {any} input - Object, array, or primitive
 * @returns {any} Sanitized clone of input
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return escapeHtml(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input !== null && typeof input === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(input)) {
      sanitizedObj[key] = sanitizeInput(input[key]);
    }
    return sanitizedObj;
  }
  return input;
};

module.exports = {
  escapeHtml,
  sanitizeInput,
};
