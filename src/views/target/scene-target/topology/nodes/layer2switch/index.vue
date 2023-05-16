<template>
  <div class="graph_node layer2Switch">
    <i class="iconfont icon-ercengjiaohuanji" :style="data.styleObject" />
    <div v-if="!isInGraph && !dragging" class="graph_node_label">二层交换机</div>
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
import NodeConfig from './config.vue'
import { baseMixin } from '../base'
import { SettingComponentRender } from '../base'
import { cloneDeep, debounce } from 'lodash-es'
import {
  networkElementSwitchl2Add,
  networkElementSwitchl2Update,
  networkElementSwitchl2Delete
} from '@/api/scene'
// business logic data
const Layer2SwitchData = {
  id: '', // 节点id
  dev_type: '', // 元件类型:最大长度:255,最小长度:1
  attrs: { // 节点配置
    name: '二层交换机', // 设备名称:最大长度:255,最小长度:1
    port_info: [
      // {
      //   id: '', // 网卡唯一id:最大长度:36,最小长度:4
      //   port_name: '', // 接口名称:最大长度:255,最小长度:1
      //   vni_type: '', // 网卡类型:最大长度:255,最小长度:1- (选参)
      //   port_mode: '', // 接口模式; 可选值：{'trunk': 'trunk', 'access': 'access'}
      //   subnet_id: '', // 子网id - (选参)
      //   attach_dev_info: // 连接的设备信息 - (选参)
      //       { // 连接的设备信息 - (选参)
      //         dev_id: '', // 设备id
      //         dev_eth_id: '' // 网卡id:最大长度:255,最小长度:1- (选参)
      //       }
      // }
    ]
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const Layer2Switch = {
  name: 'Layer2Switch',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(Layer2SwitchData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  methods: {
    onAdded(sceneId, node) {
      console.log('新增数据')
      networkElementSwitchl2Add({
        data: {
          scene_id: sceneId,
          attrs: {
            dev_name: this.data.attrs.name,
            ...this.data.attrs
          },
          illustration_info: node.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          this.data.id = res?.data?.data?.id || ''
          console.log(this.data.id)
        }
      })
    },
    update() {
      if (this.data.id) {
        console.log('更新数据')
        const port_info = cloneDeep(this.data.attrs.port_info)
        const self_eth_id_list = this.data.connections.map(it => it.self_eth_id)
        for (const port of port_info) {
          if (self_eth_id_list.includes(port.id)) {
            const cable = this.data.connections.find(it => it.self_eth_id === port.id)
            if (cable.dev_eth_id) {
              port.attach_dev_info = {
                dev_id: cable.dev_id,
                dev_eth_id: cable.dev_eth_id
              }
            }
          }
        }
        networkElementSwitchl2Update({
          data: {
            id: this.data.id,
            attrs: {
              dev_name: this.data.attrs.name,
              ...this.data.attrs,
              port_info
            },
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    onRemoved() {
      return networkElementSwitchl2Delete({
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
              style-object={vm.data.styleObject}
              data={vm.data}
            />
          </el-tab-pane>
        </el-tabs>
      )
    }
  }
}

export function createLayer2Switch() {
  return { shape: 'vue-shape', component: 'Layer2Switch', data: Object(Layer2SwitchData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('Layer2Switch', Layer2Switch, true)

export default Layer2Switch
</script>
