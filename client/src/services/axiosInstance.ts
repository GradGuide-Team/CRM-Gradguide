import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosResponse
} from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        
        // Debug logging
        console.log('Request interceptor - Token found:', token ? 'Yes' : 'No');
        console.log('Request URL:', config.url);
        console.log('Request method:', config.method);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header set:', config.headers.Authorization?.substring(0, 20) + '...');
        } else {
            console.warn('No token found in localStorage');
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => { 
        console.log('Response interceptor - Success:', response.status, response.config.url);
        return response;
    },
    (error: AxiosError) => {
        // Enhanced error logging with more details
        console.error('Response interceptor - Error Details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            message: error.message
        });

        if (error.response && error.response.status === 401) {
            console.error('Authentication error: Token expired or invalid.');
            console.error('Response data:', error.response.data);

            // Check if we need to redirect to login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                console.log('Redirecting to login due to 401 error');
                // You might want to clear tokens here
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_type');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.response && error.response.status === 422) {
            // Special handling for validation errors
            console.error('Validation Error (422):', {
                url: error.config?.url,
                method: error.config?.method,
                requestData: error.config?.data,
                responseData: error.response.data,
                // validationDetails: error.response.data?.detail
            });
        } else if (error.response) {
            const detail = (error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data)
                ? (error.response.data as { detail?: string }).detail
                : undefined;
            console.error(`API Error: ${error.response.status} - ${detail || error.message}`);
        } else if (error.request) {
            console.error('Network Error: No response received from server.');
            console.error('Request details:', error.request);
        } else {
            console.error('Request Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;