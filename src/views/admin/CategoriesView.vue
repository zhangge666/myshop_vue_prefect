<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">
          分类管理
          <el-button size="small" type="primary" link @click="treeDialogVisible = true" style="margin-left:8px;">
            显示元素树
          </el-button>
        </div>
        <div class="actions">
          <el-button type="primary" @click="openCreate">新增分类</el-button>
        </div>
      </div>

      <el-table :data="categories" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="parentId" label="父级ID" width="100" />
        <el-table-column prop="sortNum" label="排序" width="80" />
        <el-table-column label="操作" width="200">
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="父级ID">
          <div style="display:flex; align-items:center; gap:8px;">
            <el-input-number v-model="form.parentId" :min="0" />
            <el-popover
              placement="bottom-start"
              width="320"
              trigger="click"
              v-model:visible="parentTreeVisible"
            >
              <template #reference>
                <el-button size="small">选择</el-button>
              </template>
              <el-tree
                :data="treeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                default-expand-all
                :indent="28"
                :highlight-current="true"
                :expand-on-click-node="false"
                @node-click="onPickParent"
              >
                <template #default="{ data }">
                  <span>{{ data.name }} (ID: {{ data.id }})</span>
                </template>
              </el-tree>
            </el-popover>
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortNum" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类元素树 -->
    <el-dialog v-model="treeDialogVisible" title="分类元素树" width="560px">
      <el-tree
        :data="treeData"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        default-expand-all
        :indent="28"
        :expand-on-click-node="false"
        :highlight-current="true"
      >
        <template #default="{ data }">
          <span>{{ data.name }} (ID: {{ data.id }})</span>
        </template>
      </el-tree>
      <template #footer>
        <el-button @click="treeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminCategories } from '@/api/admin'
import { categoryApi } from '@/api/index'

const categories = ref([])
const showTree = ref(true)
const page = ref(1)
const size = ref(10)
const total = ref(0)

const load = async () => {
  const data = await adminCategories.list({ page: Number(page.value), size: Number(size.value) })
  categories.value = data.records || data || []
  total.value = Number(data.total) || categories.value.length
}

onMounted(load)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const saving = ref(false)
const form = ref({ id: null, name: '', parentId: 0, sortNum: 0 })
const rules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

// 直接使用后端返回的树数据
const treeData = ref([])
const loadTree = async () => {
  const tree = await categoryApi.getCategories()
  treeData.value = Array.isArray(tree) ? tree : (tree?.records || [])
}

onMounted(loadTree)

const treeDialogVisible = ref(false)
const parentTreeVisible = ref(false)

const onPickParent = (node) => {
  // 编辑时不允许将父级选为自身
  if (isEdit.value && Number(node.id) === Number(form.value.id)) {
    ElMessage.warning('不能选择自身作为父级')
    return
  }
  form.value.parentId = Number(node.id)
  parentTreeVisible.value = false
}

const onInlineNodeClick = (node) => {
  // 点击树结点时联动高亮/筛选，可按需扩展。
}

const openCreate = () => {
  isEdit.value = false
  form.value = { id: null, name: '', parentId: 0, sortNum: 0 }
  dialogVisible.value = true
}
const openEdit = (row) => {
  isEdit.value = true
  form.value = { id: row.id, name: row.name, parentId: row.parentId || 0, sortNum: row.sortNum || 0 }
  dialogVisible.value = true
}
const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await adminCategories.update(form.value.id, { name: form.value.name, parentId: form.value.parentId, sortNum: form.value.sortNum })
      } else {
        await adminCategories.create({ name: form.value.name, parentId: form.value.parentId, sortNum: form.value.sortNum })
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      load()
    } finally {
      saving.value = false
    }
  })
}
const remove = async (row) => {
  await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' })
  await adminCategories.remove(row.id)
  ElMessage.success('删除成功')
  load()
}

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
.panel { background: #ffffff; border: 1px solid #ebeef5; color: #303133; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.actions { display: flex; gap: 8px; }
.title { font-weight: 600; }

.content-wrap {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  min-height: 420px;
}
.tree-panel { border: 1px solid #ebeef5; border-radius: 6px; padding: 8px; background: #fff; }
.list-wrap { display: flex; flex-direction: column; }

.pager { margin-top: auto; display: flex; justify-content: center; padding: 16px 0; }
@media (max-width: 768px) {
  .pager { padding-bottom: 68px; }
  .pager :deep(.el-pagination) { width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
}
</style>


