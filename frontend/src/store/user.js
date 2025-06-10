// src/store/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        isLogin: false,
        username: '',
        isAdmin: false,
        token: localStorage.getItem('token') || ''
    }),
    actions: {
        async login(data) {
            // 模拟登录请求
            this.token = data.token;
            this.isLogin = true;
            this.username = data.username;
            this.isAdmin = data.role === 'admin';
            localStorage.setItem('token', this.token);
        },
        logout() {
            this.token = '';
            this.isLogin = false;
            this.username = '';
            this.isAdmin = false;
            localStorage.removeItem('token');
        },
        checkAuth() {
            if (!this.token) {
                throw new Error('身份验证失败');
            }
        }
    }
});

export class useAuthStore {
}