<template>
  <div>
    <div class="operation-box">
      <div v-if="itemActive === 'student'" class="org-search">
        <el-select v-model="query.org_id" placeholder="请选择组织名称" clearable size="medium" @change="getRecords">
          <el-option
            v-for="item in orgs"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="query-conditions">
        <el-input
          v-model="query.info"
          placeholder="请输入内容"
          class="search"
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
      :columns="tableOptions.columns"
      :data="records"
      :loading="loading"
      row-key="id"
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
import { getlist, getorg as getOrgs } from '@/api/account'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
import { JudgeType, PlayerType } from './index.vue'

export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    itemActive: {
      type: String,
      default: 'teacher'
    }
  },
  setup({ itemActive }) {
    const params = {
      info: '',
      org_id: '',
      role_type: ''
    }
    if (itemActive === JudgeType) {
      params.role_type = 'evaluation'
    }

    if (itemActive === PlayerType) {
      params.org_type = 0
    }

    const query = reactive(params)

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(getlist, query, { removeEmpty: false })
    }
  },
  data() {
    return {
      tableOptions: {
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'username', label: '账号' },
          { prop: 'name', label: '昵称' },
          { prop: 'real_name', label: '姓名' },
          { prop: 'org_ls', label: '组织',
            render: (scope) => {
              const nameList = scope.row.org_ls.map(val => { return val.name })
              return <div class='table-tag'>{nameList.join(',')}</div>
            }
          }
        ]
      },
      loading: false,
      orgs: []
    }
  },
  computed: {},
  watch: {
    itemActive(val) {
      this.query.category = val
      this.getRecords()
    }
  },
  created() {
    this.getRecords()
    this.getOrgs()
  },
  mounted() {},
  methods: {
    // 弹框获取题目信息列表
    getDialogInfo() {
      this.getRecords()
    },
    getOrgs() {
      getOrgs().then(({ data }) => {
        this.orgs = data?.data?.reduce((acc, item) => {
          acc.push(...item.org_ls)
          return acc
        }, [])
      })
    },
    changeTags(id) {
      this.query.tag = id || null
      this.tagActive = id || -1
      this.getRecords()
    },
    closeDialog() {
      this.initData()
      this.$emit('closeDialog')
    },
    confirm() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this.$emit('confirm', ids)
    },
    // 初始化弹框
    initData() {
      this.$refs.table.$refs.table.clearSelection()
      this.getRecords()
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
.table-tag {
  overflow:hidden;
  text-overflow:ellipsis;
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
