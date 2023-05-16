<template>
  <div class="graph_node rectBlock">
    <div v-if="!isInGraph" style="height: 100%">
      <i class="iconfont icon-juxing" :style="data.styleObject" />
      <div v-if="!dragging" class="graph_node_label">矩形</div>
    </div>
    <div v-else :style="`width: 100%; height: 100%; border: 2px solid ${data.styleObject.color};`" />
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeStyle from '../components/base-node-style.vue'
import { baseMixin } from './base'
import { SettingComponentRender } from './base'
import { cloneDeep, debounce } from 'lodash-es'
import {
  scenetargetRectangleAdd,
  scenetargetRectangleUpdate,
  scenetargetRectangleDelete
} from '@/api/scene'
// business logic data
const RectBlockData = {
  id: '',
  attrs: {
    name: '矩形'
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const RectBlock = {
  name: 'RectBlock',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(RectBlockData),
      zIndex: -10
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  mounted() {
    this.node.removePorts(this.node.getPorts())
  },
  methods: {
    onAdded(sceneId, node) {
      console.log('新增数据')
      scenetargetRectangleAdd({
        data: {
          scene_id: sceneId,
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
        scenetargetRectangleUpdate({
          data: {
            id: this.data.id,
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    onRemoved() {
      return scenetargetRectangleDelete({
        data: {
          type: 1,
          id: this.data.id
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

export function createRectBlock() {
  return { shape: 'vue-shape', component: 'RectBlock', data: cloneDeep(RectBlockData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('RectBlock', RectBlock, true)

export default RectBlock
</script>
