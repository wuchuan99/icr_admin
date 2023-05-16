<template>
  <AsideTabs tab-position="left" header-title="考生(完成题数)" @tab-click="handleClick">
    <el-tab-pane v-for="item in userList" :key="item.id" :label="`${ item.name }(${ item.count })`">
      <competitionSubjects v-if="userId === item.id && item.count > 0" :user="item" v-bind="$attrs" />
      <div v-else> {{ item.attend ? `${attendName}完成任何题目` : `${attendName}参加竞赛` }}</div>
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import competitionSubjects from './subject.vue'
import { competitionOperationUserList } from '@/api/competition'
export default {
  components: {
    AsideTabs,
    competitionSubjects
  },
  inject: ['competitionId', 'getCompetition'],
  data() {
    return {
      userList: [],
      userId: 0,
      activeName: 0,
      competition: this.getCompetition()
    }
  },
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
          data: { id: this.competitionId }
        })
          .then((res) => {
            if (res.data) {
              this.userList = res.data.data
              this.userId = this.userList[0].id
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
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-tabs__header.is-left {
    display: flex;
    flex-direction: column;
    min-width: 167px;
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
</style>
