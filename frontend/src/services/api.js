import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the access token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const movieAPI = {
    // Fetch movies with optional search query and pagination
    getMovies: async (searchQuery = '', page = 1) => {
        const params = { page };
        if (searchQuery) {
            params.search = searchQuery;
        }
        const response = await api.get('/movies/', { params });
        return response.data;
    },

    // Get single movie by ID
    getMovie: async (id) => {
        const response = await api.get(`/movies/${id}/`);
    return response.data;
    },
    
    // Create movie (admin only)
    createMovie: async (movieData) => {
        const response = await api.post('/movies/', movieData);
        return response.data;
    },

    // Update movie (admin only)
    updateMovie: async (id, movieData) => {
        const response = await api.put(`/movies/${id}/`, movieData);
        return response.data;
    },
}