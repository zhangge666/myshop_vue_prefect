<template>
  <div>
    <h1>简单测试页面</h1>
    <p>如果你能看到这个页面，说明路由工作正常。</p>
    <p>当前时间: {{ currentTime }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref('')

onMounted(() => {
  currentTime.value = new Date().toLocaleString()
  console.log('SimpleTest页面已加载')
})
</script>

<style scoped>
div {
  padding: 20px;
  text-align: center;
}
</style>
