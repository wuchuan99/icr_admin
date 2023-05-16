<template>
  <el-collapse v-bind="_option" v-on="_option" @change="handleChange">
    <el-collapse-item name="1">
      <template slot="title">
        <div class="title">
          <div>{{ title }}</div>
          <div class="header-actions"><slot name="header-actions" /></div>
        </div>
      </template>
      <slot />
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  name: 'IcrCollapse',
  props: {
    title: {
      type: String,
      default: '标题'
    }
  },
  data() {
    return {
      defaultOption: {
        value: ['1']
      }
    }
  },
  computed: {
    _option() {
      return Object.assign({}, this.defaultOption, this.$attrs, this.$listeners)
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('handleChange', val)
    }
  }
}
</script>

