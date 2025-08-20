<template>
  <div class="no-permission-container">
    <div class="no-permission-content">
      <div class="icon-container">
        <el-icon class="permission-icon" :size="80">
          <Lock />
        </el-icon>
      </div>
      
      <h1 class="title">权限不足</h1>
      <p class="description">抱歉，您没有访问该页面的权限</p>
      
      <div class="error-details">
        <p class="error-message">{{ errorMessage }}</p>
        <p class="error-code">错误代码: {{ errorCode }}</p>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="goHome" size="large">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack" size="large">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
        <el-button v-if="!userStore.isLoggedIn" type="success" @click="goLogin" size="large">
          <el-icon><User /></el-icon>
          立即登录
        </el-button>
      </div>
      
      <div class="help-info">
        <h3>需要帮助？</h3>
        <ul>
          <li>如果您认为这是一个错误，请联系管理员</li>
          <li>确保您已使用正确的账户登录</li>
          <li>某些功能可能需要特定的权限级别</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { Lock, HomeFilled, Back, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 根据路由参数生成错误信息
const errorMessage = computed(() => {
  const targetPath = route.query.target || route.query.from || '该页面'
  return `您没有权限访问 ${targetPath}`
})

const errorCode = computed(() => {
  return route.query.code || '403'
})

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.no-permission-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.no-permission-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.icon-container {
  margin-bottom: 24px;
}

.permission-icon {
  color: #f56c6c;
  background: #fef0f0;
  padding: 20px;
  border-radius: 50%;
  border: 4px solid #fde2e2;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 16px;
}

.description {
  font-size: 16px;
  color: #86909c;
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  border-left: 4px solid #f56c6c;
}

.error-message {
  font-size: 14px;
  color: #f56c6c;
  margin-bottom: 8px;
  font-weight: 500;
}

.error-code {
  font-size: 12px;
  color: #86909c;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.action-buttons .el-button {
  min-width: 120px;
}

.help-info {
  text-align: left;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.help-info h3 {
  font-size: 16px;
  color: #1d2129;
  margin-bottom: 12px;
  font-weight: 600;
}

.help-info ul {
  margin: 0;
  padding-left: 20px;
}

.help-info li {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
  line-height: 1.5;
}

.help-info li:last-child {
  margin-bottom: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .no-permission-container {
    padding: 16px;
  }
  
  .no-permission-content {
    padding: 24px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
