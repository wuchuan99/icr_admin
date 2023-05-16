<template>
  <el-tabs class="operation-tabs" style="height: 100%" @tab-click="handleClick">
    <el-tab-pane label="考试监控"><ExamMonitor v-if="activeIndex === 0" style="height: 100%" /></el-tab-pane>
    <el-tab-pane label="违规事件"><ExamIllegal v-if="activeIndex === 1" style="height: 100%" :publish-status="publishStatus" /></el-tab-pane>
    <el-tab-pane label="阅卷"><ExamReview v-if="activeIndex === 2" style="height: 100%" :publish-status="publishStatus" /></el-tab-pane>
    <el-tab-pane label="成绩单"><ExamReport v-if="activeIndex === 3" style="height: 100%" :publish-status="publishStatus" @changeStatus="changeStatus" /></el-tab-pane>
    <el-tab-pane label="考试分析"><ExamAnalysis v-if="activeIndex === 4" style="height: 100%" /></el-tab-pane>
  </el-tabs>
</template>

<script>
import ExamAnalysis from './analysis'
import ExamIllegal from './illegal'
import ExamMonitor from './monitor'
import ExamReport from './report'
import ExamReview from './review'
import { examReportPublish } from '@/api/exam'

export default {
  components: {
    ExamAnalysis,
    ExamIllegal,
    ExamMonitor,
    ExamReport,
    ExamReview
  },
  provide() {
    return {
      examId: Number(this.$route.params?.id)
    }
  },
  props: {},
  data() {
    return {
      activeIndex: 0,
      publishStatus: false
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getPublishStatus()
  },
  mounted() {},
  methods: {
    handleClick(tab) {
      this.activeIndex = Number(tab.index)
    },
    getPublishStatus() {
      examReportPublish({
        data: { exam_id: Number(this.$route.params?.id) }
      }).then((res) => {
        this.publishStatus = res.data.publish
      })
    },
    // 成绩单发布
    changeStatus(flag) {
      this.publishStatus = flag
    }
  }
}
</script>

<style scoped lang="scss">
.operation-tabs {
  ::v-deep {
    & > .el-tabs__content {
      height: calc(100% - 55px);
      & > .el-tab-pane {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
