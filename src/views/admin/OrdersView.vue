<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">订单管理</div>
        <div class="filters">
          <el-input v-model="orderNo" placeholder="订单号" clearable style="max-width: 200px;" />
          <el-select v-model="status" placeholder="状态" style="max-width: 180px;">
            <el-option label="全部" :value="undefined" />
            <el-option label="创建" :value="0" />
            <el-option label="待支付" :value="1" />
            <el-option label="已支付" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="已取消" :value="4" />
            <el-option label="已过期" :value="5" />
            <el-option label="已退款" :value="6" />
          </el-select>
          <el-button type="primary" @click="query">查询</el-button>
        </div>
      </div>
      <el-table :data="orders" border stripe>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="payAmount" label="金额">
          <template #default="{ row }">¥{{ Number(row.totalAmount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="danger" :disabled="!canCancel(row)" @click="cancel(row)">取消</el-button>
            <el-button link type="success" :disabled="!canComplete(row)" @click="complete(row)">完成</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640px">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="订单ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="联系方式类型">{{ detail.contactType }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detail.contact }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ Number(detail.totalAmount || 0).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">¥{{ Number(detail.payAmount || 0).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ statusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付渠道ID">{{ detail.channelId }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ detail.expireTime }}</el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ detail.clientIp }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.userRemark }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminOrders } from '@/api/admin'
const orderNo = ref('')
const status = ref()
const orders = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const query = async () => {
  const data = await adminOrders.list({ page: Number(page.value), size: Number(size.value), orderNo: orderNo.value || undefined, status: status.value })
  orders.value = data.records || data || []
  total.value = Number(data.total) || orders.value.length
  console.log(orders.value)
}

const handleSizeChange = (val) => {
  size.value = Number(val)
  page.value = 1
  query()
}
const handleCurrentChange = (val) => {
  page.value = Number(val)
  query()
}

const normalizeStatus = (val) => {
  if (val === null || val === undefined) return undefined
  if (typeof val === 'number') return val
  // numeric string
  const n = Number(val)
  if (!Number.isNaN(n)) return n
  // enum string names
  const map = {
    CREATED: 0,
    PENDING_PAYMENT: 1,
    PAID: 2,
    SHIPPED: 3,
    CANCELED: 4,
    EXPIRED: 5,
    REFUNDED: 6
  }
  return map[String(val).toUpperCase()]
}

const statusText = (val) => {
  const s = normalizeStatus(val)
  if (s === 0) return '创建'
  if (s === 1) return '待支付'
  if (s === 2) return '已支付'
  if (s === 3) return '已发货'
  if (s === 4) return '已取消'
  if (s === 5) return '已过期'
  if (s === 6) return '已退款'
  return String(val ?? '')
}
const statusTagType = (val) => {
  const s = normalizeStatus(val)
  if (s === 2) return 'success' // 已支付
  if (s === 3) return 'success' // 已发货/完成
  if (s === 1) return 'warning' // 待支付
  if (s === 4) return 'info' // 已取消
  if (s === 5) return 'info' // 已过期
  if (s === 6) return 'danger' // 已退款
  return 'info' // 创建
}

// 详情对话框
const detailVisible = ref(false)
const detail = ref({})
const openDetail = async (row) => {
  const data = await adminOrders.detail(row.id)
  detail.value = data || {}
  detailVisible.value = true
}

// 取消/完成
const canCancel = (row) => {
  const s = normalizeStatus(row.status)
  // 未发货且未取消/过期/退款才允许取消
  return s !== undefined && ![3,4,5,6].includes(s)
}
const canComplete = (row) => {
  const s = normalizeStatus(row.status)
  // 待支付或已支付时允许完成
  return s === 1 || s === 2
}
const cancel = async (row) => {
  await ElMessageBox.confirm('确认取消该订单吗？', '提示', { type: 'warning' })
  await adminOrders.update(row.id, { status: 4 })
  ElMessage.success('已取消')
  query()
}
const complete = async (row) => {
  await ElMessageBox.confirm('确认将该订单标记为已发货/完成吗？', '提示', { type: 'warning' })
  await adminOrders.update(row.id, { status: 3 })
  ElMessage.success('已完成')
  query()
}

onMounted(query)
</script>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #ebeef5;
  color: #303133;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.filters {
  display: flex;
  gap: 8px;
}
.title { font-weight: 600; }
.pager { margin-top: auto; display: flex; justify-content: center; padding: 16px 0; }
@media (max-width: 768px) {
  .pager { padding-bottom: 68px; }
  .pager :deep(.el-pagination) { width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
}
</style>


