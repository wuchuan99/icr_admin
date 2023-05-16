<template>
  <AsideTabs
    v-model="userTabIndex"
    class="monitor-tabs"
    :class="{scrollPage: activeIndex === 1}"
    tab-position="left"
    header-title="考生(完成题数)"
    @tab-click="handleClick"
  >
    <el-tab-pane
      v-for="(item, key) in userList"
      :key="item.id"
      :label="`${ item.name }(${ item.count })`"
      :name="key.toString()"
      :lazy="true"
    >
      <AsideTabs
        v-if="userTabIndex == key && item.count > 0"
        :class="{fullStyle: activeIndex === 2}"
        @tab-click="insideClick"
      >
        <el-tab-pane label="竞赛记录" :lazy="true">
          <CompetitionRecord
            :user="item"
          />
        </el-tab-pane>
        <el-tab-pane label="查看赛题" :lazy="true">
          <CompetitionPaper :user="item" />
        </el-tab-pane>
        <el-tab-pane v-if="Number.isInteger(competition.competition_model) && [CompetitionDrillModel, CompetitionInvasionModel, CompetitionDevOpsModel, CompetitionRealWorldModel].indexOf(competition.competition_model) >= 0" label="屏幕监控" :lazy="true">
          <CompetitionMonitor
            v-if="activeIndex === 2"
            :user="item"
          />
        </el-tab-pane>
        <el-button v-if="activeIndex === 1" slot="header-suffix" type="text" class="download-paper">下载试卷</el-button>
      </AsideTabs>
      <div v-else> {{ item.attend ? `${attendName}完成任何题目` : `${attendName}参加竞赛` }}</div>
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import CompetitionRecord from './competition-record.vue'
import CompetitionPaper from './competition-paper.vue'
import CompetitionMonitor from './competition-monitor.vue'
import { competitionOperationUserList } from '@/api/competition'
import { CompetitionDevOpsModel, CompetitionInvasionModel, CompetitionDrillModel, CompetitionRealWorldModel } from '../../index.vue'
export default {
  components: {
    AsideTabs,
    CompetitionRecord,
    CompetitionPaper,
    CompetitionMonitor
  },
  props: {
    competition: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      CompetitionDevOpsModel,
      CompetitionInvasionModel,
      CompetitionRealWorldModel,
      CompetitionDrillModel,
      userList: [],
      userTabIndex: '0',
      userId: 0,
      activeName: 0,
      activeIndex: 0
    }
  },
  inject: ['competitionId'],
  computed: {
    attendName() {
      return this.competition.competition_type ? '该队伍中没有选手' : '该选手未'
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      if (!this.competitionId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        competitionOperationUserList({
          data: {
            id: this.competitionId
          }
        })
          .then((res) => {
            if (res.data) {
              this.userList = res.data.data
              this.userId = this.userList[0].account_id
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
      this.userId = this.userList[tab.index].account_id
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
    & > .el-tabs__content {
      height: 100%;
      overflow-y:auto;
      & > .el-tab-pane {
        height: 100%;
        // & > .aside-tabs {
        //   height: 100%;
          // & > .el-tabs__content {
          //   height: calc(100% - 55px);
          //   & > .el-tab-pane:nth-child(3) {
          //     height: 100%;
          //   }
          // }
        // }
        & .fullStyle.aside-tabs {
          & > .el-tabs__content {
            overflow: visible;
          }
        }
      }
    }
  }
}
::v-deep {
  .el-tabs__header.is-left {
    display: flex;
    flex-direction: column;
    height: calc(100 - 40px);
  }
  .el-tabs__content {
    overflow-y: auto;
    height: 100%;
  }
  .el-tabs__nav-scroll {
    overflow: auto;
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
.scrollPage {
  ::v-deep {
  // 添加滚动条样式
    >.el-tabs__content {
      @import '@/styles/themes/black/customScroll.scss';
    }
  }
}
</style>
