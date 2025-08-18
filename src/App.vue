<template>
  <div id="app">
    <!-- 前台导航，仅在非后台路由展示 -->
    <Navbar v-if="!isAdmin" />

    <!-- 主内容区：后台路由有自己的布局 -->
    <main class="main-content" v-if="!isAdmin">
      <router-view />
    </main>

    <!-- 直接渲染后台布局的内容区域 -->
    <router-view v-else />

    <!-- 前台页脚，仅在非后台路由展示 -->
    <Footer v-if="!isAdmin" />
  </div>
</template>

<script setup>
import Navbar from './components/layout/front/Navbar.vue'
import Footer from './components/layout/front/Footer.vue'
import { useAppStore } from '@/store/app'
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const route = useRoute()
onMounted(async () => {
  await appStore.initApp()
})

const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  background-color: #f9fafb;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
