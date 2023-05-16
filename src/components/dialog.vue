<template>
  <el-dialog class="icr-dialog" v-bind="_option" v-on="_option">
    <slot />
    <div slot="footer" class="footer">
      <el-button type="primary" @click="confirm">{{ confirmBtnTxt }}</el-button>
      <el-button @click="close">{{ cancelBtnTxt }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'IcrDialog',
  props: {
    cancelBtnTxt: {
      type: String,
      default: '取消'
    },
    confirmBtnTxt: {
      type: String,
      default: '确定'
    }
  },
  data() {
    return {
      defaultOption: {
        visible: false
      },
      defaultCancelBtnTxt: '取消',
      defaultConfirmBtnTxt: '确认'
    }
  },
  computed: {
    _option() {
      return Object.assign({}, this.defaultOption, this.$attrs, this.$listeners)
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    close() {
      if (this.cancelBtnTxt === this.defaultCancelBtnTxt) {
        this.$emit('update:visible', false)
      } else {
        this.$emit('cancel')
      }
    }
  }
}
</script>
