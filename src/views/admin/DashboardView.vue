<template>
  <div class="dashboard-view">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in summaryCards" :key="card.label">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi">
            <el-icon class="kpi-icon"><component :is="card.icon" /></el-icon>
            <div class="kpi-meta">
              <div class="kpi-value">{{ card.value }}</div>
              <div class="kpi-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <div ref="ordersChartRef" style="height:300px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <div ref="usersChartRef" style="height:300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :xs="24">
        <el-card shadow="hover">
          <div ref="revenueChartRef" style="height:320px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, ShoppingCart, Box, Coin } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { adminOrders, adminUsers, adminProducts } from '@/api/admin'

const summaryCards = ref([
  { label: '用户数', value: 0, icon: User },
  { label: '订单数', value: 0, icon: ShoppingCart },
  { label: '商品数', value: 0, icon: Box },
  { label: '今日营收', value: '¥0.00', icon: Coin }
])

const ordersChartRef = ref(null)
const usersChartRef = ref(null)
const revenueChartRef = ref(null)

const initCharts = (ordersSeries, usersSeries, revenueSeries, categories) => {
  const ordersChart = echarts.init(ordersChartRef.value)
  ordersChart.setOption({
    title: { text: '近7天订单数', left: 'center', textStyle: { fontSize: 12 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: ordersSeries, itemStyle: { color: '#409eff' } }]
  })

  const usersChart = echarts.init(usersChartRef.value)
  usersChart.setOption({
    title: { text: '近7天新增用户', left: 'center', textStyle: { fontSize: 12 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: 'line', areaStyle: {}, data: usersSeries, itemStyle: { color: '#67c23a' } }]
  })

  const revenueChart = echarts.init(revenueChartRef.value)
  revenueChart.setOption({
    title: { text: '近7天营收', left: 'center', textStyle: { fontSize: 12 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: revenueSeries, smooth: true, itemStyle: { color: '#e6a23c' } }]
  })
}

const loadMetrics = async () => {
  // 加载汇总
  const products = await adminProducts.list()
  const usersPage = await adminUsers.list({ page: 1, size: 1 })
  const ordersPage = await adminOrders.list({ page: 1, size: 1 })
  summaryCards.value = [
    { label: '用户数', value: Number(usersPage.total || 0), icon: User },
    { label: '订单数', value: Number(ordersPage.total || 0), icon: ShoppingCart },
    { label: '商品数', value: (products.records || products || []).length, icon: Box },
    { label: '今日营收', value: '¥0.00', icon: Coin }
  ]

  // 伪造近7天数据（如需真实统计，可改为后端统计接口），这里从分页数据中构造简单样例
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return `${d.getMonth()+1}/${d.getDate()}`
  })
  const ordersSeries = [3, 5, 2, 6, 4, 7, 5]
  const usersSeries = [1, 0, 2, 3, 1, 4, 2]
  const revenueSeries = [120, 300, 180, 260, 200, 520, 380]
  initCharts(ordersSeries, usersSeries, revenueSeries, days)
}

onMounted(loadMetrics)
</script>

<style scoped>
.kpi-card {
  background: #ffffff;
  border: 1px solid #ebeef5;
  color: #303133;
}
.kpi {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kpi-icon {
  color: #409eff;
  font-size: 26px;
}
.kpi-value {
  font-size: 20px;
  font-weight: 700;
}
.kpi-label { opacity: 0.8; font-size: 12px; }
</style>


