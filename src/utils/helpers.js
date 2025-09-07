/**
 * Utility functions for the PTA Platform application
 */

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format a date for display in Dutch locale
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('nl-NL', defaultOptions).format(new Date(date));
}

/**
 * Format a number for display in Dutch locale
 * @param {number} number - The number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export function formatNumber(number, options = {}) {
  return new Intl.NumberFormat('nl-NL', options).format(number);
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} String with first letter capitalized
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Deep clone an object (simple implementation)
 * @param {any} obj - The object to clone
 * @returns {any} Deep cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(deepClone);
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - The value to check
 * @returns {boolean} True if empty, false otherwise
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Generate a random ID string
 * @param {number} length - The length of the ID (default: 8)
 * @returns {string} Random ID string
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallback - The fallback value if parsing fails
 * @returns {any} Parsed object or fallback value
 */
export function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Create a promise that resolves after a specified delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise} Promise that resolves after the delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate Dutch postal code format
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidDutchPostalCode(postalCode) {
  const regex = /^[1-9][0-9]{3} ?[A-Z]{2}$/i;
  return regex.test(postalCode);
}

/**
 * Extract initials from a full name
 * @param {string} fullName - The full name
 * @returns {string} Initials
 */
export function getInitials(fullName) {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .filter(name => name.length > 0)
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}