// API Configuration for development and production
const API_URL = import.meta.env.VITE_API_URL || '';

// 🛡️ FAIL-SAFE: If in PRODUCTION and no VITE_API_URL is set, use the Render Backend
// This prevents the "405 Method Not Allowed" error on Vercel
if (!API_URL && import.meta.env.PROD) {
    console.warn('⚠️ VITE_API_URL missing! Using fallback: https://schooldesk-api.onrender.com');
}

// Log the API URL status for debugging
console.log('🔌 API Configuration:', API_URL ? `Connected to ${API_URL}` : 'Running in Local/Proxy Mode');

export const getApiUrl = (path) => {
    // If API_URL is set (production/custom), use it.
    if (API_URL) {
        return `${API_URL}${path}`;
    }

    // If in production but API_URL missing (fallback logic above didn't assign to const API_URL),
    // use the hardcoded fallback
    if (import.meta.env.PROD) {
        return `https://schooldesk-api.onrender.com${path}`;
    }

    // DEV MODE:
    // If we are in dev, assuming proxy is set in vite.config.js, we return just the path.
    // However, to be extra safe against proxy failures:
    return `http://localhost:5000${path}`;
};

export default API_URL;
