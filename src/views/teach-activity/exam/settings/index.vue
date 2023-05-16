<template>
  <div class="question-container">
    <AsideTabs tab-position="left" :class="{scrollPage: itemActive === -1}" @tab-click="handleClick">
      <el-tab-pane v-for="item in leftOption" :key="item.value" :label="item.label">
        <theory-list v-if="itemActive === item.value" ref="theoryList" :item-active="itemActive" />
      </el-tab-pane>
      <el-tab-pane label="实操题">
        <operation-list v-if="itemActive === 3" ref="operationList" :item-active="itemActive" />
      </el-tab-pane>
      <el-tab-pane label="预览试卷">
        <paper-view v-if="itemActive === -1" ref="paperView" @submitQuestionInfo="submitQuestionInfo" />
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import paperView from './paperview.vue'
import theoryList from './question/theory.vue'
import operationList from './question/operation.vue'
export default {
  components: {
    AsideTabs,
    paperView,
    theoryList,
    operationList
  },
  inject: ['getExamId'],
  data() {
    return {
      leftOption: [
        {
          label: '单选题',
          value: 1
        },
        {
          label: '多选题',
          value: 2
        },
        {
          label: '判断题',
          value: 0
        },
        {
          label: '主观题',
          value: 4
        }
      ],
      itemActive: 1
    }
  },
  methods: {
    handleClick(tab) {
      switch (tab.index) {
        case '0':
          this.itemActive = 1
          break
        case '1':
          this.itemActive = 2
          break
        case '2':
          this.itemActive = 0
          break
        case '3':
          this.itemActive = 4
          break
        case '4':
          this.itemActive = 3
          break
        default:
          this.itemActive = -1
      }
    },
    // 预览试卷
    getPaperview() {
      this.itemActive = -1
    },
    submitQuestionInfo() {
      if (this.itemActive === -1) {
        this.$emit('submitQuestionInfo')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.question-container {
  height: 100%;
  ::v-deep.aside-tabs {
    height: 100%;
    >.el-tabs__content {
      // overflow-y: auto;
      height: 100%;
    }
    .el-tabs__item:last-child {
      margin-top: 40px;
    }
  }
  .scrollPage {
    // 添加滚动条样式
    ::v-deep {
      >.el-tabs__content {
        overflow-y: auto;
        @import '@/styles/themes/black/customScroll.scss';
      }
    }
  }
}
</style>
