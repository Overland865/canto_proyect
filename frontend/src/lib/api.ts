// src/lib/api.ts

// Configura la URL base. En desarrollo es relativa a la raíz.
const API_URL = '/api';

/**
 * Función genérica para hacer peticiones
 * @param {string} endpoint - Ej: '/services'
 * @param {object} options - Opciones de fetch (method, body, etc)
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const settings: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, settings);
        const data = await response.json().catch(() => ({})); // Handle empty responses gracefully

        if (!response.ok) {
            throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}
