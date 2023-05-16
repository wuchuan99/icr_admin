<template>
  <div class="question-container">
    <AsideTabs tab-position="left" @tab-click="handleClick">
      <el-tab-pane v-for="item in leftOption" :key="item.value" :label="item.label">
        <participants-list v-if="itemActive === item.value" ref="participantsList" :item-active="itemActive" />
        <div class="submit-btn">
          <el-button type="primary" :disabled="getAccess()" @click="submitUserInfo">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import participantsList from './participants-list.vue'
import AsideTabs from '@/views/common/aside-tabs.vue'
export default {
  components: {
    AsideTabs,
    participantsList
  },
  props: {},
  inject: ['getExamId', 'getAccess'],
  data() {
    return {
      leftOption: [
        {
          label: '监考老师',
          value: 'teacher'
        },
        {
          label: '学生',
          value: 'student'
        }
      ],
      itemActive: 'teacher'
    }
  },
  methods: {
    handleClick(tab) {
      switch (tab.index) {
        case '0':
          this.itemActive = 'teacher'
          break
        default:
          this.itemActive = 'student'
      }
    },
    submitUserInfo() {
      this.$emit('submitUserInfo')
    },
    goBack() {
      this.$router.go(-1)
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
      height: 100%;
      overflow-y: auto;
    }
  }
}
.submit-btn {
  margin-top: 16px;
}
</style>
