<template>
  <el-container class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header height="60px">
      <div class="header-content">
        <h1 class="system-title">图书借阅管理系统</h1>
        <div class="user-info">
          <span>{{ userStore.username }}</span>
          <el-button @click="handleLogout" type="text">退出登录</el-button>
        </div>
      </div>
    </el-header>

    <!-- 主体容器 -->
    <el-container>
      <!-- 侧边导航 -->
      <el-aside width="200px">
        <el-menu
            :default-active="$route.path"
            router
            background-color="#333744"
            text-color="#fff"
            active-text-color="#ffd04b"
        >
          <el-menu-item index="/dashboard">
            <i class="el-icon-s-home"></i>
            <span>仪表盘</span>
          </el-menu-item>

          <el-submenu index="/books">
            <template #title>
              <i class="el-icon-edit"></i>
              <span>图书管理</span>
            </template>
            <el-menu-item index="/books">图书列表</el-menu-item>
            <el-menu-item v-if="userStore.isAdmin" index="/books/add">新增图书</el-menu-item>
          </el-submenu>

          <el-menu-item v-if="userStore.isAdmin" index="/users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'   // 添加computed导入
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 页面加载时检查登录状态
const checkLogin = async () => {
  if (!userStore.isLogin) {
    await userStore.checkAuth()
    if (!userStore.isLogin) {
      ElMessage.error('请先登录')
      router.push('/login')
    }
  }
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 移除未使用的showAdminMenu计算属性


// 响应式适配
const isMobile = ref(window.innerWidth < 768)
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})

// 初始化检查
checkLogin()
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background-color: #f0f2f5;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.system-title {
  color: #333;
  font-size: 20px;
  margin-right: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}
</style>