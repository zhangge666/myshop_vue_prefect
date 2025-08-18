<template>
  <div class="admin-layout">
    <AdminSidebar :mobile-open="mobileOpen" @navigate="closeMobile" />
    <!-- 点击遮罩关闭侧栏（仅移动端显示） -->
    <div v-if="mobileOpen" class="mobile-overlay" @click="closeMobile"></div>
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <el-button type="primary" link @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回前台
          </el-button>
          <el-button class="icon-btn" text circle @click="openNotifications">
            <el-icon><Bell /></el-icon>
          </el-button>
          <el-dropdown>
            <div class="user-box">
              <el-avatar :src="avatarUrl || defaultAvatar" size="small" />
              <span class="nickname">{{ nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- 移动端菜单按钮置于最右侧 -->
          <el-button class="mobile-menu-btn" text circle @click="toggleMobile">
            <el-icon><Menu /></el-icon>
          </el-button>
        </div>
      </header>
      <section class="admin-content">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from './AdminSidebar.vue'
import { HomeFilled, Bell, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getImageUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const mobileOpen = ref(false)

const pageTitle = computed(() => route.meta?.title || '管理后台')
const goHome = () => router.push('/')

const nickname = computed(() => userStore.userInfo?.username || '管理员')
const avatarUrl = computed(() => getImageUrl(userStore.userInfo?.avatar || ''))
const defaultAvatar = 'https://picsum.photos/id/237/100/100'

const openNotifications = () => {
  // TODO: 打开通知抽屉/下拉
}

const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value
}
const closeMobile = () => {
  mobileOpen.value = false
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
}

.admin-content {
  padding: 16px;
  background: #ffffff;
  color: #303133;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  color: #606266;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 1px solid #ebeef5;
}

.nickname {
  font-weight: 500;
  color: #303133;
}

/* Mobile topbar tweaks */
@media (max-width: 768px) {
  .mobile-menu-btn { display: inline-flex; }
  .page-title { font-size: 15px; }
}

@media (min-width: 769px) {
  .mobile-menu-btn { display: none; }
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  z-index: 1500;
  inset: 0;
  background: rgba(0,0,0,0.35);
}
</style>


