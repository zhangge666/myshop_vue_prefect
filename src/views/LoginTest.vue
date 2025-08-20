<template>
  <div class="login-test-container">
    <h1>登录功能测试</h1>
    
    <div class="test-section">
      <h2>当前状态</h2>
      <div class="status-info">
        <p><strong>Token:</strong> {{ token }}</p>
        <p><strong>是否登录:</strong> {{ isLoggedIn ? '是' : '否' }}</p>
        <p><strong>是否游客:</strong> {{ isGuest ? '是' : '否' }}</p>
        <p><strong>用户名:</strong> {{ userInfo?.username || '无' }}</p>
        <p><strong>头像:</strong> {{ userInfo?.avatar || '无' }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>登录测试</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testLogin" :loading="loading">测试登录</el-button>
          <el-button @click="testLogout">测试退出</el-button>
          <el-button @click="refreshState">刷新状态</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="test-section">
      <h2>用户信息详情</h2>
      <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
    </div>
    
    <div class="test-section">
      <h2>JWT信息</h2>
      <pre>{{ jwtInfo }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)

// 使用computed属性来响应状态变化
const token = computed(() => userStore.token || 'null')
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isGuest = computed(() => userStore.isGuest)
const userInfo = computed(() => userStore.userInfo)
const jwtInfo = computed(() => {
  const info = userStore.getJwtInfo()
  return typeof info === 'string' ? info : JSON.stringify(info, null, 2)
})

const testLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  try {
    const success = await userStore.login(loginForm.value.username, loginForm.value.password)
    if (success) {
      ElMessage.success('登录成功！')
    } else {
      ElMessage.error('登录失败！')
    }
  } catch (error) {
    ElMessage.error('登录出错：' + error.message)
  } finally {
    loading.value = false
  }
}

const testLogout = async () => {
  await userStore.logout()
  ElMessage.success('退出登录成功！')
}

const refreshState = () => {
  userStore.updateState()
  ElMessage.success('状态已刷新！')
}
</script>

<style scoped>
.login-test-container {
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

.status-info p {
  margin: 8px 0;
  font-family: monospace;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.el-form {
  max-width: 400px;
}
</style>
