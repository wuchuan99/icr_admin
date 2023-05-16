<template>
  <div class="topology-editor" :class="{disabled: ([1, 2, 3].includes(status) || isReloadingGraph)}">
    <div class="topology-tools">
      <slot name="tools" />
    </div>
    <div class="topology-body-wrapper" :class="{onlyPc: status === 2}">
      <div class="topology-stencil" />
      <div class="topology-graph" style="flex: 1"><slot name="context-menu" /></div>
      <div class="topology-minimap" />
      <transition name="device-config-fade-transform">
        <slot name="setting" />
      </transition>
      <slot />
    </div>
  </div>
</template>

<script>
import { Graph, Addon } from '@antv/x6'
export default {
  props: {
    option: {
      type: Object,
      default: () => {}
    },
    status: {
      type: [Number, String],
      default: 0
    },
    isReloadingGraph: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      graph: {},
      stencil: {}
    }
  },
  mounted() {
    // this.init()
  },
  methods: {
    init() {
      this.initGraph()
      this.initScentil()
    },
    initGraph() {
      if (this.option.minimap?.enabled) {
        this.option.minimap.container = this.$el.querySelector('.topology-minimap')
      }

      const config = Object.assign({}, {
        container: this.$el.getElementsByClassName('topology-graph')[0] }, this.option)
      this.graph = new Graph(config)
    },
    initScentil() {
      const stencilConfig = this.option?.stencil
      if (!stencilConfig) return

      stencilConfig.target = this.graph
      this.stencil = new Addon.Stencil(stencilConfig)
      const stencilContainer = this.$el.getElementsByClassName('topology-stencil')[0]
      if (stencilContainer) {
        stencilContainer.appendChild(this.stencil.container)
      }

      stencilConfig.groups?.length && stencilConfig.groups.forEach(group => {
        const nodes = group.nodes.map(node => this.graph.createNode(node))
        this.stencil.load(nodes, group.name)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/themes/black/vars.scss";

$topologyToolsHeight:48px;

.topology-editor {
  display: flex;
  flex-wrap: wrap;
  background: $--icr-bg-color-regular;
  border: 2px solid $--icr-color-input-primary;
  position: relative;
  &.disabled {
    .topology-body-wrapper{
      .topology-stencil {
        &::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          cursor: not-allowed;
        }
      }
      .topology-minimap {
        z-index: 10;
      }
    }
  }
}
.topology-tools {
  height: $topologyToolsHeight;
  width: 100%;
}
.topology-body-wrapper {
  width: 100%;
  height: calc(100% - #{$topologyToolsHeight});
  display: flex;
  align-items: center;
  position: absolute;
  top: $topologyToolsHeight;
  overflow: hidden;
  ::v-deep {
    .x6-graph-scroller {
      .x6-graph-scroller-content {
        .x6-graph-scroller-background,
        .x6-graph-grid {
          cursor: default;
        }
      }
    }
  }

}
.topology-stencil {
  flex: 1;
  height: 100%;
  min-width: 226px;
  max-width: 234px;
  position: relative;
  &.disabled {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      cursor: not-allowed;
    }
  }
}
.topology-graph {
  flex: 1;
  cursor: auto;
  height: 100%;
}
.topology-setting {
  height: 100%;
  position: absolute;
  right: 0;
}
.topology-minimap {
  position: absolute;
  right: 10px;
  top:10px;
  ::v-deep {
    .x6-widget-minimap {
      background: $--icr-bg-color-regular;
      border:2px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;
      .x6-graph {
        box-shadow: none;
        cursor: default;
      }
      .x6-widget-minimap-viewport {
        cursor: grab;
      }
    }
  }
}
</style>

<style lang="scss">
@import "@/styles/themes/black/vars.scss";
.topology-editor {
  &.disabled {
    .topology-body-wrapper {
      .x6-graph-scroller {
        .x6-graph-scroller-content {
          pointer-events: none;
          .x6-graph-scroller-background {
            pointer-events: all;
            cursor: not-allowed;
          }
          .x6-graph-svg {
            .x6-cell {
              pointer-events: none !important;
              .x6-port {
                display: none !important;
              }
            }
          }
          .topology-context-menu,
          .x6-widget-transform {
            display: none;
          }
        }
      }
    }
    .onlyPc {
      .x6-graph-scroller {
        .x6-graph-scroller-content {
          pointer-events: all;
          .x6-graph-svg {
            .x6-cell {
              &.x6-edge {
                pointer-events: all !important;
              }
              .graph_node {
                &.laptop,
                &.desktop,
                &.netRouter,
                &.layer2Switch {
                  pointer-events: all;
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
      .topology-minimap {
        z-index: 0 !important;
      }
    }
  }
  .x6-widget-stencil {
    background-color: transparent;
    padding: 12px 0;
    border-right: 2px solid rgba(255, 255, 255, 0.1);
    .x6-widget-stencil-title {
      background-color: transparent;
      display: none;
    }
    .x6-widget-stencil-search {
      position: relative;
      padding: 0 10px;
      input {
        width: 100%;
        margin: 0;
        padding-left: 38px;
        background-color: #47484A;
        border: none;
        border-radius: 4px;
        color: #fff;
        font-size: 14px;
        &::-webkit-input-placeholder{
          font-size: 14px;
          opacity: .4;
          color: #E0F1FF;
        }
      }
      .sarchIcon {
        position: absolute;
        left: 20px;
        top: 6px;
        color: #fff;
        z-index: 10;
        font-size: 16px;
      }
    }
    .x6-widget-stencil-content {
      top: 60px;
      right: 0;
      left: 0;
      bottom: 0;
      @import '@/styles/themes/black/customScroll.scss';
      &::-webkit-scrollbar {
        width: 4px;
      }
      .x6-widget-stencil-group {
        position: relative;
       border-bottom:1px solid $--icr-border-color;
        > .x6-widget-stencil-group-title  {
          font-family: MicrosoftYaHei, MicrosoftYaHei-Regular;
          background-color: transparent;
          opacity: .6;
          font-size: 14px;
          color: #fff;
          padding: 0 10px;
          &::before {
            display: none;
          }
          &::after {
            content: '';
            border: 5px solid transparent;
            border-bottom: 6px solid rgba(255, 255, 255, 0.6);
            position: absolute;
            top: 7px;
            right: 10%;
          }
        }
        &.collapsed .x6-widget-stencil-group-title {
          &::after {
            transform: rotate(180deg);
            top: 14px;
          }
        }
      }
    }
  }
  .x6-graph {

    .x6-widget-selection {
      .x6-widget-selection-inner {
        box-shadow: none;
      }
      .x6-widget-selection-box {
        box-shadow: none;
      }
    }
  }
  .x6-widget-stencil-group .x6-graph{
    // height: 110px !important;
  }
  .topology-setting {
    .el-tab-pane>.el-input:first-child {
      width: 90%;
      margin-left: 5%;
    }
  }
}

</style>
