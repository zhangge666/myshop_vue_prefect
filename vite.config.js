import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',   // 允许外网访问
    port: 5173,
    allowedHosts: [
      '4272ccca.r36.cpolar.top'  // 把 cpolar 分配给你的域名加进来
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/admin/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/qrcodes': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
