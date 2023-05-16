<template>
  <div class="graph_node virtualNet">
    <i class="iconfont icon-monihulianwang" :style="data.styleObject" />
    <div v-if="!isInGraph && !dragging" class="graph_node_label">虚拟网络</div>
    <div
      v-if="isInGraph"
      class="node_label"
    >{{ data.attrs.name }}</div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash-es'
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeStyle from '../components/style.vue'
import { baseMixin } from './base'
import { SettingComponentRender } from './base'
import {
  scenetargetSubnetAddvirtualnet,
  scenetargetSubnetUpdatevirtualnet,
  scenetargetSubnetAttachvirtualnet,
  scenetargetSubnetDelete
} from '@/api/scene'
// business logic data
const VirtualNetData = {
  id: '',
  attrs: {
    name: '虚拟网络'
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const VirtualNet = {
  name: 'VirtualNet',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(VirtualNetData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  methods: {
    onAdded(sceneId, node) {
      console.log('新增数据')
      scenetargetSubnetAddvirtualnet({
        data: {
          scene_id: sceneId,
          attrs: this.data.attrs,
          illustration_info: node.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          this.data.id = res?.data?.id || ''
        }
      })
    },
    update() {
      if (this.data.id) {
        console.log('更新数据')
        scenetargetSubnetUpdatevirtualnet({
          data: {
            id: this.data.id,
            attrs: this.data.attrs,
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    setAttach(self, other, op) {
      scenetargetSubnetAttachvirtualnet({
        link: {
          id: self.data.id,
          ele_id: other?.data?.id || '',
          op
        }
      })
    },
    onRemoved() {
      return scenetargetSubnetDelete({
        data: {
          type: 1,
          ids: [this.data.id]
        }
      })
    },
    // for render setting component
    [SettingComponentRender]() {
      // TODO
      const vm = this
      return (
        <el-tabs key={vm.node.id} stretch>
          <el-tab-pane label='样式'>
            <NodeStyle
              node={ this.node }
              config={vm.data.attrs}
              position={ vm.position }
              size={ vm.size }
              style-object={vm.data.styleObject}
              data={vm.data}
            />
          </el-tab-pane>
        </el-tabs>
      )
    }
  }
}

export function createVirtualNet() {
  return { shape: 'vue-shape', component: 'VirtualNet', data: Object(VirtualNetData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('VirtualNet', VirtualNet, true)

export default VirtualNet
</script>
