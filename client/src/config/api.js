// API Configuration for development and production
const API_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
    // If API_URL is set (production), use it; otherwise use relative path (development with proxy)
    return API_URL ? `${API_URL}${path}` : path;
};

export default API_URL;
