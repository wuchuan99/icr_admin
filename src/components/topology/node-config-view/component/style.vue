<template>
  <div class="Style">
    <icr-form
      ref="form"
      label-width="80px"
      class="form"
      :display-actions="false"
    >
      <el-form-item label="元件位置">
        <el-row>
          <el-col :span="12" class="insert-unit">
            <el-input
              v-model.number="formData.location.x"
              maxlength="4"
            />
            <span class="unit">X</span>
          </el-col>
          <el-col :span="12" class="insert-unit">
            <el-input
              v-model.number="formData.location.y"
              maxlength="4"
            />
            <span class="unit">Y</span>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="元件大小">
        <el-row>
          <el-col :span="12" class="insert-unit">
            <el-input
              v-model.number="formData.size.width"
              maxlength="4"
            />
            <span class="unit">W</span>
          </el-col>
          <el-col :span="12" class="insert-unit">
            <el-input
              v-model.number="formData.size.height"
              maxlength="4"
            />
            <span class="unit">H</span>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-if="['baseRect', 'baseTextBlock'].includes(deviceType)" label="圆角半径">
        <el-row>
          <el-col :span="12" class="insert-unit">
            <el-input
              v-model.number="formData.r"
              maxlength="2"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-row v-if="deviceType === 'baseTextBlock'">
        <el-form-item label="文本字体">
          <el-select v-model="formData.fontFamily" placeholder="请选择">
            <el-option label="MicrosoftYaHei" value="MicrosoftYaHei" />
            <el-option label="宋体" value="宋体" />
            <el-option label="黑体" value="黑体" />
          </el-select>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-select v-model="formData.fontSize" placeholder="请选择">
            <el-option :label="12" :value="12" />
            <el-option :label="13" :value="13" />
            <el-option :label="14" :value="14" />
            <el-option :label="15" :value="15" />
          </el-select>
        </el-form-item>
        <el-form-item label="字体颜色">
          <el-color-picker v-model="formData.textColor" popper-class="noClear" :predefine="predefineColors" />
        </el-form-item>
        <el-form-item label="字体样式">
          <span style="color: #fff;margin: 0 10px">normal</span>
          <span style="color: #fff;margin: 0 10px">italic</span>
          <span style="color: #fff;margin: 0 10px">bold</span>
          <span style="color: #fff;margin: 0 10px">underline</span>
        </el-form-item>
        <el-form-item label="对齐方式">
          <span style="color: #fff;margin: 0 10px">left</span>
          <span style="color: #fff;margin: 0 10px">center</span>
          <span style="color: #fff;margin: 0 10px">right</span>
        </el-form-item>
        <el-form-item label="段落对齐">
          <span style="color: #fff;margin: 0 10px">top</span>
          <span style="color: #fff;margin: 0 10px">center</span>
          <span style="color: #fff;margin: 0 10px">bottom</span>
        </el-form-item>
      </el-row>
      <el-row v-if="['baseRect', 'baseTextBlock'].includes(deviceType)">
        <el-form-item label="边框颜色">
          <el-color-picker v-model="formData.stroke" popper-class="noClear" :predefine="predefineColors" />
        </el-form-item>
        <el-form-item label="边框样式">
          <el-select v-model="formData.strokeDasharray" placeholder="请选择线条样式">
            <el-option label="__________________" :value="0" />
            <el-option label="------------------" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="边框粗细">
          <el-input v-model.number="formData.strokeWidth" />
        </el-form-item>
      </el-row>
      <el-form-item v-if="!['baseRect', 'baseTextBlock'].includes(deviceType)" label="元件颜色">
        <el-color-picker v-model="formData.color" popper-class="noClear" :predefine="predefineColors" />
      </el-form-item>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
export default {
  name: 'Style',
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
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%)'
      ]
    }
  },
  created() {

  },
  mounted() {

  },
  methods: {
    setData(data) {
      this.form = data
    }
  }
}
</script>
<style lang="scss" scoped>
  .Style {
    .form {
      padding: 0 !important;
    }
    .line {
      border-bottom: 1px solid #ccc;
      padding: 10px;
    }
    .title {
      text-align: center;
    }
    .node-name {
      color: #ccc;
      margin-bottom: 10px;
    }
    .insert-unit {
      position: relative;
      padding-right: 18px;
      .unit {
        position: absolute;
        right: 28px;
        top: 50%;
        transform: translateY(-50%);
        color: #fff;
      }
    }
    .block {
      display: block;
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
