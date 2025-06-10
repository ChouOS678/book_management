import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  // state: () => ({
  //   // token: localStorage.getItem('token') || null,
  //   // user: JSON.parse(localStorage.getItem('user')) || null
  //
  // }),
  state: () => {
    const storedUser = localStorage.getItem('user');
    let user = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser); // 尝试解析
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        // 如果解析失败，可能是存储了无效JSON，清除它
        localStorage.removeItem('user');
      }
    }

    return{
      token: localStorage.getItem('token') || null,
          user: user // 使用经过检查的 user 值
    };
  },


  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === '管理员'
  },

  actions: {
    // 登录请求
    async login(credentials) {
      try {
        const response = await axios.post('/api/users/login', credentials)
        const { token, user } = response.data
        
        this.token = token
        this.user = user
        // 确保后端返回的 user 对象有 role 属性，且值为“管理员”
        this.isAdmin = user?.role === '管理员'; // 确保这里也用可选链

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return response
      } catch (error) {
        throw error
      }
    },
    // 注册请求
    async register(credentials) {
      try {
        const response = await axios.post('/api/users/register', credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return response
      } catch (error) {
        throw error
      }
    },


    // 注销
    async logout() {
      this.token = null
      this.user = null
      this.isAdmin = false // 注销时重置isAdmin
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAdmin') // 如果之前有存储 isAdmin，也清除
    },

    async checkAuth() {
      if (!this.token) return false
      
      try {
        const response = await axios.get('/api/users/books')
        this.user = response.data
        this.isAdmin = response.data?.role === '管理员'; // 确保更新 isAdmin
        localStorage.setItem('user', JSON.stringify(response.data))
        return true
      } catch (error) {
        this.logout()
        return false
      }
    }
  }
})