<template>
  <div class="topology">
    <div ref="stencil" class="stencil" />
    <div ref="container" class="container" />
    <transition name="device-config-fade-transform">
      <div v-if="componentName" class="device-config">
        <component
          :is="componentName"
          :key="componentKey"
          ref="child"
          :node-data="nodeData"
          :graph="graph"
          @rest-style="restStyle"
        />
        <!-- <device-config :key="componentKey" ref="child" :node-data="nodeData" @rest-style="restStyle" /> -->
      </div>
    </transition>
  </div>
</template>

<script>
import { Graph, Addon } from '@antv/x6'
import { graphConfig } from './init/config/graph-config'
import { StencilConfig } from './init/config/stencil-config'
import registerNode from './init/register-node/register-node'
import createNode from './init/create-node/create-node'
import registerEvent from './init/register-event'
import DeviceConfig from './node-config-view/device-config.vue'
import DnsServer from './node-config-view/dns-server.vue'
import SubnetManagement from './node-config-view/subnet-management.vue'
import { debounce, isEqual } from 'lodash-es'
import apiMap from './api-map'
export default {
  name: 'Topology',
  components: {
    DeviceConfig,
    DnsServer,
    SubnetManagement
  },
  props: {
    sceneData: {
      type: Object,
      default: () => {}
    },
    sceneTmpUuid: {
      type: String,
      default: ''
    },
    curDebuggerStatus: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      graph: null,
      stencil: null,
      currentNode: null,
      nodeData: null,
      topologyDeviceData: {},
      renderGraphData: [],
      componentKey: 0,
      componentName: '',
      isUpdate: true,
      oldPosition: {}
    }
  },
  created() {
    console.log(this.sceneData)

    this.renderGraphData = this.sceneData.topologyData
      .filter(item => (item.illustration_info?.data?.id))
      .map(item => item.illustration_info)
  },
  mounted() {
    // 初始化画布
    this.initGraph()

    // 初始化左侧节点
    this.initStencil()

    // 注册事件
    this.initEvent()

    // 注册节点
    registerNode()

    // 创建节点
    createNode(this.graph, this.stencil)

    // 先释放再注册返回HTML元素的函数
    Graph.unregisterHTMLComponent('my-html')
    Graph.registerHTMLComponent('my-html', (node) => {
      // console.log(node.data)
      const wrap = document.createElement('div')
      wrap.style.width = '100%'
      wrap.style.height = '100%'
      wrap.style.display = 'flex'
      wrap.style.justifyContent = 'center'
      wrap.style.alignItems = 'center'
      wrap.id = node.id
      const fontSize = (node.data.configData.style.size.width > node.data.configData.style.size.height ? node.data.configData.style.size.height : node.data.configData.style.size.width) + 'px'
      const iconStyle = `display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;font-size: ${fontSize};color: ${node.data.configData.style.color}`
      wrap.innerHTML = `<i class="iconfont icon-${node.data.icon}" style="${iconStyle}"></i>`
      return wrap
    })

    this.graph.fromJSON(this.renderGraphData)

    // this.graph.centerContent()
  },
  methods: {
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        ...graphConfig,
        connecting: {
          ...graphConfig.connecting,
          createEdge: () => {
            return this.graph.createEdge({ shape: 'cable' })
          }
        }
      })
    },
    initStencil() {
      const _this = this
      this.stencil = new Addon.Stencil({
        target: this.graph,
        ...StencilConfig,
        getDragNode(node) {
          // 这里返回一个新的节点作为拖拽节点
          if (node.data.deviceType === 'baseRect') { // 矩形
            return _this.graph.createNode({
              shape: 'baseRect',
              data: node.data
            })
          } else if (node.data.deviceType === 'baseTextBlock') { // 文本
            return _this.graph.createNode({
              shape: 'baseTextBlock',
              data: node.data
            })
          }
          // 设备节点
          return _this.graph.createNode({
            shape: 'warp-icon',
            html: 'my-html',
            data: node.data
          })
        },
        validateNode(node) {
          const validate = (
            node.data.deviceType === 'virtualNetwork' &&
            _this.graph.toJSON().cells.some((cell) => cell.data.deviceType === 'virtualNetwork')
          )
          if (validate) {
            _this.$message({
              message: ' 一个场景仅允许存在一个虚拟网络',
              type: 'warning'
            })
          }
          return !validate
        }
      })
      this.$refs.stencil.appendChild(this.stencil.container)
      this.addSearchIcon()
      this.addGroupIcon()
    },
    addSearchIcon() {
      // 添加搜索图标
      const inputBox = this.$refs.stencil.querySelector('.x6-widget-stencil-search')
      const i = document.createElement('i')
      i.className = 'sarchIcon iconfont icon-sousuo1'
      inputBox.appendChild(i)
    },
    addGroupIcon() {
      // 添加下拉图标
      const groups = this.$refs.stencil.querySelectorAll('.x6-widget-stencil-group')
      const down = document.createElement('i')
      down.className = 'el-icon-caret-bottom'
      for (const group of groups) {
        group.appendChild(down.cloneNode())
      }
    },
    initEvent() {
      // 节点点击事件
      registerEvent(this.graph, 'node:click', ({ e, node }) => {
        if (e.target.tagName === 'circle') return
        if (this.currentNode && this.currentNode.id === node.id) return
        this.nodeClick(node)
      })

      // 节点选中事件
      registerEvent(this.graph, 'node:selected', ({ node }) => {
        console.log(this.graph.getSelectedCells())
        if (this.graph.getSelectedCells().length > 1) { // 选中多个节点
          this.closeDeviceConfig()
        }
      })

      // 节点嵌入事件
      registerEvent(this.graph, 'node:added', ({ node }) => {
        // console.log(this.graph.toJSON())
        this.getNodeStyle(node) // 同步节点data数据)
        this.create(node)
      })

      // 节点删除
      registerEvent(this.graph, 'cell:removed', ({ cell }) => {
        if (apiMap[cell.data.deviceType] && cell.data.id) {
          this.delElementInfo(apiMap[cell.data.deviceType].del, cell)
        }
      })

      // 边嵌入事件
      registerEvent(this.graph, 'edge:connected', ({ isNew, edge }) => {
        console.log(edge.getSourceNode().data, edge.getTargetNode().data)
        const source = edge.getSourceNode()
        const target = edge.getTargetNode()
        if (isNew) {
          console.log('边连接了')
          this.isUpdate = false
          source.data.cableList.push({
            cableId: edge.id,
            devId: target.data.id,
            selfEthId: edge.data.configData.config.fromId || '',
            devEthId: edge.data.configData.config.toId || ''
          })
          target.data.cableList.push({
            cableId: edge.id,
            devId: source.data.id,
            selfEthId: edge.data.configData.config.toId || '',
            devEthId: edge.data.configData.config.fromId || ''
          })
          console.log(source.data, target.data)
          edge.setData({
            source: {
              nodeId: edge.getSource().cell,
              id: edge.getSourceNode().data.id,
              deviceType: edge.getSourceNode().data.deviceType
            },
            target: {
              nodeId: edge.getTarget().cell,
              id: edge.getTargetNode().data.id,
              deviceType: edge.getTargetNode().data.deviceType
            },
            configData: {
              config: {
                from: edge.getSourceNode().data.id,
                to: edge.getTargetNode().data.id
              }
            }
          })
          this.getEdgeStyle(edge)
          this.create(edge)
        }
      })

      // 边选中事件
      registerEvent(this.graph, 'edge:selected', ({ edge }) => {
        if (!edge.getSourceNode() || !edge.getTargetNode()) {
          return
        }
        this.edgeSelect(edge)
      })

      // 画布空白区域点击事件
      registerEvent(this.graph, 'blank:click', () => {
        this.closeDeviceConfig()
      })

      // 鼠标按下
      registerEvent(this.graph, 'node:mousedown', ({ node }) => {
        this.oldPosition = node.position()
      })

      // 节点移动事件
      registerEvent(this.graph, 'node:moving', ({ node }) => {
        const isChange = isEqual(node.position(), this.oldPosition)
        if (this.graph.getSelectedCells().length > 1) { // 选中多个节点
          this.debounceUpdateApiBatch(this.graph.getSelectedCells())
        } else {
          node.setData({
            configData: {
              style: {
                location: node.position()
              }
            }
          })
          if (this.currentNode && node.id === this.currentNode.id) {
            this.nodeData = node.data
          } else {
            if (!isChange) {
              apiMap[node.data.deviceType] && this.debounceUpdateApi(apiMap[node.data.deviceType].update, this.getRenderData(node), node)
            }
          }
        }
      })

      // 进入节点事件
      registerEvent(this.graph, 'cell:mouseenter', ({ e, cell }) => {
        console.log(e, cell)
        this.showPorts(true)
        let args = {
          distance: '50%'
        }
        if (cell.isNode()) {
          args = {
            x: '100%',
            y: 0,
            offset: { x: -5, y: 5 }
          }
        }
        cell.addTools({
          name: 'button-remove',
          args
        })
      })

      // 离开节点事件
      registerEvent(this.graph, 'cell:mouseleave', ({ cell }) => {
        this.showPorts(false)
        cell.removeTools()
      })

      // 双击编辑文本
      registerEvent(this.graph, 'node:dblclick', ({ node, e }) => {
        if (node.data.deviceType === 'baseTextBlock') {
          node.removeTool('node-editor')
          node.addTools({
            name: 'node-editor',
            args: {
              event: e
            }
          })
        }
      })

      // 画布缩放
      registerEvent(this.graph, 'scale', ({ sx, sy, ox, oy }) => {
        // console.log(sx, sy, ox, oy)
        const zoom = parseInt(sx * 100) + '%'
        this.$emit('zoom-change', { zoom, set: false })
      })

      // 操作历史队列变化
      registerEvent(this.graph.history, 'change', () => {
        this.$emit('history-change', {
          canUndo: this.graph.history.canUndo(),
          canRedo: this.graph.history.canRedo()
        })
      })
    },

    edgeSelect(edge) {
      this.currentNode = edge
      this.componentName = 'DeviceConfig'
      const source = edge.getSourceNode()
      const sourceInterface = []
      if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(source.data.deviceType)) {
        for (const networkAdapter of source.data.configData.config.networkAdapter) {
          // const flag = source.data.cableList.some((item) => {
          //   return (item.cableId !== edge.id && item.selfEthId === networkAdapter.id)
          // })
          // if (!flag) {
          sourceInterface.push(networkAdapter)
          // }
        }
      }

      const target = edge.getTargetNode()
      const targetInterface = []
      if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(target.data.deviceType)) {
        for (const networkAdapter of target.data.configData.config.networkAdapter) {
          // const flag = target.data.cableList.some((item) => {
          //   return (item.cableId !== edge.id && item.selfEthId === networkAdapter.id)
          // })
          // if (!flag) {
          targetInterface.push(networkAdapter)
          // }
        }
      }

      edge.setData({
        ...edge.data,
        configData: {
          ...edge.data.configData,
          config: {
            ...edge.data.configData.config,
            sourceInterface: {
              name: source.data.name || '暂无',
              interface: sourceInterface
            },
            targetInterface: {
              name: target.data.name || '暂无',
              interface: targetInterface
            }
          }
        }
      }, { overwrite: true })
      this.getEdgeStyle(edge)
      this.nodeData = this.currentNode.data
      console.log(this.nodeData)
      this.componentKey++
    },

    nodeClick(node, isUpdate = false) {
      if (apiMap[node.data.deviceType] && apiMap[node.data.deviceType].retrieve) {
        const params = {
          data: {
            ne_id: node.data.id
          }
        }
        if (this.curDebuggerStatus === 2) {
          params.data.uuid = this.sceneTmpUuid
        }
        apiMap[node.data.deviceType].retrieve(params).then((res) => {
          if (res.status === 0) {
            const attrs = res.data.data.attrs
            let len1 = 0
            if (node.data.configData.system.ipList && node.data.configData.system.ipList.length) {
              len1 = node.data.configData.system.ipList.length
              for (let i = 0; i < node.data.configData.system.ipList.length; i++) {
                node.data.configData.system.ipList.splice(i, 1)
              }
            } else {
              node.setData({
                configData: {
                  system: {
                    ipList: []
                  }
                }
              })
            }
            const ipList = attrs.ip_list || []
            for (const ip of ipList) {
              node.data.configData.system.ipList.push(ip)
            }
            const len2 = ipList.length
            const flag = len1 !== len2 || isUpdate
            this.openDeviceConfig(node, flag)
          }
        }).catch(() => {
          if (!node.data.id) {
            this.$message.closeAll()
            this.graph.removeCell(node.id)
            this.$message({
              message: '设备异常，请重新添加',
              type: 'error'
            })
            this.closeDeviceConfig()
          }
        })
      } else {
        this.openDeviceConfig(node, isUpdate)
      }
    },
    openDeviceConfig(node, isUpdate) {
      this.currentNode = node
      this.componentName = 'DeviceConfig'
      // // 1.先同步节点data数据，2.再同步右侧数据
      this.getNodeStyle(this.currentNode) // 同步节点data数据
      this.nodeData = this.currentNode.data
      this.componentKey++
      console.log(this.nodeData)

      if (isUpdate) {
        // 修改信息
        apiMap[node.data.deviceType] &&
        this.updateElementInfo(apiMap[node.data.deviceType].update, this.getRenderData(node), node)
      }
    },
    closeDeviceConfig() {
      this.currentNode = null
      this.componentName = ''
      this.nodeData = null
    },
    create(node) {
      const renderData = this.getRenderData(node)
      apiMap[node.data.deviceType] &&
      this.addElementInfo(apiMap[node.data.deviceType].add, renderData, node).then(res => {
        if (res.status === 0) {
          // 默认配置
          let attrs = {}
          if (['desktop', 'notebook'].includes(node.data.deviceType)) {
            attrs = {
              memory: res.data.data.attrs.ram,
              CPUNumber: res.data.data.attrs.vcpus + '',
              hardDisk: res.data.data.attrs.disk.map((item) => ({
                name: '硬盘',
                capacity: item
              }))
            }
          }
          node.setData({
            id: res.data.id || res.data.data.id,
            configData: {
              config: {
                ...attrs
              }
            }
          })

          this.graph.resetSelection()
          this.graph.select(node)
          if (node.isNode()) {
            this.nodeClick(node, true)
          } else {
            this.edgeSelect(node)
            // 修改信息
            apiMap[node.data.deviceType] &&
            this.updateElementInfo(apiMap[node.data.deviceType].update, this.getRenderData(node), node)
          }
          // 连接信息
          this.attachElementInfo(node, 1)
        }
      }).catch(() => {
        this.$message.closeAll()
        this.graph.removeCell(node.id)
        let message = ''
        if (node.isNode()) {
          message = '设备异常，请重新添加'
        } else {
          message = '链路异常，请重新连接'
        }
        this.$message({
          message,
          type: 'error'
        })
        this.closeDeviceConfig()
      })
    },
    getDeviceAttrs(node) {
      let attrs = {}
      if (['desktop', 'notebook'].includes(node.data.deviceType)) {
        attrs = {
          name: node.data.name,
          image_info: {
            image_id: node.data.configData.config.imageId,
            name: node.data.configData.config.imageName,
            target_name: node.data.configData.config.targetName,
            target_id: node.data.configData.config.targetId,
            target_classify: node.data.configData.config.targetClassify,
            classify: node.data.configData.config.classify
          },
          ram: node.data.configData.config.memory * 1 || 0,
          vcpus: node.data.configData.config.CPUNumber * 1 || 0,
          usb: [{ name: 1, status: node.data.configData.config.USBSwitch }],
          disk: node.data.configData.config.hardDisk.map(item => (item.capacity || 0) * 1),
          nics: node.data.configData.config.networkAdapter.map(item => ({
            id: item.id,
            name: item.interfaceName,
            subnet_id: item.subnetId,
            mac: item.MACAddress,
            network_type: item.cardType,
            ip_info: {
              ip_type: item.getIPType * 1,
              ip_address: item.ip,
              mask: item.mask,
              gateway: item.defaultGateway
            },
            dns_info: {
              dns_type: item.getDNSServerType * 1,
              mask: item.preference,
              gateway: item.standby
            }
          })),
          system: {
            account_info: node.data.configData.system.accountList.map(item => ({
              account: item.account,
              password: item.passWord
            })),
            remote: {
              remote_type: node.data.configData.system.access,
              port: node.data.configData.system.port,
              account: node.data.configData.system.account,
              password: node.data.configData.system.passWord
            }
          }
        }
      } else if (node.data.deviceType === 'router') {
        attrs = {
          inf: node.data.configData.config.networkAdapter.map((item) => ({
            id: item.id,
            eth_name: item.interfaceName,
            subnet_id: item.subnet,
            ip: item.ipAddress
          })),
          port_mappings: node.data.configData.config.portMapList.map((item) => ({
            id: item.id,
            dest_ip: item.external,
            d_port: item.externalPort * 1,
            to_ip: item.internal,
            t_port: item.internalPort * 1,
            protocol: item.protocol
          }))
        }
      } else if (node.data.deviceType === 'layerTwoSwitches') {
        const port_info = []
        for (const item of node.data.configData.config.networkAdapter) {
          const obj = {
            id: item.id,
            port_name: item.interfaceName,
            vni_type: item.cardType,
            port_mode: item.portMode
          }
          if (obj.port_mode === 'access') {
            obj.subnet_id = item.subnet
          }
          for (const cable of node.data.cableList) {
            const edge = this.graph.getCellById(cable.cableId)
            if (!edge) {
              continue
            }
            const target = edge.data.target
            const source = edge.data.source
            if (source.nodeId === node.id) {
              if (obj.id === edge.data.configData.config.fromId) {
                if (edge.data.configData.config.toId) {
                  obj.attach_dev_info = {
                    dev_id: cable.devId,
                    dev_eth_id: edge.data.configData.config.toId || ''
                  }
                }
              }
            } else if (target.nodeId === node.id) {
              if (obj.id === edge.data.configData.config.toId) {
                if (edge.data.configData.config.fromId) {
                  obj.attach_dev_info = {
                    dev_id: cable.devId,
                    dev_eth_id: edge.data.configData.config.fromId || ''
                  }
                }
              }
            }
          }
          port_info.push(obj)
        }
        attrs = {
          dev_name: node.data.name,
          port_info
        }
      } else if (node.data.deviceType === 'cable') {
        console.log(node.data.configData.config.fromId, node.data.configData.config.toId)
        attrs = {
          from: node.data.configData.config.from,
          from_index: node.data.configData.config.fromId || '',
          to: node.data.configData.config.to,
          to_index: node.data.configData.config.toId || '',
          delay: node.data.configData.config.delay || 0,
          speed_limit: node.data.configData.config.Bandwidth || 0,
          package_loss: node.data.configData.config.packetLossRate || 0
        }
      }
      return attrs
    },
    attachElementInfo(node, op) {
      if (node.isEdge()) {
        const source = node.data.source
        const target = node.data.target
        this.attachApi(source, target, op)
        this.attachApi(target, source, op)
      }
    },
    attachApi(self, other, op) {
      if (self.deviceType === 'virtualNetwork' && this.graph.getCellById(self.nodeId)) {
        return apiMap.attach && apiMap.attach[self.deviceType] &&
        apiMap.attach[self.deviceType]({
          link: {
            id: self.id,
            ele_id: other.id,
            op
          }
        })
      } else {
        return new Promise((resolve) => {
          resolve({
            status: 0,
            msg: ''
          })
        })
      }
    },
    addElementInfo(api, renderData, node) {
      const attrs = this.getDeviceAttrs(node)
      console.log(attrs)
      return api({
        data: {
          scene_id: this.sceneData.id,
          attrs,
          illustration_info: renderData
        }
      })
    },
    getElementInfo(api, id) {
      return api({ data: id })
    },
    updateElementInfo(api, renderData, node) {
      const attrs = this.getDeviceAttrs(node)
      return api({
        data: {
          id: renderData.data.id,
          attrs,
          illustration_info: renderData
        }
      }).then((res) => {
        if (res.status === 0) {
          if (node.isEdge()) {
            const source = node.getSourceNode()
            const target = node.getTargetNode()
            if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(source.data.deviceType)) {
              for (const cable of source.data.cableList) {
                if (cable.cableId === node.id) {
                  cable.devId = target.data.id
                  cable.selfEthId = node.data.configData.config.fromId || ''
                  cable.devEthId = node.data.configData.config.toId || ''
                }
              }
              apiMap[source.data.deviceType] &&
              this.updateElementInfo(apiMap[source.data.deviceType].update, this.getRenderData(source), source)
            }
            if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(target.data.deviceType)) {
              for (const cable of target.data.cableList) {
                if (cable.cableId === node.id) {
                  cable.devId = source.data.id
                  cable.selfEthId = node.data.configData.config.toId || ''
                  cable.devEthId = node.data.configData.config.fromId || ''
                }
              }
              apiMap[target.data.deviceType] &&
            this.updateElementInfo(apiMap[target.data.deviceType].update, this.getRenderData(target), target)
            }
          }
        }

        // if (node.isEdge()) {
        //   const source = node.getSourceNode()
        //   const target = node.getTargetNode()
        //   if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(source.data.deviceType)) {
        //     source.setData({
        //       devId: target.data.id,
        //       selfEthId: node.data.configData.config.fromId,
        //       devEthId: node.data.configData.config.toId
        //     })
        //     apiMap[node.data.deviceType] &&
        //   this.updateElementInfo(apiMap[source.data.deviceType].update, this.getRenderData(source), source)
        //   }
        //   if (['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(source.data.deviceType)) {
        //     target.setData({
        //       devId: source.data.id,
        //       selfEthId: node.data.configData.config.toId,
        //       devEthId: node.data.configData.config.fromId
        //     })
        //     apiMap[target.data.deviceType] &&
        //   this.updateElementInfo(apiMap[target.data.deviceType].update, this.getRenderData(target), target)
        //   }
        // }
      }).catch(() => {
        if (!node.data.id) {
          this.$message.closeAll()
          this.graph.removeCell(node.id)
          let message = ''
          if (node.isNode()) {
            message = '设备异常，请重新添加'
          } else {
            message = '链路异常，请重新连接'
          }
          this.$message({
            message,
            type: 'error'
          })
          this.closeDeviceConfig()
        }
      })
    },
    debounceUpdateApi: debounce(
      function(api, renderData, node) {
        this.updateElementInfo(api, renderData, node)
      },
      500
    ),
    debounceUpdateApiBatch: debounce(
      function(nodes) {
        for (const cell of nodes) {
          if (this.graph.isNode(cell)) {
            cell.setData({
              configData: {
                style: {
                  location: cell.position()
                }
              }
            }, {
              overwrite: false,
              deep: true,
              silent: true
            })
            apiMap[cell.data.deviceType] &&
            this.updateElementInfo(apiMap[cell.data.deviceType].update, this.getRenderData(cell), cell)
          }
        }
      },
      500
    ),
    delElementInfo(api, node) {
      if (!node.data.id) {
        return
      }
      api({ data: {
        type: 1,
        ids: [node.data.id]
      }}).then((res) => {
        if (res.status === 0) {
          if (this.currentNode && this.currentNode.id === node.id) {
            this.componentName = ''
            this.currentNode = null
            this.nodeData = null
          }
          if (node.isEdge()) {
            const source = this.graph.getCellById(node.data.source.nodeId)
            const target = this.graph.getCellById(node.data.target.nodeId)
            if (source) {
              const cableList = source.data.cableList
              for (let i = 0; i < cableList.length; i++) {
                const cable = cableList[i]
                if (node.id === cable.cableId) {
                  cableList.splice(i, 1)
                  break
                }
              }
              apiMap[node.data.deviceType] &&
              this.updateElementInfo(apiMap[source.data.deviceType].update, this.getRenderData(source), source)
            }
            if (target) {
              const cableList = target.data.cableList
              for (let i = 0; i < cableList.length; i++) {
                const cable = cableList[i]
                if (node.id === cable.cableId) {
                  cableList.splice(i, 1)
                  break
                }
              }
              apiMap[target.data.deviceType] &&
              this.updateElementInfo(apiMap[target.data.deviceType].update, this.getRenderData(target), target)
            }
          }
          this.attachElementInfo(node, 0)
        }
      })
    },
    getRenderData(node) {
      let renderData = {}
      const dataArr = this.graph.toJSON().cells
      console.log(dataArr)
      for (const item of dataArr) {
        if (item.id === node.id) {
          renderData = item
        }
      }
      delete renderData.tools // 保存时删除工具
      return renderData
    },
    getNodeStyle(node) { // 获取节点样式，并同步节点data数据
      const configData = { style: {}}
      if (node.data.deviceType === 'baseRect') {
        configData.style.location = node.position()
        configData.style.size = node.size()
        console.log(node.attrs)
        configData.style.r = node.attrs.body.rx
        configData.style.stroke = node.attrs.body.stroke
        configData.style.strokeDasharray = node.attrs.body.strokeDasharray
        configData.style.strokeWidth = node.attrs.body.strokeWidth
      } else if (node.data.deviceType === 'baseTextBlock') {
        console.log(node.attrs)
      } else {
        configData.style.location = node.position()
        configData.style.size = node.size()
        const iconfont = document.getElementById(`${node.id}`).querySelector('.iconfont')
        console.log(iconfont.style.color)
        configData.style.color = iconfont.style.color
      }
      node.setData({ configData }, {
        overwrite: false,
        deep: true,
        silent: true
      })
    },
    getEdgeStyle(edge) {
      console.log(edge.attrs, edge.getConnector())
      const connector = edge.getConnector()
      edge.setData({
        configData: {
          style: {
            strokeDasharray: edge.attrs.line.strokeDasharray,
            strokeWidth: edge.attrs.line.strokeWidth,
            connector: connector.name
          }
        }
      }, {
        overwrite: false,
        deep: true,
        silent: true
      })
    },
    restStyle() { // 重置节点样式
      if (!this.isUpdate) {
        this.isUpdate = true
        return
      }
      const style = this.currentNode.data.configData.style
      if (this.isHasEmpty(style)) {
        return
      }
      if (this.currentNode.isNode()) {
        this.restNode(this.currentNode, style)
      } else {
        this.restEdge(this.currentNode, style)
      }
      apiMap[this.currentNode.data.deviceType] &&
      this.updateElementInfo(apiMap[this.currentNode.data.deviceType].update, this.getRenderData(this.currentNode), this.currentNode)
    },
    restNode(node, style) {
      node.position(style.location.x, style.location.y)
      node.size({ width: style.size.width, height: style.size.height })
      if (node.data.deviceType === 'baseRect') {
        node.attr({
          body: {
            rx: style.r,
            ry: style.r,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            strokeDasharray: style.strokeDasharray
          }
        })
      } else if (node.data.deviceType === 'baseTextBlock') {
        console.log(node.attrs)
      } else {
        console.log(node)
        const iconfont = document.getElementById(`${node.id}`).querySelector('.iconfont')
        iconfont.style.fontSize = (style.size.width > style.size.height ? style.size.height : style.size.width) + 'px'
        iconfont.style.color = style.color
      }
    },
    restEdge(node, style) {
      let router = {
        name: 'normal'
      }
      const connector = {
        name: style.connector
      }
      if (style.connector === 'rounded') {
        connector.args = {
          radius: 8
        }
        router = {
          name: 'manhattan',
          args: {
            padding: 1
          }
        }
      }
      node.attr({
        line: {
          strokeDasharray: style.strokeDasharray,
          strokeWidth: style.strokeWidth
        }
      })
      node.setConnector(connector)
      node.setRouter(router)
    },
    isHasEmpty(data) {
      let flag = false
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          if (typeof data[key] === 'object') {
            flag = this.isHasEmpty(data[key])
          } else {
            flag = data[key] === ''
            console.log(key)
          }
          if (flag) break
        }
      }
      return flag
    },
    getNodes() {
      // console.log(JSON.stringify(this.graph.toJSON()))
    },
    showPorts(show) {
      const container = this.$refs.container
      const ports = container.querySelectorAll('.x6-port-body')
      for (let i = 0; i < ports.length; i++) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    cleanSelection() {
      this.graph.cleanSelection()
      this.currentNode = null
      this.nodeData = null
    },
    setComponentName(type) {
      this.cleanSelection()
      if (type === 'subnet') {
        this.componentName = 'SubnetManagement'
      } else if (type === 'dns') {
        this.componentName = 'DnsServer'
      } else {
        this.componentName = ''
      }
    },
    setZoom(zoom) {
      this.graph.zoomTo(zoom)
    },
    setRedo() {
      this.graph.history.redo()
    },
    setUndo() {
      this.graph.history.undo()
    }
  }
}
</script>
<style lang="scss" scoped>
  .topology {
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    >div {
      height: 100% !important;
    }
    .stencil {
      width: 234px;
      position: relative;
    }
    .container {
      flex: 1;
      overflow: hidden;
    }
    .device-config {
      position: absolute;
      right: 0;
      top: 0;
      width: 388px;
      // background-color: #1B1D20;
      background: #323436;
      border-left: 2px solid rgba(255, 255, 255, 0.1);
    }
  }
</style>
