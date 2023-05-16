<template>
  <!--
    属性
      content：el-tooltip 属性，文本内容
      effect：el-tooltip 属性，Tooltip 主题，默认 dark
      placement：el-tooltip 属性，Tooltip 显示的方向，默认值为 top
  -->
  <el-tooltip :disabled="disabled" :content="content" :effect="effect" :placement="placement">
    <div ref="content" class="text_ellipsis">
      <span>{{ content }}</span>
    </div>
  </el-tooltip>
</template>

<script>
export default {
  name: 'IcrTooltip',
  props: {
    content: String,
    effect: {
      type: String,
      default: 'dark'
    },
    placement: {
      type: String,
      default: 'top'
    }
  },
  data() {
    return {
      disabled: false
    }
  },
  mounted() {
    const parentNode = this.$refs.content.parentNode
    parentNode.addEventListener('mouseenter', this.handleMouseenter)
  },
  beforeDestroy() {
    const parentNode = this.$refs.content.parentNode
    if (parentNode) {
      parentNode.removeEventListener('mouseenter', this.handleMouseenter)
    }
  },
  methods: {
    handleMouseenter(e) {
      // debugger
      this.disabled = !this.textOverflow(e.target)
    },

    // 判断文本是否溢出
    textOverflow(element) {
      const range = document.createRange()
      range.setStart(element, 0)
      range.setEnd(element, element.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      const computed = window.getComputedStyle(element)
      const padding = (parseInt(computed.paddingLeft, 10) || 0) + (parseInt(computed.paddingRight, 10) || 0)

      return rangeWidth + padding > element.offsetWidth || element.scrollWidth > element.offsetWidth
    }
  }
}
</script>
