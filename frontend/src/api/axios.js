import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const instance = axios.create({
    baseURL: 'http://localhost:8082/book-management',
    timeout: 5000
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('登录已过期，请重新登录');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                    break;
                case 403:
                    ElMessage.error('没有权限访问该资源');
                    break;
                case 404:
                    ElMessage.error('请求的资源不存在');
                    break;
                case 500:
                    ElMessage.error('服务器错误');
                    break;
                default:
                    ElMessage.error(error.response.data.message || '请求失败');
            }
        } else {
            ElMessage.error('网络错误，请检查网络连接');
        }
        return Promise.reject(error);
    }
);

export default instance;
