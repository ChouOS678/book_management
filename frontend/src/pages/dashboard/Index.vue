<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>总图书数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalBooks }}</h2>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>可借图书</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.availableBooks }}</h2>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>借阅中</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.borrowedBooks }}</h2>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>用户数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ stats.totalUsers }}</h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近借阅记录</span>
            </div>
          </template>
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="bookTitle" label="图书名称" />
            <el-table-column prop="userName" label="借阅人" />
            <el-table-column prop="borrowDate" label="借阅日期" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '已归还' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门图书</span>
            </div>
          </template>
          <el-table :data="popularBooks" style="width: 100%">
            <el-table-column prop="title" label="图书名称" />
            <el-table-column prop="author" label="作者" />
            <el-table-column prop="borrowCount" label="借阅次数" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '可借阅' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

const stats = ref({
  totalBooks: 0,
  availableBooks: 0,
  borrowedBooks: 0,
  totalUsers: 0
})

const recentRecords = ref([])
const popularBooks = ref([])

const fetchDashboardData = async () => {
  try {
    // 获取统计数据
    const statsResponse = await axios.get('/api/users')
    stats.value = statsResponse.data

    // 获取最近借阅记录
    const recordsResponse = await axios.get('/api/borrow-records')
    recentRecords.value = recordsResponse.data

    // 获取热门图书
    const booksResponse = await axios.get('/api/books')
    popularBooks.value = booksResponse.data
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.card-content h2 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}
</style>