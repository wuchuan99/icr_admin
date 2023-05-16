<script>
import './style/index.scss'
import Topology from '@/views/common/topology'
import { Cable } from './edges'
import { createDesktopComputer, createLaptop, createNetRouter,
  createLayer2Switch,
  createVirtualNet,
  createRectBlock,
  createTextBlock,
  createPhysical
} from './nodes'
import ContextMenu from './components/context-menu.vue'
import { SettingComponentRender } from './nodes/base'
import SubnetManager from './subnet-manager'
import DnsManager from './dns-manager'
import { v4 as uuidv4 } from 'uuid'
import { scenetargetStartup, scenetargetStartingstatus, scenetargetRelease, scenetargetRetrieve } from '@/api/scene'
import IcrDialog from '@/components/dialog.vue'
import {
  physicalPaging
} from '@/api/resource'
import { cloneDeep } from 'lodash-es'
import { splitUrl } from '@/utils/tools'
import { Message } from 'element-ui'
const stencilNodeWrapper = function(node) {
  const defaultNodeConfig = {
    width: 36,
    height: 36,
    ports: []
  }

  return {
    ...node,
    ...defaultNodeConfig
  }
}
const MaxZIndex = 9999
const MinZIndex = -9999

const GraphContextMenus = [
  { name: '全选', shortcutKey: 'Ctrl + A', click: ({ graph }) => {
    graph.select(graph.getNodes())
  } },
  { name: '粘贴', shortcutKey: 'Ctrl + V', click: ({ editor }) => {
    editor.paste()
  } },
  null,
  { name: '撤销', shortcutKey: 'Ctrl + Z', click: ({ editor }) => {
    editor.undo()
  } },
  { name: '恢复', shortcutKey: 'Ctrl + Shift + Z', click: ({ editor }) => {
    editor.redo()
  } }
]

const NodeContextMenus = [
  { name: '复制', shortcutKey: 'Ctrl + C', click: ({ editor }) => {
    editor.copy()
  } },
  { name: '删除', shortcutKey: null, click: ({ graph, contextMenu, editor }) => {
    graph.startBatch('remove nodes')
    const nodes = graph.selection?.cells
    if (nodes.length) {
      nodes.map(node => {
        graph.removeNode(node)
      })
      editor.activeNode = null
    }
    graph.stopBatch('remove nodes')
  } },
  null,
  { name: '置于顶层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.setZIndex(MaxZIndex)
  } },
  { name: '置于底层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.setZIndex(MinZIndex)
  } },
  { name: '上移一层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.toFront()
  } },
  { name: '下移一层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.toBack()
  } },
  null,
  { name: '组合', shortcutKey: 'Ctrl + G', click: ({ editor }) => {
    editor.group()
  } },
  { name: '取消组合', shortcutKey: 'Ctrl + Shift + G', click: ({ editor }) => {
    editor.ungroup()
  } }
]

const EdgeContextMenus = [
  { name: '删除', shortcutKey: null, click: ({ graph, contextMenu, editor }) => {
    graph.startBatch('remove edges')
    const edge = contextMenu.node
    graph.removeEdge(edge)
    editor.activeNode = null
    graph.stopBatch('remove edges')
  } },
  null,
  { name: '至于顶层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.setZIndex(MaxZIndex)
    node.update && node.update()
  } },
  { name: '至于低层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.setZIndex(MinZIndex)
    node.update && node.update()
  } },
  { name: '上移一层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.toFront()
    node.update && node.update()
  } },
  { name: '下移一层', shortcutKey: null, click: ({ contextMenu }) => {
    const node = contextMenu.node
    node.toBack()
    node.update && node.update()
  } }
]

const SANP = 20
const PhysicalValidate = function(source, target) {
  if (['physical'].includes(source.component) || ['physical'].includes(target.component)) {
    if (source.component === 'physical' && (target.component === 'Layer2Switch' || target.component === 'NetRouter')) {
      return false
    } else if (target.component === 'physical' && (source.component === 'Layer2Switch' || source.component === 'NetRouter')) {
      return false
    } else {
      Message({
        message: '物理设备只能与交换机、路由器连接！',
        type: 'error'
      })
      return true
    }
  } else {
    return false
  }
}
export default {
  components: {
    Topology,
    SubnetManager,
    DnsManager,
    ContextMenu,
    IcrDialog
  },
  provide() {
    return {
      getGraph: () => {
        return this.graph
      },
      getContext: () => {
        return this.contextMenu
      },
      getEditor: () => {
        return this
      }
    }
  },
  data() {
    const vm = this
    return {
      settingComponent: null,
      graph: null,
      scale: 1,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        node: null,
        menus: GraphContextMenus
      },
      activeNode: null,
      fullscreen: false,
      editorOption: {
        snapline: true,
        autoResize: true,
        history: {
          enabled: true,
          // ignoreAdd: true,
          // ignoreRemove: true,
          ignoreChange: true
        },
        grid: {
          size: 10,
          visible: true,
          args: {
            color: '#5B5D5E', // 网格线/点颜色
            thickness: 1.5 // 网格线宽度/网格点大小
          }
        },
        interacting: {
          nodeMovable: () => {
            return vm.curDebuggerStatus === 0
          }
        },
        selecting: {
          enabled: true,
          rubberband: true,
          multiple: true,
          useCellGeometry: true,
          showNodeSelectionBox: true,
          // showEdgeSelectionBox: true,
          pointerEvents: 'none'
        },
        resizing: {
          enabled: true,
          autoScroll: true,
          orthogonal: false,
          preserveAspectRatio: true
        },
        clipboard: {
          enabled: true
        },
        keyboard: {
          enabled: true
          // global: true
        },
        mousewheel: {
          enabled: true
        },
        connecting: {
          router: {
            name: 'manhattan',
            args: {
              padding: 1
            }
          },
          connector: {
            name: 'rounded',
            args: {
              radius: 8
            }
          },
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          allowLoop: false,
          allowMulti: 'withPort',
          snap: {
            radius: SANP
          },
          validateConnection({ targetMagnet }) {
            return !!targetMagnet
          },
          createEdge() {
            const edge = new Cable({
              editor: vm
            })
            return edge
          },
          validateEdge({ edge }) {
            const target = edge.getTargetNode()
            const source = edge.getSourceNode()
            target && vm.showPorts(target, false)
            const flag = PhysicalValidate(source, target)
            if (flag) return false
            return edge.source?.cell && edge.target?.cell
          }
        },
        minimap: {
          enabled: true,
          width: 238,
          height: 133,
          padding: 10
        },
        scroller: {
          enabled: true,
          pannable: true,
          modifiers: 'ctrl|shift',
          pageVisible: false,
          pageBreak: false,
          autoResize: true,
          autoResizeOptions: {
            minWidth: 1920,
            minHeight: 1080,
            border: 20
          }
        },
        scaling: {
          max: 2.5,
          min: 0.3
        },
        stencil: {
          search(cell, keyword) {
            const name = cell.data?.attrs.name
            if (name && name.indexOf(keyword) >= 0) {
              return true
            }
            return false
          },
          title: '组件',
          placeholder: '搜索',
          notFoundText: '找不到相关数据',
          collapsable: false,
          groups: [
            {
              name: '基本形状',
              graphWidth: '100%',
              graphHeight: 110,
              nodes: [
                stencilNodeWrapper(createRectBlock()),
                stencilNodeWrapper(createTextBlock())
              ]
            },
            {
              name: '终端设备',
              graphWidth: '100%',
              graphHeight: 110,
              nodes: [
                stencilNodeWrapper(createDesktopComputer()),
                stencilNodeWrapper(createLaptop())
              ]
            },
            {
              name: '网络设备',
              graphWidth: '100%',
              graphHeight: 110,
              nodes: [
                stencilNodeWrapper(createNetRouter()),
                stencilNodeWrapper(createLayer2Switch()),
                stencilNodeWrapper(createVirtualNet())
              ]
            },
            {
              name: '物理设备',
              graphWidth: '100%',
              graphHeight: 110,
              nodes: []
            }
          ],
          getDropNode(sourceNode) {
            console.log(`dropNode `, sourceNode)
            const cloneNode = sourceNode.clone()
            let size = { width: 40, height: 40 }
            if (cloneNode.component === 'RectBlock') {
              size = { width: 96, height: 54 }
            } else if (cloneNode.component === 'TextBlock') {
              size = { width: 120, height: 30 }
            }
            cloneNode.size(size)
            return cloneNode
          },
          validateNode(node) {
            const validate = (
              node.component === 'VirtualNet' &&
              vm.graph.toJSON().cells.some((cell) => cell.component === 'VirtualNet')
            )
            if (validate) {
              vm.$message({
                message: '一个场景仅允许存在一个虚拟网络',
                type: 'error'
              })
            }
            return !validate
          },
          layoutOptions: {
            columns: 3,
            columnWidth: 70
          }
        }
      },
      mousePosition: {
        x: 0,
        y: 0
      },
      // 调试
      curDebuggerStatus: 0, // 0 未调试 1 正在调试 2 调试完成 3 保存中
      debuggerStatusMap: {
        0: '调试',
        1: '调试启动中...',
        2: '停止调试',
        3: '保存中...'
      },
      isDebuggering: false,
      isReleaseing: false,
      sceneTmpUuid: '',
      pollingST: null,
      isReloadingGraph: false,
      dialogVisible: false,
      // isPhysical: false // 是否是物理设备
    }
  },
  computed: {
    sceneData() {
      return this.$store.state.topology.sceneData
    }
  },
  watch: {
    fullscreen: {
      handler: function() {
        this.setupGraphSzie()
      }
    },
    curDebuggerStatus: function(newVal) {
      const FLAG = ![1, 2, 3].includes(newVal)
      this.graph.toggleKeyboard(FLAG)
      this.graph.toggleRubberband(FLAG)
      this.graph.toggleMultipleSelection(FLAG)
    }
  },
  mounted() {
    physicalPaging({ page_info: { page_num: 1, page_size: 10000 }, search_info: {}}).then(({ data }) => {
      const res = data.data
      const index = this.editorOption.stencil.groups.findIndex(ele => ele.name === '物理设备')
      this.editorOption.stencil.groups[index].graphHeight = res.length > 3 ? Math.ceil(res.length / 3) * 95 : 110
      res.forEach((ele, idx) => {
        this.editorOption.stencil.groups[index].nodes.push(stencilNodeWrapper(cloneDeep(createPhysical())))
        this.editorOption.stencil.groups[index].nodes[idx].data.attrs.name = ele.name
        this.editorOption.stencil.groups[index].nodes[idx].data.attrs.physical_resource.id = ele.id
        this.editorOption.stencil.groups[index].nodes[idx].data.attrs.port_info = ele.network_interface.map((item) => { return { name: item.value, networkName: item.name, id: item.network_interface_id } })
        this.editorOption.stencil.groups[index].nodes[idx].data.src = splitUrl(ele.logo)
      })
    }).catch((error) => {
      // 未授权、无权限不显示物理设备
      if (error.status === -9999) {
        this.editorOption.stencil.groups = this.editorOption.stencil.groups.filter(item => item.name !== '物理设备')
      }
    }).finally(() => {
      this.$refs.editor.init()
      this.init()
    })
    window.addEventListener('resize', this.setupGraphSzie)
  },
  beforeDestroy() {
    clearTimeout(this.pollingST)
    window.removeEventListener('resize', this.setupGraphSzie)
  },
  destroyed() {
    this.$destroy()
  },
  methods: {
    init() {
      this.graph = this.$refs.editor?.graph
      this.graph.vm = this
      this.initEvent()
      this.addSearchIcon()
      this.renderNodes()
      this.setupGraphSzie()

      // 初始化调试状态
      this.initDebuggerStatus()
    },
    reloadGraph() {
      this.isReloadingGraph = true
      scenetargetRetrieve({
        id: this.sceneData.id
      }).then(res => {
        this.$store.dispatch('topology/setSceneData', {
          id: this.sceneData.id,
          topologyData: res.data.data,
          ...res.data.scene
        })
        this.renderNodes()
        this.isReloadingGraph = false
      })
    },
    renderNodes() {
      const nodes = this.sceneData.topologyData.filter(item => item.illustration_info && item.illustration_info.id).map(item => {
        if (item.illustration_info.data && item.id) {
          item.illustration_info.data.id = item.id
          if (['desktop', 'laptop'].includes(item.illustration_info.component)) {
            if (item.illustration_info.data?.attrs?.image_info) {
              item.illustration_info.data.attrs.image_info.image_id = item.attrs?.image_info?.image_id
              item.illustration_info.data.attrs.image_info.name = item.attrs?.image_info?.name
            }
          }
        }
        return item.illustration_info
      })
      console.log(nodes)
      this.graph.fromJSON(nodes)
      this.graph.cleanHistory()
    },
    restCellData(cells) {
      for (const cell of cells) {
        if (cell.isNode()) {
          cell.updateData({
            connections: []
          })
        } else if (cell.isEdge()) {
          cell.updateData({
            attrs: {
              ...cell.data.attrs,
              from: '',
              to: ''
            },
            source: null,
            target: null
          })
        }
      }
    },
    initDebuggerStatus() {
      const sceneTmpUuid = `debug_${this.sceneData.id}`
      this.scenetargetStartingstatusApi(sceneTmpUuid).then((res) => {
        if (res.status === 0) {
          if ([3, 2].includes(res.data.status)) {
            this.curDebuggerStatus = 0
            this.sceneTmpUuid = ''
          } else if (res.data.status === 0) {
            this.curDebuggerStatus = 1
            this.polling(sceneTmpUuid, 1)
          } else if (res.data.status === 1) {
            this.curDebuggerStatus = 2
            this.sceneTmpUuid = sceneTmpUuid
          } else if (res.data.status === 4) {
            this.curDebuggerStatus = 3
            this.polling(sceneTmpUuid, 1)
          }
        }
      })
    },
    initEvent() {
      this.setupGraphEvents()
      this.setupNodeEvents()
      this.setupEdgeEvents()
    },
    setupGraphSzie() {
      const rootEl = this.fullscreen ? document.body : this.$el
      const editorEl = this.$el.querySelector('.topology-editor')
      const toolsEl = editorEl.querySelector('.editor-tools')
      const stencilEl = editorEl.querySelector('.topology-stencil')

      const w = rootEl.clientWidth - stencilEl.clientWidth
      const h = rootEl.clientHeight - toolsEl.clientHeight - 6
      console.log(w, h)
      this.$nextTick(() => {
        this.graph.resize(w, h)
        this.centerContent()
      })
    },
    setupGraphEvents() {
      this.graph.on('cell:click', (e) => {
        const cell = e.cell
        // 处理文本节点失去焦点问题
        const nodes = this.graph.getNodes().filter(it => (it.id !== cell.id))
        this.focusAllText(nodes)
        setTimeout(() => {
          const vm = e.view.vm
          vm?.editable && vm?.setFocus()
        })
      })

      this.graph.on('scale', ({ sx, sy, ox, oy }) => {
        this.scale = sx
      })

      this.graph.on('blank:click', e => {
        this.activeNode = null
        this.contextMenu.visible = false
        const nodes = this.graph.getNodes()
        this.focusAllText(nodes)
      })

      this.graph.on('blank:contextmenu', e => {
        this.graph.cleanSelection()
        this.toggleContextMenu(e, GraphContextMenus)
        this.mousePosition.x = e.x
        this.mousePosition.y = e.y
        const nodes = this.graph.getNodes()
        this.focusAllText(nodes)
      })

      this.graph.on('cells:copy', ({ cells }) => {
        const groups = cells.reduce(function(acc, cur) {
          if (cur.data?.group) {
            const k = cur.data?.group?.id
            console.log(cur, k, acc)
            k && (acc[k] = acc[k] || []).push(cur)
          }
          return acc
        }, {})

        for (const k in groups) {
          const cells = groups[k]
          if (cells.length <= 1) continue
          const groupId = uuidv4()
          cells.map(cell => {
            cell.setData({
              ...cell.data,
              group: {
                id: groupId
              }
            })
          })
        }
      })

      // copy paste
      this.graph.bindKey('ctrl+c', () => {
        this.copy()
      })
      this.graph.bindKey('ctrl+v', () => {
        this.graph.startBatch('paste cells')
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({
            offset: 32,
            edgeProps: {
              zIndex: 0
            }
          })
          this.graph.cleanSelection()
          this.graph.select(cells)
        }
        this.graph.stopBatch('paste cells')
        return false
      })

      // undo redo
      this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
        console.log('ctrl+z')
        this.undo()
        return false
      })

      this.graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
        this.redo()
        return false
      })

      // group ungroup
      this.graph.bindKey('ctrl+g', () => {
        this.group()
        return false
      })

      this.graph.bindKey('ctrl+shift+g', () => {
        this.ungroup()
        return false
      })

      this.graph.bindKey('ctrl+a', () => {
        const graphNodes = this.graph.getNodes()
        if (graphNodes.length) {
          this.graph.select(this.graph.getNodes())
        }
        return false
      })
    },
    setupNodeEvents() {
      this.graph.on('node:added', ({ node, index, options }) => {
        this.restCellData([node])
        this.graph.cleanSelection()
        setTimeout(() => {
          if (node.shape !== 'vue-shape') return
          this.graph.startBatch('add node')
          const view = this.graph.findView(node)
          const vm = view.vm
          this.activeNode = vm
          this.graph.select(node)
          vm.onAdded && vm.onAdded(this.sceneData.id, node)
          // this.isPhysical = node.component === 'physical'
          this.$nextTick(() => {
            this.graph.stopBatch('add node')
          })
        }, 100)
      })

      this.graph.on('node:click', (e) => {
        const node = e.node
        // find group nodes
        if (node.data.group) {
          const groupNodes = this.graph.getNodes().filter(n => n.data.group?.id === node.data.group.id)
          this.graph.select(groupNodes)
          // }
          return
        }

        // if current node is active node no send request
        if (this.activeNode?.node?.id === node.id) return

        // this.isPhysical = node.component === 'physical'
        this.activeNode = e.view.vm
        this.activeNode.onRetrieved && this.activeNode.onRetrieved(this.curDebuggerStatus, this.sceneTmpUuid)
      })

      this.graph.on('node:mousedown', (e) => {
        const node = e.node
        // if current node is selected do nothing
        if (this.graph.getSelectedCells().indexOf(node) >= 0) {
          // select multiple disable snapline
          this.graph.toggleSnapline(this.graph.getSelectedCells().length <= 1)
          return
        }

        const event = e.e
        if (!event.ctrlKey) {
          this.graph.cleanSelection()
          this.graph.select(node)
        }

        // find group nodes
        if (node.data.group) {
          const groupNodes = this.graph.getNodes().filter(n => n.data.group?.id === node.data.group.id)
          this.graph.select(groupNodes)
        }
        // select multiple disable snapline
        this.graph.toggleSnapline(this.graph.getSelectedCells().length <= 1)
      })

      this.graph.on('node:dblclick', (e) => {
        this.graph.cleanSelection()
        this.graph.select(e.node)

        // if current node is active node no send request
        if (this.activeNode?.node?.id === e.node.id) return

        this.activeNode = e.view.vm
        this.activeNode.onRetrieved && this.activeNode.onRetrieved(this.curDebuggerStatus, this.sceneTmpUuid)
      })

      this.graph.on('node:contextmenu', (e) => {
        this.activeNode = e.view.vm
        this.contextMenu.node = e.node
        this.toggleContextMenu(e, NodeContextMenus)

        // if current node is selected do nothing
        if (this.graph.getSelectedCells().indexOf(e.node) >= 0) {
          return
        }

        this.graph.cleanSelection()
        this.graph.select(e.node)
      })

      this.graph.on('node:mouseenter', ({ e, node }) => {
        this.showPorts(node, true)
      })

      this.graph.on('node:mouseleave', ({ node }) => {
        this.showPorts(node, false)
      })

      this.graph.on('node:removed', ({ node }) => {
        this.graph.needRemoveNodes = this.graph.needRemoveNodes || []
        this.graph.needRemoveNodes.push(node)
      })
    },
    setupEdgeEvents() {
      this.graph.on('edge:click', e => {
        this.activeNode = e.edge
      })

      this.graph.on('edge:added', (e) => {
        const edge = e.edge
        this.restCellData([edge])
        // trigger onConnected atfer undo
        if (edge.source?.cell && edge.target?.cell) {
          if (edge.onConnected) {
            this.graph.startBatch('add edge')
            this.activeNode = edge
            this.$nextTick(() => {
              this.graph.stopBatch('add edge')
              setTimeout(() => {
                edge.onConnected(this.sceneData.id, edge, this).then(() => {
                  this.setVirtualNetAttachInfo(edge, 1)
                })
              }, 1000)
            })
          }
        }
      })

      this.graph.on('edge:connected', (e) => {
        const { edge } = e
        edge.setProp('zIndex', 0)
        setTimeout(() => {
          this.graph.startBatch('add edge')
          this.activeNode = edge
          this.$nextTick(() => {
            this.graph.stopBatch('add edge')
            if (edge.onConnected) {
              edge.onConnected(this.sceneData.id, edge, this).then(() => {
                this.setVirtualNetAttachInfo(edge, 1)
              })
            }
          })
        })
      })

      this.graph.on('edge:removed', (e) => {
        if (this._isBeingDestroyed || this._isDestroyed) return

        const { edge } = e
        if (edge.data.id && edge.onRemoved) {
          this.graph.startBatch('remove edge')
          const p = edge.onRemoved()
          p?.then && p.then(() => {
            this.delNodeConnections(edge)
            this.setVirtualNetAttachInfo(edge, 0)
            this.graph.stopBatch('remove edge')
          })
        }
      })

      this.graph.on('edge:contextmenu', (e) => {
        this.activeNode = e.edge
        this.contextMenu.node = e.edge
        this.toggleContextMenu(e, EdgeContextMenus)
      })

      this.graph.on('edge:mouseup', ({ edge }) => {
        if (edge.source?.cell && edge.target?.cell) return
        const nodes = this.graph.getNodes().filter(node => node.hasPorts())
        for (const node of nodes) {
          this.showPorts(node, false)
        }
      })

      this.graph.on('edge:mousemove', ({ edge, x, y }) => {
        if (edge.source?.cell && edge.target?.cell) return
        const nodes = this.graph.getNodes().filter(node => node.hasPorts())
        for (const node of nodes) {
          const { x: nx, y: ny } = node.position()
          const { width, height } = node.size()
          const radius = SANP + 10
          const scope = { x: [nx - radius, nx + width + radius], y: [ny - radius, ny + height + radius] }
          const show = (x > scope.x[0] && x < scope.x[1]) && (y > scope.y[0] && y < scope.y[1])
          this.showPorts(node, show)
        }
      })
    },
    focusAllText(nodes) {
      // focusout all text node
      nodes.forEach(node => {
        if (node.component && node.component === 'TextBlock') {
          const view = this.graph.findView(node)
          view.vm?.editable && view.vm?.focusout && view.vm?.focusout()
        }
      })
    },
    setVirtualNetAttachInfo(edge, op) {
      const source = edge.getSourceCellId() ? this.graph.getCellById(edge.getSourceCellId()) : {}
      const target = edge.getTargetCellId() ? this.graph.getCellById(edge.getTargetCellId()) : {}
      console.log(source, target)
      source && source.component === 'VirtualNet' && this.graph.findView(source) && this.graph.findView(source).vm.setAttach(source, target, op)
      target && target.component === 'VirtualNet' && this.graph.findView(target) && this.graph.findView(target).vm.setAttach(target, source, op)
    },
    delNodeConnections(edge) {
      const source = this.graph.getCellById(edge.getSourceCellId())
      if (source) {
        const source_connections = source.data.connections.filter(it => it.id !== edge.id)
        source.updateData({
          connections: source_connections
        })
      }
      const target = this.graph.getCellById(edge.getTargetCellId())
      if (target) {
        const target_connections = target.data.connections.filter(it => it.id !== edge.id)
        target.updateData({
          connections: target_connections
        })
      }
    },
    showPorts(node, show) {
      const view = this.graph.findView(node)
      const ports = view?.container?.querySelectorAll('.x6-port-body')
      for (let i = 0; i < ports.length; i++) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    toggleContextMenu(e, menus) {
      if (!e) this.contextMenu.visible = false
      const graphEl = this.$el.querySelector('.topology-graph')
      const rect = graphEl.getBoundingClientRect()

      this.contextMenu.x = e.e.clientX - rect.left
      this.contextMenu.y = e.e.clientY - rect.top
      this.contextMenu.menus = menus
      this.contextMenu.visible = true
    },
    redo() {
      if (this.graph) {
        this.activeNode = null
        if (this.graph?.history.canRedo()) {
          this.graph?.history.redo()
        }
      }
    },
    undo() {
      if (this.graph) {
        this.activeNode = null
        if (this.graph?.history.canUndo()) {
          this.graph?.history.undo()
        }
      }
    },
    zoom(factory, options) {
      this.graph.zoom.apply(this.graph, arguments)
      this.scale = this.graph.zoom()
    },
    setZoom(command) {
      this.graph.zoomTo(Number(command))
      this.scale = this.graph.zoom()
    },
    centerContent() {
      this.setZoom(1)
      this.graph.centerContent()
    },
    group() {
      const graph = this.graph
      const selection = graph.selection
      if (selection.length <= 1) {
        return
      }
      graph.startBatch('group')
      const groupId = uuidv4()
      console.log(selection.cells)
      selection.cells.map(cell => {
        cell.setData({
          ...cell.data,
          group: {
            id: groupId
          }
        })
      })
      graph.stopBatch('group')
    },
    ungroup() {
      const graph = this.graph
      const selection = graph.selection
      if (selection.length <= 1) {
        return
      }
      selection.cells.map(cell => {
        cell.setData({ group: null })
        // cell.data.group = null
      })
      graph.cleanSelection()
    },
    addSearchIcon() {
    // 添加搜索图标
      const inputBox = this.$el.querySelector('.x6-widget-stencil-search')
      const i = document.createElement('i')
      i.className = 'sarchIcon iconfont icon-sousuo1'
      inputBox.appendChild(i)
    },
    copy() {
      this.graph.startBatch('copy cells')
      const cells = this.graph.getSelectedCells()

      // prevent virtual net copy
      const hasVirtualNet = cells.some(cell => {
        return cell.component === 'VirtualNet'
      })
      if (hasVirtualNet) {
        this.$message({
          message: '一个场景仅允许存在一个虚拟网络',
          type: 'error'
        })
        return
      }

      if (cells.length) {
        // this.graph.cleanClipboard()
        this.graph.copy(cells)
        const copyCells = this.graph.getCellsInClipboard()
        this.graph.emit('cells:copy', { cells: copyCells })
      }
      this.graph.stopBatch('copy cells')
      return false
    },
    paste() {
      // 上下文粘贴
      if (!this.graph.isClipboardEmpty()) {
        const nodes = this.graph.getCellsInClipboard()
        let nodePositionX = 0
        let nodePositionY = 0
        if (nodes.length > 1) {
          const nodePositionArr = []
          nodes.forEach(ele => {
            if (ele.shape !== 'Cable') {
              nodePositionArr.push(ele.position())
            }
          })
          nodePositionX = Math.min.apply(Math, nodePositionArr.map(ele => { return ele.x }))
          nodePositionY = Math.min.apply(Math, nodePositionArr.map(ele => { return ele.y }))
        } else {
          nodePositionX = nodes[0].position().x
          nodePositionY = nodes[0].position().y
        }
        const cells = this.graph.paste({
          offset: { dx: this.mousePosition.x - nodePositionX, dy: this.mousePosition.y - nodePositionY },
          edgeProps: {
            zIndex: 0
          }
        })
        this.graph.cleanSelection()
        this.graph.select(cells)
      }
      return false
    },
    goBack() {
      this.$router.push('/targets/scene-targets')
    },
    nextStep() {
      this.fullscreen = false
      setTimeout(() => {
        this.$emit('submit')
      })
    },
    // 调试
    subnetManagementBtnClick(subnetManager) {
      this.graph.cleanSelection()
      this.activeNode = subnetManager
    },
    dnsBtnClick(dnsManager) {
      this.graph.cleanSelection()
      this.activeNode = dnsManager
    },
    debugBtnClick() {
      this.graph.cleanSelection()
      this.activeNode = null
      if (this.curDebuggerStatus === 0) {
        this.debuggerStart()
      } else if (this.curDebuggerStatus === 2) {
        // this.debuggerRelease()
        this.dialogVisible = true
      }
    },
    restDebuggerStatus() {
      this.curDebuggerStatus = 0
      this.isDebuggering = false
      this.sceneTmpUuid = ''
    },
    debuggerStart() {
      if (this.isDebuggering) return
      this.isDebuggering = true
      scenetargetStartup({
        data: {
          id: this.sceneData.id,
          debug: true
        }
      }).then((res) => {
        if (res.status === 0) {
          if (res?.data?.scene_tmp_uuid) {
            this.$message({ message: '调试启动中' })
            this.curDebuggerStatus = 1
            this.sceneTmpUuid = res.data.scene_tmp_uuid
            this.polling(res.data.scene_tmp_uuid, 1) // 开始轮询
          } else {
            this.restDebuggerStatus()
          }
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
          this.restDebuggerStatus()
        }
      }).catch(() => {
        this.restDebuggerStatus()
      })
    },
    scenetargetStartingstatusApi(sceneTmpUuid) {
      return scenetargetStartingstatus({
        scene_tmp_uuid: sceneTmpUuid
      })
    },
    polling(sceneTmpUuid, number) {
      // const maxNumber = 10 * 60
      this.scenetargetStartingstatusApi(sceneTmpUuid).then((res) => {
        if (res.status === 0) {
          if (this._isBeingDestroyed || this._isDestroyed) return

          if (res.data.status === 0) { // 调试启动中
            this.curDebuggerStatus = 1
            this.sceneTmpUuid = sceneTmpUuid
          } else if (res.data.status === 4) { // 快照保存中
            this.curDebuggerStatus = 3
            this.sceneTmpUuid = sceneTmpUuid
          } else if (res.data.status === 3) { // 未调试
            if (this.curDebuggerStatus === 3) {
              this.$message({
                type: 'success',
                message: '保存成功'
              })
              this.reloadGraph()
            }
            return this.restDebuggerStatus()
          } if (res.data.status === 1) { // 调试启动完成
            this.curDebuggerStatus = 2
            this.sceneTmpUuid = sceneTmpUuid
            return this.$message({
              message: '调试启动完成',
              type: 'success'
            })
          } else if (res.data.status === 2) { // 调试失败
            this.restDebuggerStatus()
            return this.$message({
              message: '调试启动失败, 请联系管理员',
              type: 'error'
            })
          }
          // if (number > maxNumber) {
          //   // this.restDebuggerStatus()
          //   return this.$message({
          //     message: '调试启动超时, 请联系管理员',
          //     type: 'error'
          //   })
          // }
          if ([1, 3].includes(this.curDebuggerStatus)) {
            this.pollingST = setTimeout(() => {
              clearTimeout(this.pollingST)
              number++
              this.polling(sceneTmpUuid, number)
            }, 1000)
          }
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
          this.restDebuggerStatus()
        }
      }).catch(() => {
        this.restDebuggerStatus()
      })
    },
    debuggerRelease(isSave) {
      if (this.isReleaseing) return
      this.isReleaseing = true
      scenetargetRelease({
        scene_tmp_uuid: this.sceneTmpUuid,
        save_it: isSave
      }).then(() => {
        this.dialogVisible = false
        this.$message({
          message: '调试已停止',
          type: 'success'
        })
        if (isSave) {
          this.polling(this.sceneTmpUuid, 1) // 开始轮询
        } else {
          this.restDebuggerStatus()
        }
      }).finally(() => {
        this.isReleaseing = false
      })
    }
  },
  render() {
    console.log(this.activeNode)
    let settingComponent = this.activeNode
    const subnetManager = <SubnetManager />
    const dnsManager = <DnsManager / >

    const contextMenu = <ContextMenu slot='context-menu'
      visible={ this.contextMenu.visible } option={this.contextMenu}
      { ...{ on: { 'update:option.visible': val => { this.contextMenu.visible = val } }} }
    />

    const settingComponentFn = this.activeNode?.[SettingComponentRender]
    if (settingComponentFn) {
      settingComponent = settingComponentFn.bind(this)(this)
    }
    this.settingComponent = settingComponent

    const classes = ['topology-editor']
    if (this.fullscreen) {
      classes.push('topology-editor__fullscreen')
    }

    return (
      <div class='app-container' style='padding: 0;width: 100%'>
        <Topology ref='editor' option={ this.editorOption } status={ this.curDebuggerStatus } isReloadingGraph={ this.isReloadingGraph } class={ classes.join(' ') }>
          <div slot='tools' class='editor-tools'>
            <div class='senceName'>{this.sceneData.name}</div>
            <div class='tools-container'>
              <div class='history'>
                <el-button size='small' type='text' onclick={ this.undo }><i class='iconfont icon-fanhui' /></el-button>
                <el-button size='small' type='text' onclick={ this.redo }><i class='iconfont icon-fanhui scaleEle' /></el-button>
              </div>
              <div class='zoom notDisabled'>
                <el-button size='small' type='text' onclick={ this.zoom.bind(this, -0.1) }><i class='el-icon-minus' /></el-button>
                <el-dropdown class='zoom-percent' placement='bottom' onCommand={ this.setZoom }>
                  <el-button size='small' type='text'>{ parseInt(this.scale * 100) }%</el-button>
                  <el-dropdown-menu slot='dropdown' >
                    <el-dropdown-item command='2'>200%</el-dropdown-item>
                    <el-dropdown-item command='1'>100%</el-dropdown-item>
                    <el-dropdown-item command='0.5'>50%</el-dropdown-item>
                    <el-dropdown-item command='0.3'>30%</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button size='small' type='text' onclick={ this.zoom.bind(this, 0.1) }><i class='el-icon-plus' /></el-button>
                <el-button size='small' type='text' onclick={ () => { this.fullscreen = !this.fullscreen } }><i class={this.fullscreen ? 'iconfont icon-guanbiquanping' : 'iconfont icon-quanping1' }/></el-button>
                <el-button size='small' type='text' onclick={ this.centerContent }><i class='iconfont icon-juzhong' /></el-button>
              </div>
            </div>
            <div class='btns'>
              <el-button class={ this.curDebuggerStatus === 2 ? 'notDisabled' : '' } size='small' onclick={ () => { this.subnetManagementBtnClick(subnetManager) } }>子网管理</el-button>
              <el-button class={ this.curDebuggerStatus === 2 ? 'notDisabled' : '' } size='small' onclick={ () => { this.dnsBtnClick(dnsManager) } }>DNS服务器</el-button>
              <el-button class='notDisabled' size='small' onclick={ this.debugBtnClick }>{ this.debuggerStatusMap[this.curDebuggerStatus] }</el-button>
              <el-button class='notDisabled' size='small' onclick={ this.goBack }>取消</el-button>
              <el-button class='notDisabled' size='small' type='primary' onclick={ this.nextStep } >下一步</el-button>
            </div>
          </div>
          {/* { this.activeNode && !this.isPhysical ? <div class='topology-setting' slot='setting'><div class='setting-wrapper'> { settingComponent }</div> </div> : null } */}
          { this.activeNode ? <div class='topology-setting' slot='setting'><div class='setting-wrapper'> { settingComponent }</div> </div> : null }
          { this.contextMenu.visible && contextMenu }
        </Topology>
        <IcrDialog
          title='提示'
          width='350px'
          visible={ this.dialogVisible }
          confirmBtnTxt='是'
          cancelBtnTxt='否'
          {...{
            on: {
              'update:visible': (val) => (this.dialogVisible = val),
              'confirm': () => { this.debuggerRelease(true) },
              'cancel': () => { this.debuggerRelease(false) }
            }
          }}
        >
          <span>是否保存快照？</span>
        </IcrDialog>
      </div>
    )
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/themes/black/vars.scss";
.topology-editor__fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  z-index: 2000;
}

.topology-editor {
  height: 100%;
  &.disabled {
    .editor-tools {
      pointer-events: none;
      .notDisabled {
        pointer-events: all;
      }
    }
  }
  .editor-tools {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 10px 9px 15px;
    border-bottom: 2px solid $--icr-color-input-primary;
    i {
      display: inline-block;
      cursor: pointer;
    }
    .tools-container {
      display: flex;
    }
    .senceName {
      font-size: 16px;
      font-weight: bold;
      max-width: calc(100% - 955px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .history {
      .icon-fanhui {
        font-size: 20px;
      }
      .scaleEle {
        transform: scale(-1,1);
      }
    }
    .history:first-child{
      position: relative;
      &:before{
        display: block;
        content: '';
        position: absolute;
        left: 0px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
      .el-button {
        margin: 0 8px;
      }
    }
    .zoom{
      position: relative;
      font-size: 16px;
      .el-button{
        margin: 0 8px;
      }
      .zoom-percent {
        .el-button{
          padding: 5px 15px;
          margin: 0;
        }
      }
    }
    .zoom>.el-button:last-child{
      margin: 0 8px;
      position: relative;
      &:after{
        display: block;
        content: '';
        position: absolute;
        left: -10px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
    }
     .zoom:after{
        display: block;
        content: '';
        position: absolute;
        left: 0px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
      .zoom:before{
        display: block;
        content: '';
        position: absolute;
        right: 0px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
  }
  .btns{
    display: grid;
    grid-template-columns: .1fr .1fr .1fr .1fr 1fr;
    .el-button:nth-child(4){
      position: relative;
      margin-left: 71px;
      &:after{
        display: block;
        content: '';
        position: absolute;
        right: 104px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
        pointer-events: none;
      }
    }
  }
}

</style>

