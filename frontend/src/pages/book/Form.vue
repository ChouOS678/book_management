<template>
  <div class="book-form-container">
    <h1>{{ formTitle }}</h1>

    <el-form
        :model="bookForm"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="书名" prop="title">
            <el-input v-model="bookForm.title" placeholder="请输入书名" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="作者" prop="author">
            <el-input v-model="bookForm.author" placeholder="请输入作者" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="ISBN" prop="isbn">
            <el-input v-model="bookForm.isbn" placeholder="请输入ISBN号" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="可借数量" prop="available_quantity">
            <el-input-number
                v-model="bookForm.available_quantity"
                :min="0"
                :step="1"
                controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="状态" prop="status">
        <el-select v-model="bookForm.status" placeholder="请选择状态">
          <el-option label="可借阅" value="available" />
          <el-option label="已借出" value="borrowed" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/api/axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const isEdit = ref(false)

const bookForm = ref({
  title: '',
  author: '',
  isbn: '',
  available_quantity: 1,
  status: 'available'
})

const rules = ref({
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  isbn: [
    { required: true, message: '请输入ISBN号', trigger: 'blur' }
  ],
  available_quantity: [
    { required: true, message: '请设置可借数量', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

const formTitle = computed(() => {
  return isEdit.value ? '编辑图书' : '添加新图书'
})

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const response = await axios.get(`/api/books/get/${route.params.id}`)
      bookForm.value = response.data
    } catch (error) {
      ElMessage.error('获取图书信息失败: ' + error.message)
      router.push({ name: 'BookList' })
    }
  }
})

const submitForm = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      await axios.put(`/api/books/${route.params.id}`, bookForm.value)
      ElMessage.success('图书更新成功')
    } else {
      await axios.post('/api/books/add', bookForm.value)
      ElMessage.success('图书添加成功')
    }

    router.push({ name: 'BookList' })
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<style scoped>
.book-form-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>