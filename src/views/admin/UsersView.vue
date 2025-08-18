<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">用户管理</div>
        <div class="header-actions">
          <el-input v-model="keyword" placeholder="搜索用户名" clearable style="max-width: 240px;" />
        </div>
      </div>
      <el-table :data="users" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="balance" label="余额">
          <template #default="{ row }">¥{{ Number(row.balance || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="wxid" label="微信ID" />
        <el-table-column prop="contactType" label="联系方式类型" width="120" />
        <el-table-column prop="contact" label="联系方式" />
        <el-table-column prop="enabled" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="toggle(row)">{{ row.enabled ? '禁用' : '启用' }}</el-button>
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

    <!-- 编辑用户信息 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户信息" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="110px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar" placeholder="https://...">
            <template #append>
              <el-avatar :src="editForm.avatar" size="small" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="editForm.balance" :min="0" :step="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="微信ID">
          <el-input v-model="editForm.wxid" />
        </el-form-item>
        <el-form-item label="联系方式类型" prop="contactType">
          <el-input-number v-model="editForm.contactType" :min="0" :max="9" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="editForm.contact" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="editForm.newPassword" type="password" show-password placeholder="可选，填写后后端将加密保存" autocomplete="new-password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminUsers } from '@/api/admin'

const keyword = ref('')
const users = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

const load = async () => {
  const data = await adminUsers.list({ page: Number(page.value), size: Number(size.value) })
  users.value = data.records || data || []
  total.value = Number(data.total) || users.value.length
}

const toggle = async (row) => {
  await adminUsers.toggle(row.id, !row.enabled)
  ElMessage.success('操作成功')
  load()
}

const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该用户吗？', '提示', { type: 'warning' })
  await adminUsers.remove(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)

// 编辑逻辑
const editDialogVisible = ref(false)
const editFormRef = ref()
const saving = ref(false)
const editForm = ref({ id: null, username: '', avatar: '', balance: 0, wxid: '', contactType: 0, contact: '', newPassword: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  contactType: [{ required: true, message: '请输入联系方式类型', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

const openEdit = (row) => {
  editForm.value = {
    id: row.id,
    username: row.username || '',
    avatar: row.avatar || '',
    balance: Number(row.balance || 0),
    wxid: row.wxid || '',
    contactType: row.contactType ?? 0,
    contact: row.contact || '',
    newPassword: ''
  }
  editDialogVisible.value = true
}

const submitEdit = () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = {
        username: editForm.value.username,
        avatar: editForm.value.avatar,
        balance: editForm.value.balance,
        wxid: editForm.value.wxid,
        contactType: editForm.value.contactType,
        contact: editForm.value.contact,
        // 仅当填写时传递 rawPassword（明文），后端负责加密
        ...(editForm.value.newPassword ? { rawPassword: editForm.value.newPassword } : {})
      }
      await adminUsers.update(editForm.value.id, payload)
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      load()
    } finally {
      saving.value = false
    }
  })
}

// pagination handlers ensure numeric types
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
.title { font-weight: 600; }
.pager { margin-top: auto; display: flex; justify-content: center; padding: 16px 0; }
@media (max-width: 768px) {
  .pager { padding-bottom: 68px; }
  .pager :deep(.el-pagination) { width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
}
</style>


