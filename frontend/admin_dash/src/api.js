import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Make sure FastAPI is running
});

export default API;