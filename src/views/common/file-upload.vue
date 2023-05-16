<template>
  <div :class="{ single: single }" class="icr-upload">
    <el-upload ref="upload" v-bind="option" v-on="option">
      <div v-if="type === 'img'">
        <div v-if="single" class="single-img">
          <img :src="singleFile.url" alt="">
        </div>
        <div v-else> <i class="el-icon-plus" /> </div>
      </div>
      <div v-else class="normal-file">
        <el-input v-model="filename" disabled placeholder="请选择文件" style="width: 240px;" />
        <el-button type="primary" style="margin-left: 20px">选择文件</el-button>
      </div>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'IcrFileUpload',
  props: {
    single: Boolean,
    type: {
      type: String,
      default: 'file'
    },
    value: {
      type: [String, Object, Array],
      default: () => []
    },
    isShowFileName: {
      type: Boolean,
      default: () => false
    },
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
        'on-progress': this.progress
      },
      percent: 0,
      singleFile: {}
    }
  },
  computed: {
    ...mapGetters(['token']),
    option() {
      const option = Object.assign({}, this.defaultOption, this.$attrs, this.$listeners, {
        headers: {
          'Authorization': this.token
        }
      })
      option.data.flag = 'file'
      return option
    },
    filename() {
      if (typeof this.value === 'string') {
        return this.value
      } else if (this.value?.url) {
        // 虚拟资源页面需要文件名
        if(this.isShowFileName) {
          return this.value.name
        }
        return this.value.url
      }
      return ''
    }
  },
  mounted() {
    this.$watch(
      () => { return this.$refs.upload.uploadFiles },
      (val) => {
        if (this.single) {
          this.singleFile = val[val.length - 1]
        }

        this.$emit('input', val.map(val => val.url))
      }
    )
  },
  methods: {
    success(res, file) {
      const { data } = res
      if (res.status !== 0) {
        this.$message({
          message: res.msg,
          type: 'error'
        })
        return
      }
      file.url = data.file_relative_url[0]
      this.$emit('input', file)
    },
    progress(e) {
      this.percent = parseInt(e.percent)
    },
    exceed() {}
  }
}
</script>

<style lang="scss">
.single {
  .single-img {
    width: 100%;
    height: 100%;
    overflow: hidden;
    img {
      width: 100%;
      border-radius: 6px;
    }
  }

  .el-upload {
    border-style: solid;
  }

  .el-upload-list {
    display: none;
    border-radius: 6px;
  }
}

.icr-upload  .normal-file .el-input.is-disabled .el-input__inner{
  cursor: pointer;
}
</style>
