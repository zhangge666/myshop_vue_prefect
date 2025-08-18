<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">网站配置</div>
        <div class="actions">
          <el-button type="primary" @click="openCreate">新增配置</el-button>
        </div>
      </div>
      <el-table :data="configs" border stripe :loading="loading">
        <el-table-column prop="configKey" label="Key" min-width="160" />
        <el-table-column prop="configValue" label="Value" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.configValue" placeholder="配置值" @change="inlineSave(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="updateTime" label="更新时间" min-width="160" />
        <el-table-column prop="isDeleted" label="是否启用" width="110">
          <template #default="{ row }">
            <el-switch v-model="row.enabledBool" @change="toggleEnable(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑配置 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Key" prop="configKey">
          <el-input v-model="form.configKey" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Value" prop="configValue">
          <el-input v-model="form.configValue" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabledBool" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminConfigs } from '@/api/admin'

const configs = ref([])
const loading = ref(false)
const load = async () => {
  loading.value = true
  const data = await adminConfigs.list()
  configs.value = (data || []).map(it => ({ ...it, enabledBool: Number(it.isDeleted) === 0 }))
  loading.value = false
}
onMounted(load)

// 行内保存
const inlineSave = async (row) => {
  await adminConfigs.update(row.id, {
    id: row.id,
    configKey: row.configKey,
    configValue: row.configValue,
    isDeleted: row.enabledBool ? 0 : 1
  })
  ElMessage.success('已保存')
  load()
}

const toggleEnable = async (row) => {
  await inlineSave(row)
}

// 新增/编辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const saving = ref(false)
const form = ref({ id: undefined, configKey: '', configValue: '', enabledBool: true })
const rules = {
  configKey: [{ required: true, message: '请输入Key', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入Value', trigger: 'blur' }]
}

const openCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
  form.value = { id: undefined, configKey: '', configValue: '', enabledBool: true }
}
const openEdit = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  form.value = { id: row.id, configKey: row.configKey, configValue: row.configValue, enabledBool: row.enabledBool }
}
const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { id: form.value.id, configKey: form.value.configKey, configValue: form.value.configValue, isDeleted: form.value.enabledBool ? 0 : 1 }
      if (isEdit.value) {
        await adminConfigs.update(form.value.id, payload)
      } else {
        await adminConfigs.create(payload)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      load()
    } finally { saving.value = false }
  })
}

const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该配置吗？', '提示', { type: 'warning' })
  await adminConfigs.remove(row.id)
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
.config-form :deep(.el-form-item__label) {
  color: #606266;
}
.title { font-weight: 600; }
</style>


