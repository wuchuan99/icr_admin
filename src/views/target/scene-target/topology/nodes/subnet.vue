<template>
  <div>
    <i class="iconfont icon-luyouqi" style="font-size: 50px;" />
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import { baseMixin } from './base'

// business logic data
const SubnetData = {
}

const Subnet = {
  name: 'Subnet',
  mixins: [baseMixin],
  data() {
    return {
      data: Object(SubnetData)
    }
  },
  methods: {
    click() {
      const { getNode, getGraph } = this._provided
      const node = getNode()
      const graph = getGraph()
      console.log(node, node.findView(graph))
    },
    // for render setting component
    settingComponent() {
      // TODO
      return (
        <div>
          Subnet setting
        </div>
      )
    }
  }
}

export function createSubnet() {
  return { shape: 'vue-shape', component: 'Subnet', data: Object(Subnet) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('Subnet', Subnet, true)

export default Subnet
</script>
