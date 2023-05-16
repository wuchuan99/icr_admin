<template>
  <div class="graph_node physical">
    <img :src="data.src" :style="{...data.styleObject, width:data.styleObject.fontSize, height: data.styleObject.fontSize}">
    <div v-if="!isInGraph && !dragging" class="graph_node_label">{{ data.attrs.name }}</div>
    <div
      v-if="isInGraph"
      class="node_label"
    >{{ data.attrs.name }}</div>
  </div>
</template>

<script>
import { cloneDeep, debounce, isEqual } from 'lodash-es'
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeStyle from '../../components/style.vue'
import NodeConfig from './config.vue'
import { baseMixin } from '../base'
import { SettingComponentRender } from '../base'
import {
  networkElementPhysicalAdd,
  networkElementPhysicalUpdate,
  networkElementPhysicalRetrieve,
  networkElementPhysicalDelete
} from '@/api/scene'
// business logic data
const PhysicalData = {
  id: '',
  dev_type: '', // 元件类型:最大长度:255,最小长度:1
  attrs: {
    name: '物理资源',
    physical_resource: {
      id: null
    },
    port_info: []
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  src: '',
  relevanceFlag: true
}

const Physical = {
  name: 'Physical',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(PhysicalData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  methods: {
    onAdded(sceneId, node) {
      networkElementPhysicalAdd({
        data: {
          scene_id: sceneId,
          attrs: {
            dev_name: this.data.attrs.name
          },
          illustration_info: node.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          this.data.id = res?.data?.data?.id || ''
        }
      })
    },
    update() {
    // self_id：我的节点id; self_eth_id:我的网络接口id
    // id: 边id
    // dev_id:与我连接的设备节点id; dev_eth_id:连接设备的网络接口id
      if (this.data.id) {
        const port_info = cloneDeep(this.data.attrs.port_info)
        const self_eth_id_list = this.data.connections.map(it => it.self_eth_id) // connections：我与之连接线的信息；找出我已选的网络接口
        for (const port of port_info) {
          if (self_eth_id_list.includes(port.id)) { // 选的网络接口，是否在我网络接口的list中
            const cable = this.data.connections.find(it => it.self_eth_id === port.id) // 是:在连接线的信息中，找出这条被选的网络接口的边的信息
            if (cable.dev_eth_id) { // 如果该线的设备也选择了该设备的网络接口，即存在dev_eth_id
              port.attach_dev_info = { // 得到两端都选择了网络接口的设备，即为完整配置
                dev_id: cable.dev_id, // 连接设备id
                dev_eth_id: cable.dev_eth_id // 连接设备的网络id(设备连接线配置中的接口设置中的下拉框数据)
              }
            }
          }
        }
        networkElementPhysicalUpdate({
          data: {
            id: this.data.id,
            attrs: {
              dev_name: this.data.attrs.name,
              physical_resource: this.data.attrs.physical_resource,
              port_info
            },
            illustration_info: this.node.toJSON()
          }
        }).then(() => {
          this.onRetrieved() // 更新网络适配器list
        })
      }
    },
    onRetrieved() {
      networkElementPhysicalRetrieve({ data: this.data.id }).then(({ data }) => {
        const res = data?.data?.attrs?.physical_resource?.network_interface || []
        const port_info = res.map((i) => { return { id: i.network_interface_id, name: i.value, networkName: i.name } })
        if (!isEqual(this.data.attrs.port_info, port_info)) {
          this.data.attrs.port_info = port_info // 若有更改，更新网络适配器list
        }
      })
    },
    onRemoved() {
      return networkElementPhysicalDelete({
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
          <el-tab-pane label='配置'><NodeConfig formData={vm.data} /></el-tab-pane>
          <el-tab-pane label='样式'>
            <NodeStyle
              node={ this.node }
              config={vm.data.attrs}
              position={ vm.position }
              size={ vm.size }
              data={vm.data}
            />
          </el-tab-pane>
        </el-tabs>
      )
    }
  }
}

export function createPhysical() {
  return { shape: 'vue-shape', component: 'physical', data: Object(PhysicalData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('physical', Physical, true)

export default Physical
</script>
