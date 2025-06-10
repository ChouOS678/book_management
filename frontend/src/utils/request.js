// src/utils/request.js
import axios from 'axios';

const service = axios.create({
    baseURL: 'http://localhost:8082/book-management',
    timeout: 5000
});

service.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
);

export default service;
