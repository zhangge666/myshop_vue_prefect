import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { guestInit } from './utils/guestInit.js'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 立即挂载应用
app.mount('#app')

// 在应用挂载后初始化用户状态
guestInit.init().then(async () => {
  console.log('用户状态初始化完成')
  // 初始化完成后，解析用户信息
  const { useUserStore } = await import('./store/user.js')
  const userStore = useUserStore()
  userStore.init()
}).catch(error => {
  console.error('用户状态初始化失败:', error)
})
