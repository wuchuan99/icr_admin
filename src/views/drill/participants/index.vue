<template>
  <div class="participate-container">
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
      :participate-type="componentKey"
      class="participate-warp"
      v-bind="option"
      v-on="option"
    />
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import player from './player/index.vue'
import team from './team/index.vue'
import against from './against/index.vue'

const leftOptionMap = [
  [
    {
      label: '裁判',
      componentName: 'player',
      key: 'referee'
    },
    {
      label: '人员',
      componentName: 'player',
      key: 'player'
    }
  ],
  [
    {
      label: '裁判',
      componentName: 'player',
      key: 'referee'
    },
    {
      label: '队伍',
      componentName: 'team',
      key: 'team'
    }
  ],
  [
    {
      label: '裁判',
      componentName: 'player',
      key: 'referee'
    },
    {
      label: '红蓝对抗',
      componentName: 'against',
      key: 'against'
    }
  ]
]
export default {
  components: {
    AsideTabs,
    player,
    team,
    against
  },
  props: {},
  data() {
    return {
      componentName: '',
      componentKey: ''
    }
  },
  computed: {
    option() {
      return Object.assign({}, this.$attrs, this.$listeners)
    },
    leftOption() {
      return leftOptionMap[this.option['drill-data']['mode']]
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
.participate-container {
  display: flex;
  align-items: center;
  height: 100%;
  .asideTabs {
    height: 100%;
    flex-shrink: 0;
  }
  .participate-warp {
    flex: 1;
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
  }
}
</style>
