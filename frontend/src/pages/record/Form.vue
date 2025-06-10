<template>
  <div class="borrow-form-container">
    <h1>{{ formTitle }}</h1>

    <el-form
        :model="borrowForm"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="borrowForm.userId" placeholder="请输入用户ID" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="图书ID" prop="bookId">
            <el-input v-model="borrowForm.bookId" placeholder="请输入图书ID" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="借阅日期" prop="borrowDate">
            <el-date-picker
                v-model="borrowForm.borrowDate"
                type="date"
                placeholder="请选择借阅日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="归还日期" prop="returnDate">
            <el-date-picker
                v-model="borrowForm.returnDate"
                type="date"
                placeholder="请选择归还日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="状态" prop="status">
        <el-select v-model="borrowForm.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="借阅中" value="borrowed" />
          <el-option label="已归还" value="returned" />
          <el-option label="逾期未还" value="overdue" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
            v-model="borrowForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
        />
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
formRef.value = undefined;
const isEdit = ref(false)

const borrowForm = ref({
  userId: '',
  bookId: '',
  borrowDate: '',
  returnDate: '',
  status: 'borrowed',
  notes: ''
})

const rules = ref({
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  bookId: [
    { required: true, message: '请输入图书ID', trigger: 'blur' }
  ],
  borrowDate: [
    { required: true, message: '请选择借阅日期', trigger: 'change' }
  ],
  returnDate: [
    { required: true, message: '请选择归还日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        const borrowDate = borrowForm.value.borrowDate
        if (value && borrowDate && value < borrowDate) {
          callback(new Error('归还日期不能早于借阅日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

const formTitle = computed(() => {
  return isEdit.value ? '编辑借阅记录' : '添加借阅记录'
})

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    try {
      const response = await axios.get(`/api/borrow-records/get/${route.params.id}`)
      borrowForm.value = response.data
    } catch (error) {
      ElMessage.error('获取借阅记录失败: ' + error.message)
      await router.push({name: 'BorrowRecordList'})
    }
  }
})

const submitForm = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      await axios.put(`/api/borrow-records/${route.params.id}`, borrowForm.value)
      ElMessage.success('记录更新成功')
    } else {
      await axios.post('/api/borrow-records/add', borrowForm.value)
      ElMessage.success('记录添加成功')
    }

    await router.push({name: 'BorrowRecordList'})
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  }
}

const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<style scoped>
.borrow-form-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>