import {defineStore} from "pinia";
import {ref} from "vue";
import {useRouter} from "vue-router";
import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/constants/index.js";

// Error types for better error handling
const API_ERRORS = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED', 
    FORBIDDEN: 'FORBIDDEN',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const useUserStore = defineStore('user', () => {
    const router = useRouter()
    const user = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    /**
     * Creates a standardized error object
     * @param {string} type - Error type from API_ERRORS
     * @param {string} message - Human readable error message
     * @param {*} originalError - Original error for debugging
     * @returns {Object} Standardized error object
     */
    function createError(type, message, originalError = null) {
        return {
            type,
            message,
            originalError,
            timestamp: new Date().toISOString()
        }
    }

    /**
     * Handles API response errors consistently
     * @param {Response} response - Fetch response object
     * @returns {Object} Error object
     */
    function handleApiError(response) {
        switch (response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                return createError(API_ERRORS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED)
            case HTTP_STATUS.FORBIDDEN:
                return createError(API_ERRORS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN)
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
            case HTTP_STATUS.BAD_GATEWAY:
            case HTTP_STATUS.SERVICE_UNAVAILABLE:
                return createError(API_ERRORS.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR)
            default:
                return createError(API_ERRORS.UNKNOWN_ERROR, ERROR_MESSAGES.UNKNOWN_ERROR)
        }
    }

    async function fetchUser() {
        try {
            error.value = null
            isLoading.value = true
            
            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_ME}`, {
                credentials: 'include',
            })
            
            if (res.ok) {
                user.value = await res.json()
            } else {
                user.value = null
                error.value = handleApiError(res)
            }
        } catch (err) {
            user.value = null
            error.value = createError(API_ERRORS.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR, err)
        } finally {
            isLoading.value = false
        }
    }

    async function login(username, password) {
        try {
            error.value = null
            isLoading.value = true
            
            const headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));

            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
                method: "GET",
                headers: headers,
                credentials: 'include',
            })

            if (res.ok) {
                user.value = await res.json()
            } else {
                user.value = null
                error.value = handleApiError(res)
            }

            return res
        } catch (err) {
            user.value = null
            error.value = createError(API_ERRORS.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR, err)
            // Return a fake response for compatibility
            return { ok: false, status: 0 }
        } finally {
            isLoading.value = false
        }
    }

    async function logout() {
        try {
            error.value = null
            isLoading.value = true
            
            const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
                method: 'GET',
                credentials: 'include',
            })
            
            if (res.ok) {
                user.value = null
            } else {
                // Still clear user even if logout fails
                user.value = null
                error.value = handleApiError(res)
            }
        } catch (err) {
            // Clear user even on network error for security
            user.value = null
            error.value = createError(API_ERRORS.NETWORK_ERROR, 'Netwerkfout tijdens uitloggen.', err)
        } finally {
            isLoading.value = false
            router.push({name: 'home'})
        }
    }

    async function setPassword(userId, oldPassword, newPassword) {
        try {
            error.value = null
            isLoading.value = true
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PASSWORD(userId)}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
            })
            
            if (!response.ok) {
                error.value = handleApiError(response)
            }
            
            return response
        } catch (err) {
            error.value = createError(API_ERRORS.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR, err)
            return { ok: false, status: 0 }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Clears the current error state
     */
    function clearError() {
        error.value = null
    }

    return {user, isLoading, error, fetchUser, login, logout, setPassword, clearError, API_ERRORS}
})