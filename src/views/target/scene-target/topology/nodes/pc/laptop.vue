<template>
  <div class="graph_node laptop">
    <i class="iconfont icon-bijiben" :style="data.styleObject" />
    <div v-if="!isInGraph && !dragging" class="graph_node_label">笔记本</div>
    <div
      v-if="isInGraph"
      class="node_label"
    >{{ data.attrs.name }}</div>
    <!-- {{ JSON.stringify($data) }} -->
  </div>
</template>

<script>
import { cloneDeep, debounce, isEqual } from 'lodash-es'
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeConfig from './config'
import NodeSystem from './system'
import NodeStyle from '../../components/style.vue'
import { baseMixin } from '../base'
import { SettingComponentRender } from '../base'
import { genUnicastMac } from '@/utils/index'
import {
  networkElementTerminalAdd,
  networkElementTerminalUpdate,
  networkElementTerminalDelete,
  networkElementTerminalRetrieve
} from '@/api/scene'

// business logic data
const LaptopData = {
  id: '',
  attrs: {
    name: '笔记本',
    ram: 0,
    disk: [],
    vcpus: 0,
    image_info: {
      name: '',
      target_name: '',
      image_id: '',
      target_classify: '',
      classify: 1,
      target_id: ''
    },
    usb: [],
    nics: [],
    system: {
      account_info: [],
      remote: {
        remote_type: 'novnc',
        port: '',
        account: '',
        password: ''
      }
    },
    ip_list: []
  },
  connections: [],
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const Laptop = {
  name: 'Laptop',
  mixins: [baseMixin],
  data() {
    return {
      data: cloneDeep(LaptopData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
  },
  methods: {
    getAttrs() {
      return {
        ...this.data.attrs,
        ram: this.data.attrs.ram || 0,
        vcpus: this.data.attrs.vcpus || 0,
        disk: this.data.attrs.disk.map(item => (item.capacity || 0))
      }
    },
    onAdded(sceneId, node) {
      console.log('新增数据')
      networkElementTerminalAdd({
        data: {
          scene_id: sceneId,
          attrs: this.getAttrs(),
          illustration_info: node.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          // id不存在说明是拖动新增，需要添加默认值。存在说明是复制，不需要默认值
          if (!this.data.id) { // 拖动
            const attrs = res?.data?.data?.attrs || {}
            const disk = res?.data?.data?.attrs?.disk || []
            this.data.attrs = {
              ...this.data.attrs,
              ...attrs,
              disk: disk.map((item) => ({
                name: '硬盘',
                capacity: item
              }))
            }
          } else { // 复制
            this.data.attrs.nics.forEach(item => {
              item.mac = genUnicastMac()
            })
          }
          this.data.id = res?.data?.data?.id || ''
        }
      })
    },
    update() {
      if (this.data.id) {
        console.log('更新数据', this.data.attrs.name)
        networkElementTerminalUpdate({
          data: {
            id: this.data.id,
            attrs: this.getAttrs(),
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    onRemoved() {
      return networkElementTerminalDelete({
        data: {
          type: 1,
          ids: [this.data.id]
        }
      })
    },
    onRetrieved(status, uuid) {
      console.log('获取详情')
      const data = {
        ne_id: this.data.id
      }
      if (status === 2) {
        data.uuid = uuid
      }
      networkElementTerminalRetrieve({ data }).then((res) => {
        if (res.status === 0) {
          const ip_list = res?.data?.data?.attrs?.ip_list || []
          if (!isEqual(this.data.attrs.ip_list, ip_list)) {
            this.data.attrs.ip_list = ip_list
          }
        }
      })
    },
    // for render setting component
    [SettingComponentRender](editor) {
      // TODO
      const vm = this
      const status = editor.curDebuggerStatus
      let index = '0'
      if ([1, 2, 3].includes(status)) index = '1'
      return (
        <el-tabs value={ index } key={vm.node.id} stretch>
          <el-tab-pane label='配置'><NodeConfig data={ vm.data } /></el-tab-pane>
          <el-tab-pane label='系统'><NodeSystem data={ vm.data } /></el-tab-pane>
          <el-tab-pane label='样式'>
            <NodeStyle
              node={ vm.node }
              config={ vm.data.attrs }
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

export function createLaptop() {
  return { shape: 'vue-shape', component: 'laptop', data: Object(LaptopData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('laptop', Laptop, true)

export default Laptop
</script>
