<template>
  <div>
    <icr-table
      ref="table"
      :loading="loading"
      :columns="columns"
      :data="records"
    />
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
import { drillOrgPaging } from '@/api/drill'
export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    color: {
      type: Number,
      default: 0
    },
    drillId: {
      type: [String, Number],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const query = reactive({
      drill_id: '',
      color: ''
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(drillOrgPaging, query)
    }
  },
  data() {
    return {
      columns: [
        { type: 'selection', selectable: () => {
          return !this.disabled
        } },
        { prop: 'name', label: '团队名称' },
        { prop: 'count', label: '团队人数' },
        {
          label: '操作',
          width: 100,
          render: (scope) => {
            return (
              <div>
                <el-button
                  type='text'
                  disabled={ this.disabled }
                  onclick={() => {
                    this.$emit('del', scope)
                  }}
                >
                  删除
                </el-button>
              </div>
            )
          }
        }
      ]
    }
  },
  mounted() {
    this.query.drill_id = this.drillId
    this.query.color = this.color
    this.getRecords()
  },
  methods: {
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this.$emit('deleteAll', ids, this.color)
    }
  }
}
</script>
<style scoped>

</style>
