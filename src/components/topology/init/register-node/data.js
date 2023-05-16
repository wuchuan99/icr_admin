// import Icon from './icon.vue'
import cableoptions from '../create-node/nodes/cable/options'
const ports = {
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
      group: 'top'
    },
    {
      group: 'right'
    },
    {
      group: 'bottom'
    },
    {
      group: 'left'
    }
  ]
}
export default [
  // 左侧拖拽的基础设备节点
  {
    shape: 'custom-image',
    type: 'node',
    options: {
      inherit: 'rect',
      width: 50,
      height: 58,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'image',
          selector: 'image'
        },
        {
          tagName: 'text',
          selector: 'label'
        }
      ],
      attrs: {
        body: {
          stroke: 'transparent',
          fill: 'transparent'
        },
        label: {
          refY: 50,
          fontSize: 12,
          fill: 'rgba(255, 255, 255, 0.6)'
        }
      },
      ports: { ...ports }
    }
  },
  // 拖拽到画布生成的基础节点
  // {
  //   shape: 'image',
  //   type: 'node',
  //   options: {
  //     inherit: 'rect',
  //     width: 50,
  //     height: 50,
  //     markup: [
  //       {
  //         tagName: 'rect',
  //         selector: 'body'
  //       },
  //       {
  //         tagName: 'image',
  //         selector: 'image'
  //       }
  //     ],
  //     attrs: {
  //       body: {
  //         stroke: 'transparent',
  //         fill: 'transparent',
  //         strokeWidth: 0
  //       }
  //     },
  //     ports: { ...ports }
  //   }
  // },
  {
    shape: 'warp-icon',
    type: 'node',
    options: {
      inherit: 'html',
      width: 50,
      height: 50,
      ports: { ...ports }
    }
  },
  // 左侧拖拽的基础矩形节点
  {
    shape: 'baseRect',
    type: 'node',
    options: {
      inherit: 'rect',
      width: 60,
      height: 40,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        }
      ],
      attrs: {
        body: {
          refWidth: -10,
          refHeight: -10,
          refX: 5,
          refY: 5,
          fill: 'transparent',
          stroke: '#ffffff',
          strokeWidth: 2,
          strokeDasharray: 0,
          rx: 0,
          ry: 0
        }
      },
      ports: { ...ports }
    }
  },
  // 左侧拖拽的基础文本节点
  {
    shape: 'baseTextBlock',
    type: 'node',
    options: {
      inherit: 'rect',
      width: 140,
      height: 30,
      label: '这是一个文本节点',
      attrs: {
        body: {
          ref: 'label',
          refWidth: 1,
          // refWidth2: 20,
          refHeight: 1,
          // refHeight2: 20,
          refX: -0.5,
          // refX2: -20,
          refY: -0.5,
          // refY2: -20,
          // xAlign: 'middle',
          // yAlign: 'middle',
          fill: '#fff',
          stroke: 'red',
          rx: 4,
          ry: 4
        },
        label: {
          // text: '这是一个文本节点',
          fill: '#000'
        }
      }
      // ports: { ...ports }
    }
  },
  // 链接线路的基础节点
  {
    shape: 'cable',
    type: 'edge',
    options: {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#25eeca',
          strokeDasharray: 0,
          strokeWidth: 2,
          targetMarker: null
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      router: {
        name: 'manhattan',
        args: {
          padding: 1
        }
      },
      zIndex: 0,
      data: cableoptions.data
    }
  }
]
