<template>
  <div class="cable-style">
    <icr-form
      ref="form"
      label-width="80px"
      class="form"
      :display-actions="false"
    >
      <el-form-item label="线条样式">
        <el-select v-model="formData.strokeDasharray" placeholder="请选择线条样式">
          <el-option label="__________________" :value="0" />
          <el-option label="------------------" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="线条类型">
        <el-button :class="{active: formData.connector === 'normal'}" round @click="formData.connector = 'normal'">直线</el-button>
        <el-button :class="{active: formData.connector === 'rounded'}" round @click="formData.connector = 'rounded'">折线</el-button>
      </el-form-item>
      <el-form-item label="线条粗细">
        <el-input v-model.number="formData.strokeWidth" />
      </el-form-item>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
export default {
  name: 'CableStyle',
  components: {
    IcrForm
  },
  props: {
    deviceType: {
      type: String,
      default: ''
    },
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    }
  }
}
</script>
<style lang="scss" scoped>
  .cable-style {
    .el-button.active {
      background-color: #00CDA8;
    }
    ::v-deep {
      .el-form {
        .el-input {
          width: 100%;
        }
      }
    }
  }
</style>
