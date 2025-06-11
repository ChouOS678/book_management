<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">图书借阅系统</h2>
      <el-form
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          class="login-form"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <router-link to="/register">注册新账户</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'
import axios from "axios";

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const loginFormRef = ref(null)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    console.log(loginForm.value);
    await authStore.login(loginForm.value)
    ElMessage.success('登录成功')

    console.log('登录成功！当前 isAdmin:', authStore.isAdmin); // 调试日志
    // 根据角色跳转到不同页面
    if (authStore.isAdmin) {
      router.push({ name: 'Dashboard' }) // 管理员跳转到管理员页面
    } else {
      router.push({ name: 'BookList' }) // 普通用户跳转到图书展示页面
    }
  } catch (error) {
    ElMessage.error('登录失败: ' + (error.response?.data?.message || '用户名或密码错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 28px;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  font-size: 14px;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}
</style>