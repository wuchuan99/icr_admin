<template>
  <AsideTabs tab-position="left" @tab-click="handleClick">
    <el-tab-pane label="违规处罚">
      <JudgeList v-if="activeIndex === 0" v-bind="$attrs" />
    </el-tab-pane>
    <!-- <el-tab-pane label="相似度">
      <div> 相似度 </div>
      <component :is="currentView" v-if="activeIndex === 1" :user-id="userId" @handleChangeView="handleChangeView" @goBack="goBack" />
    </el-tab-pane> -->
  </AsideTabs>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import JudgeList from './judge.vue'

export default {
  components: {
    AsideTabs,
    JudgeList
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
</style>
