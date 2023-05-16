import { Graph } from '@antv/x6'
import registerNodeData from './data'

export default () => {
  for (const item of registerNodeData) {
    if (item.type === 'node') {
      Graph.registerNode(item.shape, item.options, true)
    } else if (item.type === 'edge') {
      Graph.registerEdge(item.shape, item.options, true)
    }
  }
}
