<template>
  <div class="record-list">
    <div class="page-header">
      <h2>借阅记录</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加借阅
      </el-button>
    </div>

    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="图书名称">
          <el-input
            v-model="searchForm.bookTitle"
            placeholder="请输入图书名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="借阅人">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入借阅人"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="借阅中" value="借阅中" />
            <el-option label="已归还" value="已归还" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="recordList"
        border
        style="width: 100%"
      >
        <el-table-column prop="bookTitle" label="图书名称" min-width="200" />
        <el-table-column prop="userName" label="借阅人" width="120" />
        <el-table-column prop="borrowDate" label="借阅日期" width="180" />
        <el-table-column prop="returnDate" label="应还日期" width="180" />
        <el-table-column prop="actualReturnDate" label="实际归还日期" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已归还' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                link
                @click="handleEdit(row)"
                v-if="row.status === '借阅中'"
              >
                归还
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from '@/api/axios'

const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  bookTitle: '',
  userName: '',
  status: ''
})

const recordList = ref([])

const fetchRecords = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/records', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        ...searchForm
      }
    })
    recordList.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取借阅记录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchRecords()
}

const resetSearch = () => {
  searchForm.bookTitle = ''
  searchForm.userName = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  router.push('/records/add')
}

const handleEdit = async (row) => {
  try {
    await ElMessageBox.confirm('确认归还该图书？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.put(`/api/records/${row.id}/return`)
    ElMessage.success('归还成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('归还失败: ' + error.message)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该借阅记录？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.delete(`/api/records/${row.id}`)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchRecords()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRecords()
}

// 初始加载
fetchRecords()
</script>

<style scoped>
.record-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>