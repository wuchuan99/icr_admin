<template>
  <el-dialog
    :custom-class="customClass"
    :append-to-body="appendToBody"
    :title="title"
    :visible.sync="show"
    width="500px"
    class="delete-dialog"
    :before-close="close"
  >
    <i class="iconfont icon-jingshi" />
    <div>
      <p style="margin: 0;margin-bottom: 20px;" v-html="desc" />
    </div>
    <div class="actions">
      <el-button type="danger" @click="confirm">确认</el-button>
      <el-button @click="close">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'IcrConfirmDelete',
  props: {
    title: String,
    desc: String,
    showInput: {
      type: Boolean,
      default: false
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false,
      model: '',
      confirmCb: () => {}
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.model = ''
      }
    }
  },
  methods: {
    prompt() {
      this.show = true
      return new Promise((resolve, reject) => {
        this.$off('confirm')
        this.$off('close')
        this.$on('confirm', () => {
          resolve()
          this.show = false
        })
        this.$on('close', () => {
          reject()
          this.show = false
        })
      })
    },
    confirm() {
      this.$emit('confirm')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.actions {
  margin-top: 20px;
  text-align: left;
}
</style>
