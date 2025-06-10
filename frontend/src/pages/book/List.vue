<template>
  <div class="book-list-container">
    <div class="header">
      <h1>图书管理</h1>
      <div class="actions">
        <el-input
            v-model="searchQuery"
            placeholder="搜索图书..."
            clearable
            class="search-input"
            @clear="fetchBooks"
            @keyup.enter="fetchBooks"
        >
          <template #append>
            <el-button icon="Search" @click="fetchBooks" />
          </template>
        </el-input>

        <el-button
            type="primary"
            icon="Plus"
            v-if="authStore.isAdmin"
            @click="$router.push({ name: 'BookAdd' })"
        >
          添加图书
        </el-button>
      </div>
    </div>

    <el-table
        :data="books"
        v-loading="loading"
        height="calc(100vh - 220px)"
        stripe
    >
      <el-table-column prop="book_id" label="图书ID" width="100" />
      <el-table-column prop="title" label="书名" min-width="200" />
      <el-table-column prop="author" label="作者" width="150" />
      <el-table-column prop="isbn" label="ISBN" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'available' ? 'success' : 'danger'">
            {{ row.status === 'available' ? '可借阅' : '已借出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="available_quantity" label="可借数量" width="100" />

      <el-table-column label="操作" width="180" v-if="authStore.isAdmin">
        <template #default="{ row }">
          <el-button
              size="small"
              type="primary"
              icon="Edit"
              @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
              size="small"
              type="danger"
              icon="Delete"
              @click="handleDelete(row.book_id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="借阅" width="120" v-else>
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              :disabled="row.available_quantity === 0"
              @click="handleBorrow(row)"
          >
            借阅
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalBooks"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          @size-change="fetchBooks"
          @current-change="fetchBooks"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'   // 新增
import { useAuthStore } from '@/store/auth'
import axios from '@/api/axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const authStore = useAuthStore()
const router = useRouter()   // 新增

const books = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalBooks = ref(0)

const fetchBooks = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/books/get/all', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        search: searchQuery.value
      }
    })
    books.value = response.data.items
    totalBooks.value = response.data.total
  } catch (error) {
    ElMessage.error('获取图书列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleEdit = (book) => {
  router.push({ name: 'BookEdit', params: { id: book.book_id } })  // 修复路由
}

const handleDelete = async (bookId) => {
  try {
    await ElMessageBox.confirm('确定要删除这本图书吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await axios.delete(`/api/books/${bookId}`)
    ElMessage.success('图书删除成功')
    fetchBooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

const handleBorrow = (book) => {
  router.push({  // 修复路由
    name: 'RecordAdd',
    query: { bookId: book.book_id, bookTitle: book.title }
  })
}

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.book-list-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>