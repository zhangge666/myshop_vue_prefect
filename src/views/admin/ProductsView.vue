<template>
  <div>
    <el-card shadow="never" class="panel">
      <div class="panel-header">
        <div class="title">商品管理</div>
        <div>
          <el-button type="primary" @click="openCreate">新增商品</el-button>
        </div>
      </div>
      <el-table :data="products" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">¥{{ Number(row.price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'">{{ Number(row.status) === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑商品 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="680px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="分类ID" prop="categoryId">
          <div style="display:flex; align-items:center; gap:8px;">
            <el-input-number v-model="form.categoryId" :min="0" />
            <el-popover
              placement="bottom-start"
              width="360"
              trigger="click"
              v-model:visible="categoryTreeVisible"
            >
              <template #reference>
                <el-button size="small">选择</el-button>
              </template>
              <div style="max-height:360px; overflow:auto;">
                <el-tree
                  :data="categoryTree"
                  :props="{ label: 'name', children: 'children' }"
                  node-key="id"
                  default-expand-all
                  :indent="28"
                  :expand-on-click-node="false"
                  @node-click="onPickCategory"
                >
                  <template #default="{ data }">
                    <span>{{ data.name }} (ID: {{ data.id }})</span>
                  </template>
                </el-tree>
              </div>
            </el-popover>
            <el-button size="small" link type="primary" @click="treeDialogVisible = true">显示元素树</el-button>
          </div>
        </el-form-item>
        <el-form-item label="商品名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.subtitle" />
        </el-form-item>
        <el-form-item label="封面图">
          <div class="cover-uploader">
            <el-image v-if="form.coverImage" 
            :src="getImageUrl(form.coverImage)" 
            fit="contain" class="cover-preview"

            />
            
            <el-upload
              class="upload-btn"
              :show-file-list="false"
              :http-request="handleCoverUpload"
              :before-upload="beforeCoverUpload"
              accept="image/*"
            >
              <el-button :loading="uploadLoading">上传图片</el-button>
            </el-upload>
            <el-input v-model="form.coverImage" placeholder="或粘贴图片URL" style="max-width: 340px;" />
          </div>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="成本价">
          <el-input-number v-model="form.costPrice" :min="0" :step="0.01" :precision="2" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="form.stock" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每人限购">
              <el-input-number v-model="form.limitPerUser" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="自动发货">
          <el-switch v-model="autoDeliveryBool" />
        </el-form-item>
        <el-form-item label="发货方式">
          <el-input v-model="form.deliveryMethod" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="以逗号分隔" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="下架" :value="0" />
            <el-option label="上架" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.description" :rows="4" />
        </el-form-item>
        <el-form-item label="卡密内容">
          <div class="code-input-wrap">
            <div class="code-count" v-if="codesCount > 0">共 {{ codesCount }} 条</div>
            <el-input type="textarea" v-model="form.cardContent" :rows="6" placeholder="在此粘贴卡密内容（纯文本，一行一条）" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类元素树（只读预览） -->
    <el-dialog v-model="treeDialogVisible" title="分类元素树" width="560px">
      <div style="max-height:520px; overflow:auto;">
        <el-tree
          :data="categoryTree"
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
      </div>
      <template #footer>
        <el-button @click="treeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminProducts, adminCards } from '@/api/admin'
import { categoryApi } from '@/api/index'
import { getImageUrl } from '@/utils/image'
import api from '@/api/index'

const products = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const load = async () => {
  const data = await adminProducts.list({ page: Number(page.value), size: Number(size.value) })
  products.value = data.records || data || []
  total.value = Number(data.total) || products.value.length
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

// 新增/编辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const saving = ref(false)
const form = ref({
  id: null,
  categoryId: 0,
  name: '',
  subtitle: '',
  coverImage: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  limitPerUser: 0,
  autoDelivery: 0,
  deliveryMethod: '',
  tags: '',
  status: 1,
  description: '',
  cardContent: ''
})
const codesCount = computed(() => {
  if (!form.value.cardContent) return 0
  return form.value.cardContent.split(/\r?\n/).filter(l => l.trim() !== '').length
})
const autoDeliveryBool = ref(false)
const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入商品名', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }]
}

const openCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
  autoDeliveryBool.value = false
  form.value = {
    id: null,
    categoryId: 0,
    name: '',
    subtitle: '',
    coverImage: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    limitPerUser: 0,
    autoDelivery: 0,
    deliveryMethod: '',
    tags: '',
    status: 1,
    description: '',
    cardContent: ''
  }
}

const openEdit = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  autoDeliveryBool.value = Number(row.autoDelivery || 0) === 1
  form.value = {
    id: row.id,
    categoryId: row.categoryId || 0,
    name: row.name || '',
    subtitle: row.subtitle || '',
    coverImage: row.coverImage || '',
    price: Number(row.price || 0),
    costPrice: Number(row.costPrice || 0),
    stock: Number(row.stock || 0),
    limitPerUser: Number(row.limitPerUser || 0),
    autoDelivery: Number(row.autoDelivery || 0),
    deliveryMethod: row.deliveryMethod || '',
    tags: row.tags || '',
    status: Number(row.status ?? 1),
    description: row.description || '',
    cardContent: row.cardContent || ''
  }
}

const submit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { ...form.value, autoDelivery: autoDeliveryBool.value ? 1 : 0 }
      if (isEdit.value) {
        await adminProducts.update(form.value.id, payload)
      } else {
        const newProduct = await adminProducts.create(payload)
        // 如果有卡密内容，调用卡密导入接口
        const codes = (form.value.cardContent || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
        if (newProduct?.id && codes.length > 0) {
          await adminCards.create({ productId: newProduct.id, codes })
        }
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
  await ElMessageBox.confirm('确认删除该商品吗？', '提示', { type: 'warning' })
  await adminProducts.remove(row.id)
  ElMessage.success('删除成功')
  load()
}

// 分类树填充
const categoryTreeVisible = ref(false)
const treeDialogVisible = ref(false)
const categoryTree = ref([])
const loadCategoryTree = async () => {
  const tree = await categoryApi.getCategories()
  categoryTree.value = Array.isArray(tree) ? tree : (tree?.records || [])
}
onMounted(loadCategoryTree)

const onPickCategory = (node) => {
  form.value.categoryId = Number(node.id)
  categoryTreeVisible.value = false
}

// 封面上传
const uploadLoading = ref(false)
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('只能上传图片文件')
  if (!isLt5M) ElMessage.error('图片大小不能超过 5MB')
  return isImage && isLt5M
}
const handleCoverUpload = async (options) => {
  try {
    uploadLoading.value = true
    const formData = new FormData()
    formData.append('file', options.file)
    // 你的上传接口：假设是 /api/v1/upload/image（根据你后端实际修改）
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // 假设返回 url
    const url = res?.url || res
    form.value.coverImage = url
    ElMessage.success('上传成功')
    options.onSuccess && options.onSuccess(res)
  } catch (e) {
    ElMessage.error('上传失败')
    options.onError && options.onError(e)
  } finally {
    uploadLoading.value = false
  }
}
</script>

<style scoped>
.cover-preview {
  max-height: 60px;
  max-width: 100%; /* 限制在容器内 */
  width: auto;
}

.cover-preview img {
  max-height: 60px;
  max-width: 100%;
  height: auto;
  width: auto;
  object-fit: contain; /* 保持比例 */
}

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

.code-input-wrap { width: 100%; position: relative; }
.code-count { position: absolute; left: 0; top: -22px; font-size: 12px; color: #909399; }
</style>


