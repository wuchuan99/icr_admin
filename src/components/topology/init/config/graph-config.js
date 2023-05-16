export const graphConfig = {
  // background: '#20324E',
  grid: true,
  autoResize: true,
  panning: true,
  history: {
    enabled: true,
    ignoreAdd: false,
    ignoreRemove: false,
    ignoreChange: true
  },
  // scroller: {
  //   enabled: true
  // },
  mousewheel: {
    enabled: true,
    zoomAtMousePosition: true,
    modifiers: 'ctrl',
    minScale: 0.5,
    maxScale: 3
  },
  connecting: {
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    allowLoop: false,
    snap: {
      radius: 20
    },
    validateConnection({ targetMagnet, sourceCell, targetCell }) {
      console.log(targetMagnet, sourceCell, targetCell)
      return !!targetMagnet
    }
  },
  highlighting: {
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#25eeca',
          stroke: '#25eeca'
        }
      }
    }
  },
  // resizing: true,
  // rotating: true,
  selecting: {
    enabled: true,
    rubberband: true,
    showNodeSelectionBox: true,
    pointerEvents: 'none',
    // showEdgeSelectionBox: true,
    modifiers: 'shift'
  },
  snapline: true,
  keyboard: true,
  clipboard: true
}
