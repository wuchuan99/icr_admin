<template>
  <div>
    <el-form ref="ruleForm" :label-position="labelPosition" :model="ruleForm" :rules="rules" label-width="80px">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="ruleForm.username" autocomplete="off" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵 称" prop="name">
            <el-input v-model="ruleForm.name" autocomplete="off" placeholder="请输入昵称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密 码" prop="password">
            <el-input v-model="ruleForm.password" type="password" autocomplete="new-password" placeholder="请输入密码" @focus="foceOnce()" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码" prop="confirm_password">
            <el-input v-model="ruleForm.confirm_password" type="password" autocomplete="off" placeholder="请确认密码" @focus="foce()" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角 色" prop="role_id">
            <el-select v-model="ruleForm.role_id" class="fillcell" placeholder="请选择角色" style="width:100%">
              <el-option v-for="item in orderTypeList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="组 织" prop="org_id">
            <el-select v-model="ruleForm.org_id" class="fillcell" placeholder="请选择组织" style="width:100%">
              <el-option v-for="item in orgTypeList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="ruleForm.phone" autocomplete="off" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮 箱" prop="email">
            <el-input v-model="ruleForm.email" autocomplete="off" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证" prop="card">
            <el-input v-model="ruleForm.card" autocomplete="off" placeholder="请输入身份证" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过期时间" prop="expiration_time">
            <el-date-picker v-model="ruleForm.expiration_time" type="date" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <div class="actions">
            <el-button @click="cancel">取消</el-button>
            <el-button v-if="title=='add'" type="primary" @click="confirm('ruleForm')">确认</el-button>
            <el-button v-if="title=='edit'" type="primary" @click="update('ruleForm')">确认</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { getrole, getorg, addauter, updatelist } from '@/api/account'
import md5 from 'blueimp-md5'
export default {
  name: 'AccountForm',
  props: {
    ruleForm: Object,
    title: String
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.confirm_password !== '') {
          this.$refs.ruleForm.validateField('confirm_password')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value != this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        if (!/^1[3456789]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      }
    }
    return {
      labelPosition: 'left',
      orderTypeList: [],
      orgTypeList: [],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在100个字符以内', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在100个字符以内', trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur', required: true }
        ],
        confirm_password: [
          { validator: validatePass2, trigger: 'blur', required: true }
        ],
        role_id: [
          { required: true, message: '请选择角色', trigger: 'blur' }
        ],
        address_name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        phone: [{ validator: validatePhone, trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
        //  card:[{ type: 'number', message: '格式不正确',min:18,max:18,trigger: ['blur', 'change']}]
      }
    }
  },
  created() {
    this.getRole()
  },
  methods: {
    getRole() {
      getrole().then(res => {
        this.orderTypeList = res.data.data
      })
      getorg().then(item => {
        this.orgTypeList = item.data.data
      })
    },
    cancel() {
      this.$emit('cancel')
    },
    foceOnce() {
      console.log(this.ruleForm.password == this.ruleForm.confirm_password)
      this.ruleForm.password = ''
      this.$set(this.ruleForm, 'confirm_password', '')
    },
    foce() {
      this.$set(this.ruleForm, 'confirm_password', '')
    },
    confirm(ruleForm) {
      const obj = {}
      obj.data = this.ruleForm
      obj.data.password = md5(obj.data.password)
      obj.data.confirm_password = md5(obj.data.confirm_password)
      this.$refs[ruleForm].validate((valid) => {
        if (valid) {
          addauter(obj).then(res => {
            console.log(res)
            this.$emit('sure')
            this.cancel()
            this.ruleForm = {}
          })
        } else {
          return false
        }
      })
    },
    update(ruleForm) {
      const obj = {}
      obj.data = this.ruleForm
      this.$refs[ruleForm].validate((valid) => {
        if (valid) {
          updatelist(obj).then(res => {
            this.$emit('sure')
            this.cancel()
            this.ruleForm = {}
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style scoped>
    .cancel{
        width: 240px;
        margin: auto;
    }
</style>
