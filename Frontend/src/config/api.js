// API Configuration
const raw = import.meta?.env?.VITE_API_BASE_URL || 'https://ccr-backend-lieb.onrender.com';
// normalize: remove trailing slash then ensure /api is present
const normalized = raw.replace(/\/+$/, '');
const API_BASE_URL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;


export default API_BASE_URL;

