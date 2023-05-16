<template>
  <div class="tab">
    <el-tabs v-model="active" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in tabList"
        :key="item.componentName"
        :label="item.name"
        :name="item.componentName"
        :prop="item.prop"
      />
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    tabList: {
      type: Array,
      default: () => []
    },
    tabActive: {
      type: String,
      default: ''
    }
  },
  data() {
    return {

    }
  },
  computed: {
    active: {
      get() {
        return this.tabActive
      },
      set(val) {
        this.$emit('update:tab-active', val)
      }
    }
  },
  created() {},
  methods: {
    handleClick(tab) {
      this.$emit('tab-click', tab)
    }
  }
}
</script>
<style lang="scss" scoped>
  .tab {
    ::v-deep {
      .el-tabs {
        .el-tabs__header {
          .el-tabs__nav-wrap {
            .el-tabs__nav-scroll {
              .el-tabs__nav {
                .el-tabs__item {
                  color: #969798;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
