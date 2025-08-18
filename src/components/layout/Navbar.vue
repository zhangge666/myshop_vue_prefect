<template>
  <header class="navbar-container">
    <div class="navbar-wrapper">
      <!-- Logo区域 -->
      <div class="logo" @click="$router.push('/')">
        <el-icon class="logo-icon">
          <Shop />
        </el-icon>
        <span class="logo-text">MyShop发卡商城</span>
      </div>

      <!-- 桌面端导航链接 -->
      <nav class="desktop-nav">
        <ul class="nav-links">
          <li :class="{ active: $route.path === '/' }">
            <router-link to="/">首页</router-link>
          </li>
          <li :class="{ active: $route.path === '/categories' }">
            <router-link to="/categories">分类</router-link>
          </li>
          <li :class="{ active: $route.path === '/orders' }">
            <router-link to="/orders">订单</router-link>
          </li>
          <li :class="{ active: $route.path === '/about' }">
            <router-link to="/about">关于我们</router-link>
          </li>
        </ul>
      </nav>

      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" size="small" />
          </template>
        </el-input>
      </div>

      <!-- 桌面端用户信息 -->
      <div class="desktop-user-info" v-if="userStore.isLoggedIn">
        <div class="user-details">
          <div class="username">{{ userStore.userInfo.username }}</div>
          <div class="balance">余额: ¥{{ userStore.userInfo.balance.toFixed(2) }}</div>
        </div>
        <el-dropdown>
          <div class="avatar-container">
            <el-avatar 
              :src="userStore.userInfo.avatar || defaultAvatar" 
              class="user-avatar"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-icon><ShoppingCart /></el-icon>
                <span>我的订单</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-icon><Coin /></el-icon>
                <span>账户充值</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 未登录状态 -->
      <div class="auth-buttons" v-else>
        <el-button type="text" @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" @click="$router.push('/register')">注册</el-button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <el-icon :size="24">
          <Menu />
        </el-icon>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
      <div class="mobile-menu-header">
        <div class="mobile-logo">
          <span class="logo-text">MyShop</span>
        </div>
        <button class="close-menu" @click="toggleMobileMenu">
          <el-icon :size="24">
            <Close />
          </el-icon>
        </button>
      </div>

      <!-- 移动端搜索框 -->
      <div class="mobile-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" size="small" />
          </template>
        </el-input>
      </div>

      <!-- 移动端导航链接 -->
      <nav class="mobile-nav">
        <ul class="mobile-nav-links">
          <li :class="{ active: $route.path === '/' }" @click="handleMobileNavClick('/')">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </li>
          <li :class="{ active: $route.path === '/categorys' }" @click="handleMobileNavClick('/categorys')">
            <el-icon><Menu /></el-icon>
            <span>分类</span>
          </li>
          <li :class="{ active: $route.path === '/orders' }" @click="handleMobileNavClick('/orders')">
            <el-icon><Document /></el-icon>
            <span>订单</span>
          </li>
          <li :class="{ active: $route.path === '/about' }" @click="handleMobileNavClick('/about')">
            <el-icon><InfoFilled /></el-icon>
            <span>关于我们</span>
          </li>
        </ul>
      </nav>

      <!-- 移动端用户信息 -->
      <div class="mobile-user-section" v-if="userStore.isLoggedIn">
        <div class="mobile-user-info">
          <el-avatar 
            :src="userStore.userInfo.avatar || defaultAvatar" 
            class="mobile-avatar"
          />
          <div class="mobile-user-details">
            <div class="username">{{ userStore.userInfo.username }}</div>
            <div class="balance">余额: ¥{{ userStore.userInfo.balance.toFixed(2) }}</div>
          </div>
        </div>
        <div class="mobile-user-menu">
          <el-button type="text" class="mobile-user-btn" @click="handleMobileNavClick('/profile')">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-button>
          <el-button type="text" class="mobile-user-btn" @click="handleMobileNavClick('/orders')">
            <el-icon><ShoppingCart /></el-icon>
            <span>我的订单</span>
          </el-button>
          <el-button type="text" class="mobile-user-btn" @click="handleMobileNavClick('/recharge')">
            <el-icon><Coin /></el-icon>
            <span>账户充值</span>
          </el-button>
          <el-button type="text" class="mobile-user-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-button>
        </div>
      </div>

      <!-- 移动端未登录 -->
      <div class="mobile-auth-buttons" v-else>
        <el-button type="primary" class="mobile-auth-btn" @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" class="mobile-auth-btn" @click="$router.push('/register')">注册</el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 导入需要的图标
import {Search, User, ShoppingCart, Coin, SwitchButton, Menu, Close, HomeFilled, Document, InfoFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const defaultAvatar = 'https://picsum.photos/id/237/100/100'

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
    mobileMenuOpen.value = false // 关闭移动端菜单
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 处理移动端导航点击
const handleMobileNavClick = (path) => {
  router.push(path)
  mobileMenuOpen.value = false
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已成功退出登录')
  router.push('/')
  mobileMenuOpen.value = false
}
</script>

<style scoped>
.navbar-container {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 100;
}

.navbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 64px;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #165DFF;
  font-weight: 600;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
}

/* 桌面端导航 */
.desktop-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin: 0 12px;
  position: relative;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  padding: 8px 0;
  font-size: 15px;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #165DFF;
}

.nav-links li.active a {
  color: #165DFF;
}

.nav-links li.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #165DFF;
}

/* 搜索框 */
.search-container {
  width: 280px;
  margin: 0 1rem;
}

.search-input {
  width: 100%;
}

/* 用户信息样式 */
.desktop-user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-right: 12px;
  text-align: right;
}

.username {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.balance {
  font-size: 13px;
  color: #F56C6C;
  white-space: nowrap;
}

/* 头像样式 - 已调整为合适大小 */
.user-avatar {
  width: 36px;
  height: 36px;
  cursor: pointer;
  border: 2px solid #f0f0f0;
}

/* 登录/注册按钮 */
.auth-buttons {
  display: flex;
  gap: 8px;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 4px;
}

/* 移动端菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 300px;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.mobile-menu-open {
  transform: translateX(0);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-logo {
  display: flex;
  align-items: center;
  color: #165DFF;
  font-weight: 600;
}

.close-menu {
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
}

.mobile-search {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-links li {
  border-bottom: 1px solid #f0f0f0;
}

.mobile-nav-links li a,
.mobile-nav-links li {
  display: flex;
  align-items: center;
  padding: 12px 1rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-nav-links li:hover {
  background-color: #f5f7fa;
}

.mobile-nav-links li.active {
  background-color: #e8f3ff;
  color: #165DFF;
}

.mobile-nav-links li el-icon {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

/* 移动端用户信息 */
.mobile-user-section {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.mobile-user-details {
  flex: 1;
}

.mobile-user-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-user-btn {
  justify-content: flex-start;
  width: 100%;
  padding: 10px 12px;
}

.mobile-user-btn el-icon {
  margin-right: 10px;
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.mobile-auth-btn {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .search-container {
    width: 200px;
  }
  
  .nav-links li {
    margin: 0 8px;
  }
}

@media (max-width: 768px) {
  .desktop-nav,
  .search-container,
  .desktop-user-info,
  .auth-buttons {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .logo-text {
    font-size: 16px;
  }
}
</style>
    