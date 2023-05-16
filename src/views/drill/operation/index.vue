<template>
  <el-tabs class="operation-tabs" style="height: 100%" @tab-click="handleClick">
    <el-tab-pane label="演练监控">
      <DrillMonitor
        v-if="activeName === 'monitor'"
        style="height: 100%"
      />
    </el-tab-pane>
    <el-tab-pane v-if="scope === 0" label="违规事件">
      <DrillIllegal
        v-if="activeName === 'illegal'"
        style="height: 100%"
        :publish-status="publishStatus"
      />
    </el-tab-pane>
    <el-tab-pane v-if="scope === 0" label="人工裁判">
      <DrillReview
        v-if="activeName === 'review'"
        style="height: 100%"
        :publish-status="publishStatus"
      />
    </el-tab-pane>
    <el-tab-pane label="演练成果">
      <DrillReport
        v-if="activeName === 'report'"
        style="height: 100%"
        :publish-status="publishStatus"
        @publish-status="changeStatus"
      />
    </el-tab-pane>
    <el-tab-pane label="演练分析">
      <DrillAnalysis
        v-if="activeName === 'analysis'"
        style="height: 100%"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import DrillAnalysis from './analysis'
import DrillIllegal from './illegal'
import DrillMonitor from './monitor'
import DrillReport from './report'
import DrillReview from './review'
import { drillFruitRetrieve } from '@/api/drill'
const tabMap = new Map([
  [0, 'monitor'],
  [1, 'illegal'],
  [2, 'review'],
  [3, 'report'],
  [4, 'analysis']
])

const publicTabMap = new Map([
  [0, 'monitor'],
  [1, 'report'],
  [2, 'analysis']
])
export default {
  components: {
    DrillAnalysis,
    DrillIllegal,
    DrillMonitor,
    DrillReport,
    DrillReview
  },
  provide() {
    return {
      drillId: Number(this.$route.params?.id),
      mode: Number(this.$route.query?.mode),
      scope: isNaN(Number(this.$route.query?.scope)) ? 0 : Number(this.$route.query?.scope),
      record: isNaN(Number(this.$route.query?.record)) ? 1 : Number(this.$route.query?.record)
    }
  },
  props: {},
  data() {
    return {
      activeIndex: 0,
      publishStatus: false,
      scope: isNaN(Number(this.$route.query?.scope)) ? 0 : Number(this.$route.query?.scope)
    }
  },
  computed: {
    activeName() {
      const tabListMap = [tabMap, publicTabMap][this.scope]
      return tabListMap.get(this.activeIndex)
    }
  },
  watch: {},
  created() {
    this.initData()
  },
  mounted() {},
  methods: {
    handleClick(tab) {
      this.activeIndex = Number(tab.index)
    },
    initData() {
      drillFruitRetrieve({ drill_id: Number(this.$route.params?.id) }).then((res) => {
        this.publishStatus = res?.data?.data?.publish_score === 1
      })
    },
    changeStatus(status) {
      this.publishStatus = status
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
