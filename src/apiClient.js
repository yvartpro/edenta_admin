import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/edenta/api';
console.log(API_URL);

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message;
        console.error("API Error:", message);
        return Promise.reject(error);
    }
);

export default apiClient;
