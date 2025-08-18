<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">卡密管理</div>
        <div class="actions">
          <el-button type="primary" @click="openImport">导入卡密</el-button>
          <el-button type="warning" :disabled="selectedIds.length===0" @click="batchInvalidate">批量作废</el-button>
          <el-button type="danger" :disabled="selectedIds.length===0" @click="batchDelete">批量删除</el-button>
          <el-button :disabled="selectedIds.length===0" @click="exportSelectedCodes">导出所选卡密</el-button>
        </div>
      </div>
      <div class="filters">
        <el-select v-model="filterProductId" placeholder="全部商品" clearable style="max-width: 220px;">
          <el-option v-for="p in productOptions" :key="p.id" :label="p.name + ' (ID:'+ p.id +')'" :value="p.id" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="max-width: 160px;">
          <el-option label="未售(0)" :value="0" />
          <el-option label="出售(1)" :value="1" />
          <el-option label="作废(2)" :value="2" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索卡密/备注" clearable style="max-width: 260px;" />
        <el-button type="primary" :loading="loading" @click="query">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <el-table :data="cards" border stripe @selection-change="onSelectionChange" ref="tableRef" :loading="loading">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productId" label="商品ID" />
        <el-table-column prop="codeCipherText" label="卡密" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.codeCipherText }}</span>
            <el-button link type="primary" @click="copy(row.codeCipherText)">复制</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="invalidate(row)">作废</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
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

    <!-- 导入卡密 -->
    <el-dialog v-model="importVisible" title="导入卡密" width="560px">
      <el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="100px">
        <el-form-item label="商品" prop="productId">
          <el-select v-model="importForm.productId" placeholder="请选择商品">
            <el-option v-for="p in productOptions" :key="p.id" :label="p.name + ' (ID:'+ p.id +')'" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡密文本" prop="codesText">
          <div class="code-input-wrap">
            <div class="code-count" v-if="importCodesCount > 0">共 {{ importCodesCount }} 条</div>
            <el-input type="textarea" v-model="importForm.codesText" :rows="8" placeholder="每行一条卡密" />
          </div>
        </el-form-item>
        <el-form-item label="从文件导入">
          <el-upload
            class="import-upload"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onImportChange"
            accept=".txt,.csv,text/plain"
          >
            <el-button>选择文件(.txt/.csv)</el-button>
          </el-upload>
          <div class="hint">文件内容将按行拆分为多条卡密</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importVisible=false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="submitImport">导入</el-button>
      </template>
    </el-dialog>

    <!-- 编辑卡密 -->
    <el-dialog v-model="editVisible" title="编辑卡密" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="90px">
        <el-form-item label="ID">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="商品ID">
          <el-input v-model="editForm.productId" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option label="未售" :value="0" />
            <el-option label="出售" :value="1" />
            <el-option label="作废" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker v-model="editForm.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminCards, adminProducts } from '@/api/admin'

const cards = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const tableRef = ref()
const selectedIds = ref([])
const loading = ref(false)
const keyword = ref('')
const filterProductId = ref()
const filterStatus = ref()
const load = async () => {
  loading.value = true
  const data = await adminCards.list({ page: Number(page.value), size: Number(size.value), productId: filterProductId.value, status: filterStatus.value, keyword: keyword.value })
  cards.value = data.records || data || []
  total.value = Number(data.total) || cards.value.length
  loading.value = false
}
const onSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}
const openEdit = (row) => {
  editForm.value = {
    id: row.id,
    productId: row.productId,
    status: Number(row.status ?? 0),
    expireTime: row.expireTime || '',
    remark: row.remark || ''
  }
  editVisible.value = true
}
const submitEdit = async () => {
  await editFormRef.value.validate()
  saving.value = true
  try {
    await adminCards.update({ ...editForm.value })
    ElMessage.success('保存成功')
    editVisible.value = false
    load()
  } finally { saving.value = false }
}
const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该卡密吗？','提示',{ type: 'warning' })
  await adminCards.remove(row.id)
  load()
}
onMounted(load)
const query = () => { page.value = 1; load() }
const resetFilters = () => { keyword.value = ''; filterProductId.value = undefined; filterStatus.value = undefined; query() }
// 状态
const statusText = (s) => {
  const n = Number(s)
  if (n === 0) return '未售'
  if (n === 1) return '出售'
  if (n === 2) return '作废'
  return String(s ?? '')
}
const statusTagType = (s) => {
  const n = Number(s)
  if (n === 0) return 'info'
  if (n === 1) return 'success'
  if (n === 2) return 'warning'
  return 'info'
}

// 批量与单个作废/删除
const invalidate = async (row) => {
  await adminCards.update({ id: row.id, productId: row.productId, status: 2 })
  ElMessage.success('已作废')
  load()
}
const batchInvalidate = async () => {
  if (selectedIds.value.length === 0) return
  await ElMessageBox.confirm(`确认将选中的 ${selectedIds.value.length} 条卡密作废吗？`, '提示', { type: 'warning' })
  await Promise.all(selectedIds.value.map(id => adminCards.update({ id, status: 2 })))
  ElMessage.success('批量作废成功')
  tableRef.value?.clearSelection?.()
  selectedIds.value = []
  load()
}
const batchDelete = async () => {
  if (selectedIds.value.length === 0) return
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条卡密吗？此操作不可恢复`, '提示', { type: 'warning' })
  await adminCards.batchDelete(selectedIds.value)
  ElMessage.success('批量删除成功')
  tableRef.value?.clearSelection?.()
  selectedIds.value = []
  load()
}

// 导入
const importVisible = ref(false)
const importing = ref(false)
const importFormRef = ref()
const importForm = ref({ productId: undefined, codesText: '' })
const importRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  codesText: [{ required: true, message: '请输入卡密文本', trigger: 'blur' }]
}
const productOptions = ref([])
const loadProducts = async () => {
  const data = await adminProducts.list({ page: 1, size: 1000 })
  productOptions.value = data.records || data || []
}
onMounted(loadProducts)
const openImport = () => {
  importForm.value = { productId: undefined, codesText: '' }
  importVisible.value = true
}
const importCodesCount = computed(() => {
  if (!importForm.value.codesText) return 0
  return importForm.value.codesText.split(/\r?\n/).filter(l => l.trim() !== '').length
})
const exportSelectedCodes = () => {
  if (selectedIds.value.length === 0) return
  const rows = cards.value.filter(c => selectedIds.value.includes(c.id))
  const lines = rows.map(r => r.codeCipherText || '').join('\n')
  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cards.txt'
  a.click()
  URL.revokeObjectURL(url)
}
const onImportChange = async (file) => {
  try {
    const raw = file.raw
    if (!raw) return
    const text = await raw.text()
    const merged = [importForm.value.codesText || '', text].filter(Boolean).join('\n')
    importForm.value.codesText = merged
    ElMessage.success('文件已读取到文本框')
  } catch (e) {
    ElMessage.error('读取文件失败')
  }
}
const submitImport = async () => {
  await importFormRef.value.validate()
  importing.value = true
  try {
    const codes = importForm.value.codesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    await adminCards.create({ productId: importForm.value.productId, codes })
    ElMessage.success('导入成功')
    importVisible.value = false
    load()
  } finally { importing.value = false }
}

// 编辑表单 refs
const editVisible = ref(false)
const editFormRef = ref()
const saving = ref(false)
const editForm = ref({ id: undefined, productId: undefined, status: 0, expireTime: '', remark: '' })
const editRules = { status: [{ required: true, message: '请选择状态', trigger: 'change' }] }

const handleSizeChange = (val) => {
  size.value = Number(val)
  page.value = 1
  load()
}
const handleCurrentChange = (val) => {
  page.value = Number(val)
  load()
}
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
.actions { display: flex; gap: 8px; }
.title { font-weight: 600; }
.filters { display: flex; gap: 8px; margin-bottom: 12px; }
.pager { margin-top: auto; display: flex; justify-content: center; padding: 16px 0; }
@media (max-width: 768px) {
  .pager { padding-bottom: 68px; }
  .pager :deep(.el-pagination) { width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
}
.code-input-wrap { width: 100%; position: relative; }
.code-count { position: absolute; left: 0; top: -22px; font-size: 12px; color: #909399; }
.hint { font-size: 12px; color: #909399; margin-left: 8px; }
 .filters { display: flex; gap: 8px; margin-bottom: 12px; }
 .code-input-wrap { width: 100%; position: relative; }
 .code-count { position: absolute; left: 0; top: -22px; font-size: 12px; color: #909399; }
</style>


