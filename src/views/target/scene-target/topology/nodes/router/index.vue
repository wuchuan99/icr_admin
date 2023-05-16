<template>
  <div class="graph_node netRouter">
    <i class="iconfont icon-luyouqi" :style="data.styleObject" />
    <div v-if="!isInGraph && !dragging" class="graph_node_label">路由器</div>
    <div
      v-if="isInGraph"
      class="node_label"
    >{{ data.attrs.name }}</div>
    <!-- {{ JSON.stringify($data) }} -->
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeStyle from '../../components/style.vue'
import RouterConfig from './config.vue'
import { baseMixin } from '../base'
import { SettingComponentRender } from '../base'
import { cloneDeep, debounce } from 'lodash-es'
import {
  networkElementRouterAdd,
  networkElementRouterUpdate,
  networkElementRouterDelete
} from '@/api/scene'

// business logic data
const NetRouterData = {
  id: '',
  attrs: {
    name: '路由器',
    inf: [],
    port_mappings: [],
    static_routes: []
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const NetRouter = {
  name: 'NetRouter',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(NetRouterData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  methods: {
    onAdded(sceneId, node) {
      console.log('新增数据')
      networkElementRouterAdd({
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
        networkElementRouterUpdate({
          data: {
            id: this.data.id,
            attrs: this.data.attrs,
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    onRemoved() {
      return networkElementRouterDelete({
        data: {
          type: 1,
          ids: [this.data.id]
        }
      })
    },
    // for render setting component
    [SettingComponentRender]() {
      const vm = this
      // TODO
      return (
        <el-tabs key={vm.node.id} stretch>
          <el-tab-pane label='配置'>
            <RouterConfig data={vm.data}></RouterConfig>
          </el-tab-pane>
          <el-tab-pane label='样式'>
            <NodeStyle
              node={ this.node }
              config={vm.data.attrs}
              position={vm.position}
              size={vm.size}
              style-object={vm.data.styleObject}
              data={vm.data}
            />
          </el-tab-pane>
        </el-tabs>
      )
    }
  }
}

export function createNetRouter() {
  return {
    shape: 'vue-shape',
    component: 'NetRouter',
    data: Object(NetRouterData)
  }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('NetRouter', NetRouter, true)

export default NetRouter
</script>
