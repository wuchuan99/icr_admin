<template>
  <AsideTabs class="monitor-tabs" tab-position="left" header-title="选手（队伍）列表" @tab-click="handleClick">
    <el-tab-pane
      v-for="item in userList"
      :key="item.id"
      :label="`${ item.name }(已提交${ item.count }项任务)`"
    >
      <AsideTabs
        v-if="userId === item.id"
        :class="{fullStyle: activeIndex === 1}"
        @tab-click="insideClick"
      >
        <el-tab-pane label="演练记录">
          <DrillRecord v-if="activeIndex === 0" :user-id="userId" />
        </el-tab-pane>
        <el-tab-pane v-if="scope === 0" label="屏幕监控">
          <DrillMonitor v-if="activeIndex === 1" :user-id="userId" style="height: 100%" />
        </el-tab-pane>
      </AsideTabs>
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import DrillRecord from './drill-record.vue'
import DrillMonitor from './drill-monitor.vue'
import { drillTaskLogCount } from '@/api/drill'
export default {
  components: {
    AsideTabs,
    DrillRecord,
    DrillMonitor
  },
  inject: ['drillId', 'scope', 'record'],
  data() {
    return {
      userList: [],
      userId: 0,
      activeName: 0,
      activeIndex: 0
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      if (!this.drillId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        drillTaskLogCount({ drill_id: this.drillId })
          .then((res) => {
            if (res.data) {
              this.userList = res?.data?.data || []
              if (this.userList.length) {
                this.userId = this.userList[0].id || ''
              }
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    },
    handleClick(tab) {
      this.userId = this.userList[tab.index].id
      this.activeIndex = 0
    },
    insideClick(tab) {
      this.activeIndex = Number(tab.index)
    }
  }
}
</script>

<style lang="scss" scoped>
.download-paper {
  position: absolute;
  right: 0;
  top: 0;
}
.monitor-tabs {
  ::v-deep {
    & > .el-tabs__header.is-left {
      display: flex;
      flex-direction: column;
    }
    & > .el-tabs__content {
      height: 100%;
      >.el-tab-pane {
        height: 100%;
        overflow-y:auto;
        .fullStyle.aside-tabs {
          height: 100%;
          & > .el-tabs__content {
            height: calc(100% - 55px);
            & > .el-tab-pane:nth-child(2) {
              height: 100%;
            }
          }
        }
      }
    }
  }
  ::v-deep {
    .el-tabs__content {
      overflow-y: auto;
      height: 100%;
    }
    .el-tabs__nav-scroll {
      overflow: auto;
      @import '@/styles/themes/black/customScroll.scss';
    }
    .el-tabs__nav-prev {
      display: none;
    }
    .el-tabs__nav-next {
      display: none;
    }
    .el-tabs__nav-wrap.is-scrollable.is-left {
      padding: 0;
    }
  }
}
</style>
