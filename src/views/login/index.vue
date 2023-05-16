<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="请输入用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="请输入密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <div class="verify-code">
        <div class="verify-code__input">
          <el-form-item prop="verify_code">
            <el-input
              v-model="loginForm.verify_code"
              placeholder="输入验证码"
              name="verify_code"
              tabindex="2"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
        </div>
        <div class="verify-code__pic">
          <img
            :src="'/api/verify/verify_pic?uuid=' + uuid"
            alt=""
            @click="getVerifyPic"
          >
        </div>
      </div>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.native.prevent="handleLogin"
      >登录</el-button>
    </el-form>
    <el-dialog
      title="产品授权"
      :visible.sync="showLicenseDialog"
    >
      <div>当前产品授权不可用，请下载授权申请文件，联系销售人员获取授权。</div>
      <p>产品名称: 工业安全靶场</p>
      <div style="display: flex; justify-content: space-evenly;">
        <el-button type="primary" @click="downloadTemplate">下载申请文件</el-button>
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="updatetLicense"
        >
          <el-button type="primary">上传授权文件</el-button>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'
import { v4 as uuidv4 } from 'uuid'
import md5 from 'blueimp-md5'
import { getLicenseInfo, exportLicense, importLicense } from '@/api/license'

export default {
  name: 'Login',
  data() {
    // eslint-disable-next-line no-unused-vars
    const validateUsername = (rule, value, callback) => {
      if (!/[_\w\s]+/.test(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    // eslint-disable-next-line no-unused-vars
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能小于6位'))
      } else {
        callback()
      }
    }

    // eslint-disable-next-line no-unused-vars
    const validateVerifyCode = (rule, value, callback) => {
      if (!/[\w\d]{4}/.test(value)) {
        callback(new Error('请输入正确的验证码'))
      } else {
        callback()
      }
    }

    return {
      showLicenseDialog: false,
      uuid: '',
      loginForm: {
        username: '',
        password: '',
        verify_code: ''
      },
      loginRules: {
        // username: [
        //   { required: true, trigger: 'blur', validator: validateUsername }
        // ],
        // password: [
        //   { required: true, trigger: 'blur', validator: validatePassword }
        // ],
        // verify_code: [
        //   { required: true, trigger: 'blur', validator: validateVerifyCode }
        // ]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  computed: {
    postUserInfo() {
      const userInfo = Object.assign({
        uuid: this.uuid
      }, this.loginForm)
      userInfo.password = md5(userInfo.password)
      return {
        'login_info': userInfo
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getVerifyPic()
    this.checkLicense().then(ok => {
      if (!ok) {
        this.showLicenseDialog = true
      }
    })
  },
  methods: {
    getVerifyPic() {
      this.uuid = uuidv4()
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    checkLicense() {
      return getLicenseInfo().then(res => {
        // const authorized_time = res.data?.system_info?.authorized_time
        // if (!authorized_time) {
        //   return false
        // }
        // let [start, end] = authorized_time.split('至')
        // start = start.trim().replaceAll('""', '')
        // end = end.trim().replaceAll('""', '')
        // const startTime = new Date(start).getTime()
        // const endTime = new Date(end).getTime()
        // const now = new Date().getTime()
        // if (!(now >= startTime && now <= endTime)) return false
        // return true

        return !res.data?.system_info?.license_need
      }).catch(err => {
        console.log('license err: ', err)
        return false
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          try {
            this.checkLicense().then(ok => {
              if (ok) {
                this.loading = true
                this.$store
                  .dispatch('user/login', this.postUserInfo)
                  .then(async() => {
                    await this.$store.dispatch('user/getInfo')
                    this.$router.push({ path: this.redirect || '/sys_operations/cluster_manage' })
                    this.loading = false
                  })
                  .catch(() => {
                    this.loading = false
                  })
              } else {
                this.showLicenseDialog = true
              }
            })
          } catch (err) {
            console.error(err)
            this.$message({
              message: '获取license信息失败',
              type: 'error'
            })
            return
          }
        } else {
          return false
        }
      })
    },
    downloadTemplate() {
      exportLicense().then(res => {
        const filename = '申请文件.csv'
        const bb = new Blob([res.data], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(bb)
        a.click()
      })
    },
    updatetLicense(file, fileList) {
      const formdata = new FormData()
      formdata.append('flag', 'admin')
      formdata.append('files', file.raw)
      importLicense(formdata).then(res => {
        if (res.status === 0) {
          this.$message({
            message: '激活成功',
            type: 'success'
          })
          this.showLicenseDialog = false
        } else {
          this.$message({
            message: res?.msg || '更新失败',
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .verify-code {
    display: flex !important;
    .verify-code__input {
      flex: 2;
    }
    .verify-code__pic {
      flex: 1;
      text-align: right;
      img {
        height: 47px;
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 35px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
