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

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => { 
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.error('Authentication error: Token expired or invalid.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
        } else if (error.response) {
            const detail = (error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data)
                ? (error.response.data as { detail?: string }).detail
                : undefined;
            console.error(`API Error: ${error.response.status} - ${detail || error.message}`);
        } else if (error.request) {
            console.error('Network Error: No response received from server.');
        } else {
            console.error('Request Setup Error:', error.message);
        }
        return Promise.reject(error); // Propagate the error so calling code can handle it
    }
);

export default axiosInstance;