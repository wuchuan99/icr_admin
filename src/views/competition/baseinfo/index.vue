<template>
  <div>
    <icr-form
      ref="form"
      :model="data"
      class="question-form"
      :rules="formRules"
      :display-actions="false"
      :disabled="competition.going"
      @confirm="submit"
    >
      <el-form-item label="竞赛名称" prop="name">
        <el-input
          v-model="data.name"
        />
      </el-form-item>
      <el-form-item label="竞赛时间" required>
        <div class="picktime">
          <el-form-item prop="start_time">
            <el-date-picker
              v-model="data.start_time"
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
              v-model="data.end_time"
              type="datetime"
              placeholder="选择日期"
              value-format="yyyy-MM-dd HH:mm"
              format="yyyy-MM-dd HH:mm"
            />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="竞赛模式" prop="competition_model">
        <el-select v-model="data.competition_model" :disabled="!!data.id">
          <el-option v-for="(item, index) in modelOptions" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="参赛方式" prop="competition_type">
        <el-select v-model="data.competition_type" :disabled="!!data.id">
          <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="Number.isInteger(data.competition_model) && [CompetitionTheoryModel, CompetitionHybridModel].indexOf(data.competition_model) >= 0"
        label="答案乱序"
        prop="answer_disorder"
      >
        <el-switch v-model="data.answer_disorder" /> {{ data.answer_disorder ? ' 启用':' 不启用' }}
      </el-form-item>
      <el-form-item
        v-if="Number.isInteger(data.competition_model) && [CompetitionTheoryModel, CompetitionResolveModel, CompetitionHybridModel].indexOf(data.competition_model) < 0"
        label="是否录屏"
        prop="record"
      >
        <el-switch v-model="data.record" /> {{ data.record ? ' 录屏':' 不录屏' }}
      </el-form-item>
      <el-form-item
        v-if="Number.isInteger(data.competition_model) && data.competition_model == CompetitionDrillModel"
        label="初始分数"
        prop="starting_score"
      >
        <el-input-number v-model="data.starting_score" :min="0" :step="1" />
      </el-form-item>
      <el-form-item label="竞赛简介" prop="desc">
        <el-input
          v-model="data.desc"
          type="textarea"
          :autosize="{ minRows: 4 }"
        />
      </el-form-item>
      <template>
        <div class="submit-btn" style="padding-left: 80px">
          <el-button type="primary" :disabled="competition.going" @click="submitBaseinfo">保存</el-button>
          <el-button :disabled="competition.going" @click="goBack">取消</el-button>
        </div>
      </template>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import { mapToSelectionOptions } from '@/utils/'
import { CompetitionModelMap, CompetitionTypeMap } from '../index.vue'
import { required } from '@/utils/validate-helper'
import { CompetitionDrillModel, CompetitionResolveModel, CompetitionHybridModel, CompetitionTheoryModel } from '../index.vue'

export default {
  components: {
    IcrForm
  },
  inject: ['getCompetition'],
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const validateCompetitionTime = (rule, value, callback) => {
      if (new Date(this.data.start_time) >= new Date(this.data.end_time)) {
        callback(new Error('结束时间必须大于开始时间'))
      } else {
        callback()
        this.$refs.form.$refs.inner_form.clearValidate(['end_time'])
        this.$refs.form.$refs.inner_form.clearValidate(['start_time'])
      }
    }

    return {
      CompetitionResolveModel,
      CompetitionDrillModel,
      CompetitionHybridModel,
      CompetitionTheoryModel,
      competition: this.getCompetition(),
      typeOptions: mapToSelectionOptions(CompetitionTypeMap),
      modelOptions: mapToSelectionOptions(CompetitionModelMap),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        competition_model: [required('竞赛模式')],
        competition_type: [required('参赛方式')],
        answer_disorder: [required('答案乱序')],
        start_time: [
          required('开始时间'),
          {
            validator: validateCompetitionTime,
            trigger: ['change', 'blur']
          }
        ],
        end_time: [
          required('结束时间'),
          {
            validator: validateCompetitionTime,
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
  },
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
