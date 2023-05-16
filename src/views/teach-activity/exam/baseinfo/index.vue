<template>
  <div>
    <icr-form
      ref="form"
      :model="examData"
      class="question-form"
      :rules="formRules"
      :display-actions="false"
      @confirm="submit"
    >
      <el-form-item label="考试名称" prop="name">
        <el-input
          v-model="examData.name"
          :disabled="getAccess()"
        />
      </el-form-item>
      <el-form-item label="考试时间" required>
        <div class="picktime">
          <el-form-item prop="start_time">
            <el-date-picker
              v-model="examData.start_time"
              type="datetime"
              placeholder="选择日期"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              :disabled="getAccess()"
            />
          </el-form-item>
        </div>
        <div class="line">-</div>
        <div class="picktime">
          <el-form-item prop="end_time">
            <el-date-picker
              v-model="examData.end_time"
              type="datetime"
              placeholder="选择日期"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              :disabled="getAccess()"
            />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="限时时间" prop="total_time">
        <el-input-number v-model="examData.total_time" :min="1" :precision="0" :disabled="getAccess()" /><span
          style="margin-left: 10px"
        >分钟</span>
      </el-form-item>
      <el-form-item label="入场限制" prop="attend_limit">
        <el-input-number v-model="examData.attend_limit" :min="0" :precision="0" :disabled="getAccess()" /><span
          style="margin-left: 10px"
        >分钟后不可入场（0表示无限制）</span>
      </el-form-item>
      <el-form-item label="交卷限制" prop="hand_limit">
        <el-input-number v-model="examData.hand_limit" :min="0" :precision="0" :disabled="getAccess()" /><span
          style="margin-left: 10px"
        >分钟后可以交卷（0表示不能提前交卷）</span>
      </el-form-item>
      <el-form-item label="答案乱序" prop="answer_disorder">
        <el-switch v-model="examData.answer_disorder" :disabled="getAccess()" /> {{ examData.answer_disorder ? ' 启用':' 不启用' }}
      </el-form-item>
      <!-- <el-form-item label="考试成绩" prop="result_display">
        <el-radio-group v-model="examData.result_display" :disabled="getAccess()">
          <el-radio label="after_submit">交卷后立即显示成绩</el-radio>
          <el-radio label="after_read">成绩单发布后显示成绩</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="考试简介" prop="description">
        <el-input
          v-model="examData.description"
          type="textarea"
          :disabled="getAccess()"
          :autosize="{ minRows: 4 }"
        />
      </el-form-item>
      <template>
        <div class="submit-btn" style="padding-left: 80px">
          <el-button type="primary" :disabled="getAccess()" @click="submitBaseinfo">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </template>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
export default {
  components: {
    IcrForm
  },
  inject: ['getAccess'],
  props: {
    examData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const validateStartTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择开始时间'))
      } else {
        if (this.examData.end_time) {
          if (new Date(value).getTime() >= new Date(this.examData.end_time).getTime()) {
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
        if (this.examData.start_time) {
          if (new Date(this.examData.start_time).getTime() >= new Date(value).getTime()) {
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
    const validateTotalTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('限时时间不能为空'))
      } else {
        if (this.examData.attend_limit && this.examData.attend_limit <= value) {
          this.$refs.form.$refs.inner_form.clearValidate(['attend_limit'])
        } else {
          this.$refs.form.$refs.inner_form.validateField(['attend_limit'])
        }
        if (this.examData.hand_limit && this.examData.hand_limit <= value) {
          this.$refs.form.$refs.inner_form.clearValidate(['hand_limit'])
        } else {
          this.$refs.form.$refs.inner_form.validateField(['hand_limit'])
        }
        callback()
      }
    }
    const validateAttendLimit = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error('入场限制不能为空'))
      } else {
        if (this.examData.total_time && this.examData.total_time < value) {
          callback(new Error('入场限制时间不可超过考试限时时间'))
        } else {
          callback()
        }
      }
    }
    const validateHandLimit = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error('交卷限制不能为空'))
      } else {
        if (this.examData.total_time && this.examData.total_time < value) {
          callback(new Error('交卷限制时间不可超过考试限时时间'))
        } else {
          callback()
        }
      }
    }
    return {
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
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
        total_time: [
          { required: true, validator: validateTotalTime, trigger: ['change', 'blur'] }
        ],
        attend_limit: [
          { required: true, validator: validateAttendLimit, trigger: ['change', 'blur'] }
        ],
        hand_limit: [
          { required: true, validator: validateHandLimit, trigger: ['change', 'blur'] }
        ],
        answer_disorder: [
          { required: true, message: '选项不能为空', trigger: 'change' }
        ],
        result_display: [{ required: true, message: '选项不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    submitBaseinfo() {
      this.$refs.form.confirm()
    },
    submit() {
      this.$emit('submitBaseinfo')
    },
    goBack() {
      this.$router.go(-1)
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
