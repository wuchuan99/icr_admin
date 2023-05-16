<template>
  <div class="app-container">
    <div class="step step1">></div>
    <div class="step step2">></div>
    <el-tabs
      v-model="step"
      class="exam-target-edit-tab"
    >
      <el-tab-pane label="基本信息" name="baseinfo" :disabled="disabledTab" />
      <el-tab-pane label="题目设置" name="settings" :disabled="disabledTab" />
      <el-tab-pane label="参与人员" name="participants" :disabled="disabledTab" />
    </el-tabs>
    <div v-show="step === 'baseinfo'" class="exam-edit baseinfo-edit">
      <base-info
        ref="baseinfo"
        :exam-data="examData"
        @submitBaseinfo="submitBaseinfo"
      />
    </div>
    <div v-if="step === 'settings'" class="exam-edit">
      <settings
        ref="settings"
        @submitQuestionInfo="submitQuestionInfo"
      />
    </div>
    <div v-if="step === 'participants'" class="exam-edit">
      <participants
        ref="participants"
        @submitUserInfo="submitUserInfo"
      />
    </div>
  </div>
</template>

<script>
import BaseInfo from './baseinfo'
import settings from './settings'
import participants from './participants'
import { examRetrieve, examAdd, examUpdate, examAccess } from '@/api/exam'
import { isEqual, cloneDeep } from 'lodash-es'
export default {
  components: {
    BaseInfo,
    settings,
    participants
  },
  provide() {
    return {
      getExamId: () => {
        return this.examID
      },
      getAccess: () => {
        return this.accessFlag
      }
    }
  },
  props: {},
  data() {
    return {
      new: '1',
      examID: '',
      step: 'baseinfo',
      examData: {
        id: '',
        name: '',
        start_time: '',
        end_time: '',
        total_time: '',
        attend_limit: '',
        hand_limit: '',
        answer_disorder: false,
        result_display: 'after_read',
        description: ''
      },
      cache: {
        name: '',
        start_time: '',
        end_time: '',
        total_time: '',
        attend_limit: '',
        hand_limit: '',
        answer_disorder: false,
        result_display: '',
        description: ''
      },
      accessFlag: false
    }
  },
  computed: {
    disabledTab() {
      return this.new === '1' || !this.examID
    }
  },
  created() {
    this.new = this.$route.query.new || ''
    this.step = this.$route.query.step || 'baseinfo'
    this.examID = this.$route.params.id * 1 || ''
    this.examID && this.getAccessFlag()
    this.examID && this.getDetail()
  },
  mounted() {},
  methods: {
    submitBaseinfo() {
      this.submit().then((res) => {
        if (res.status === 0) {
          if (!this.examID) {
            this.examID = res?.data.id
            this.examData.id = res?.data.id
            this.step = 'settings'
          } else {
            this.cache = cloneDeep(this.examData)
            this.step = 'settings'
          }
        }
      })
    },
    submitQuestionInfo() {
      this.step = 'participants'
    },
    submitUserInfo() {
      this.$router.push('/teach-activity/exam')
    },
    submit() {
      return this.examID ? this.update() : this.create()
    },
    create() {
      this.changeTime(this.examData)
      return examAdd({
        data: this.examData
      })
    },
    update() {
      if (isEqual(this.cache, this.examData)) {
        return Promise.resolve({ status: 0 })
      }
      this.changeTime(this.examData)
      return examUpdate({
        data: this.examData
      })
    },
    getDetail() {
      return examRetrieve({ exam_id: this.examID }).then((res) => {
        const data = res?.data.data
        data.answer_disorder = JSON.parse(data.answer_disorder.toLowerCase())
        this.examData = data
        this.cache = cloneDeep(this.examData)
      })
    },
    getAccessFlag() {
      examAccess({
        data: { exam_id: this.examID, type: 'update' }
      }).then(({ data }) => {
        this.accessFlag = !data.access
      })
    },
    changeTime(data) {
      data.start_time = `${data.start_time}:00`.slice(0, 19)
      data.end_time = `${data.end_time}:00`.slice(0, 19)
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 0;
  height: 100%;
  position: relative;
}
.step {
  position: absolute;
  &.step1 {
    top: 12px;
    left: 70px;
  }
  &.step2 {
    top: 12px;
    left: 165px;
  }
}
::v-deep {
 .exam-target-edit-tab {
    .el-tabs__header {
      margin: 0;
    }
    .el-tabs__item.is-active.is-disabled {
      color: #00AD84;
    }
  }
}
.exam-edit {
  box-sizing: border-box;
  height: calc(100% - 40px);
  padding-top: 16px;
  &.baseinfo-edit {
    overflow-y: auto;
  }
}
</style>
