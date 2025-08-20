# JWT认证系统使用说明

## 概述

本项目实现了基于JWT的混合认证系统，支持：
- **用户登录认证**：使用用户名密码登录，获得JWT token
- **游客身份**：自动为未登录用户创建游客身份
- **权限控制**：基于角色的权限管理（ROLE_USER、ROLE_ADMIN、ROLE_GUEST）

## 核心文件

### 1. 认证工具类 (`src/utils/auth.js`)
提供JWT解析和用户状态管理功能：

```javascript
import { authUtils } from '../utils/auth'

// 获取token
const token = authUtils.getToken()

// 检查是否登录
const isLoggedIn = authUtils.isLoggedIn()

// 检查是否是游客
const isGuest = authUtils.isGuest()

// 获取用户ID
const userId = authUtils.getUserId()

// 获取游客ID
const guestId = authUtils.getGuestId()

// 获取用户角色
const roles = authUtils.getRoles()

// 检查权限
const isAdmin = authUtils.isAdmin()
const isUser = authUtils.isUser()
```

### 2. 用户状态管理 (`src/store/user.js`)
基于Pinia的用户状态管理：

```javascript
import { useUserStore } from '../store/user'

const userStore = useUserStore()

// 登录
await userStore.login(username, password)

// 注册
await userStore.register(userData)

// 退出登录
userStore.logout()

// 获取用户信息
await userStore.fetchUserInfo()

// 检查权限
const isAdmin = userStore.isAdmin
const isGuest = userStore.isGuest
```

### 3. API拦截器 (`src/api/index.js`)
自动处理JWT的发送和接收：

- **请求拦截器**：自动添加JWT到请求头
- **响应拦截器**：自动捕获登录/注册响应中的JWT并存储

### 4. 用户状态组件 (`src/components/UserStatus.vue`)
可复用的用户状态显示组件，已集成到Navbar中：

```vue
<template>
  <UserStatus />
</template>

<script setup>
import UserStatus from '../components/UserStatus.vue'
</script>
```

## 使用示例

### 在组件中使用

```vue
<template>
  <div>
    <!-- 游客模式 -->
    <div v-if="userStore.isGuest">
      <p>游客ID: {{ userStore.guestId }}</p>
      <el-button @click="login">登录</el-button>
    </div>
    
    <!-- 登录用户 -->
    <div v-else-if="userStore.isLoggedIn">
      <p>欢迎, {{ userStore.userInfo?.username }}</p>
      <p>用户ID: {{ userStore.userId }}</p>
      
      <!-- 管理员功能 -->
      <div v-if="userStore.isAdmin">
        <el-button @click="goToAdmin">管理后台</el-button>
      </div>
    </div>
    
    <!-- 未登录 -->
    <div v-else>
      <el-button @click="login">登录</el-button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const login = () => {
  router.push('/login')
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>
```

### 权限检查

```javascript
// 在组件中检查权限
if (userStore.isAdmin) {
  // 管理员功能
}

if (userStore.hasRole('ROLE_USER')) {
  // 普通用户功能
}

// 在路由守卫中检查权限
router.beforeEach((to, from, next) => {
  if (to.meta.admin && !userStore.isAdmin) {
    next('/')
    return
  }
  next()
})
```

## 工作流程

### 1. 游客访问
1. 用户访问网站
2. `guestInit.js` 自动发送请求到后端
3. 后端 `SessionOrJwtAuthFilter` 创建游客身份并返回JWT
4. 前端自动存储JWT到localStorage

### 2. 用户登录
1. 用户输入用户名密码
2. 前端调用登录API
3. 后端验证并返回JWT + 用户信息
4. 响应拦截器自动捕获并存储JWT
5. 用户状态更新为登录状态

### 3. API请求
1. 请求拦截器自动添加JWT到请求头
2. 后端 `SessionOrJwtAuthFilter` 解析JWT
3. 设置用户身份到Spring Security上下文
4. 业务逻辑执行

## 组件集成

### UserStatus组件已集成到Navbar
- **桌面端**：显示用户名、余额和头像下拉菜单
- **移动端**：适配移动端布局
- **游客模式**：显示游客标签和登录按钮
- **登录用户**：显示用户信息和功能菜单

### 测试页面
访问 `/test-user-status` 可以测试UserStatus组件的各种状态。

## 配置说明

### 后端配置
- JWT密钥：`myshop.jwt.secret`
- JWT过期时间：`myshop.jwt.expire-seconds`
- 游客身份：自动创建，无需配置

### 前端配置
- Token存储：localStorage
- 自动捕获：响应拦截器
- 自动发送：请求拦截器

## 注意事项

1. **JWT安全性**：生产环境请使用强密钥
2. **Token过期**：401错误会自动清除token并跳转登录
3. **游客数据**：游客身份数据存储在本地，清除浏览器数据会丢失
4. **权限控制**：前端权限检查仅用于UI显示，后端仍需验证

## 故障排除

### 常见问题

1. **Token不自动存储**
   - 检查响应拦截器是否正确配置
   - 确认后端返回的响应格式包含token字段

2. **请求不携带Token**
   - 检查请求拦截器是否正确配置
   - 确认localStorage中是否有token

3. **权限检查失败**
   - 检查JWT payload中的roles字段
   - 确认角色名称格式正确（如ROLE_ADMIN）

4. **游客身份不创建**
   - 检查后端SessionOrJwtAuthFilter配置
   - 确认前端guestInit.js是否正确调用

5. **UserStatus组件不显示**
   - 确认组件已正确导入到Navbar
   - 检查路由配置是否正确
   - 访问 `/test-user-status` 测试组件功能
