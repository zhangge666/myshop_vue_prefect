<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>账户注册</h2>
        <p>创建新账户，开始使用我们的服务</p>
      </div>
      
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="auth-form"
        label-width="80px"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="contactType">
          <el-select 
            v-model="registerForm.contactType" 
            placeholder="请选择联系方式类型"
            prefix-icon="Phone"
          >
            <el-option label="手机号" value="1"></el-option>
            <el-option label="邮箱" value="2"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item prop="contact">
          <el-input 
            v-model="registerForm.contact" 
            placeholder="请输入联系方式" 
            :prefix-icon="registerForm.contactType === 1 ? 'Phone' : 'Message'"
          ></el-input>
        </el-form-item>
        
        <el-form-item class="form-actions">
          <el-button 
            type="primary" 
            class="w-full" 
            @click="handleRegister"
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        <p>
          已有账户？
          <el-link type="primary" @click="$router.push('/login')">
            立即登录
          </el-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  contactType: null,
  contact: ''
})

const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  contactType: [
    { required: true, message: '请选择联系方式类型', trigger: 'change' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (registerForm.contactType === 1) {
          // 手机号验证
          const phoneReg = /^1[3-9]\d{9}$/
          if (!phoneReg.test(value)) {
            callback(new Error('请输入正确的手机号'))
          } else {
            callback()
          }
        } else if (registerForm.contactType === 2) {
          // 邮箱验证
          const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailReg.test(value)) {
            callback(new Error('请输入正确的邮箱地址'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const handleRegister = async () => {
  // 表单验证
  const valid = await registerFormRef.value.validate()
  if (!valid) return
  
  loading.value = true
  
  try {
    // 准备注册数据
    const userData = {
      username: registerForm.username,
      password: registerForm.password,
      contactType: registerForm.contactType,
      contact: registerForm.contact
    }
    
    const success = await userStore.register(userData)
    if (success) {
      ElMessage.success('注册成功')
      router.push('/')
    } else {
      ElMessage.error('注册失败，请稍后重试')
    }
  } catch (error) {
    console.error('注册失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.auth-header p {
  color: #86909c;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 20px;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: #86909c;
}
</style>
