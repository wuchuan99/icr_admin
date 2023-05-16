<template>
  <div class="dialog">
    <div class="operation-box">
      <div class="query-conditions">
        <el-input
          v-model="query.name"
          placeholder="请输入内容"
          size="medium"
          class="search"
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
    <div class="bottom-box">
      <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { scenetargetPaging } from '@/api/scene'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
export default {
  components: {
    IcrTable,
    Pagination
  },
  setup() {
    const query = reactive({
      name: '',
      enable_status: 1
    })
    return {
      query,
      ...usePagination(scenetargetPaging, query)
    }
  },
  data() {
    return {
      table: {
        // 题目添加-表格配置
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'name', label: '场景名称' },
          { prop: 'desc', label: '场景描述' },
          { prop: 'nodes', label: '资源规模' },
          { prop: 'debug_status', label: '调试状态' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.getRecords()
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    confirm() {
      const rows = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val)
        return acc
      }, [])
      if (!rows?.length) {
        return this.$message({
          type: 'error',
          message: '请先勾选演练场景'
        })
      }
      this.$emit('confirm', rows)
    },
    selectItem(rows) {
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
  }
}
</style>
