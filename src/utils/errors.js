/**
 * Error handling utilities for the PTA Platform application
 */

import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants/index.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, type = 'UNKNOWN_ERROR', statusCode = null, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Network error class for connection issues
 */
export class NetworkError extends AppError {
  constructor(message = ERROR_MESSAGES.NETWORK_ERROR, originalError = null) {
    super(message, 'NETWORK_ERROR', 0, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error class for form validation issues
 */
export class ValidationError extends AppError {
  constructor(message, field = null, originalError = null) {
    super(message, 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, originalError);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Parse HTTP response errors into standardized error objects
 * @param {Response} response - Fetch response object
 * @param {Error} originalError - Original error if any
 * @returns {AppError} Standardized error object
 */
export function parseHttpError(response, originalError = null) {
  const statusCode = response?.status || 0;
  
  switch (statusCode) {
    case HTTP_STATUS.UNAUTHORIZED:
      return new AppError(ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED', statusCode, originalError);
    
    case HTTP_STATUS.FORBIDDEN:
      return new AppError(ERROR_MESSAGES.FORBIDDEN, 'FORBIDDEN', statusCode, originalError);
    
    case HTTP_STATUS.NOT_FOUND:
      return new AppError('De gevraagde resource kon niet worden gevonden.', 'NOT_FOUND', statusCode, originalError);
    
    case HTTP_STATUS.CONFLICT:
      return new AppError('Er is een conflict opgetreden. De resource bestaat mogelijk al.', 'CONFLICT', statusCode, originalError);
    
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new AppError(ERROR_MESSAGES.SERVER_ERROR, 'SERVER_ERROR', statusCode, originalError);
    
    case 0:
      return new NetworkError(ERROR_MESSAGES.NETWORK_ERROR, originalError);
    
    default:
      return new AppError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR', statusCode, originalError);
  }
}

/**
 * Enhanced fetch wrapper with better error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Enhanced fetch response
 */
export async function enhancedFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw parseHttpError(response);
    }
    
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle network errors or other unexpected errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new NetworkError(ERROR_MESSAGES.NETWORK_ERROR, error);
    }
    
    throw new AppError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR', null, error);
  }
}

/**
 * Log errors in a consistent format
 * @param {Error} error - The error to log
 * @param {string} context - Additional context about where the error occurred
 */
export function logError(error, context = '') {
  const errorInfo = {
    name: error.name,
    message: error.message,
    type: error.type || 'UNKNOWN',
    statusCode: error.statusCode || null,
    timestamp: error.timestamp || new Date().toISOString(),
    context,
    stack: error.stack
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or similar
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, { extra: errorInfo });
  }
}

/**
 * Create a user-friendly error message for display
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error) {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function or error after all retries
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry on certain error types
      if (error instanceof AppError && 
          ['UNAUTHORIZED', 'FORBIDDEN', 'VALIDATION_ERROR'].includes(error.type)) {
        break;
      }
      
      // Exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}