// API Configuration for development and production
let API_URL = import.meta.env.VITE_API_URL || '';

// 🛡️ FAIL-SAFE: If in PRODUCTION and no VITE_API_URL is set, use the Render Backend
// This prevents the "405 Method Not Allowed" error on Vercel
if (!API_URL && import.meta.env.PROD) {
    API_URL = 'https://schooldesk-backend.onrender.com';
    console.warn('⚠️ VITE_API_URL missing! Using fallback:', API_URL);
}

// Log the API URL status for debugging
console.log('🔌 API Configuration:', API_URL ? `Connected to ${API_URL}` : 'Running in Local/Proxy Mode');

export const getApiUrl = (path) => {
    // If API_URL is set (or fallback active), use it; otherwise use relative path (dev)
    return API_URL ? `${API_URL}${path}` : path;
};

export default API_URL;
