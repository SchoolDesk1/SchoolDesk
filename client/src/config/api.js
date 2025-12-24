// API Configuration for development and production
const API_URL = import.meta.env.VITE_API_URL || '';

// Log the API URL status for debugging
console.log('🔌 API Configuration:', API_URL ? `Connected to ${API_URL}` : 'Using Vite Proxy (Dev Mode)');

export const getApiUrl = (path) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If API_URL is explicitly set (production/custom), use it
    if (API_URL) {
        return `${API_URL}${normalizedPath}`;
    }

    // If in production but API_URL missing, use the hardcoded fallback
    if (import.meta.env.PROD) {
        return `https://schooldesk-api.onrender.com${normalizedPath}`;
    }

    // DEV MODE: Return just the path - Vite proxy will forward to backend
    // This allows the Vite dev server proxy to handle the request
    return normalizedPath;
};

export default API_URL;

