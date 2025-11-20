// API Configuration
const raw = import.meta?.env?.VITE_API_BASE_URL || 'https://ccr-backend-lieb.onrender.com/api';
// normalize: remove trailing slash then ensure /api is present
let API_BASE_URL = raw.replace(/\/+$/, '');
if (!API_BASE_URL.endsWith('/api')) API_BASE_URL = API_BASE_URL + '/api';


console.log("Using API_BASE_URL:", API_BASE_URL);


export default API_BASE_URL;

