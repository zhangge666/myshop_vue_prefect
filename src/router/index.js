import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import Home from '../views/Home.vue'
import { useUserStore } from '../store/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/test',
      name: 'test',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guest: true // 不需要登录即可访问
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        guest: true // 不需要登录即可访问
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 已登录用户不能访问登录和注册页
  if (userStore.isLoggedIn && to.meta.guest) {
    next('/')
  } else {
    next()
  }
})

export default router
