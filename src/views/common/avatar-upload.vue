<template>
  <div class="avatar-upload">
    <el-upload ref="upload" v-bind="option" v-on="option">
      <img v-if="value" :src="urlPrefix + value" alt="">
      <div v-else class="avatar-add-icon"> <i class="el-icon-plus" /> </div>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import emitter from 'element-ui/src/mixins/emitter'

export default {
  mixins: [emitter],
  props: {
    type: {
      type: String,
      default: 'file'
    },
    value: {
      type: String,
      default: () => {}
    }
  },
  data() {
    return {
      urlPrefix: '/resource/',
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
    }
  },
  mounted() {
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
      this.$emit('input', file.url)
      this.dispatch('ElFormItem', 'el.form.change', file.url)
    },
    progress(e) {
      this.percent = parseInt(e.percent)
    },
    exceed() {}
  }
}
</script>

<style lang="scss">
.avatar-upload {
  border: none;
  border-radius: 1px;
  background-color: hsla(0,0%,100%,.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 80px;
  img {
    width: 80px;
    height: 80px;
    border-radius: 1px;
    display: inline-block;
  }
  .avatar-add-icon {
    font-size: 22px;
    color: #fff;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
}
.icr-upload  .normal-file .el-input.is-disabled .el-input__inner{
  cursor: pointer;
}
</style>
