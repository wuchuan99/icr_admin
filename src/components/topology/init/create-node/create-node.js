// import rectangularNode from './nodes/rectangular/options'
// import textNode from './nodes/text/options'
import layerTwoSwitchesNode from './nodes/layer-two-switches/options'
// import layerThreeSwitchesNode from './nodes/layer-three-switches/options'
import routerNode from './nodes/router/options'
import desktopNode from './nodes/desktop/options'
import notebookNode from './nodes/notebook/options'
import virtualNetworkNode from './nodes/virtual-network/options'
const createNodeByShapes = (graph, shapes) => {
  return shapes.map((item) =>
    graph.createNode({
      shape: 'custom-image',
      label: item.label,
      attrs: {
        image: {
          'xlink:href': item.image,
          ...item.attrs
        }
      },
      data: {
        ...item.data,
        icon: item.icon
      } || {}
    })
  )
}

export default (graph, stencil) => {
  // 创建基本形状节点
  // stencil.load(createNodeByShapes(graph, [rectangularNode, textNode]), 'basis')

  // 创建终端设备节点
  stencil.load(createNodeByShapes(graph, [desktopNode, notebookNode]), 'terminal')

  // 创建网络设备节点
  const networkShapes = [
    routerNode,
    layerTwoSwitchesNode,
    // layerThreeSwitchesNode,
    virtualNetworkNode
  ]
  stencil.load(createNodeByShapes(graph, networkShapes), 'network')
}
