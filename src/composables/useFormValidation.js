import { ref } from 'vue'
import { VALIDATION_MESSAGES } from '@/constants/index.js'

/**
 * Composable for common form validation patterns
 * Provides reusable validation functions and error handling
 */
export function useFormValidation() {
  const errors = ref({})
  const isValidating = ref(false)

  /**
   * Validates required fields
   * @param {string} value - The value to validate
   * @param {string} fieldName - The field name for error messaging
   * @returns {string|null} Error message or null if valid
   */
  const validateRequired = (value, fieldName = 'Dit veld') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is verplicht.`
    }
    return null
  }

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {string|null} Error message or null if valid
   */
  const validateEmail = (email) => {
    if (!email) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : VALIDATION_MESSAGES.EMAIL_INVALID
  }

  /**
   * Validates password strength
   * @param {string} password - Password to validate
   * @param {number} minLength - Minimum length (default: 8)
   * @returns {string|null} Error message or null if valid
   */
  const validatePassword = (password, minLength = 8) => {
    if (!password) return null
    if (password.length < minLength) {
      return `Wachtwoord moet minimaal ${minLength} karakters bevatten.`
    }
    return null
  }

  /**
   * Validates that two passwords match
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @returns {string|null} Error message or null if valid
   */
  const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) return null
    return password === confirmPassword ? null : VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH
  }

  /**
   * Common form resolver for PrimeVue forms
   * @param {Object} validationRules - Object with field names as keys and validation functions as values
   * @returns {Function} Resolver function for PrimeVue forms
   */
  const createFormResolver = (validationRules) => {
    return ({ values }) => {
      const errors = {}
      
      Object.entries(validationRules).forEach(([fieldName, validators]) => {
        const fieldValue = values[fieldName]
        const fieldErrors = []
        
        // Ensure validators is an array
        const validatorArray = Array.isArray(validators) ? validators : [validators]
        
        for (const validator of validatorArray) {
          const error = validator(fieldValue)
          if (error) {
            fieldErrors.push({ message: error })
            break // Stop at first error
          }
        }
        
        if (fieldErrors.length > 0) {
          errors[fieldName] = fieldErrors
        }
      })
      
      return { errors }
    }
  }

  /**
   * Clears validation errors
   * @param {string|null} fieldName - Specific field to clear, or null to clear all
   */
  const clearErrors = (fieldName = null) => {
    if (fieldName) {
      delete errors.value[fieldName]
    } else {
      errors.value = {}
    }
  }

  /**
   * Sets validation errors manually
   * @param {Object} newErrors - Error object to set
   */
  const setErrors = (newErrors) => {
    errors.value = { ...errors.value, ...newErrors }
  }

  /**
   * Common validation rules that can be reused
   */
  const commonRules = {
    required: (fieldName) => (value) => validateRequired(value, fieldName),
    email: validateEmail,
    password: validatePassword,
    abbreviation: (value) => validateRequired(value, 'Afkorting'),
    userName: (value) => validateRequired(value, 'Gebruikersnaam'),
    subjectName: (value) => validateRequired(value, 'Vak'),
    toolName: (value) => validateRequired(value, 'Hulpmiddel')
  }

  return {
    errors,
    isValidating,
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    createFormResolver,
    clearErrors,
    setErrors,
    commonRules
  }
}