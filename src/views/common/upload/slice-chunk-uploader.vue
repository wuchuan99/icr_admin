<template>
  <div>
    <slot>
      <el-button class="trigger">选择文件</el-button>
    </slot>
    <ul class="el-upload-list">
      <FileItem v-for="file in files" :key="file.uniqueIdentifier" :file="file" />
    </ul>
  </div>
</template>

<script>
import Flow from '@flowjs/flow.js'
import { mapGetters } from 'vuex'
import { precheckUpload, commitUpload } from '@/api/resource.js'
import Emitter from 'element-ui/src/mixins/emitter'
import {
  removeToken
} from '@/utils/auth'
import { BasePath } from '@/router'

const defaultOption = {
  target: '/api/common/file/sliceupload',
  query: (file, chunk) => {
    return {
      file_uuid: file.uniqueIdentifier,
      slice_index: chunk.offset + 1,
      flag: 'file'
    }
  },
  headers: {
    Authorization: ''
  },
  testChunks: false,
  simultaneousUploads: 1,
  singleFile: true,
  allowDuplicateUploads: true,
  chunkSize: 20 * 1024 * 1024,
  fileParameterName: '_upload_files'
}

export default {
  components: {
    FileItem: {
      props: {
        file: Object
      },
      created() {
        this.$set(this.file, 'status', this.file.status || 'ready')
      },
      watch: {
        file: {
          handler(file) {
            let status = ''
            if (file.isUploading && file.isUploading()) {
              status = 'uploading'
            } else if (file.isComplete && file.isComplete()) {
              status = file.status || 'success'
            } else {
              status = 'fail'
            }
            this.$set(file, 'status', status)
          },
          deep: !!1
        }
      },
      render() {
        return (
          <li
            class={ 'el-upload-list__item is-' + this.file.status }
          >
            <a class='el-upload-list__item-name'>
              <i class='el-icon-document' />{ this.file.name }
            </a>
            <div style='position: absolute;right: 30px; top: 0;'>{ this.file.status === 'checking' && <span>文件校验中<i class='el-icon-loading' /></span> }</div>
            <label class='el-upload-list__item-status-label'>
              <i class='el-icon-upload-success el-icon-circle-check' />
            </label>
            <i class='el-icon-close' on-click={ () => { this.$parent.remove(this.file) } } />
            { this.file.status === 'uploading' && <el-progress
              type='line'
              stroke-width={ 2 }
              percentage={ this.$parent.parsePercentage(this.file.progress() * 100) }
            /> }
          </li>
        )
      }
    }
  },
  mixins: [Emitter],
  props: {
    value: {
      type: [String, Object, Array],
      default: () => []
    }
  },
  data() {
    return {
      defaultOption,
      data: {
        type: 'env'
      },
      flow: {
        files: []
      },
      files: []
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  watch: {
    value: function(val) {
      if (!val) {
        this.files = []
      } else if (this.value && typeof this.value === 'string') {
        this.files = [{ name: this.value.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1'), url: this.value, status: 'success' }]
      }

      this.dispatch('ElFormItem', 'el.form.change', val)
    },
    'flow.files': function(val) {
      this.files = val
    }
  },
  mounted() {
    this.init()
    // init value after dom changed
    this.$nextTick(() => {
      if (this.value && typeof this.value === 'string') {
        this.files = [{ name: this.value.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1'), url: this.value, status: 'success' }]
      }
    })

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
        this.flow.cancel()
      })
    }
  },
  methods: {
    init() {
      this.flow = new Flow({
        ...this.defaultOption,
        ...this.$attrs,
        ...{
          headers: {
            Authorization: this.token
          }
        }
      })
      const triggerEl = this.$el.querySelector('.trigger')
      this.flow.assignBrowse(triggerEl)
      this.flow.assignDrop(triggerEl)

      // events
      this.flow.on('fileAdded', this.fileAdded)
      this.flow.on('fileSuccess', this.fileSuccess)
      this.flow.on('fileError', (file, message) => {
        this.$message({
          message: '上传失败',
          type: 'error'
        })
        this.remove(file)
      })
    },
    remove(file) {
      this.files.splice(this.files.indexOf(file), 1)
      if (this.flow?.opts?.singleFile) {
        const file = this.files.length ? this.file[0] : ''
        this.$emit('input', file)
      }
    },
    precheck(file) {
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
    fileAdded(file, event) {
      if (file && file.size === 0) {
        this.$message({
          message: '非法文件, 不能上传空文件',
          type: 'error'
        })
        return false
      }

      this.precheck(file)
        .then(() => {
          file.status = 'ready'
          file.percentage = 0
          this.flow.upload()
        })
    },
    fileSuccess(file, message) {
      file.status = 'checking'
      commitUpload({
        file_name: file.name,
        file_type: this.$attrs.data?.file_type || this.data.file_type,
        file_uuid: file.uniqueIdentifier,
        slice_num: file.chunks?.length
      }).then(res => {
        const AuthInvalidStatusCodes = [-30007, -30008, -30009, -60001]
        if (AuthInvalidStatusCodes.indexOf(res.status) >= 0 &&
        // not not rejump
        location.pathname !== '/login'
        ) {
          removeToken()
          location.href = `${BasePath}login`
          return
        }

        file.status = 'success'
        const { data } = res
        file.url = data.file_relative_url
        this.$emit('input', file)
      }).catch(() => {
        this.remove(file)
      })
    },
    parsePercentage(val) {
      return parseInt(val, 10)
    }
  }
}
</script>
