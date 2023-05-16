<template>
  <div class="graph_node textBlock">
    <div v-if="!isInGraph" style="height: 100%">
      <i class="iconfont icon-wenben" :style="data.styleObject" />
      <div v-if="!dragging" class="graph_node_label">文本</div>
    </div>
    <div
      v-else
      :contenteditable="editable"
      class="text-input"
      :style="{color: data.styleObject.color}"
      @dblclick="enableEdit"
    >
      {{ data.text }}
    </div>
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
// should import x6-vue-shappe
import '@antv/x6-vue-shape'
import NodeStyle from '../components/base-node-style.vue'
import { baseMixin } from './base'
import { SettingComponentRender } from './base'
import { cloneDeep, debounce } from 'lodash-es'
import {
  scenetargetTextAdd,
  scenetargetTextUpdate,
  scenetargetTextDelete
} from '@/api/scene'

function selectElementContents(el) {
  var range = document.createRange()
  range.selectNodeContents(el)
  var sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

// business logic data
const TextBlockData = {
  id: '',
  attrs: {
    name: '文本'
  },
  connections: [],
  text: 'Text',
  styleObject: {
    fontSize: '36px',
    color: 'rgba(255, 255, 255, 1)'
  },
  relevanceFlag: true
}

const TextBlock = {
  name: 'TextBlock',
  mixins: [baseMixin],
  data() {
    return {
      editable: false,
      data: cloneDeep(TextBlockData)
    }
  },
  created() {
    this.onUpdated = debounce(this.update, 300)
    console.log(this.data)
  },
  mounted() {
    this.node.removePorts(this.node.getPorts())
  },
  methods: {
    enableEdit() {
      this.editable = true
      const inputEl = this.$el.querySelector('.text-input')
      selectElementContents(inputEl)
    },
    setFocus() {
      const inputEl = this.$el.querySelector('.text-input')
      inputEl.focus()
    },
    focusout() {
      const sel = window.getSelection()
      sel.removeAllRanges()
      this.editable = false
      const inputEl = this.$el.querySelector('.text-input')
      if (inputEl) {
        const text = inputEl.innerText.trim()
        if (text) {
          this.data.text = text
        } else {
          this.graph.removeNode(this.node)
        }
      }
    },
    onAdded(sceneId, node) {
      console.log('新增数据')
      scenetargetTextAdd({
        data: {
          scene_id: sceneId,
          illustration_info: node.toJSON()
        }
      }).then((res) => {
        if (res.status === 0) {
          this.data.id = res?.data?.id || ''
        }
      })
    },
    update() {
      if (this.data.id) {
        console.log('更新数据')
        scenetargetTextUpdate({
          data: {
            id: this.data.id,
            illustration_info: this.node.toJSON()
          }
        })
      }
    },
    onRemoved() {
      return scenetargetTextDelete({
        data: {
          type: 1,
          id: this.data.id
        }
      })
    },
    // for render setting component
    [SettingComponentRender]() {
      // TODO
      const vm = this
      return (
        <el-tabs key={vm.node.id} stretch>
          <el-tab-pane label='样式'>
            <NodeStyle
              node={ this.node }
              config={vm.data.attrs}
              position={ vm.position }
              size={ vm.size }
              style-object={vm.data.styleObject}
              data={vm.data}
            />
          </el-tab-pane>
        </el-tabs>
      )
    }
  }
}

export function createTextBlock() {
  return { shape: 'vue-shape', component: 'TextBlock', data: cloneDeep(TextBlockData) }
}

// register component https://x6.antv.vision/zh/docs/tutorial/advanced/react#%E6%B8%B2%E6%9F%93-vue-%E8%8A%82%E7%82%B9
Graph.registerVueComponent('TextBlock', TextBlock, true)

export default TextBlock
</script>

<style lang="scss" scoped>
.text-input[contenteditable="true"] {
  cursor: auto;
}
</style>
