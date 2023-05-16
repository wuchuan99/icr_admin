<script>
import './style/index.scss'
import Topology from '@/views/common/_topology'
import { Cable } from './edges'
import {
  // eslint-disable-next-line no-unused-vars
  createDesktopComputer,
  // eslint-disable-next-line no-unused-vars
  createLaptop,
  // eslint-disable-next-line no-unused-vars
  createNetRouter,
  // eslint-disable-next-line no-unused-vars
  createLayer2Switch,
  // eslint-disable-next-line no-unused-vars
  createVirtualNet,
  // eslint-disable-next-line no-unused-vars
  createRectBlock,
  // eslint-disable-next-line no-unused-vars
  createTextBlock
} from './nodes'

/**
 * context-menu (https://element.eleme.io/#/zh-CN/component/cascader)
 * [
 *    {
 *      value: 'xxx',
 *      label: 'xxx',
 *      children: [...]
 *    },
 *    ...
 * ]
 */

export default {
  components: {
    Topology
  },
  provide() {
    return {
      getGraph: () => {
        return this.graph
      },
      getEditor: () => {
        return this
      }
    }
  },
  props: {
    sceneData: {
      type: Object,
      default: () => {}
    },
    option: {
      type: Object,
      default: () => {}
    },
    contextmenuProps: {
      type: Object,
      default: () => {}
    },
    contextmenu: {
      type: Array,
      default: () => []
    },
    fullscreenObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      graph: null,
      contextmenuVisable: false,
      contextmenuEvent: null,
      editorOption: {
        autoResize: true,
        grid: {
          size: 10,
          visible: true,
          args: {
            color: '#5B5D5E', // 网格线/点颜色
            thickness: 1.5 // 网格线宽度/网格点大小
          }
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
          snap: {
            radius: 20
          },
          validateConnection({ targetMagnet }) {
            return !!targetMagnet
          },
          createEdge() {
            const edge = new Cable({
              editor: vm
            })
            return edge
          }
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
        interacting: {
          nodeMovable: false
        },
        mousewheel: {
          enabled: true
        },
        scaling: {
          max: 2.5,
          min: 0.3
        },
        minimap: {
          enabled: true,
          width: 238,
          height: 133,
          padding: 10
        },
        scale: 1,
        fullscreenFlag: false
      }
    }
  },
  beforeDestroy() {
    this.fullscreenObj?.fullTarget && this.fullscreenObj?.otherEle && window.removeEventListener('resize', this.setupGraphSzie)
    this.graph && this.graph.dispose()
  },
  mounted() {
    this.fullscreenObj?.fullTarget && this.fullscreenObj?.otherEle && window.addEventListener('resize', this.setupGraphSzie)
  },
  created() {
    this.editorOption = Object.assign(this.editorOption, this.option)
  },
  methods: {
    init() {
      this.$refs.editor.init()
      this.graph = this.$refs.editor?.graph
      this.graph.vm = this
      this.initEvent()
      this.renderNodes()
      // this.graph.center()
      this.graph.centerContent()
    },
    renderNodes() {
      const nodes = this.sceneData.data.filter(item => item.illustration_info && item.illustration_info.id).map(item => {
        if (item.illustration_info.data && item.id) {
          item.illustration_info.data.id = item.id
          if (item.illustration_info.data.attrs && item.attrs) {
            item.illustration_info.data.attrs.ip_list = item.attrs.ip_list || []
          }
        }
        return item.illustration_info
      })
      console.log(nodes)
      this.graph.fromJSON(nodes)
    },
    initEvent() {
      this.setupNodeEvents()
    },
    setupNodeEvents() {
      this.graph.on('node:click', (e) => {
        this.$emit('show-dialog', e.node.data)
        this.$emit('nodeClick', e)
        this.contextmenuEvent = e
        if (this.contextmenuProps?.lazy) {
          this.contextmenuVisable = false
          this.$nextTick(() => {
            this.contextmenuVisable = true
          })
        } else {
          this.contextmenu.length && (this.contextmenuVisable = true)
        }
      })

      // this.graph.on('node:contextmenu', (e) => {
      //   this.$emit('node-contextmenu', e)
      //   this.contextmenuEvent = e
      //   this.contextmenu.length && (this.contextmenuVisable = true)
      // })

      this.graph.on('scale', ({ sx, sy, ox, oy }) => {
        this.scale = sx
        this.$emit('changeScale', this.scale)
      })

      this.graph.on('blank:click', e => {
        this.$emit('blank:click', e)
        this.contextmenuVisable = false
      })

      this.graph.on('blank:mousedown', e => {
        this.$emit('blank-mousedown')
      })
    },
    contextMenuClickHandler(node) {
      if (node.data?.onclick) {
        node.data?.onclick()
      }
    },
    closeContextMenu() {
      this.contextmenuVisable = false
    },
    changeSize(size) {
      this.zoom(size)
    },
    zoom(factory, options) {
      this.graph.zoom.apply(this.graph, arguments)
      this.scale = this.graph.zoom()
      this.$emit('changeScale', this.scale)
    },
    setZoom(command) {
      this.graph.zoomTo(Number(command))
      this.scale = this.graph.zoom()
      this.$emit('changeScale', this.scale)
    },
    centerContent() {
      this.setZoom(1)
      this.graph.centerContent()
    },
    setFullSceen(fullscreen) {
      this.fullscreenFlag = fullscreen
      this.setupGraphSzie()
    },
    setupGraphSzie() {
      const rootEl = this.fullscreenFlag ? document.body : this.$el
      const editorEl = document.querySelector(this.fullscreenObj.fullTarget)
      const toolsEl = editorEl.querySelector('.tools')
      const w = this.checkoutOtherEle(rootEl, editorEl)
      const h = this.fullscreenFlag ? rootEl.clientHeight - toolsEl.clientHeight - 6 : rootEl.clientHeight
      console.log(w, h)
      this.$nextTick(() => {
        this.graph.resize(w, h)
        this.centerContent()
      })
    },
    checkoutOtherEle(rootEl, editorEl) {
      if (this.fullscreenObj?.otherEle) {
        const stencilEl = editorEl.querySelector(this.fullscreenObj.otherEle)
        return this.fullscreenFlag ? rootEl.clientWidth - stencilEl.clientWidth : rootEl.clientWidth
      } else {
        return rootEl.clientWidth
      }
    }
  },
  render() {
    // context menu
    const props = {
      props: this.contextmenuProps
    }

    if (!this.contextmenuProps?.lazy) {
      props.options = this.contextmenu
    }

    // context menu style
    const style = {
      position: 'absolute',
      top: 0,
      left: 0
    }
    if (this.contextmenuEvent) {
      const rootEl = document.querySelector('.x6-graph-scroller')
      const rootRect = rootEl.getBoundingClientRect()
      style.left = this.contextmenuEvent.e.clientX - rootRect.left + 'px'
      style.top = this.contextmenuEvent.e.clientY - rootRect.top + 'px'
      console.log(rootRect, this.contextmenuEvent, style)
    }

    const contextMenu = (<div >
      <el-cascader-panel
        ref='cascader-panel'
        class='cascader-panel'
        slot='context-menu'
        props={ props }
        style={ style }
        scopedSlots={
          {
            default: ({ node, data }) => {
              return (<div>
                <div class='label'
                  on={{ click: () => {
                    this.contextMenuClickHandler(node)
                  } }}
                > { data.label } </div>
              </div>)
            }
          }
        }
      />
    </div>)

    return (<Topology ref='editor' option={ this.editorOption } class='topology-editor'>
      { this.contextmenuVisable && contextMenu }
    </Topology>)
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
    padding: 9px 10px 9px 30px;
    border-bottom: 2px solid $--icr-color-input-primary;
    i {
      display: inline-block;
      cursor: pointer;
    }

    .history {
      .icon-fanhui {
        font-size: 20px;
      }
      .scaleEle {
        transform: scale(-1,1);
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

// context-menu
::v-deep {
//   .el-cascader-panel {
//     border: none;
//   }
//   .el-cascader-menu {
//     border-right: solid 1px #a6a6a624;
//   }
//   .el-cascader-menu__list {
//     background: #323436;
//   }
  .el-cascader-menu__hover-zone {
    display: none;
  }
  .el-cascader-node__prefix {
    display: none;
  }

  .cascader-panel {
    background: #323436;
    border: 2px solid rgba(255,255,255,0.05);
    border-radius: 1px;
    box-shadow: 0px 14px 60px 0px rgb(0 0 0 / 29%);
    user-select: none;
    .el-cascader-menu {
      border-right: 2px solid rgba(255,255,255,0.05);
      .el-cascader-menu__wrap {
        height: 120px;
        .el-scrollbar__view {
          &.el-cascader-menu__list {
            .el-cascader-node {
              padding: 0;
              .el-cascader-node__label {
                padding: 0;
                .label {
                  padding: 0 30px;
                }
              }
              &.is-active {
                font-weight: normal;
                color: white;
              }
            }
          }
        }
      }
    }
  }
}

</style>

