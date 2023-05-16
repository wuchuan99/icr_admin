<template>
  <div class="app-main">
    <div class="app-container">
      <el-form
        ref="form"
        :model="model"
        :rules="formRules"
        label-width="110px"
      >
        <el-form-item label="申请文件" prop="licenseFile">
          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="licenseFileChange"
          >
            <el-button>选择申请文件</el-button>
          </el-upload>
          <div v-if="model.licenseFile" style="line-height: 24px;">
            {{ model.licenseFile.name }}
          </div>
        </el-form-item>
        <el-form-item label="系统版本">
          {{ model.product_version }}
        </el-form-item>
        <el-form-item label="cpuID">
          {{ model.cpu_id }}
        </el-form-item>
        <el-form-item label="硬盘ID">
          {{ model.disc_id }}
        </el-form-item>
        <el-form-item label="内存大小" prop="max_memory">
          <el-input-number v-model="model.max_memory" :min="16" :max="1024 * 128" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customer_name">
          <el-input v-model="model.customer_name" />
        </el-form-item>
        <el-form-item label="授权模块" prop="modules">
          <el-checkbox-group v-model="model.modules">
            <el-checkbox v-for="(module, index) in modules" :key="index" :label="module.display_name" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="授权人数" prop="user_limit">
          <div>
            <el-radio v-model="authUserLimit" :label="1">
              设定人数 <el-input-number v-if="authUserLimit === 1" v-model="model.user_limit" :min="1" />
            </el-radio>
          </div>
          <el-radio v-model="authUserLimit" :label="-1">不限制</el-radio>
        </el-form-item>
        <el-form-item label="vCPU数量" prop="vCpu_count">
          <el-input-number v-model="model.vCpu_count" :min="1" :max="512" />
        </el-form-item>
        <el-form-item label="授权开始时间" prop="auth_start">
          <el-date-picker
            v-model="model.auth_start"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="授权时长" prop="authorized_time">
          <el-select v-model="model.authorized_time">
            <el-option
              v-for="item in authTimeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-left: 100px;">
        <el-button type="primary" @click="applyLicense">生成授权文件</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { readLicense, obtainmodule, applyLicense } from '@/api/license'
import { cloneDeep } from 'lodash-es'
import { required } from '@/utils/validate-helper'
export default {
  data() {
    return {
      authUserLimit: 1,
      modules: [],
      model: {
        licenseFile: null,
        product_name: '',
        product_version: '',
        customer_name: '',
        license_serial_num: '',
        auth_start: '',
        authorized_time: '',
        user_limit: 1,
        maker: '',
        mac: '',
        vCpu_count: '',
        cpu_id: '',
        disc_id: '',
        max_memory: '',
        modules: []
      },
      authTimeOptions: [
        { label: '3个月', value: 30 * 3 },
        { label: '6个月', value: 30 * 6 },
        { label: '1年', value: 30 * 12 * 1 },
        { label: '2年', value: 30 * 12 * 2 },
        { label: '3年', value: 30 * 12 * 3 },
        { label: '5年', value: 30 * 12 * 5 },
        { label: '永久', value: 30 * 12 * 1000 }
      ],
      formRules: {
        licenseFile: [required('申请文件')],
        max_memory: [required('内存大小')],
        customer_name: [required('客户名称')],
        modules: [required('授权模块')],
        user_limit: [required('授权人数')],
        vCpu_count: [required('vCPU数量')],
        auth_start: [required('授权开始时间')],
        authorized_time: [required('授权时长')]
      }
    }
  },
  created() {
    this.obtainmodule()
  },
  methods: {
    obtainmodule() {
      obtainmodule().then(res => {
        if (res.status === 0) {
          this.modules = res.data.modules
        }
      })
    },
    licenseFileChange(file, fileList) {
      this.model.licenseFile = file
      this.$refs.form.validateField('licenseFile')

      const formdata = new FormData()
      formdata.append('flag', 'admin')
      formdata.append('files', file.raw)
      readLicense(formdata).then(res => {
        if (res.status === 0) {
          const data = res.data
          this.model.product_version = data.context?.version
          this.model.license_serial_num = data.context.serial_number
          this.model.vCpu_count = parseInt(data.context.vCpu_count) || 1
          this.model.max_memory = parseInt(data.context.max_memory) || 1
        }
      })
    },
    getPostModel() {
      const model = cloneDeep(this.model)
      model.payload = {
        modules: this.modules.map(module => {
          module.is_allow = model.modules.indexOf(module.display_name) >= 0
          return module
        }),
        vCpu_count: model.vCpu_count,
        max_memory: model.max_memory,
        cpu_id: model.cpu_id,
        disc_id: model.disc_id
      }
      return model
    },
    applyLicense() {
      this.$refs.form.validate((ok) => {
        if (!ok) return
        applyLicense(this.getPostModel()).then(res => {
          console.log(res.headers['content-disposition'])
          const filename = res.headers['content-disposition'].split(';')[1].split('=')[1]
          // const filename = this.decodeUnicode(title)
          const bb = new Blob([res.data], { type: 'application/octet-stream' })
          const a = document.createElement('a')
          a.download = filename
          a.href = window.URL.createObjectURL(bb)
          a.click()
        })
      })
    }
  }
}
</script>
