<template>
  <div class="test-page">
    <h1>UserStatus 组件测试</h1>
    
    <div class="test-section">
      <h2>页面加载成功！</h2>
      <p>如果你能看到这个页面，说明路由配置是正确的。</p>
    </div>
    
    <div class="test-section">
      <h2>当前用户状态</h2>
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
          <strong>用户ID:</strong> 
          <span>{{ userId || '无' }}</span>
        </div>
        <div class="status-item">
          <strong>游客ID:</strong> 
          <span>{{ guestId || '无' }}</span>
        </div>
        <div class="status-item">
          <strong>联系方式:</strong> 
          <span>{{ contact || '无' }}</span>
        </div>
        <div class="status-item">
          <strong>联系方式类型:</strong> 
          <span>{{ contactTypeText }}</span>
        </div>
        <div class="status-item">
          <strong>用户角色:</strong> 
          <div class="roles-display">
            <el-tag v-for="role in roles" :key="role" :type="getRoleTagType(role)" size="small">
              {{ role }}
            </el-tag>
          </div>
        </div>
        <div class="status-item">
          <strong>是否管理员:</strong> 
          <el-tag :type="isAdmin ? 'danger' : 'info'">{{ isAdmin ? '是' : '否' }}</el-tag>
        </div>
        <div class="status-item">
          <strong>是否普通用户:</strong> 
          <el-tag :type="isUser ? 'success' : 'info'">{{ isUser ? '是' : '否' }}</el-tag>
        </div>
        <div class="status-item">
          <strong>Token过期时间:</strong> 
          <span>{{ tokenExpiry || '无' }}</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>JWT详细信息</h2>
      <div class="jwt-info">
        <pre>{{ jwtInfo }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>测试按钮</h2>
      <div class="button-group">
        <el-button @click="clearToken" type="danger">清除Token</el-button>
        <el-button @click="setTestToken" type="warning">设置测试Token</el-button>
        <el-button @click="getGuestToken" type="primary">获取游客JWT</el-button>
        <el-button @click="refreshInfo" type="info">刷新信息</el-button>
        <el-button @click="setUserToken" type="success">设置用户Token</el-button>
        <el-button @click="updateStoreState" type="primary">手动更新Store状态</el-button>
        <el-button @click="testLogout" type="danger">测试退出登录</el-button>
        <el-button @click="testGuestInit" type="warning">测试游客身份初始化</el-button>
        <el-button @click="testNoPermission" type="danger">测试权限不足页面</el-button>
      </div>
    </div>

    <div class="test-section">
      <h2>权限守卫组件测试</h2>
      <div class="permission-tests">
        <div class="permission-test-item">
          <h4>管理员权限测试</h4>
          <PermissionGuard type="admin" message="此内容仅管理员可见" target-path="/admin">
            <div class="admin-content">
              <p>这是管理员专属内容</p>
              <el-button type="success">管理员操作</el-button>
            </div>
          </PermissionGuard>
        </div>
        
        <div class="permission-test-item">
          <h4>用户权限测试</h4>
          <PermissionGuard type="user" message="此内容仅登录用户可见" target-path="/profile">
            <div class="user-content">
              <p>这是用户专属内容</p>
              <el-button type="primary">用户操作</el-button>
            </div>
          </PermissionGuard>
        </div>
        
        <div class="permission-test-item">
          <h4>游客权限测试</h4>
          <PermissionGuard type="guest" message="此内容仅游客可见">
            <div class="guest-content">
              <p>这是游客专属内容</p>
              <el-button type="info">游客操作</el-button>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../store/user'
import { authApi } from '../api/index.js'
import { ElMessage } from 'element-plus'
import { guestInit } from '../utils/guestInit.js'
import { useRouter } from 'vue-router'
import PermissionGuard from '../components/PermissionGuard.vue'

const userStore = useUserStore()
const router = useRouter()

// 监听登录成功事件
const handleLoginSuccess = () => { 
  console.log('TestUserStatus页面收到登录成功事件')
  // 不需要手动更新，computed会自动响应
}

// 监听注册成功事件
const handleRegisterSuccess = () => { 
  console.log('TestUserStatus页面收到注册成功事件')
  // 不需要手动更新，computed会自动响应
}

// 监听退出登录事件
const handleLogoutSuccess = () => { 
  console.log('TestUserStatus页面收到退出登录事件')
  // 不需要手动更新，computed会自动响应
}

const token = computed(() => {
  return userStore.token || 'null'
})

const isLoggedIn = computed(() => {
  return userStore.isLoggedIn
})

const isGuest = computed(() => {
  return userStore.isGuest
})

const userId = computed(() => {
  return userStore.userId
})

const guestId = computed(() => {
  return userStore.guestId
})

const contact = computed(() => {
  return userStore.contact
})

const contactType = computed(() => {
  return userStore.contactType
})

const contactTypeText = computed(() => {
  const type = contactType.value
  if (type === 0) return '匿名用户'
  if (type === 1) return '手机号'
  if (type === 2) return '邮箱'
  return `未知类型(${type})`
})

const roles = computed(() => {
  return userStore.roles || []
})

const isAdmin = computed(() => {
  return userStore.isAdmin
})

const isUser = computed(() => {
  return userStore.isUser
})

const tokenExpiry = computed(() => {
  const token = userStore.token
  if (!token) return '无'
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) {
      return new Date(payload.exp * 1000).toLocaleString()
    }
    return '无过期时间'
  } catch (error) {
    return '解析失败'
  }
})

const jwtInfo = computed(() => {
  const token = userStore.token
  if (!token) return '无Token'
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return 'Token格式错误'
    
    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))
    
    return JSON.stringify({
      header,
      payload,
      signature: parts[2].substring(0, 20) + '...'
    }, null, 2)
  } catch (error) {
    return `Token解析失败: ${error.message}`
  }
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

const setTestToken = () => {
  // 设置一个测试的游客token
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZ3Vlc3QiLCJnaWQiOiJ0ZXN0LWd1ZXN0LWlkIiwibmFtZSI6InRlc3QiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test'
  localStorage.setItem('token', testToken)
  ElMessage.success('测试Token已设置')
  // 刷新页面以更新状态
  window.location.reload()
}

const setUserToken = () => {
  // 设置一个测试的用户token
  const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidXNlciIsInVpZCI6MTIzLCJuYW1lIjoidGVzdHVzZXIiLCJjb250YWN0IjoiMTM4MDAwMDAwMDAiLCJjb250YWN0X3R5cGUiOjEsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test'
  localStorage.setItem('token', testUserToken)
  ElMessage.success('用户Token已设置')
  // 刷新页面以更新状态
  window.location.reload()
}

const getGuestToken = async () => {
  try {
    const response = await authApi.getGuestToken()
    if (response && response.token) {
      localStorage.setItem('token', response.token)
      ElMessage.success('游客JWT获取成功')
      // 刷新页面以更新状态
      window.location.reload()
    } else {
      ElMessage.error('获取游客JWT失败')
    }
  } catch (error) {
    console.error('获取游客JWT失败:', error)
    ElMessage.error('获取游客JWT失败: ' + error.message)
  }
}

const refreshInfo = () => {
  // 强制更新store状态
  userStore.$reset()
  ElMessage.success('信息已刷新')
}

const updateStoreState = () => {
  // 手动触发store的更新逻辑
  userStore.updateState()
  ElMessage.success('Store状态已手动更新')
}

const testLogout = () => {
  userStore.logout()
  ElMessage.success('测试退出登录成功')
  // 刷新页面以更新状态
  window.location.reload()
}

const testGuestInit = async () => {
  try {
    await guestInit.initGuestIfNeeded()
    ElMessage.success('游客身份初始化成功')
    // 刷新页面以更新状态
    window.location.reload()
  } catch (error) {
    console.error('游客身份初始化失败:', error)
    ElMessage.error('游客身份初始化失败: ' + error.message)
  }
}

const testNoPermission = () => {
  // 直接跳转到权限不足页面进行测试
  router.push({
    path: '/no-permission',
    query: {
      target: '/admin',
      from: '/test-user-status',
      code: '403',
      reason: 'admin_required'
    }
  })
}

onMounted(() => {
  // 监听登录相关事件
  window.addEventListener('loginSuccess', handleLoginSuccess)
  window.addEventListener('registerSuccess', handleRegisterSuccess)
  window.addEventListener('logoutSuccess', handleLogoutSuccess)
})

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('loginSuccess', handleLoginSuccess)
  window.removeEventListener('registerSuccess', handleRegisterSuccess)
  window.removeEventListener('logoutSuccess', handleLogoutSuccess)
})
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.test-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 10px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.status-item strong {
  min-width: 100px;
  color: #333;
}

.token-display {
  font-family: monospace;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  max-width: 200px;
}

.roles-display {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.jwt-info {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
}

.jwt-info pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.permission-tests {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-test-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
}

.permission-test-item h4 {
  margin-top: 0;
  color: #409EFF;
  border-bottom: 1px dashed #eee;
  padding-bottom: 10px;
}

.admin-content, .user-content, .guest-content {
  margin-top: 15px;
  padding: 15px;
  background-color: #eef;
  border: 1px solid #dde;
  border-radius: 6px;
}

.admin-content p, .user-content p, .guest-content p {
  margin-bottom: 10px;
  color: #555;
}

.admin-content .el-button, .user-content .el-button, .guest-content .el-button {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .status-item strong {
    min-width: auto;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>
