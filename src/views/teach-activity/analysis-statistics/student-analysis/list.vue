<template>
  <div>
    <AsideTabs v-model="activeIndex" @tab-click="handleClick">
      <el-tab-pane v-for="item in leftOption" :key="item.value" :label="item.label" :name="item.value">
        <record-list v-if="activeIndex === item.value" :active-index="activeIndex" />
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import recordList from './table.vue'
import AsideTabs from '@/views/common/aside-tabs.vue'
export default {
  components: {
    AsideTabs,
    recordList
  },
  data() {
    return {
      leftOption: [
        {
          label: '全部数据',
          value: '0'
        },
        {
          label: '组织数据',
          value: '1'
        }
      ],
      activeIndex: '0'
    }
  },
  mounted() {},
  methods: {
    handleClick(tab) {
      this.activeIndex = tab.index.toString()
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep{
  .el-table__row td:last-child .el-button:last-child {
    color: #33bd9d;
  }
}
</style>
