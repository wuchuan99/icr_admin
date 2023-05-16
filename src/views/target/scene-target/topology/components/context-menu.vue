<template>
  <div class="topology-context-menu" :style="{ 'left': (option.x + offset.x) + 'px', 'top': (option.y + offset.y )+ 'px' }">
    <div class="topology-context-menu-wrapper">
      <div class="topology-context-menu-item" v-for='(menu, index) in option.menus' :key="index">
        <div v-if="!!menu" class="topology-context-menu-item-option" @click="menuClick(menu)">
          <div>{{ menu.name }}</div>
          <div>{{ menu.shortcutKey }}</div>
        </div>
        <div v-else class="topology-context-menu-item-divider">
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['getGraph', 'getContext', 'getEditor'],
  props: {
    option: Object
  },
  data() {
    return {
      offset: {
        x: 0,
        y: 0
      }
    }
  },
  created() {
    console.log(this)
  },
  mounted() {
    // set offset aviod menu out of view
    const { bottom, right } = this.$el.getBoundingClientRect()
    const graphEL = document.querySelector('.x6-graph-scroller')
    const graphRect = graphEL.getBoundingClientRect()
    const h = bottom - graphRect.bottom
    const w = right - graphRect.right
    if (h > 0) {
      this.offset.y = -h
    }
    if (w > 0) {
      this.offset.x = -w
    }
  },
  methods: {
    menuClick(menu) {
      menu.click && menu.click({
        graph: this.getGraph(),
        contextMenu: this.getContext(),
        editor: this.getEditor()
      })
      this.$emit('update:option.visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.topology-context-menu {
  position: absolute;
  background: #323436;
  border: 2px solid rgba(255,255,255,0.05);
  border-radius: 1px;
  box-shadow: 0px 14px 60px 0px rgb(0 0 0 / 29%);
  user-select: none;
  min-width: 196px;
  z-index: 10;
  hr {
    margin: 13px 0;
    border: 1px solid rgba(255,255,255,0.05);
  }
}

.topology-context-menu-item-option {
  display: flex;
  padding: 10px;
  justify-content: space-between;
  height: 36px;
  &:hover {
    background: #656565;
  }
  div:nth-child(1) {
    margin-right: 36px;
  }
}
</style>
