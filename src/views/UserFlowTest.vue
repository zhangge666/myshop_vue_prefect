<template>
  <div class="user-flow-test">
    <h1>用户流程测试</h1>
    
    <div class="test-section">
      <h2>当前状态</h2>
      <div class="status-grid">
        <div class="status-item">
          <strong>Token:</strong> 
          <span class="token-display">{{ token }}</span>
        </div>
        <div class="status-item">
          <strong>是否登录:</strong> 
          <el-tag :type="isLoggedIn ? 'success' : 'info'">{{ isLoggedIn ? '是' : '否' }}</el-tag>
        </div>
        <div class="status-item">
          <strong>用户类型:</strong> 
          <el-tag :type="isGuest ? 'warning' : 'primary'">{{ isGuest ? '游客' : '注册用户' }}</el-tag>
        </div>
        <div class="status-item">
          <strong>用户名:</strong> 
          <span>{{ userStore.username }}</span>
        </div>
        <div class="status-item">
          <strong>用户ID:</strong> 
          <span>{{ userStore.userId || '无' }}</span>
        </div>
        <div class="status-item">
          <strong>游客ID:</strong> 
          <span>{{ userStore.guestId || '无' }}</span>
        </div>
        <div class="status-item">
          <strong>余额:</strong> 
          <span>¥{{ userStore.balance.toFixed(2) }}</span>
        </div>
        <div class="status-item">
          <strong>角色:</strong> 
          <div class="roles-display">
            <el-tag v-for="role in userStore.roles" :key="role" :type="getRoleTagType(role)" size="small">
              {{ role }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>测试操作</h2>
      <div class="button-group">
        <el-button @click="clearToken" type="danger">清除Token</el-button>
        <el-button @click="getGuestToken" type="primary">获取游客JWT</el-button>
        <el-button @click="setTestUser" type="success">设置测试用户</el-button>
        <el-button @click="refreshState" type="info">刷新状态</el-button>
        <el-button @click="parseToken" type="warning">解析Token</el-button>
        <el-button @click="testPersistence" type="info">测试持久化</el-button>
      </div>
    </div>
    
    <div class="test-section">
      <h2>JWT信息</h2>
      <pre>{{ jwtInfo }}</pre>
    </div>
    
    <div class="test-section">
      <h2>用户信息详情</h2>
      <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { authApi } from '../api/index.js'

const userStore = useUserStore()

// 使用computed属性来响应状态变化
const token = computed(() => userStore.token || 'null')
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isGuest = computed(() => userStore.isGuest)
const userInfo = computed(() => userStore.userInfo)
const jwtInfo = computed(() => {
  const info = userStore.getJwtInfo()
  return typeof info === 'string' ? info : JSON.stringify(info, null, 2)
})

const getRoleTagType = (role) => {
  if (role.includes('ADMIN')) return 'danger'
  if (role.includes('USER')) return 'success'
  if (role.includes('GUEST')) return 'warning'
  return 'info'
}

const clearToken = () => {
  userStore.logout()
  ElMessage.success('Token已清除')
}

const getGuestToken = async () => {
  try {
    const response = await authApi.getGuestToken()
    if (response && response.token) {
      userStore.setToken(response.token)
      ElMessage.success('游客JWT获取成功')
    } else {
      ElMessage.error('获取游客JWT失败')
    }
  } catch (error) {
    console.error('获取游客JWT失败:', error)
    ElMessage.error('获取游客JWT失败: ' + error.message)
  }
}

const setTestUser = () => {
  const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsInVpZCI6MTIzLCJuYW1lIjoidGVzdHVzZXIiLCJjb250YWN0IjoiMTM4MDAwMDAwMDAiLCJjb250YWN0X3R5cGUiOjEsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test'
  userStore.setToken(testUserToken)
  ElMessage.success('测试用户Token已设置')
}

const testPersistence = () => {
  // 模拟浏览器关闭后重新打开
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  console.log('localStorage中的token:', token)
  console.log('localStorage中的userInfo:', userInfo)
  ElMessage.success('已检查localStorage数据，请查看控制台')
}

const refreshState = () => {
  userStore.updateState()
  ElMessage.success('状态已刷新')
}

const parseToken = () => {
  userStore.parseUserInfoFromToken()
  ElMessage.success('Token已解析')
}
</script>

<style scoped>
.user-flow-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.test-section h2 {
  margin-top: 0;
  color: #409EFF;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.status-item {
  padding: 10px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.token-display {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: #666;
}

.roles-display {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
