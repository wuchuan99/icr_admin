<template>
  <div class="dialog">
    <icr-table
      ref="table"
      :columns="table.columns"
      :data="records"
      :loading="loading"
      row-key="id"
    />
    <pagination :total="total" :page="1" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { scenetargetRulePaging } from '@/api/scene'
import { useTableSelection } from '@/hooks'
export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    sceneId: {
      type: [String, Number],
      default: ''
    },
    drillData: {
      type: Object,
      default: () => {}
    }
  },
  setup() {
    const { selection } = useTableSelection()
    return {
      selection
    }
  },
  data() {
    return {
      table: {
        // 题目添加-表格配置
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'name', label: '判定名称' },
          { prop: 'target', label: '判定目标' },
          { prop: 'desc', label: '判定规则描述' }
        ]
      },
      loading: false,
      records: []
    }
  },
  computed: {
    total() {
      return this.records.length
    }
  },
  watch: {},
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords() {
      this.loading = true
      const params = {
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          scene_id: this.sceneId
        }
      }
      if (this.drillData.scope === 1) {
        params.search_info.judgment = [0, 1, 2, 3, 4, 5, 7]
      }
      scenetargetRulePaging(params).then((res) => {
        this.loading = false
        this.records = res?.data?.data || []
      })
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    confirm() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      if (!ids?.length) {
        return this.$message({
          type: 'error',
          message: '请先勾选任务'
        })
      }
      this.$emit('confirm', ids)
    }
  }
}
</script>
<style lang="scss" scoped>
.operation-box {
  margin-bottom: 22px;
  .org-search {
    float: left;
  }
  .search {
    float: right;
  }
}
.bottom-box {
  position: relative;
  .total {
    position: absolute;
    top: 20px;
    left: 100px;
    color: #f6bf53;
  }
}
.dialog-footer {
  margin-top: 20px;
}
::v-deep {
  .el-table tr.el-table__row td {
    padding: 12px 0;
  }
  .pagination-container {
    .el-button.el-button--text:last-child {
      display: none;
    }
    .el-pagination {
      display: none;
    }
  }
}
</style>
