<template>
  <div class="payment-result-view">
    <div class="container">
      <div class="card">
        <h1 class="title">支付结果</h1>
        <div v-if="loading" class="content">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else class="content">
          <div class="status" :class="{ success: isSuccess, fail: !isSuccess }">
            <el-icon v-if="isSuccess" color="#67C23A"><i class="el-icon-success" /></el-icon>
            <el-icon v-else color="#F56C6C"><i class="el-icon-error" /></el-icon>
            <span>{{ message }}</span>
          </div>
          <div class="details">
            <p><strong>商户订单号：</strong>{{ outTradeNo || '-' }}</p>
            <p><strong>平台订单号：</strong>{{ tradeNo || '-' }}</p>
            <p><strong>支付方式：</strong>{{ type || '-' }}</p>
            <p><strong>金额：</strong>{{ money || '-' }}</p>
          </div>
          <div class="actions">
            <el-button v-if="isSuccess" type="warning" @click="openCardDialog">查看卡密</el-button>
            <el-button type="primary" @click="goOrders">查看我的订单</el-button>
            <el-button @click="goHome">返回首页</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看卡密弹窗（与订单列表一致） -->
    <el-dialog
      v-model="cardDialogVisible"
      width="700px"
      :close-on-click-modal="false"
      :lock-scroll="false"
      class="card-dialog"
    >
      <template #header>
        <div class="card-dialog-header">
          <span>卡密信息（订单号：{{ currentOrderNo }}）</span>
          <div class="actions">
            <template v-if="viewingMode === 'text'">
              <el-button size="small" type="success" @click="handleConvertToImages" :loading="converting">转化为图片</el-button>
              <el-button
                v-if="cardTexts.length > 0"
                size="small"
                type="primary"
                plain
                @click="handleCopyAll"
              >一键复制</el-button>
            </template>
            <template v-else>
              <el-button size="small" type="warning" @click="viewingMode = 'text'">转化为文本</el-button>
              <el-button
                v-if="cardTexts.length > 0"
                size="小"
                type="primary"
                plain
                @click="handleCopyAll"
              >一键复制</el-button>
            </template>
          </div>
        </div>
      </template>

      <div v-loading="cardLoading">
        <div v-if="viewingMode === 'text'">
          <div v-if="cardTexts.length > 0" class="card-texts">
            <div v-for="(line, idx) in cardTexts" :key="idx" class="card-line">
              <span class="line-text">{{ line }}</span>
              <el-button class="copy-btn" size="small" type="primary" link @click="handleCopy(line)">复制</el-button>
            </div>
          </div>
          <el-empty v-else description="暂无卡密数据" />
        </div>
        <div v-else class="card-images">
          <div v-if="cardImageUrls.length > 0" class="image-grid">
            <div v-for="(img, idx) in cardImageUrls" :key="idx" class="image-item">
              <img :src="img && img.startsWith('data:') ? img : getImageUrl(img)" alt="卡密二维码" />
            </div>
          </div>
          <el-empty v-else description="暂无图片" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentResultApi, cardApi } from '@/api'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'
import { getImageUrl } from '@/utils/image'


const route = useRoute()
const router = useRouter()

const loading = ref(true)
const isSuccess = ref(false)
const message = ref('正在验证支付结果...')

const outTradeNo = ref('')
const tradeNo = ref('')
const type = ref('')
const money = ref('')

const goOrders = () => router.push('/orders')
const goHome = () => router.push('/')

// 查看卡密对话框状态
const cardDialogVisible = ref(false)
const cardLoading = ref(false)
const converting = ref(false)
const viewingMode = ref('text')
const cardTexts = ref([])
const cardImageUrls = ref([])
const currentOrderNo = ref('')

const openCardDialog = async () => {
  try {
    cardDialogVisible.value = true
    cardLoading.value = true
    converting.value = false
    viewingMode.value = 'text'
    cardTexts.value = []
    cardImageUrls.value = []
    currentOrderNo.value = outTradeNo.value

    const res = await cardApi.getCardTextsByOrderNo(currentOrderNo.value)
    let lines = []
    if (Array.isArray(res)) {
      lines = res
    } else if (typeof res === 'string') {
      lines = res.split(/\r?\n/).filter(Boolean)
    } else if (res && Array.isArray(res.list)) {
      lines = res.list
    } else if (res && typeof res.data === 'string') {
      lines = res.data.split(/\r?\n/).filter(Boolean)
    } else if (res && Array.isArray(res.data)) {
      lines = res.data
    }
    cardTexts.value = lines
  } catch (e) {
    ElMessage.error('获取卡密失败，请稍后重试')
  } finally {
    cardLoading.value = false
  }
}

const handleConvertToImages = async () => {
  if (!cardTexts.value || cardTexts.value.length === 0) {
    ElMessage.warning('暂无可转换的卡密')
    return
  }
  if (cardTexts.value.length > 30) {
    ElMessage.warning('最多只能转换前30条卡密为图片')
    return
  }
  try {
    converting.value = true
    const opts = { errorCorrectionLevel: 'M', margin: 1, width: 260 }
    const result = []
    for (const line of cardTexts.value) {
      const text = String(line ?? '').trim()
      if (!text) continue
      const dataUrl = await QRCode.toDataURL(text, opts)
      result.push(dataUrl)
    }
    if (result.length === 0) {
      ElMessage.warning('没有可转换的有效卡密')
      return
    }
    cardImageUrls.value = result
    viewingMode.value = 'image'
  } catch (error) {
    ElMessage.error('生成二维码失败，请重试')
  } finally {
    converting.value = false
  }
}

const handleCopy = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleCopyAll = async () => {
  if (!cardTexts.value || cardTexts.value.length === 0) {
    ElMessage.warning('暂无可复制内容')
    return
  }
  const allText = cardTexts.value.join('\n')
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(allText)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = allText
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('全部卡密已复制')
  } catch (e) {
    ElMessage.error('复制失败，请手动复制')
  }
}

onMounted(async () => {
    // params 为支付平台通知的参数集合
  try {
    loading.value = true
    // 透传支付平台回传的所有查询参数给后端做验签
    const params = { ...route.query }
    outTradeNo.value = params.out_trade_no || ''
    tradeNo.value = params.trade_no || ''
    type.value = params.type || ''
    money.value = params.money || ''

    //await paymentResultApi.notify(params)


    const res = await paymentResultApi.verifyReturn(params)
    if (typeof res === 'string') {
      isSuccess.value = res.includes('成功')
      message.value = res
    } else if (res && res.code === 0) {
      isSuccess.value = (res.data || '').includes('成功')
      message.value = res.data || '支付结果已返回'
    } else {
      isSuccess.value = false
      message.value = res?.msg || res?.message || '支付验证失败'
    }
  } catch (e) {
    isSuccess.value = false
    message.value = '支付验证异常，请稍后重试'
    ElMessage.error(message.value)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.payment-result-view {
  min-height: 70vh;
  display: flex;
  align-items: center;
}
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 24px;
}
.title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}
.status.success { color: #67C23A; }
.status.fail { color: #F56C6C; }
.details p {
  margin: 0;
  color: #666;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

/* 复用订单列表卡密弹窗样式 */
.card-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}
.card-texts {
  max-height: 60vh;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #eee;
}
.card-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.card-line .line-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-line .copy-btn { flex-shrink: 0; }
.card-images .image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.card-images .image-item { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: center; }
.card-images .image-item img { max-width: 100%; height: auto; }
.card-dialog-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
