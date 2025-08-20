<template>
  <div class="navbar-test">
    <h1>导航栏测试</h1>
    
    <div class="test-section">
      <h2>当前状态</h2>
      <div class="status-info">
        <p><strong>Token:</strong> {{ userStore.token || 'null' }}</p>
        <p><strong>是否登录:</strong> {{ userStore.isLoggedIn ? '是' : '否' }}</p>
        <p><strong>是否游客:</strong> {{ userStore.isGuest ? '是' : '否' }}</p>
        <p><strong>是否管理员:</strong> {{ userStore.isAdmin ? '是' : '否' }}</p>
        <p><strong>是否普通用户:</strong> {{ userStore.isUser ? '是' : '否' }}</p>
        <p><strong>用户名:</strong> {{ userStore.username }}</p>
        <p><strong>头像:</strong> {{ userStore.avatar }}</p>
        <p><strong>余额:</strong> ¥{{ userStore.balance.toFixed(2) }}</p>
        <p><strong>角色:</strong> {{ userStore.roles.join(', ') || '无' }}</p>
        <p><strong>用户ID:</strong> {{ userStore.userId || '无' }}</p>
        <p><strong>游客ID:</strong> {{ userStore.guestId || '无' }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>测试按钮</h2>
      <div class="button-group">
        <el-button @click="clearToken" type="danger">清除Token</el-button>
        <el-button @click="setTestUser" type="primary">设置测试用户</el-button>
        <el-button @click="setGuestToken" type="warning">设置游客Token</el-button>
        <el-button @click="refreshState" type="info">刷新状态</el-button>
        <el-button @click="testPersistence" type="success">测试持久化</el-button>
      </div>
    </div>
    
    <div class="test-section">
      <h2>导航栏组件</h2>
      <div class="navbar-preview">
        <!-- 这里可以放置导航栏组件的预览 -->
        <p>导航栏应该显示在页面顶部</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const clearToken = () => {
  userStore.logout()
  ElMessage.success('Token已清除')
}

const setTestUser = () => {
  const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsInVpZCI6MTIzLCJuYW1lIjoidGVzdHVzZXIiLCJjb250YWN0IjoiMTM4MDAwMDAwMDAiLCJjb250YWN0X3R5cGUiOjEsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test'
  userStore.setToken(testUserToken)
  ElMessage.success('测试用户已设置')
}

const testPersistence = () => {
  // 模拟浏览器关闭后重新打开
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  console.log('localStorage中的token:', token)
  console.log('localStorage中的userInfo:', userInfo)
  ElMessage.success('已检查localStorage数据，请查看控制台')
}

const setGuestToken = () => {
  const guestToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZ3Vlc3QiLCJnaWQiOiJ0ZXN0LWd1ZXN0LWlkIiwibmFtZSI6InRlc3QiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test'
  userStore.setToken(guestToken)
  ElMessage.success('游客Token已设置')
}

const refreshState = () => {
  userStore.updateState()
  ElMessage.success('状态已刷新')
}
</script>

<style scoped>
.navbar-test {
  max-width: 800px;
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

.navbar-preview {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-info p {
  margin: 8px 0;
  font-family: monospace;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
