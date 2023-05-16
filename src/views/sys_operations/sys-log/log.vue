<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-select v-model="query.action" clearable size="medium" placeholder="日志类型" @change="getRecords">
            <el-option
              v-for="item in actionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="query-conditions__item search">
          <el-date-picker
            v-model="query.start_time"
            :value-format="dateFormat"
            type="datetime"
            clearable
            size="medium"
            placeholder="开始时间"
            @change="getRecords"
          />
        </div>
        <div class="query-conditions__item search">
          <el-date-picker
            v-model="query.end_time"
            :value-format="dateFormat"
            type="datetime"
            clearable
            size="medium"
            placeholder="结束时间"
            @change="getRecords"
          />
        </div>
        <div class="search">
          <el-input
            v-model="query.search"
            placeholder="请输入内容"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :options="tableOptions" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { usePagination } from '@/hooks'
import {
  sysLogsPaging
} from '@/api/log'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'

const LOGIN = 1
const EXCEPTION = 2
const ADD = 3
const DELETE = 4
const EDIT = 5

const actionsMap = new Map([
  [LOGIN, '登录'],
  [EXCEPTION, '异常报错'],
  [ADD, '增加'],
  [DELETE, '删除'],
  [EDIT, '修改']
])

const actionOptions = Array.from(actionsMap).map((v) => {
  return { label: v[1], value: v[0] }
})

console.log(actionOptions)

export default {
  components: {
    IcrTable,
    Pagination
  },
  setup() {
    const query = reactive({
      action: '',
      search: '',
      start_time: '',
      end_time: ''
    })

    return {
      query,
      ...usePagination(sysLogsPaging, query)
    }
  },
  data() {
    return {
      dateFormat: 'yyyy-MM-dd HH:mm:ss',
      actionOptions,
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          { prop: 'id', label: 'id', width: 50 },
          { prop: 'username', label: '用户名称', width: 80 },
          { prop: 'action', label: '日志类型', width: 80, render: scope => {
            const type = actionsMap.get(scope.row.action)
            return (
              <span>{type}</span>
            )
          } },
          { prop: 'api', label: '接口地址', width: 251 },
          { prop: 'ip_address', label: 'ip地址', width: 140 },
          { prop: 'info', label: '内容' },
          { prop: 'datetime', label: '创建日期', width: 200 }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    $table() {
      return this.$refs.table
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.el-dialog {
  min-width: 750px;
}
.question-form {
  min-width: 750px;
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 740px;
  }
}
.import-button {
  margin-left: 20px;
  span {
    color:rgba(255,255,255,0.5);
  }
}
.tags-wrapper {
  .tags {
    display: flex;
    flex-wrap: wrap;
    max-width: 660px;
    .tags-item {
      margin-right: 8px;
      margin-top: 8px;
      font-size: 14px;
    }
  }
  .addBtn {
    display: inline-block;
    width: 60px;
    background-color:rgba(255,255,255,0.1);
    border-left: 1px solid rgba(255,255,255,0.2);
    text-align: center;
    color: #00AD84;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
::v-deep {
  .options-wrapper .el-form-item {
    margin-bottom: 20px;
  }
  .options .el-form-item:nth-child(2n) .el-form-item__content {
    margin-left: 20px !important;
  }
  .options .el-input-group__prepend {
    width: 80px;
  }
  .el-autocomplete .el-input {
    width: 260px;
  }
}
</style>
