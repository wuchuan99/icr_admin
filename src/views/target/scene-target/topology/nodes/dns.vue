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
const DnsData = {
}

const Dns = {
  name: 'Dns',
  mixins: [baseMixin],
  data() {
    return {
      data: Object(DnsData)
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
          Dns manager
        </div>
      )
    }
  }
}

export function createDns() {
  return { shape: 'vue-shape', component: 'Dns', data: Object(Dns) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('Dns', Dns, true)

export default Dns
</script>
