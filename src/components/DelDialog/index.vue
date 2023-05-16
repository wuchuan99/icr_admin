<template>
  <!-- 删除弹出框
visible：显示隐藏
title：标题
closeDialog：关闭
submitDialog：确认
disabled：禁选，默认false,可不传
 -->
  <el-dialog :visible.sync="visible" width="30%" :before-close="closeDialog" :title="title">
    <div class="DelDialog">
      <slot />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="disabled" @click="submitDialog">确认</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </span>
  </el-dialog>
  <!-- 删除弹出框 end-->
</template>
<script>
export default {
  name: 'DelDialog',
  props: {
    title: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    submit: Function,
    close: Function
  },
  data() {
    return {
      visible: false
    }
  },
  created() {},
  methods: {
    submitDialog() {
      this.submit && this.submit()
    },
    closeDialog() {
      this.close && this.close()
    }
  }
}
</script>
<style lang="scss" scoped>
.DelDialog {
  text-align: center;
  h2 {
    color: #666;
    font-size: 24px;
  }
  div {
    span {
      color: #999;
      line-height: 20px;
      font-size: 14px;
      display: inline-block;
      width: 300px;
    }
  }
  .deleteIput {
    margin: 0 auto;
    display: block;
    width: 192px;
    padding: 10px 0 0 0;
  }
}
</style>
