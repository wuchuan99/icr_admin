<template>
  <el-upload ref="upload" v-bind="$$attrs" v-on="$$listeners">
    <ul class="el-upload-list">
      <li
        v-for="file in files"
        :key="file.id"
        :class="['el-upload-list__item', 'is-' + file.status]"
        class="el-upload-list__item"
      >
        <a class="el-upload-list__item-name">
          <i class="el-icon-document" />{{ file.name }}
        </a>
        <label class="el-upload-list__item-status-label">
          <i
            :class="{
              'el-icon-upload-success': true,
              'el-icon-circle-check': 'text',
            }"
          />
        </label>
        <i class="el-icon-close" @click="remove(file)" />
        <el-progress
          v-if="file.status === 'uploading'"
          type="line"
          :stroke-width="2"
          :percentage="parsePercentage(file.percentage)"
        />
      </li>
    </ul>
    <template slot="trigger" @submit.native.prevent>
      <el-button>选择文件</el-button>
    </template>
  </el-upload>
</template>

<script>
import { mapGetters } from 'vuex'
import { precheckUpload } from '@/api/resource.js'
import Emitter from 'element-ui/src/mixins/emitter'
import {
  removeToken
} from '@/utils/auth'
import { BasePath } from '@/router'

export default {
  name: 'IcrFileUpload',
  mixins: [Emitter],
  props: {
    singleFile: {
      type: Boolean,
      default: true
    },
    value: {
      type: [String, Object, Array],
      default: () => []
    }
  },
  data() {
    return {
      urlPrefix: 'resource/',
      defaultOption: {
        name: '_upload_files',
        data: {
          file_type: 'pic'
        },
        action: '/api/common/file/upload',
        'show-file-list': false,
        'on-success': this.success,
        'on-exceed': this.exceed,
        'on-progress': this.progress,
        'before-upload': this.precheck
      },
      percent: 0,
      files: []
    }
  },
  computed: {
    ...mapGetters(['token']),
    $$attrs() {
      const option = Object.assign({}, this.defaultOption, this.$attrs, {
        headers: {
          'Authorization': this.token
        }
      })
      option.data.flag = 'file'
      return option
    },
    $$listeners() {
      return this.$listeners
    }
  },
  watch: {
    value: function(val) {
      if (!val) {
        this.files = []
      } else if (this.value && typeof this.value === 'string') {
        this.files = [{ name: this.value.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1'), url: this.value, status: 'success' }]
      }

      this.dispatch('ElFormItem', 'el.form.change', val)
    }
  },
  created() {
    if (this.value && typeof this.value === 'string') {
      this.files = [{ name: this.value.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1'), url: this.value, status: 'success' }]
    }
  },
  mounted() {
    this.$watch(
      () => { return this.$refs.upload.uploadFiles },
      (val) => {
        const files = this.$refs.upload.uploadFiles
        if (this.singleFile) {
          this.files = files?.length ? files.slice(-1) : []
        } else {
          this.files = files
        }
      }
    )

    // watch parent dialog
    let parentDialog
    let cur = this
    do {
      if (cur.$parent?.$vnode?.componentOptions?.tag === 'el-dialog') {
        parentDialog = cur.$parent
        break
      }
      cur = cur.$parent
    } while (cur.$parent)
    if (parentDialog) {
      this.$watch(() => {
        return parentDialog.visible
      }, () => {
        if (!parentDialog.visible) {
          this.clear()
        }
      })
    }
  },
  methods: {
    remove(file) {
      this.files.splice(this.files.indexOf(file), 1)
      if (this.singleFile) {
        const file = this.files.length ? this.file[0] : ''
        this.$emit('input', file)
      }
    },
    clear() {
      this.$refs.upload.clearFiles()
      this.$emit('input', '')
    },
    precheck(file) {
      if (file && file.size === 0) {
        this.$message({
          message: '非法文件, 不能上传空文件',
          type: 'error'
        })
        return false
      }

      return new Promise((resolve, reject) => {
        precheckUpload({
          file_name: file.name,
          file_size: file.size,
          file_type: this.$attrs.data?.file_type || this.data.file_type
        }).then(res => {
          if (res.status === 0) {
            resolve()
          }
        }).catch(() => {
          this.remove(file)
        })
      })
    },
    success(res, file) {
      const { data } = res
      if (res.status !== 0) {
        this.$message({
          message: res.msg,
          type: 'error'
        })

        const AuthInvalidStatusCodes = [-30007, -30008, -30009, -60001]
        if (AuthInvalidStatusCodes.indexOf(res.status) >= 0 &&
        // not not rejump
        location.pathname !== '/login'
        ) {
          removeToken()
          location.href = `${BasePath}login`
          return
        }

        return this.remove(file)
      }
      file.url = data.file_relative_url[0]
      this.$nextTick(() => {
        this.$emit('input', file)
      })
    },
    progress(e) {
      this.percent = parseInt(e.percent)
    },
    parsePercentage(val) {
      return parseInt(val, 10)
    }
  }
}
</script>
