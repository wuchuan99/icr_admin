<template>
  <AsideTabs class="monitor-tabs" :class="{scrollPage: activeIndex === 1}" tab-position="left" header-title="考生(完成题数)" @tab-click="handleClick">
    <el-tab-pane v-for="item in userList" :key="item.id" :class="activeIndex === 2 ? 'fullStyle' : ''" :label="`${ item.real_name }(${ item.done_number })`">
      <AsideTabs v-if="userId === item.account_id && attendStatue" @tab-click="insideClick">
        <el-tab-pane label="考试记录">
          <ExamRecord v-if="activeIndex === 0" :user-id="userId" />
        </el-tab-pane>
        <el-tab-pane label="查看试卷">
          <ExamPaper v-if="activeIndex === 1" :user-id="userId" />
        </el-tab-pane>
        <!-- <el-tab-pane label="屏幕监控">
          <ExamMonitor v-if="activeIndex === 2" :user-id="userId" style="height: 100%" />
        </el-tab-pane> -->
        <el-button v-if="activeIndex === 1" slot="header-suffix" type="text" class="download-paper" @click="downloadPaper">下载试卷</el-button>
      </AsideTabs>
      <div v-else>该考生未参加考试</div>
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import ExamRecord from './exam-record.vue'
import ExamPaper from './exam-paper.vue'
import ExamMonitor from './exam-monitor.vue'
import { markPaperUserList, examPaperExport } from '@/api/exam'
export default {
  components: {
    AsideTabs,
    ExamRecord,
    ExamPaper,
    // eslint-disable-next-line vue/no-unused-components
    ExamMonitor
  },
  data() {
    return {
      userList: [],
      userId: 0,
      activeName: 0,
      activeIndex: 0,
      // 该生是否参加考试
      attendStatue: true,
      loadingInstance: null
    }
  },
  inject: ['examId'],
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
          search_info: { exam_id: this.examId, category: 'student', type: 'all' }
        })
          .then((res) => {
            if (res.data) {
              this.userList = res.data.data
              this.userId = this.userList[0].account_id
              this.attendStatue = this.userList[0].attend
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
      if (this.userId !== this.userList[tab.index].account_id) {
        this.userId = this.userList[tab.index].account_id
        this.attendStatue = this.userList[tab.index].attend
        this.activeIndex = 0
      }
    },
    insideClick(tab) {
      this.activeIndex = Number(tab.index)
    },
    downloadPaper() {
      examPaperExport({
        search_info: { exam_id: this.examId, name: 'user_paper', user_id: this.userId }
      }).then(res => {
        const title = res.headers['content-disposition'].split(';')[1].split('=')[1].split('"')[1]
        const filename = this.decodeUnicode(title)
        const bb = new Blob([res.data], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(bb)
        a.click()
      })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
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
      overflow-y:auto;
    }
    .fullStyle.el-tab-pane {
      height: 100%;
      & > .aside-tabs {
        height: 100%;
        & > .el-tabs__content {
          height: calc(100% - 55px);
          & > .el-tab-pane:nth-child(3) {
            height: 100%;
          }
        }
      }
    }
  }
}
::v-deep {
  .el-tabs__header.is-left {
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
.scrollPage {
  ::v-deep {
  // 添加滚动条样式
    >.el-tabs__content {
      @import '@/styles/themes/black/customScroll.scss';
    }
  }
}
</style>
