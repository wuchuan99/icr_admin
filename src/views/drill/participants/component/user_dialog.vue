<template>
  <div>
    <div class="operation-box">
      <div class="org-search">
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
      :columns="table.columns"
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
import { getlist } from '@/api/account'
import { getlist as getOrgs } from '@/api/organiza'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    participateType: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const query = reactive({
      info: '',
      org_id: ''
    })
    if (props.participateType === 'referee') {
      query.role_type = 'evaluation'
    } else if (props.participateType === 'player') {
      query.role_type = 'participating'
      query.org_type = 1
    }
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(getlist, query)
    }
  },
  data() {
    return {
      table: {
        // 题目添加-表格配置
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'username', label: '账号' },
          { prop: 'name', label: '昵称' },
          { prop: 'real_name', label: '姓名' },
          {
            prop: 'org_ls',
            label: '组织名称',
            render: (scope) => {
              return (
                <div class='text_ellipsis'>
                  {
                    scope.row.org_ls.reduce((acc, item) => {
                      acc.push(item.name)
                      return acc
                    }, []).join(',')
                  }
                </div>
              )
            }
          }
        ]
      },
      orgs: []
    }
  },
  computed: {},
  created() {
    this.getOrgs()
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getOrgs() {
      const search_info = {}
      if (this.participateType === 'player') {
        search_info.type = 1
      }
      getOrgs({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: search_info
      }).then(({ data }) => {
        this.orgs = data?.data || []
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
      this.$emit('confirm', ids)
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
.text_ellipsis{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
