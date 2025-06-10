<template>
  <div class="book-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑图书' : '添加图书' }}</h2>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="图书号" prop="id">
          <el-input
            v-model="formData.id"
            placeholder="请输入图书号"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入图书标题"
          />
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input
            v-model="formData.author"
            placeholder="请输入作者"
          />
        </el-form-item>

        <el-form-item label="ISBN" prop="isbn">
          <el-input
            v-model="formData.isbn"
            placeholder="请输入ISBN"
          />
        </el-form-item>

        <el-form-item label="可借阅数量" prop="available">
          <el-input-number
            v-model="formData.available"
            :min="0"
            :max="999"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="可用" value="可用" />
            <el-option label="已借出" value="已借出" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)

const formData = reactive({
  id: '',
  title: '',
  author: '',
  isbn: '',
  available: 1,
  status: '可用'
})

const rules = {
  id: [
    { required: true, message: '请输入图书号', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入图书标题', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  isbn: [
    { required: true, message: '请输入ISBN', trigger: 'blur' }
  ],
  available: [
    { required: true, message: '请输入可借阅数量', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    // TODO: Fetch book data
    // const response = await getBook(id)
    // Object.assign(formData, response)
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: Implement save functionality
        // if (isEdit.value) {
        //   await updateBook(formData)
        // } else {
        //   await createBook(formData)
        // }
        ElMessage.success('保存成功')
        router.push('/books')
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.book-form {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.el-card {
  max-width: 800px;
  margin: 0 auto;
}
</style> 