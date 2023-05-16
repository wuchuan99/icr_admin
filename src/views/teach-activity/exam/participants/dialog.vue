<template>
  <div>
    <div class="operation-box">
      <div v-if="itemActive === 'teacher'" class="org-search">
        <el-select v-model="query.role_id" placeholder="请选择角色名称" clearable size="medium" @change="getRecords">
          <el-option
            v-for="item in roles"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
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
      :columns="examUserTable.columns"
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
import { getlist, getorg as getOrgs, getrole as getRoles } from '@/api/account'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
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
  setup(props) {
    const queryObj = {
      info: '',
      org_id: ''
    }
    if (props.itemActive === 'student') {
      queryObj.org_type = 2
    } else {
      queryObj.role_id = ''
    }
    const query = reactive(queryObj)
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(getlist, query, { removeEmpty: false })
    }
  },
  data() {
    return {
      examUserTable: {
        // 题目添加-表格配置
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
      orgs: [],
      roles: []
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
  },
  mounted() {
    this.getRecords()
    this.itemActive === 'student' && this.getOrgs()
    this.itemActive === 'teacher' && this.getRoles()
  },
  methods: {
    getOrgs() {
      getOrgs().then(({ data }) => {
        this.orgs = data?.data?.reduce((acc, item) => {
          if (item.type === 2) {
            acc.push(...item.org_ls)
          }
          return acc
        }, [])
      })
    },
    getRoles() {
      getRoles().then(({ data }) => {
        this.roles = data?.data
      })
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
      if (!ids.length) {
        this.$message.error('请先勾选参与人员')
      } else {
        this.$emit('confirm', ids)
      }
    },
    // 初始化弹框
    initData() {
      this.$refs.table.$refs.table.clearSelection()
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
