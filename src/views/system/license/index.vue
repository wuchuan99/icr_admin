<template>
  <div class="app-container">
    <div class="license" v-cloak>
      <el-descriptions :column="1" class="license-info">
        <el-descriptions-item label="产品名称"> {{ model.product_name }}  </el-descriptions-item>
        <el-descriptions-item label="版本号"> {{ model.version }}  </el-descriptions-item>
        <el-descriptions-item label="序列号"> {{ model.serial_number }}  </el-descriptions-item>
        <el-descriptions-item label="制造商"> {{ model.maker }}  </el-descriptions-item>
        <el-descriptions-item label="硬件ID"> {{ model.mac }}  </el-descriptions-item>
        <el-descriptions-item label="授权时间"> {{ model.authorized_time }}  </el-descriptions-item>
        <el-descriptions-item label="vCPU授权"> {{ model.vCpu_count }}  </el-descriptions-item>
        <el-descriptions-item label="授权人数"> {{ model.user_limit }}  </el-descriptions-item>
        <el-descriptions-item label="授权模块">
          <div style="display:flex; flex-wrap: wrap;">
            <el-checkbox
              v-for="(module, index) in model.license_modules"
              :key="index"
              :value="module.is_allow"
              style="flex:1 1 33.33%; margin-right: 30px;"
            >
              {{ module.display_name }}
            </el-checkbox>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="更新授权">
          <el-upload
            :disabled="progressFlag"
            drag
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="updatetLicense"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将授权文件拖到此处，或<em>点击上传</em>更新授权</div>
            <el-progress v-if="progressFlag" :percentage="loadProgress" />
          </el-upload>
        </el-descriptions-item>
      </el-descriptions>
      <div class="license-actions">
        <el-button type="primary" @click="downloadTemplate">下载申请文件</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getLicenseInfo, exportLicense, importLicense } from '@/api/license'
import store from '@/store'
export default {
  data() {
    return {
      model: {},
      loadProgress: 0,
      progressFlag: false

    }
  },
  created() {
    this.getLicense()
  },
  beforeDestroy() {
    if (window.progressTimer) {
      clearInterval(window.progressTimer)
    }
  },
  methods: {
    getLicense() {
      getLicenseInfo().then((res) => {
        if (res.status === 0) {
          this.model = res?.data?.system_info
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
      this.loadProgress = 0
      this.progressFlag = true
      window.progressTimer = setInterval(() => {
        this.loadProgress += 10
        if (this.loadProgress >= 100) {
          this.loadProgress = 99
        }
      }, 500)
      importLicense(formdata).then(res => {
        if (window.progressTimer) {
          clearInterval(window.progressTimer)
        }
        if (res.status === 0) {
          this.loadProgress = 100
          this.getLicense()
          store.dispatch('user/getInfo').then(() => {
            this.$message({
              message: '激活成功',
              type: 'success'
            })
          })
        } else {
          this.loadProgress = 0
          this.$message({
            message: res?.msg || '更新失败',
            type: 'error'
          })
        }
      }).finally(() => {
        setTimeout(() => {
          this.progressFlag = false
        }, 1000)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.license {
  display: flex;
}
.license-info {
  max-width: 420px;
}
.license-actions {
  flex: 1;
}

::v-deep {
  .el-upload-dragger {
    background: none;
    width: 320px;
  }
}
</style>
