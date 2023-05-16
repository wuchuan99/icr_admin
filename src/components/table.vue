<template>
  <div>
    <el-table ref="table" :data="data" v-bind="_option" v-on="_option">
      <el-table-column
        v-for="(column, index) in columns"
        :key="index"
        v-bind="{...defaultColumnOption, ...column}"
      >
        <template
          :slot="column.render ? 'default' : column.prop"
          slot-scope="scope"
        >
          <div v-if="column.render">
            <template-render :scope="scope" :render="column.render" />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { Loading } from 'element-ui'

export default {
  name: 'IcrTable',
  components: {
    TemplateRender: {
      functional: true,
      props: {
        scope: Object,
        render: Function
      },
      render(h, ctx) {
        return ctx.props.render(ctx.props.scope)
      }
    }
  },
  props: {
    columns: Array,
    options: Object,
    data: Array,
    loading: Boolean
  },
  data() {
    return {
      defaultOption: {
        stripe: true
      },
      defaultColumnOption: {
        showOverflowTooltip: true
      },
      loadingInstance: null,
      loadingDefaultOption: {
        'background': 'rgb(50 52 54 / 80%)',
        'text': '加载中...'
      }
    }
  },
  computed: {
    _option() {
      return Object.assign({}, this.defaultOption, this.options, this.$attrs, this.$listeners)
    },
    $table() {
      return this.$refs.table
    }
  },
  watch: {
    loading(val) {
      if (val) {
        this.loadingInstance = Loading.service(Object.assign({}, this.loadingDefaultOption, this.$attrs, {
          target: this.$el
        }))
      } else {
        this.loadingInstance && this.loadingInstance.close()
      }
    }
  },
  methods: {
    getSelection() {
      return this.$table.selection
    }
  }
}
</script>

<style lang="scss">
.el-tooltip__popper {
  max-width: 400px;
  line-height: 180%;
  font-size: 16px;
}
</style>
