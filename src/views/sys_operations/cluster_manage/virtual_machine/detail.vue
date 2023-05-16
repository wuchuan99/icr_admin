<template>
  <div class="app-container">
    <AsideTabs @tab-click="handleClick">
      <el-tab-pane label="概况">
        <VitureDescription v-if="activeIndex === 0" :viture-id="id" />
      </el-tab-pane>
      <el-tab-pane label="接口">
        <VitureTable v-if="activeIndex === 1" :viture-id="id" type="interface" />
      </el-tab-pane>
      <el-tab-pane label="操作日志">
        <VitureTable v-if="activeIndex === 2" :viture-id="id" type="action" />
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import VitureDescription from './description.vue'
import VitureTable from './table.vue'
export default {
  components: {
    AsideTabs,
    VitureDescription,
    VitureTable
  },
  data() {
    return {
      id: this.$route.params.id,
      leftOption: [
        {
          label: '概况',
          value: 0
        },
        {
          label: '接口',
          value: 1
        },
        {
          label: '操作日志',
          value: 2
        }
      ],
      activeIndex: 0
    }
  },
  mounted() {},
  methods: {
    // tab切换
    handleClick(tab) {
      this.activeIndex = Number(tab.index)
    }
  }
}
</script>

<style scoped lang="scss"></style>
