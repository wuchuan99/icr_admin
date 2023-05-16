<template>
  <div>
    <div class="operation-box">
      <div class="query-conditions">
        <el-input
          v-model="query.name"
          class="search"
          placeholder="请输入内容"
          size="medium"
          @keyup.enter.native="getRecords"
        >
          <i
            slot="suffix"
            class="el-input__icon iconfont icon-sousuo"
            @click="getRecords"
          />
        </el-input>
      </div>
    </div>
    <icr-table
      ref="table"
      :columns="table.columns"
      :data="records"
      :loading="loading"
      row-key="id"
      @selection-change="selectItem"
    />
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">添 加</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { getlist } from '@/api/organiza'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    radio: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const query = reactive({
      name: '',
      type: 1
    })
    const state = {
      query,
      ...usePagination(getlist, query, { removeEmpty: false })
    }
    if (!props.radio) {
      const { selection } = useTableSelection()
      state.selection = selection
    }
    return state
  },
  data() {
    return {
      table: {
        // 题目添加-表格配置
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'name', label: '组织名称' },
          { prop: 'account_count', label: '人数' }
        ]
      }
    }
  },
  computed: {},
  created() {
    this.getRecords()
  },
  mounted() {},
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    confirm() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this.$emit('confirm', ids)
    },
    selectItem(rows) {
      if (!this.radio) return
      if (rows.length > 1) {
        rows.filter((it, index) => {
          if (index === rows.length - 1) {
            this.$refs.table.$refs.table.toggleRowSelection(it, true)
            return true
          } else {
            this.$refs.table.$refs.table.toggleRowSelection(it, false)
            return false
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
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
  }
}
</style>
