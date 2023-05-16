<template>
  <AsideTabs class="review-tabs" tab-position="left" header-title="选手（队伍）列表" @tab-click="handleClick">
    <el-tab-pane v-for="item in userList" :key="item.id" :label="`${ item.name }(已提交${ item.count }项任务)`">
      <DrillSubjects
        v-if="userId === item.id"
        :user-id="userId"
        :publish-status="publishStatus"
        :status="status"
      />
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import DrillSubjects from './subject.vue'
import { drillTaskLogCount } from '@/api/drill'
export default {
  components: {
    AsideTabs,
    DrillSubjects
  },
  inject: ['drillId'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userList: [],
      userId: 0,
      status: 0,
      activeName: 0
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
              this.userList = res.data.data || []
              if (this.userList?.length) {
                console.log(this.userList[0])
                this.userId = this.userList[0].id || 0
                this.status = this.userList[0].status || 0
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
      this.userId = this.userList[tab.index].id || 0
      this.status = this.userList[tab.index].status || 0
    }
  }
}
</script>
<style lang="scss" scoped>
.review-tabs {
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
}

</style>

