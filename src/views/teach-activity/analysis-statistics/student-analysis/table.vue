<template>
  <div>
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button class="filter-item" size="medium" @click="exportList">导出</el-button>
      </div>
      <!-- query -->
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-select
            v-model="query.org"
            placeholder="请选择组织名称"
            clearable
            class="filter-item"
            @change="getRecords()"
          >
            <el-option
              v-for="ele in orgOption"
              :key="ele.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div v-if="activeIndex === '0'" class="query-conditions__item search">
          <el-input
            v-model="query.name"
            placeholder="请输入用户名/姓名"
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
        <div class="search">
          <el-date-picker
            v-model="date"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            @change="getDateQuery()"
          />
        </div>
      </div>
    </div>
    <!-- table -->
    <icr-table
      ref="table"
      :loading="loading"
      :columns="columns"
      :data="tabRecords"
    />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import { drillPaging } from '@/api/drill'
import { competitionPaging } from '@/api/competition'

import { usePagination } from '@/hooks'
import { reactive, toRefs } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import IcrTable from '@/components/table'
export default {
  setup(props) {
    const { activeIndex } = toRefs(props)
    // 假数据待修改
    const paging = activeIndex.value === '0' ? drillPaging : competitionPaging
    const query = reactive({
      name: null
    })
    return {
      query,
      ...usePagination(paging, query)
    }
  },
  components: {
    Pagination,
    IcrTable
  },
  props: {
    activeIndex: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      orgOption: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      },
      date: [],
      columnsOptions: [
        { prop: 'name', label: '用户名' },
        { prop: 'real_name', label: '姓名' },
        { prop: 'org_ls', label: '组织',
          render: (scope) => {
            if (scope.row.org_ls) {
              const nameList = scope.row.org_ls.map(val => { return val.name })
              return <div class='table-tag'>{nameList.join(',')}</div>
            } else {
              return <div></div>
            }
          } },
        { prop: 'org_count', label: '人数' },
        { prop: 'role', label: '角色' },
        { prop: 'lesson', label: '完成课时数' },
        { prop: 'operation', label: '完成实验' },
        { prop: 'practice', label: '完成练习' },
        { prop: 'score', label: '实验平均得分' },
        { prop: 'exam', label: '完成考试数' },
        {
          label: '操作',
          render: (scope) => {
            return (
              <div>
                <el-button
                  type='text'
                  onclick={() => {
                    this.toDetail(scope.row)
                  }}
                >
                  个人详细数据查看
                </el-button>
              </div>
            )
          }
        }
      ],
      tabRecords: [{ id: 1 }]
    }
  },
  computed: {
    columns() {
      return this.activeIndex === '0'
        ? [
          ...this.columnsOptions.slice(0, 3),
          ...this.columnsOptions.slice(4)
        ]
        : [
          ...this.columnsOptions.slice(2, 4),
          ...this.columnsOptions.slice(5, this.columnsOptions.length - 1)
        ]
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getDateQuery() {
      this.query.startTime = this.date[0]
      this.query.endTime = this.date[1]
      this.getRecords()
    },
    toDetail(row) {
      this.$router.push(`/teach-activity/analysis-statistics/student-analysis/${row.id}`)
    },
    exportList() {}
  }
}
</script>

<style scoped lang="scss">
.table-tag {
  overflow:hidden;
  text-overflow:ellipsis;
}
</style>
