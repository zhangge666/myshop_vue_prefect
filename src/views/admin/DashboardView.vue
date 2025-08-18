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
import { adminOrders, adminUsers, adminProducts, adminDashboard } from '@/api/admin'

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
  const stats = await adminDashboard.stats()
  const today = stats.todayStats || {}
  const week = stats.weekStats || {}
  const dates = (week.dates || []).map(d => d?.slice(5)) // MM-DD
  const orderSeries = (week.validOrderCounts || []).map(n => Number(n))
  const userSeries = (week.newUserCounts || []).map(n => Number(n))
  const revenueSeries = (week.revenues || []).map(n => Number(n))

  summaryCards.value = [
    { label: '今日新增用户', value: Number(today.newUserCount || 0), icon: User },
    { label: '今日有效订单', value: Number(today.validOrderCount || 0), icon: ShoppingCart },
    { label: '今日利润', value: `¥${Number(today.profit || 0).toFixed(2)}`, icon: Box },
    { label: '今日营收', value: `¥${Number(today.revenue || 0).toFixed(2)}`, icon: Coin }
  ]

  initCharts(orderSeries, userSeries, revenueSeries, dates)
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


