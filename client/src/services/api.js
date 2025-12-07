import API_URL from '../config/api';

const apiClient = {
    // Helper to get full headers with token
    getHeaders(options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; // Corrected format
        }
        return headers;
    },

    async request(endpoint, options = {}) {
        // Ensure endpoint starts with / for consistency
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        // Use API_URL which handles the logic of selecting the right URL
        const url = `${API_URL || 'https://schooldesk-api.onrender.com'}${path}`;

        const config = {
            ...options,
            headers: this.getHeaders(options),
        };

        try {
            const response = await fetch(url, config);

            // Handle empty responses (e.g. 204)
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network Error:', error);
                throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
            }
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};

export default apiClient;
