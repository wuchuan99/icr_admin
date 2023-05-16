<template>
  <el-tabs class="operation-tabs" style="height: 100%" @tab-click="handleClick">
    <el-tab-pane label="竞赛监控" :lazy="true"><CompetitionMonitor v-if="activeIndex === 0" style="height: 100%" :competition="model" /></el-tab-pane>
    <el-tab-pane label="违规事件" :lazy="true"><CompetitionIllegal v-if="activeIndex === 1" style="height: 100%" :publish-status="publishStatus" /></el-tab-pane>
    <el-tab-pane label="人工裁判" :lazy="true"><CompetitionReview v-if="activeIndex === 2" style="height: 100%" :publish-status="publishStatus" /></el-tab-pane>
    <el-tab-pane label="成绩排名" :lazy="true"><CompetitionReport v-if="activeIndex === 3" style="height: 100%" :publish-status="publishStatus" @changeStatus="changeStatus" /></el-tab-pane>
    <el-tab-pane label="竞赛分析" :lazy="true"><CompetitionAnalysis v-if="activeIndex === 4" style="height: 100%" /></el-tab-pane>
  </el-tabs>
</template>

<script>
import { competitionRetrieve, competitionOperationPublishstatus } from '@/api/competition'
import CompetitionAnalysis from './analysis'
import CompetitionIllegal from './illegal'
import CompetitionMonitor from './monitor'
import CompetitionReport from './report'
import CompetitionReview from './review'

export let currentCompetition = null

export function getQuestStateByScore(score) {
  if (typeof score !== 'number') return ''
  return score > 0 ? '正确' : '错误'
}

export function extractFilename(path) {
  return path.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1')
}

export default {
  components: {
    CompetitionAnalysis,
    CompetitionIllegal,
    CompetitionMonitor,
    CompetitionReport,
    CompetitionReview
  },
  provide() {
    return {
      competitionId: Number(this.$route.params?.id),
      getCompetition: () => {
        return this.model
      }
    }
  },
  props: {},
  data() {
    return {
      activeIndex: 0,
      model: {},
      publishStatus: false
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.retrieve()
    this.getOperationPublishstatus()
  },
  methods: {
    handleClick(tab) {
      this.activeIndex = Number(tab.index)
    },
    retrieve() {
      competitionRetrieve({
        data: {
          id: this.$route.params?.id
        }
      }).then(res => {
        if (res.status === 0) {
          this.model = res.data.data
          currentCompetition = res.data.data
        }
      })
    },
    getOperationPublishstatus() {
      competitionOperationPublishstatus({
        data: {
          id: this.$route.params?.id
        }
      }).then(res => {
        if (res.status === 0) {
          this.publishStatus = !!res.data.data.publish_score
        }
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
