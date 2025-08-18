<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">支付渠道</div>
        <div class="actions">
          <el-input v-model="keyword" placeholder="关键字" clearable style="max-width: 220px;" />
          <el-button type="primary" @click="query">查询</el-button>
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="openCreate">新增渠道</el-button>
        </div>
      </div>

      <el-table :data="channels" border stripe :loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="channelName" label="渠道名称" />
        <el-table-column prop="pid" label="PID" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="apiUrl" label="API地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="isEnable" label="启用" width="120">
          <template #default="{ row }">
            <el-switch :model-value="Number(row.isEnable) === 1" @change="(v)=>toggleEnable(row, v)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="updateTime" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
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

    <!-- 新增/编辑渠道 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑渠道' : '新增渠道'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="渠道名称" prop="channelName">
          <el-input v-model="form.channelName" />
        </el-form-item>
        <el-form-item label="PID">
          <el-input v-model="form.pid" />
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="form.keySecret" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="例如: alipay/wechat/xxx" />
        </el-form-item>
        <el-form-item label="API地址">
          <el-input v-model="form.apiUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabledBool" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminPayments } from '@/api/admin'

const channels = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const loading = ref(false)
const keyword = ref('')

const load = async () => {
  loading.value = true
  const data = await adminPayments.list({ page: Number(page.value), size: Number(size.value), keyword: keyword.value || undefined })
  channels.value = data.records || data || []
  total.value = Number(data.total) || channels.value.length
  loading.value = false
}
onMounted(load)

const handleSizeChange = (val) => {
  size.value = Number(val)
  page.value = 1
  load()
}
const handleCurrentChange = (val) => {
  page.value = Number(val)
  load()
}
const query = () => { page.value = 1; load() }
const reset = () => { keyword.value = ''; query() }

// 新增/编辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const saving = ref(false)
const form = ref({ id: undefined, channelName: '', pid: '', keySecret: '', type: '', apiUrl: '', enabledBool: true })
const rules = {
  channelName: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入类型', trigger: 'blur' }]
}

const openCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
  form.value = { id: undefined, channelName: '', pid: '', keySecret: '', type: '', apiUrl: '', enabledBool: true }
}
const openEdit = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  form.value = { id: row.id, channelName: row.channelName, pid: row.pid, keySecret: row.keySecret, type: row.type, apiUrl: row.apiUrl, enabledBool: Number(row.isEnable) === 1 }
}
const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { channelName: form.value.channelName, pid: form.value.pid, keySecret: form.value.keySecret, type: form.value.type, apiUrl: form.value.apiUrl, isEnable: form.value.enabledBool ? 1 : 0 }
      if (isEdit.value && form.value.id) {
        await adminPayments.update(form.value.id, payload)
      } else {
        await adminPayments.create(payload)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      load()
    } finally { saving.value = false }
  })
}

const toggleEnable = async (row, val) => {
  await adminPayments.update(row.id, { channelName: row.channelName, pid: row.pid, keySecret: row.keySecret, type: row.type, apiUrl: row.apiUrl, isEnable: val ? 1 : 0 })
  ElMessage.success('状态已更新')
  load()
}

const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该渠道吗？', '提示', { type: 'warning' })
  await adminPayments.remove(row.id)
  ElMessage.success('删除成功')
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
.pager { margin-top: auto; display: flex; justify-content: center; padding: 16px 0; }
@media (max-width: 768px) {
  .pager { padding-bottom: 68px; }
  .pager :deep(.el-pagination) { width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
}
</style>


