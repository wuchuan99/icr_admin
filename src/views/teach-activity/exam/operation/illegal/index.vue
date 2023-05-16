<template>
  <AsideTabs tab-position="left" :class="{scrollPage: activeIndex === 1 && currentView === 'comparePaper'}" @tab-click="handleClick">
    <el-tab-pane label="违规处罚">
      <JudgeList v-if="activeIndex === 0" v-bind="$attrs" />
    </el-tab-pane>
    <el-tab-pane label="相似度">
      <component :is="currentView" v-if="activeIndex === 1" :user-id="userId" v-bind="$attrs" @handleChangeView="handleChangeView" @goBack="goBack" />
    </el-tab-pane>
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import JudgeList from './judge.vue'
import SimilarList from './similar.vue'
import comparePaper from './compare.vue'
export default {
  components: {
    AsideTabs,
    JudgeList,
    SimilarList,
    comparePaper
  },
  data() {
    return {
      currentView: 'SimilarList',
      activeIndex: 0,
      userId: {
        user_a_id: 0,
        user_b_id: 0
      }
    }
  },
  methods: {
    handleClick(tab) {
      this.activeIndex = Number(tab.index)
      this.currentView = 'SimilarList'
      this.userId = {
        user_a_id: 0,
        user_b_id: 0
      }
    },
    handleChangeView(obj) {
      this.currentView = 'comparePaper'
      this.userId.user_a_id = obj.user_a_id
      this.userId.user_b_id = obj.user_b_id
    },
    goBack() {
      this.currentView = 'SimilarList'
      this.userId = {
        user_a_id: 0,
        user_b_id: 0
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-tabs__content {
    overflow-y: auto;
    height: 100%;
  }
}
.scrollPage {
  // 添加滚动条样式
  ::v-deep {
    >.el-tabs__content {
      @import '@/styles/themes/black/customScroll.scss';
    }
  }
}
</style>
