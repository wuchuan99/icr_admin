<template>
  <el-tabs stretch>
    <el-tab-pane label="配置">
      <div class="icrCollapse_item">
        <el-input v-model="data.attrs.name" :disabled="disabled" size="mini" placeholder="连接线" />
      </div>
      <IcrCollapse title="链路设置">
        <div class="link-settings">
          <span>链路带宽(MBPS)</span>
          <el-input-number
            ref="speed_limit"
            v-model="data.attrs.speed_limit"
            size="mini"
            :min="0"
            :max="10000"
            :disabled="disabled"
            @input.native="disposalRange(data.attrs, 'speed_limit', null, 0, 10000)"
          />
          <span>丢包率(%)</span>
          <el-input-number
            ref="package_loss"
            v-model="data.attrs.package_loss"
            size="mini"
            :min="0"
            :max="100"
            :disabled="disabled"
            @input.native="disposalRange(data.attrs, 'package_loss', null, 0, 100)"
          />
          <span>延迟(MS)</span>
          <el-input-number
            ref="delay"
            v-model="data.attrs.delay"
            size="mini"
            :min="0"
            :max="10000"
            :disabled="disabled"
            @input.native="disposalRange(data.attrs, 'delay', null, 0, 10000)"
          />
        </div>
      </IcrCollapse>
      <IcrCollapse title="接口设置">
        <div class="interface-settings">
          <template v-if="pcToBottom">
            <template v-if="target.component != 'VirtualNet'">
              <div class="setting-title"> <i class="mark" style="background: #FF9FC8" /> 组件: {{ target.data.name || target.data.attrs.name }}</div>
              <span>网络接口</span>
              <el-select v-model="data.attrs.to_index" :disabled="disabled" size="mini" placeholder="请选择" :clearable="true">
                <el-option
                  v-for="item in targetOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </template>
            <template v-if="source.component != 'VirtualNet'">
              <div class="setting-title"> <i class="mark" style="background: #FFBC99" /> 组件: {{ source.data.name || source.data.attrs.name }}</div>
              <span>网络接口</span>
              <el-select v-model="data.attrs.from_index" :disabled="disabled" size="mini" placeholder="请选择" :clearable="true">
                <el-option
                  v-for="item in sourceOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </template>
          </template>
          <template v-else>
            <template v-if="source.component != 'VirtualNet'">
              <div class="setting-title"> <i class="mark" style="background: #FFBC99" /> 组件: {{ source.data.name || source.data.attrs.name }}</div>
              <span>网络接口</span>
              <el-select v-model="data.attrs.from_index" :disabled="disabled" size="mini" placeholder="请选择" :clearable="true">
                <el-option
                  v-for="item in sourceOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </template>
            <template v-if="target.component != 'VirtualNet'">
              <div class="setting-title"> <i class="mark" style="background: #FF9FC8" /> 组件: {{ target.data.name || target.data.attrs.name }}</div>
              <span>网络接口</span>
              <el-select v-model="data.attrs.to_index" :disabled="disabled" size="mini" placeholder="请选择" :clearable="true">
                <el-option
                  v-for="item in targetOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </template>
          </template>

        </div>
      </IcrCollapse>
    </el-tab-pane>
    <el-tab-pane label="样式">
      <div class="icrCollapse_item">
        <el-input v-model="data.attrs.name" :disabled="disabled" size="mini" placeholder="连接线" />
        <div class="link-settings" style="margin-top:20px">
          <span>线条类型</span>
          <div class="lineType-settings">
            <el-button
              type="text"
              :class="{active: connector === 'rounded'}"
              :disabled="disabled"
              title="曲线"
              @click="connectorChange('rounded')"
            >
              <i class="iconfont icon-lianjiexian" />
            </el-button>
            <el-button
              type="text"
              :class="{active: connector === 'normal'}"
              :disabled="disabled"
              title="直线"
              @click="connectorChange('normal')"
            >
              <i class="iconfont icon-zhixian" />
            </el-button>
          </div>
          <span>线条颜色</span>
          <el-color-picker
            v-model="attrs.line.stroke"
            size="mini"
            popper-class="noClear"
            :predefine="predefineColors"
            :disabled="disabled"
            style="margin-left: -4px"
          />
          <span>线条样式</span>
          <el-select v-model="lineStyle" :disabled="disabled" size="mini" @change="lineStyleChange">
            <el-option
              v-for="(item, key) in lineStyles"
              :key="key"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span>线条粗细(px)</span>
          <el-input-number
            ref="strokeWidth"
            v-model="attrs.line.strokeWidth"
            size="mini"
            :min="1"
            :max="10"
            :disabled="disabled"
            @input.native="disposalRange(attrs.line, 'strokeWidth', null, 1, 10)"
          />
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { Shape } from '@antv/x6'
import IcrCollapse from '../../components/collapse.vue'
import { isEqual, cloneDeep } from 'lodash-es'
import { disposalRange } from '@/utils'

// eslint-disable-next-line prefer-const
let normalStyle = '______________'
// eslint-disable-next-line prefer-const
let dashStyle = '---------------'

const lineStyles = new Map([
  [normalStyle, {
    strokeDasharray: 0
  }],
  [dashStyle, {
    strokeDasharray: 5
  }]
])

export default {
  components: { IcrCollapse },
  props: {
    edge: [Object, Shape.Edge]
  },
  inject: ['getEditor'],
  data() {
    return {
      target: this.edge.getTargetNode(),
      source: this.edge.getSourceNode(),
      attrs: cloneDeep(this.edge.attrs),
      data: this.edge.data,
      lineStyle: '',
      lineStyles: Array.from(lineStyles).map((v) => {
        return { label: v[0], value: v[0] }
      }),
      connector: '',
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
        'rgb(37, 238, 202)'
      ]
    }
  },
  computed: {
    pcToBottom() { // 台式、笔记本的关于Edges的配置页中接口设置：调整台式笔记本的显示顺序，保持放在最底部
      return !['desktop', 'laptop'].includes(this.target.component) && ['desktop', 'laptop'].includes(this.source.component)
    },
    isSwitch() {
      // 两端设备是否都是交换机
      return this.source.component === 'Layer2Switch' && this.target.component === 'Layer2Switch'
    },
    sourceOptions() {
      const network_list = this.source.data.attrs.nics || this.source.data.attrs.inf || this.source.data.attrs.port_info || []
      let options = network_list.filter((it) => {
        return !this.source.data.connections.some((item) => {
          return (item.id !== this.edge.id && item.self_eth_id === it.id)
        })
      }).map((item) => ({
        port_mode: item.port_mode || '',
        name: item.name || item.eth_name || item.port_name,
        id: item.id
      }))

      // 添加都是交换机过只显示trunk模式的逻辑
      if (this.isSwitch) {
        options = options.filter(it => it.port_mode === 'trunk')
      }
      return options
    },
    targetOptions() {
      const network_list = this.target.data.attrs.nics || this.target.data.attrs.inf || this.target.data.attrs.port_info || []
      let options = network_list.filter((it) => {
        return !this.target.data.connections.some((item) => {
          return (item.id !== this.edge.id && item.self_eth_id === it.id)
        })
      }).map((item) => ({
        port_mode: item.port_mode || '',
        name: item.name || item.eth_name || item.port_name,
        id: item.id
      }))

      // 添加都是交换机只显示trunk模式的逻辑
      if (this.isSwitch) {
        options = options.filter(it => it.port_mode === 'trunk')
      }
      return options
    },
    disabled() {
      const editor = this.getEditor()
      const status = editor.curDebuggerStatus
      return [1, 2, 3].includes(status)
    }
  },
  watch: {
    attrs: {
      handler(newVal) {
        if (!isEqual(newVal, this.edge.attrs)) {
          this.edge.setAttrs({ ...newVal })
        }
        this.edge.onUpdated()
      },
      deep: !!1
    },
    data: {
      handler() {
        this.edge.onUpdated()
      },
      deep: !!1
    }
  },
  created() {
    this.lineStyle = normalStyle
    if (this.attrs.line.strokeDasharray === 5) {
      this.lineStyle = dashStyle
    }
    const connector = this.edge.getConnector()
    this.connector = connector?.name || ''
  },
  mounted() {
    console.log(this)
    this.edge.on('change:attrs', ({ current }) => {
      this.attrs = cloneDeep(current)
    })
  },
  methods: {
    disposalRange() {
      disposalRange.apply(this, arguments)
    },
    lineStyleChange(newVal) {
      this.attrs.line = {
        ...this.attrs.line,
        ...lineStyles.get(newVal)
      }
    },
    connectorChange(newVal) {
      if (this.connector === newVal) {
        return
      }
      this.connector = newVal
      let router = {
        name: 'normal'
      }
      const connector = {
        name: newVal
      }
      if (newVal === 'rounded') {
        connector.args = {
          radius: 8
        }
        router = {
          name: 'manhattan',
          args: {
            padding: 1
          }
        }
      }
      this.edge.setConnector(connector)
      this.edge.setRouter(router)
      this.edge.onUpdated()
    }
  }
}
</script>

<style lang="scss" scoped>
.lineType-settings{
   display: grid;
   grid-template-columns: .1fr .1fr;
   .active {
    background-color: rgba(255, 255, 255, 0.2);
   }
}
.link-settings {
  line-height: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 5px;
  column-gap: 2px
}
.interface-settings {
  display: grid;
  grid-template-columns: .7fr 1fr;
  row-gap: 10px;
  column-gap: 2px;
  .setting-title {
    grid-column: 1/3;
  }
  .mark {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 50%;
    margin-right: 5px;
  }
  &>span{
    line-height: 30px;
  }
}
.line-style {
  display: grid;
  grid-template-columns: 1fr 3fr 3fr;
  &>div{
    color: #fff;
    text-align: center;
  }
}
</style>
