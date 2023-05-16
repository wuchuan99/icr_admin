<template>
  <div class="settings-container">
    <AsideTabs
      class="asideTabs"
      tab-position="left"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="item in leftOption"
        :key="item.key"
        :label="item.label"
      />
    </AsideTabs>
    <component
      :is="componentName"
      :key="componentKey"
      ref="children"
      :color="componentKey"
      class="settings-warp"
      v-bind="option"
      v-on="option"
    />
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import scene from './scene.vue'
import task from './task.vue'
const leftOptionMap = [
  [
    {
      label: '场景',
      key: -1,
      componentName: 'scene'
    },
    {
      label: '任务',
      key: 0,
      componentName: 'task'
    }
  ],
  [
    {
      label: '场景',
      key: -1,
      componentName: 'scene'
    },
    {
      label: '红方任务',
      key: 0,
      componentName: 'task'
    },
    {
      label: '蓝方任务',
      key: 1,
      componentName: 'task'
    }
  ]
]
export default {
  components: {
    AsideTabs,
    scene,
    task
  },
  data() {
    return {
      activeTab: 'scene',
      componentKey: '',
      componentName: ''
    }
  },
  computed: {
    option() {
      return Object.assign({}, this.$attrs, this.$listeners)
    },
    leftOption() {
      let index = 0
      if (this.option['drill-data']['mode'] === 2) {
        index = 1
      }
      return leftOptionMap[index]
    }
  },
  created() {
    this.handleClick({ index: 0 })
  },
  methods: {
    handleClick(tab) {
      this.componentName = this.leftOption[Number(tab.index)]?.componentName
      this.componentKey = this.leftOption[Number(tab.index)]?.key
    }
  }
}
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  align-items: center;
  height: 100%;
  .asideTabs {
    height: 100%;
    flex-shrink: 0;
  }
  .settings-warp {
    flex: 1;
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
  }
}
</style>
