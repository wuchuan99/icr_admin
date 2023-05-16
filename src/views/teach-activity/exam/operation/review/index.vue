<template>
  <AsideTabs ref="AsideTabs" tab-position="left" header-title="考生(完成题数)" @tab-click="handleClick">
    <div slot="header-btn">
      <div class="header-btn">
        <span
          v-for="item in readOption"
          :key="item.type"
          :class="activeReadType === item.type ? 'active' : ''"
          @click="selectReadType(item.type)"
        >
          {{ item.name }}
        </span>
      </div>
      <div v-if="!userList.length" class="no-data">暂无数据</div>
    </div>
    <el-tab-pane v-for="item in userList" :key="item.id" :label="`${ item.real_name }(${ item.done_number })`">
      <ExamSubjects v-if="userId === item.account_id && attendStatue" :user-id="userId" v-bind="$attrs" />
      <div v-if="userId === item.account_id && !attendStatue">该考生未参加考试</div>
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import ExamSubjects from './subject.vue'
import { markPaperUserList } from '@/api/exam'
export default {
  components: {
    AsideTabs,
    ExamSubjects
  },
  inject: ['examId'],
  data() {
    return {
      userList: [],
      userId: 0,
      activeName: 0,
      attendStatue: true, // 该生是否参加考试
      readOption: [
        { name: '全部', type: 'all' },
        { name: '已阅卷', type: 'read' },
        { name: '未阅卷', type: 'wait' }
      ],
      activeReadType: 'all',
      loadingInstance: null
    }
  },
  mounted() {
    this.getUserList().finally(() => {
      this.loadingInstance && this.loadingInstance.close()
    })
  },
  methods: {
    getUserList() {
      if (!this.examId) return
      return new Promise((resolve, reject) => {
        this.loadingInstance && this.loadingInstance.close()
        this.loadingInstance = this.$loading({
          target: '.el-tabs__header.is-left',
          text: '加载中...',
          background: 'rgb(50 52 54 / 80%)'
        })
        markPaperUserList({
          search_info: { exam_id: this.examId, category: 'student', type: this.activeReadType }
        })
          .then((res) => {
            if (res.data) {
              this.userList = res.data.data
              if (this.userList.length) {
                this.userId = this.userList[0].account_id
                this.attendStatue = this.userList[0].attend
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
      this.userId = this.userList[tab.index].account_id
      this.attendStatue = this.userList[tab.index].attend
    },
    selectReadType(type) {
      this.activeReadType = type
      this.userList = []
      this.getUserList().finally(() => {
        this.loadingInstance && this.loadingInstance.close()
        if (this.userList.length) {
          this.$refs.AsideTabs.currentName = '0'
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.header-btn {
  display: flex;
  justify-content: space-around;
  margin: 4px;
  height: 30px;
  background: rgba(0,0,0, 0.2);
  border-radius: 1px;
  padding: 2px;
  span {
    width: 100%;
    height: 100%;
    border-radius: 1px;
    line-height: 26px;
    text-align: center;
    cursor: pointer;
    &.active {
      background: #00ad84;
    }
  }
}
.no-data {
  margin-top: 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}
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

