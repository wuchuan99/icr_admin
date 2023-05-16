import { Shape, Graph } from '@antv/x6'
import CableSetting from './cable'
import Vue from 'vue'
import { cloneDeep, debounce, isEqual } from 'lodash-es'
import {
  networkElementCableAdd,
  networkElementCableDelete,
  networkElementCableUpdate
} from '@/api/scene'

const defaultEdgeStyle = {
  zIndex: 0,
  markup: [
    {
      tagName: 'path',
      selector: 'wrap',
      groupSelector: 'lines',
      attrs: {
        fill: 'none',
        cursor: 'pointer',
        stroke: 'transparent',
        strokeLinecap: 'butt'
      }
    },
    {
      tagName: 'path',
      selector: 'line',
      groupSelector: 'lines',
      attrs: {
        fill: 'none',
        pointerEvents: 'none'
      }
    }
  ],
  attrs: {
    line: {
      stroke: '#25eeca',
      strokeWidth: 2,
      targetMarker: null
    }
  },
  router: {
    name: 'manhattan',
    args: {
      padding: 1
    }
  },
  connector: {
    name: 'rounded'
  }
}

const CableData = {
  id: '',
  attrs: {
    name: '连接线',
    from: '',
    from_index: '',
    to: '',
    to_index: '',
    delay: 0,
    speed_limit: 0,
    package_loss: 0
  },
  source: null,
  target: null
}

export class Cable extends Shape.Edge {
  constructor(option) {
    if (option.editor) {
      super({
        ...cloneDeep(defaultEdgeStyle),
        data: cloneDeep(CableData)
      })
      this.editor = option.editor
    } else {
      super(option)
    }
    this.onUpdated = debounce(this.update, 500)
  }
  onConnected(sceneId, edge, editor) {
    return this.onAdded(sceneId, edge, editor)
  }

  onAdded(sceneId, edge, editor) {
    console.log('新增数据', this.data.attrs.name)
    return networkElementCableAdd({
      data: {
        scene_id: sceneId,
        attrs: {
          ...this.data.attrs,
          delay: this.data.attrs.delay || 0,
          speed_limit: this.data.attrs.speed_limit || 0,
          package_loss: this.data.attrs.package_loss || 0
        },
        illustration_info: edge.toJSON()
      }
    }).then(res => {
      if (res.status === 0) {
        const target = edge.getTargetNode()
        const source = edge.getSourceNode()
        this.data.id = res.data?.id || ''
        this.data.attrs.from = source.data.id
        this.data.attrs.to = target.data.id
        this.data.source = {
          nodeId: source.id,
          id: source.data.id,
          component: source.component
        }

        this.data.target = {
          nodeId: target.id,
          id: target.data.id,
          component: target.component
        }
        console.log(editor?.activeNode?.id, edge.id)
        if (editor?.activeNode?.id !== edge.id) {
          this.update()
        }
      }
    })
  }

  update() {
    if (this.data.id) {
      console.log('更新数据', this.data.attrs.name)
      networkElementCableUpdate({
        data: {
          id: this.data.id,
          attrs: {
            ...this.data.attrs,
            delay: this.data.attrs.delay || 0,
            speed_limit: this.data.attrs.speed_limit || 0,
            package_loss: this.data.attrs.package_loss || 0
          },
          illustration_info: this.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          const source = this.getSourceNode()
          const target = this.getTargetNode()
          const source_index = source.data.connections.findIndex(it => it.id === this.id)
          const source_connections = cloneDeep(source.data.connections)
          const source_cable = {
            id: this.id,
            self_id: source.data.id,
            dev_id: target.data.id,
            self_eth_id: this.data.attrs.from_index || '',
            dev_eth_id: this.data.attrs.to_index || ''
          }
          if (source_index > -1) {
            source_connections.splice(source_index, 1, source_cable)
          } else {
            source_connections.push(source_cable)
          }
          console.log(source.data.connections, source_connections)
          if (!isEqual(source.data.connections, source_connections)) {
            source.updateData({
              connections: source_connections
            })
          }

          const target_index = target.data.connections.findIndex(it => it.id === this.id)
          const target_connections = cloneDeep(target.data.connections)
          const target_cable = {
            id: this.id,
            self_id: target.data.id,
            dev_id: source.data.id,
            self_eth_id: this.data.attrs.to_index || '',
            dev_eth_id: this.data.attrs.from_index || ''
          }
          if (target_index > -1) {
            target_connections.splice(target_index, 1, target_cable)
          } else {
            target_connections.push(target_cable)
          }
          console.log(target.data.connections, target_connections)
          if (!isEqual(target.data.connections, target_connections)) {
            target.updateData({
              connections: target_connections
            })
          }
        }
      })
    }
  }

  onRemoved() {
    return networkElementCableDelete({
      data: {
        type: 1,
        ids: [this.data.id]
      }
    })
  }

  settingComponent() {
    // current instance
    const self = Vue.observable(this.activeNode)

    // TODO
    return (
      <CableSetting key={self.id} edge={self} />
    )
  }
}

Graph.registerEdge('Cable', Cable, true)

