<template>
  <div>
    <icr-form
      ref="form"
      :model="drillData"
      class="question-form"
      :rules="formRules"
      :display-actions="false"
      :disabled="disabled"
      @confirm="submit"
    >
      <el-form-item label="演练名称" prop="name">
        <el-input
          v-model="drillData.name"
        />
      </el-form-item>
      <el-form-item label="演练范围" prop="scope">
        <el-radio-group
          v-model="drillData.scope"
          :disabled="!!drillData.id"
          @change="scopeChange"
        >
          <el-radio :label="0">私有</el-radio>
          <el-radio :label="1">公开</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="drillData.scope === 0" label="演练时间" required>
        <div class="picktime">
          <el-form-item prop="start_time">
            <el-date-picker
              v-model="drillData.start_time"
              type="datetime"
              placeholder="选择日期"
              value-format="yyyy-MM-dd HH:mm"
              format="yyyy-MM-dd HH:mm"
            />
          </el-form-item>
        </div>
        <div class="line">-</div>
        <div class="picktime">
          <el-form-item prop="end_time">
            <el-date-picker
              v-model="drillData.end_time"
              type="datetime"
              placeholder="选择日期"
              value-format="yyyy-MM-dd HH:mm"
              format="yyyy-MM-dd HH:mm"
            />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="演练方式" prop="mode">
        <el-select
          v-model="drillData.mode"
          placeholder="请选择演练方式"
          :disabled="!!drillData.id"
          :class="{readOnly: drillData.scope === 1}"
        >
          <el-option
            v-for="item in drillModeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="drillData.scope === 0" label="是否录屏" prop="record">
        <el-radio-group v-model="drillData.record">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="演练简介" prop="desc">
        <el-input
          v-model="drillData.desc"
          type="textarea"
          :autosize="{ minRows: 4 }"
        />
      </el-form-item>
    </icr-form>
    <template>
      <div class="submit-btn" style="padding-left: 80px">
        <el-button :disabled="disabled" type="primary" @click="submitBaseinfo">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </template>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import { dirllModes } from '@/const/resource'
import { mapToSelectionOptions } from '@/utils/'
import { required } from '@/utils/validate-helper'

export default {
  components: {
    IcrForm
  },
  props: {
    drillData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const validateStartTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择开始时间'))
      } else {
        if (this.drillData.end_time) {
          if (new Date(value).getTime() >= new Date(this.drillData.end_time).getTime()) {
            callback(new Error('结束时间必须大于开始时间'))
          } else {
            callback()
            this.$refs.form.$refs.inner_form.clearValidate(['end_time'])
          }
        } else {
          callback()
        }
      }
    }
    const validateEndTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择结束时间'))
      } else {
        if (this.drillData.start_time) {
          if (new Date(this.drillData.start_time).getTime() >= new Date(value).getTime()) {
            callback(new Error('结束时间必须大于开始时间'))
          } else {
            callback()
            this.$refs.form.$refs.inner_form.clearValidate(['start_time'])
          }
        } else {
          callback()
        }
      }
    }
    return {
      formRules: {
        name: required('演练名称'),
        scope: required('演练范围'),
        start_time: [
          {
            required: true,
            validator: validateStartTime,
            trigger: 'change'
          }
        ],
        end_time: [
          {
            required: true,
            validator: validateEndTime,
            trigger: 'change'
          }
        ],
        mode: required('演练方式'),
        record: required('是否录屏')
      },
      drillModeOptions: mapToSelectionOptions(dirllModes)
    }
  },
  computed: {
    disabled() {
      return [1, 2].includes(this.drillData.status) || this.drillData.enable_status === 1
    }
  },
  watch: {
    'drillData.scope': function(val) {
      this.drillModeOptions = mapToSelectionOptions(dirllModes)
      if (val === 1) {
        this.drillModeOptions.splice(1, 2)
        this.drillData.mode = this.drillModeOptions[0].value
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    scopeChange() {
      this.drillData.start_time = ''
      this.drillData.end_time = ''
      this.drillData.record = 0
      this.$nextTick(() => {
        this.$refs.form.$refs.inner_form.clearValidate(['start_time', 'end_time', 'record'])
      })
    },
    submitBaseinfo() {
      this.$refs.form.confirm()
    },
    submit() {
      this.$emit('submitBaseinfo')
    },
    goBack() {
      this.$router.push('/drill-manage/drill')
    }
  }
}
</script>

<style scoped lang="scss">
.question-form {
  padding-top: 14px;
}
.picktime {
  display: inline-block;
}
.line {
  display: inline-block;
  text-align: center;
  margin: 0 10px;
}
</style>
