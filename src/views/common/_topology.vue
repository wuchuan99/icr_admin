<template>
  <div class="topology-editor">
    <div class="topology-body-wrapper">
      <div class="topology-graph" style="flex: 1"><slot name="context-menu" /></div>
      <div class="topology-minimap" />
      <slot />
    </div>
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
export default {
  props: {
    option: {
      type: Object,
      default: () => {}
    },
    status: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      graph: {},
      stencil: {}
    }
  },
  methods: {
    init() {
      this.initGraph()
    },
    initGraph() {
      if (this.option.minimap?.enabled) {
        this.option.minimap.container = this.$el.querySelector('.topology-minimap')
      }

      const config = Object.assign({}, {
        container: this.$el.getElementsByClassName('topology-graph')[0] }, this.option)
      this.graph = new Graph(config)
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
}
.topology-body-wrapper {
  // width: 100%;
  // height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
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
.topology-graph {
  flex: 1;
  cursor: auto;
  height: 100%;
  ::v-deep {
    .x6-node {
      pointer-events: none;
      .graph_node {
        &.laptop,
        &.desktop {
          pointer-events: all;
          cursor: pointer;
        }
      }
    }
    .x6-edge {
      path {
        cursor: default;
      }
    }
  }
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
