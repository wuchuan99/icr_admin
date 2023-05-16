<template>
  <div class="style-container">
    <div class="icrCollapse_item">
      <el-input v-model.trim="config.name" :disabled="disabled" size="mini" />
      <span class="item-title">位置和尺寸</span>
      <el-row :gutter="20" class="item-content">
        <el-col :span="12">
          <el-input v-model="position.x" :disabled="disabled" size="mini"><span slot="prefix">X</span></el-input>
        </el-col>
        <el-col :span="12">
          <el-input v-model="position.y" :disabled="disabled" size="mini"><span slot="prefix">Y</span></el-input>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="item-content">
        <el-col :span="12">
          <el-input v-model="size.width" :disabled="disabled" size="mini" @change="changeWidth"><span slot="prefix">W</span></el-input>
        </el-col>
        <span class="relevance" :class="{disabled: disabled}" @click="data.relevanceFlag = !data.relevanceFlag"><i v-if="data.relevanceFlag" class="iconfont icon-guanlian" /><i v-else class="iconfont icon-quxiaoguanlian" /></span>
        <el-col :span="12">
          <el-input v-model="size.height" :disabled="disabled" size="mini" @change="changeHeight"><span slot="prefix">H</span></el-input>
        </el-col>
      </el-row>
    </div>
    <div v-if="styleObject" class="icrCollapse_item">
      <span class="item-title" style="display:inline-block">组件颜色</span>
      <el-color-picker v-model="styleObject.color" :disabled="disabled" popper-class="noClear" :predefine="predefineColors" style="vertical-align:middle; margin-left:10px" />
    </div>
  </div>
</template>

<script>
import { Node } from '@antv/x6'
import { isEqual } from 'lodash-es'
export default {
  props: {
    data: Object,
    position: Object,
    size: Object,
    styleObject: Object,
    config: Object,
    node: Node
  },
  inject: ['getEditor'],
  data() {
    return {
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsl(181, 100%, 37%)',
        '#ffffff'
      ],
      disabled: false
    }
  },
  watch: {
    position: {
      handler(newVal) {
        const oldPosition = this.node.getPosition()
        const IntegerRegex = /^-?[0-9]*[1-9][0-9]*$/
        const { x, y } = newVal
        if (x && !IntegerRegex.test(x)) {
          if (['0', '-'].includes(x)) {
            this.position.x = x
          } else {
            this.position.x = Math.round(oldPosition.x)
          }
        }
        if (y && !IntegerRegex.test(y)) {
          if (['0', '-'].includes(y)) {
            this.position.y = y
          } else {
            this.position.y = Math.round(oldPosition.y)
          }
        }
      },
      deep: !!1
    },
    size: {
      handler(newVal) {
        const oldSize = this.node.getSize()
        const { width, height } = newVal
        const IntegerRegex = /^[1-9]*[1-9][0-9]*$/
        if (width && !IntegerRegex.test(width)) {
          if (!isNaN(Math.round(width)) && Math.round(width) >= 0) {
            if (width.includes('.')) {
              this.size.width = Math.round(oldSize.width)
            } else {
              this.size.width = Math.round(width)
            }
          } else {
            this.size.width = Math.round(oldSize.width)
          }
        }
        if (height && !IntegerRegex.test(height)) {
          if (!isNaN(Math.round(height)) && Math.round(height) >= 0) {
            if (height.includes('.')) {
              this.size.height = Math.round(oldSize.height)
            } else {
              this.size.height = Math.round(height)
            }
          } else {
            this.size.height = Math.round(oldSize.height)
          }
        }
      },
      deep: !!1
    }
  },
  beforeDestroy() {
    const oldSize = this.node.getSize()
    if (Math.round(this.size.width) !== Math.round(oldSize.width)) {
      return this.changeWidth(this.size.width)
    }
    if (Math.round(this.size.height) !== Math.round(oldSize.height)) {
      this.changeHeight(this.size.height)
    }
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
  },
  methods: {
    changeWidth(val) {
      const oldSize = this.node.getSize()
      let proportion = 0
      if (Math.round(oldSize.width) && val) {
        proportion = (val / Math.round(oldSize.width))
      }
      if (this.data.relevanceFlag) {
        if (proportion) {
          this.size.height = Math.round(this.size.height * proportion)
        } else {
          this.size.height = val
        }
      }
      this.setNodeSize()
    },
    changeHeight(val) {
      const oldSize = this.node.getSize()
      let proportion = 0
      if (Math.round(oldSize.height) && val) {
        proportion = (val / Math.round(oldSize.height))
      }
      if (this.data.relevanceFlag) {
        if (proportion) {
          this.size.width = Math.round(this.size.width * proportion)
        } else {
          this.size.width = val
        }
      }
      this.setNodeSize()
    },
    setNodeSize() {
      if (!isNaN(Math.round(this.size.width)) && !isNaN(Math.round(this.size.height))) {
        if (!isEqual(this.size, this.node.getSize())) {
          this.node.size(Math.round(this.size.width), Math.round(this.size.height))
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .item_title{
//   color:#fff;
//   opacity: 0.6;
// }
// // .item_input{
// //   display: flex;
// //   justify-content: space-between;
// // }
// .position-size {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   row-gap: 10px;
//   .el-input {
//     width: 110px;
//   }
// }
.item-content {
  position: relative;
}
.relevance {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  cursor: pointer;
  &.disabled {
    pointer-events: none;
  }
}
</style>

