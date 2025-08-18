<template>
  <aside class="admin-sidebar" :class="{ collapsed, 'is-mobile-open': mobileOpen }">
    <div class="sidebar-header" @click="goDashboard">
      <el-icon class="brand-icon"><HomeFilled /></el-icon>
      <span class="brand-text">MyShop 后台</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#ffffff"
      text-color="#303133"
      active-text-color="#409eff"
      :collapse="collapsed"
      :router="true"
      @select="handleSelect"
    >
      <el-menu-item index="/admin">
        <el-icon><DataLine /></el-icon>
        <span class="menu-text">仪表盘</span>
      </el-menu-item>

      <el-menu-item index="/admin/users">
        <el-icon><User /></el-icon>
        <span class="menu-text">用户</span>
      </el-menu-item>

      <el-menu-item index="/admin/orders">
        <el-icon><Document /></el-icon>
        <span class="menu-text">订单</span>
      </el-menu-item>

      <el-menu-item index="/admin/categories">
        <el-icon><Menu /></el-icon>
        <span class="menu-text">分类</span>
      </el-menu-item>

      <el-menu-item index="/admin/products">
        <el-icon><Box /></el-icon>
        <span class="menu-text">商品</span>
      </el-menu-item>

      <el-menu-item index="/admin/cards">
        <el-icon><Key /></el-icon>
        <span class="menu-text">卡密</span>
      </el-menu-item>

      <el-menu-item index="/admin/configs">
        <el-icon><Setting /></el-icon>
        <span class="menu-text">网站配置</span>
      </el-menu-item>

      <el-menu-item index="/admin/payments">
        <el-icon><CreditCard /></el-icon>
        <span class="menu-text">支付渠道</span>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <el-button text size="small" @click="toggle">
        <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
        <span v-if="!collapsed">收起</span>
      </el-button>
    </div>
  </aside>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, DataLine, User, Document, Box, Key, Setting, CreditCard, Fold, Expand, Menu } from '@element-plus/icons-vue'

const props = defineProps({
  mobileOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['navigate'])

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/users')) return '/admin/users'
  if (path.startsWith('/admin/orders')) return '/admin/orders'
  if (path.startsWith('/admin/products')) return '/admin/products'
  if (path.startsWith('/admin/categories')) return '/admin/categories'
  if (path.startsWith('/admin/cards')) return '/admin/cards'
  if (path.startsWith('/admin/configs')) return '/admin/configs'
  if (path.startsWith('/admin/payments')) return '/admin/payments'
  return '/admin'
})

const toggle = () => {
  collapsed.value = !collapsed.value
}

const goDashboard = () => {
  router.push('/admin')
}

const handleSelect = () => {
  emit('navigate')
}
</script>

<style scoped>
.admin-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  color: #303133;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: padding 0.25s ease, gap 0.25s ease, justify-content 0.25s ease;
}

.brand-icon {
  color: #409eff;
  transition: transform 0.25s ease;
}

.brand-text {
  white-space: nowrap;
  transition: opacity 0.2s ease, transform 0.2s ease, width 0.2s ease;
  display: inline-block;
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 10px;
  display: flex;
  justify-content: center;
}

/* menu item aesthetics */
:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  margin: 6px 10px;
}

:deep(.el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.12) !important;
}

:deep(.el-menu) {
  border-right: none !important;
}

.menu-text {
  margin-left: 8px;
  transition: opacity 0.2s ease, width 0.2s ease, margin 0.2s ease;
  white-space: nowrap;
  display: inline-block;
  overflow: hidden;
}

.admin-sidebar.collapsed .brand-text {
  opacity: 0;
  width: 0;
  transform: translateX(-6px);
}

.admin-sidebar.collapsed .menu-text {
  opacity: 0;
  width: 0;
  margin-left: 0;
}

.admin-sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 18px 0;
  gap: 0;
}

/* 确保收起后菜单项(含激活项)图标水平居中 */
.admin-sidebar.collapsed :deep(.el-menu) {
  width: 64px !important;
}

.admin-sidebar.collapsed :deep(.el-menu-item) {
  display: flex !important;
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
}

.admin-sidebar.collapsed :deep(.el-menu-item .el-icon) {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 78vw;
    max-width: 300px;
    transform: translateX(-100%);
    transition: transform 0.25s ease, width 0.25s ease;
    z-index: 2000;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
  .admin-sidebar.is-mobile-open {
    transform: translateX(0);
  }
  .admin-sidebar.collapsed {
    width: 78vw;
  }
}

</style>


