<template>
  <div class="device-config-common">
    <tab
      class="device-config-common-tab"
      :tab-active.sync="tabActive"
      :tab-list="tabList"
      @tab-click="tabClick"
    />
    <div class="main">
      <div class="node-cell-name">
        <el-input v-model="nodeData.name" placeholder="请给组件命名" />
      </div>
      <keep-alive>
        <component
          :is="componentName"
          ref="child"
          :form-data="formData"
          :device-type="deviceType"
          :node-data="nodeData"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Tab from './component/tab.vue'
import Style from './component/style.vue'
import Config from './component/config.vue'
import System from './component/system.vue'
import CableStyle from './cable/style.vue'
import CableConfig from './cable/config.vue'
import { debounce, cloneDeep, isEqual } from 'lodash-es'
export default {
  name: 'DeviceConfig',
  components: {
    Tab,
    Style,
    Config,
    System,
    CableStyle,
    CableConfig
  },
  props: {
    nodeData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      componentName: '',
      prop: '',
      // configData: {},
      // tabList: [],
      tabActive: '',
      // deviceType: ''
      oldNodeData: {}
    }
  },
  computed: {
    tabList() {
      return this.nodeData.tabList
    },
    configData() {
      return this.nodeData.configData
    },
    deviceType() {
      return this.nodeData.deviceType
    },
    formData() {
      return this.configData[this.prop]
    }
  },
  watch: {
    nodeData: {
      handler(val) {
        if (!isEqual(val, this.oldNodeData)) {
          this.oldNodeData = cloneDeep(val)
          this.debounceUpdate()
        }
      },
      deep: true
    }
  },
  created() {
    this.oldNodeData = cloneDeep(this.nodeData)
    this.restTabActive()
  },
  methods: {
    debounceUpdate: debounce(
      function() {
        this.$emit('rest-style', 'node')
      },
      500
    ),
    tabClick(tab) {
      this.componentName = tab.name
      this.prop = tab.$attrs.prop
      // setTimeout(() => {
      //   this.$refs.child.setData(this.configData[this.prop])
      // })
    },
    setData(data, isRestTabActive = false) { // 设置表单数据
      this.configData = data.configData
      this.tabList = data.tabList
      this.deviceType = data.deviceType
      if (this.tabList && this.tabList.length) {
        isRestTabActive && this.restTabActive()
        setTimeout(() => {
          this.$refs.child.setData(this.configData[this.prop])
        })
      }
    },
    restTabActive() { // 重置tab状态
      if (this.tabList.length > 1) {
        this.componentName = this.tabList[1].componentName
        this.tabActive = this.tabList[1].componentName
        this.prop = this.tabList[1].prop
      } else {
        this.componentName = this.tabList[0].componentName
        this.tabActive = this.tabList[0].componentName
        this.prop = this.tabList[0].prop
      }
    }
  }
}
</script>
<style lang="scss">
.device-config-common {
  .device-config-common-tab {
    .el-tabs__header {
      margin-bottom: 0;
      .el-tabs__nav-wrap {
        &::after {
          background-color: rgba(224,241,255,0.1);
        }
        .el-tabs__nav-scroll {
          padding-top: 10px;
          display: flex;
          justify-content: center;
          .el-tabs__nav {
            .el-tabs__active-bar {
              background-color: #00CDA8;
              transition: none;
            }
            .el-tabs__item {
              font-weight: 700;
              &:hover {
                color: #00CDA8;
              }
              &.is-active {
                color: #00CDA8;
              }
            }
          }
        }
      }
    }
  }
  .main {
    // .el-form-item {
    //   .el-input__inner {
    //     height: 30px;
    //     padding-right: 30px;
    //   }
    // }
    .el-collapse {
      border-top: none;
      border-bottom: none;
      .el-collapse-item__header {
        background-color: transparent;
        border-bottom: none;
        opacity: 0.6;
        font-size: 14px;
        color: #e0f1ff;
        height: 44px;
        line-height: 44px;
      }
      .el-collapse-item__wrap {
        background-color: transparent;
        border-bottom: none;
        .el-collapse-item__content {
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(224,241,255,0.1);
        }
      }
    }
  }
}

</style>
<style lang="scss" scoped>
  .device-config-common{
    height: 100%;
    .main {
      height: calc(100% - 54px);
      overflow: auto;
      overflow-x: hidden;
      padding: 0 10px;
      .node-cell-name {
        padding: 20px 0;
        // border-bottom: 2px solid rgba(224,241,255,0.1);
      }
    }
  }
</style>
