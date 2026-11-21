import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Handle 401 errors (unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;