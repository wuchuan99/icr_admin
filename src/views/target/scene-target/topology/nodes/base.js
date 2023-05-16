import { isEqual, cloneDeep } from 'lodash-es'

export const SettingComponentRender = 'settingComponent'

// default style
const defaultNodeStyle = {
  position: {
    x: 0,
    y: 0
  },
  size: {
    width: 36,
    height: 36
  }
}

// default ports
const defaultPorts = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#25eeca',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#25eeca',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#25eeca',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#25eeca',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden'
          }
        }
      }
    }
  },
  items: [
    {
      id: 'port1',
      group: 'top'
    },
    {
      id: 'port2',
      group: 'right'
    },
    {
      id: 'port3',
      group: 'bottom'
    },
    {
      id: 'port4',
      group: 'left'
    }
  ]
}

export const baseMixin = {
  data() {
    const { getNode, getGraph } = this.$options.provide()
    const node = getNode()
    const graph = getGraph()
    return {
      graph,
      node,
      ...cloneDeep(defaultNodeStyle),
      ports: cloneDeep(defaultPorts),
      isInGraph: false,
      dragging: false
    }
  },
  created() {
    this.data = cloneDeep(this.node.getData())
    const { width, height } = this.node.size()
    this.size = cloneDeep({
      width: Math.round(width),
      height: Math.round(height)
    })
    const { x, y } = this.node.getPosition()
    this.position = cloneDeep({
      x: Math.round(x),
      y: Math.round(y)
    })
    // debugger
    const fontSize = this.size.width > this.size.height ? this.size.height : this.size.width
    this.data.styleObject.fontSize = fontSize + 'px'
  },
  mounted() {
    const view = this.graph.findView(this.node)
    const self = this
    if (view?.on) {
      view.on('node:resize', function() {
        const transform = self.graph.transform.widgets.get(self.node)
        // set preserveAspectRatio
        if (transform) {
          transform.options.preserveAspectRatio = self.node.data.relevanceFlag
        }
      })
    }

    this.isInGraph = Array.from(document.querySelectorAll('.topology-graph')).some(graph => graph.contains(view?.container))
    this.dragging = !!document.querySelector('.x6-widget-dnd.dragging')?.contains(view?.container)
    this.node.position(this.position)
    this.node.on('change:position', ({ current }) => {
      const { x, y } = this.node.getPosition()
      this.position = { x: Math.round(x), y: Math.round(y) }
      this.isInGraph && this.onUpdated && this.onUpdated()
    })

    this.node.size(this.size)
    this.node.on('change:size', ({ current }) => {
      const { width, height } = this.node.getSize()
      this.size = { width: Math.round(width), height: Math.round(height) }
      const fontSize = this.size.width > this.size.height ? this.size.height : this.size.width
      this.data.styleObject.fontSize = fontSize + 'px'
      this.isInGraph && this.onUpdated && this.onUpdated()
    })

    // watch zIndex
    this.zIndex && this.node.setZIndex(this.zIndex)
    this.node.on('change:zIndex', () => {
      this.isInGraph && this.onUpdated && this.onUpdated()
    })

    // init data
    // debugger
    this.node.setData(cloneDeep(this.data))
    this.node.on('change:data', ({ current }) => {
      this.data = cloneDeep(current)
    })

    // init ports
    // setup ports when node in graph
    if (this.node.model?.graph) {
      this.node.setProp('ports', this.ports)
    }

    this.node.on('change:ports', ({ current }) => {
      this.ports = current
    })
    this.applyWatchers()
  },
  methods: {
    applyWatchers() {
      this.$watch('position',
        function(newVal) {
          if ((newVal.x || newVal.x === 0) && (newVal.y || newVal.y === 0)) {
            if (!isNaN(Math.round(newVal.x)) && !isNaN(Math.round(newVal.y))) {
              if (!isEqual(newVal, this.node.position())) {
                this.node.position(Math.round(newVal.x), Math.round(newVal.y))
              }
            }
          }
        }, { deep: !!1 })

      // this.$watch('size',
      //   function(newVal) {
      //     if (!isNaN(Math.round(newVal.width)) && !isNaN(Math.round(newVal.height))) {
      //       if (!isEqual(newVal, this.node.getSize())) {
      //         // this.node.size(Math.round(newVal.width), Math.round(newVal.height))
      //       }
      //     }
      //   }, { deep: !!1 })

      this.$watch('data',
        function(newVal) {
          console.log(this.isInGraph)
          if (!isEqual(newVal, this.node.getData())) {
            this.node.updateData(newVal)
          }
          this.isInGraph && this.onUpdated && this.onUpdated()
        }, { deep: !!1 })

      this.$watch('ports',
        function(newVal) {
          if (!isEqual(newVal, this.node.getProp('ports'))) {
            this.node.setProp('ports', this.ports)
          }
        }, { deep: !!1 })
    }
  },
  beforeDestroy() {
    const graphEl = document.querySelector('.topology-graph')
    setTimeout(() => {
      if (
        graphEl &&
        graphEl.children.length > 0 &&
        this.graph.needRemoveNodes?.length &&
        this.graph.needRemoveNodes.indexOf(this.node) >= 0
      ) {
        const index = this.graph.needRemoveNodes.indexOf(this.node)
        this.graph.needRemoveNodes.splice(index, 1)
        this.isInGraph && this.onRemoved && this.onRemoved()
      }
    })
  }
}
