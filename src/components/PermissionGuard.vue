<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else>
    <slot name="no-permission">
      <div class="permission-denied">
        <el-icon class="permission-icon" :size="40">
          <Lock />
        </el-icon>
        <p class="permission-message">{{ message }}</p>
        <el-button type="primary" size="small" @click="goToNoPermission">
          查看详情
        </el-button>
      </div>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { Lock } from '@element-plus/icons-vue'

const props = defineProps({
  // 权限类型：admin, user, guest, login
  type: {
    type: String,
    required: true
  },
  // 自定义消息
  message: {
    type: String,
    default: '您没有权限访问此内容'
  },
  // 目标路径（用于跳转到权限不足页面时显示）
  targetPath: {
    type: String,
    default: ''
  }
})

const userStore = useUserStore()
const router = useRouter()

// 检查权限
const hasPermission = computed(() => {
  switch (props.type) {
    case 'admin':
      return userStore.isAdmin
    case 'user':
      return userStore.isUser
    case 'guest':
      return userStore.isGuest
    case 'login':
      return userStore.isLoggedIn
    default:
      return false
  }
})

// 跳转到权限不足页面
const goToNoPermission = () => {
  router.push({
    path: '/no-permission',
    query: {
      target: props.targetPath || window.location.pathname,
      from: window.location.pathname,
      code: '403',
      reason: `${props.type}_required`
    }
  })
}
</script>

<style scoped>
.permission-denied {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.permission-icon {
  color: #f56c6c;
  margin-bottom: 12px;
}

.permission-message {
  color: #86909c;
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
