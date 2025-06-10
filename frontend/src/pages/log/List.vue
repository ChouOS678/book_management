<template>
  <div class="log-container">
    <!-- 管理员权限提示 -->
    <div v-if="!isAdmin" class="permission-denied">
      <el-alert
          title="权限不足"
          type="error"
          description="仅管理员可查看系统登录日志"
          show-icon
          :closable="false"
      />
    </div>

    <!-- 日志筛选工具栏 -->
    <div v-if="isAdmin" class="log-toolbar">
      <el-form :inline="true">
        <el-form-item label="用户名">
          <el-input
              v-model="filters.username"
              placeholder="筛选用户"
              clearable
              @clear="loadLogs"
              @keyup.enter="loadLogs"
          />
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="loadLogs"
          />
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input
              v-model="filters.ip"
              placeholder="筛选IP"
              clearable
              @clear="loadLogs"
              @keyup.enter="loadLogs"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              :icon="Search"
              @click="loadLogs"
          >
            查询
          </el-button>
          <el-button
              type="success"
              :icon="RefreshRight"
              @click="resetFilters"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志表格 -->
    <div v-if="isAdmin" class="log-table">
      <el-table
          v-loading="loading"
          :data="logs"
          stripe
          height="calc(100vh - 220px)"
          style="width: 100%"
      >
        <el-table-column
            prop="id"
            label="ID"
            width="80"
            sortable
            align="center"
        />

        <el-table-column
            prop="username"
            label="用户名"
            min-width="120"
            sortable
        >
          <template #default="{ row }">
            <el-tag v-if="row.isAdmin" type="success" effect="dark">
              <el-icon><User /></el-icon>
              {{ row.username }}
            </el-tag>
            <span v-else>{{ row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column
            prop="loginTime"
            label="登录时间"
            min-width="180"
            sortable
        >
          <template #default="{ row }">
            {{ formatDateTime(row.loginTime) }}
            <el-tag
                v-if="isRecentLogin(row.loginTime)"
                size="small"
                type="warning"
                effect="plain"
            >
              最近
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="ip"
            label="IP地址"
            min-width="140"
            sortable
        >
          <template #default="{ row }">
            <el-tooltip
                placement="top"
                :content="`归属地: ${row.location || '未知'}`"
            >
              <span>{{ row.ip }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
            prop="device"
            label="设备信息"
            min-width="180"
        >
          <template #default="{ row }">
            <el-tooltip placement="top">
              <template #content>
                <div>操作系统: {{ row.os || '未知' }}</div>
                <div>浏览器: {{ row.browser || '未知' }}</div>
              </template>
              <el-tag v-if="row.deviceType === 'Mobile'" type="info">
                <el-icon><Iphone /></el-icon>
              </el-tag>
              <el-tag v-else-if="row.deviceType === 'Tablet'" type="info">
                <el-icon><Platform /></el-icon>
              </el-tag>
              <span>{{ row.device || '未知设备' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
            prop="status"
            label="状态"
            width="100"
            align="center"
        >
          <template #default="{ row }">
            <el-tag
                v-if="row.status === 'success'"
                type="success"
                effect="plain"
            >
              成功
            </el-tag>
            <el-tag
                v-else
                type="danger"
                effect="plain"
            >
              失败
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="120"
            align="center"
        >
          <template #default="{ row }">
            <el-button
                size="small"
                :icon="View"
                type="info"
                plain
                @click="showLogDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="loadLogs"
            @current-change="loadLogs"
        />
      </div>
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        title="登录记录详情"
        width="600px"
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions
            :column="1"
            border
        >
          <el-descriptions-item label="用户名">
            <el-tag v-if="currentLog.isAdmin" type="success" effect="plain">
              {{ currentLog.username }} (管理员)
            </el-tag>
            <span v-else>{{ currentLog.username }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="登录时间">
            {{ formatDateTime(currentLog.loginTime) }}
          </el-descriptions-item>

          <el-descriptions-item label="IP地址">
            {{ currentLog.ip }}
            <el-tag size="small" type="info" style="margin-left: 8px">
              {{ currentLog.location || '未知归属地' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="设备信息">
            <div>
              <el-tag v-if="currentLog.deviceType === 'Mobile'" size="small">
                移动端
              </el-tag>
              <el-tag v-else-if="currentLog.deviceType === 'Tablet'" size="small">
                平板
              </el-tag>
              <el-tag v-else size="small">
                桌面端
              </el-tag>
              {{ currentLog.device }}
            </div>
            <div class="detail-subtext">系统: {{ currentLog.os }}</div>
            <div class="detail-subtext">浏览器: {{ currentLog.browser }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="登录状态">
            <el-tag
                v-if="currentLog.status === 'success'"
                type="success"
                effect="plain"
            >
              登录成功
            </el-tag>
            <el-tag
                v-else
                type="danger"
                effect="plain"
            >
              登录失败: {{ currentLog.failReason || '未知原因' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="登录持续">
            {{ currentLog.duration ? currentLog.duration + ' 分钟' : '未知' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  View, Search, Iphone, Platform, User, RefreshRight
} from '@element-plus/icons-vue';
import type { LogItem } from '@/types/log';
import { fetchLogs } from '@/api/log';
import { useUserStore } from '@/stores/user';
import { formatDateTime } from '@/utils/date';

// 用户状态管理
const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');

// 筛选条件
const filters = ref({
  username: '',
  dateRange: [],
  ip: ''
});

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 日志数据状态
const logs = ref<LogItem[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const currentLog = ref<LogItem | null>(null);

// 加载日志数据
const loadLogs = async () => {
  if (!isAdmin.value) return;

  try {
    loading.value = true;

    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      username: filters.value.username?.trim(),
      ip: filters.value.ip?.trim(),
      startDate: filters.value.dateRange?.[0],
      endDate: filters.value.dateRange?.[1]
    };

    const response = await fetchLogs(params);
    logs.value = response.data;
    pagination.value.total = response.total;
  } catch (error) {
    console.error('加载日志失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    username: '',
    dateRange: [],
    ip: ''
  };
  pagination.value.currentPage = 1;
  loadLogs();
};

// 显示日志详情
const showLogDetail = (log: LogItem) => {
  currentLog.value = log;
  detailVisible.value = true;
};

// 检查是否为最近登录（过去15分钟内）
const isRecentLogin = (datetime: string) => {
  const now = new Date();
  const loginTime = new Date(datetime);
  return (now.getTime() - loginTime.getTime()) < 15 * 60 * 1000;
};

// 组件挂载时加载数据
onMounted(() => {
  if (isAdmin.value) {
    loadLogs();
  }
});
</script>

<style scoped>
.log-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.permission-denied {
  margin: 20px;
}

.log-toolbar {
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.log-table {
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.detail-subtext {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>