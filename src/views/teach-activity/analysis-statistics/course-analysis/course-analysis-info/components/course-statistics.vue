<template>
  <icr-card title="课程学习统计" class="course-statistics">
    <div class="operation-box">
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <div class="selects">
            <el-select v-model="query.direction" placeholder="全部方向" clearable size="medium" @change="getRecords">
              <el-option
                v-for="item in directionOption"
                :key="item.tag"
                :label="item.name"
                :value="item.tag"
              />
            </el-select>
            <el-select v-model="query.level" placeholder="全部难度" clearable size="medium" @change="getRecords">
              <el-option
                v-for="item in levelOption"
                :key="item.tag"
                :label="item.name"
                :value="item.tag"
              />
            </el-select>
          </div>
        </div>
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入名称"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" @sort-change="sortChange" />
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </icr-card>
</template>

<script>
import IcrCard from '../common/card.vue'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import IcrTable from '@/components/table'
import { courseAnalysisPaging, selectList } from '@/api/education_manage'
const colorMap = new Map([
  [0, 'green'],
  [1, 'yellow'],
  [2, 'red']
])

export default {
  components: {
    IcrCard,
    Pagination,
    IcrTable
  },
  setup() {
    const query = reactive({
      name: '',
      direction: '',
      level: ''
    })
    return {
      query,
      ...usePagination(courseAnalysisPaging, query, { removeEmpty: true })
    }
  },
  data() {
    return {
      directionOption: [],
      levelOption: [],
      table: {
        columns: [
          { prop: 'name', label: '名称' },
          { prop: 'direction', label: '方向' },
          {
            prop: 'level',
            label: '难度',
            render: (scope) => {
              const value = this.levelOption.find(it => it.name === scope.row.level)
              const color = colorMap.get(value?.tag) || ''
              return <div class={color}>{scope.row.level}</div>
            }
          },
          { prop: 'course_long', label: '课程时长', sortable: 'custom' },
          { prop: 'study_num', label: '学习人数', sortable: 'custom' },
          { prop: 'creator', label: '创建者' },
          {
            label: '操作',
            width: 150,
            render: (scope) => {
              return <el-button type='text' onclick={() => { this.look(scope.row) }} class='view'>课时统计数据查看</el-button>
            }
          }
        ]
      }
    }
  },
  async mounted() {
    await this.getSelectList()
    this.getRecords()
  },
  methods: {
    getSelectList() {
      const fetchs = []
      const props = ['directionOption', 'levelOption']
      for (const prop of props) {
        const type = prop.slice(0, prop.length - 6)
        const promise = selectList({ type }).then((res) => {
          this[prop] = res?.data?.select || []
        })
        fetchs.push(promise)
      }
      return Promise.all(fetchs)
    },
    sortChange({ prop, order }) {
      delete this.query.order
      const sortType = (order === 'descending' ? '-' : '')
      if (order) this.query.order = [sortType + prop]
      this.getRecords()
    },
    look(row) {
      this.$router.push(`/teach-activity/analysis-statistics/course-analysis/period-statistics/${row.course_id}?courseName=${row.name}`)
    }
  }
}
</script>
<style lang="scss" scoped>
.course-statistics {
  margin-top: 20px;
  .selects {
    display: flex;
    >div {
      &:last-of-type {
        margin-left: 10px;
      }
    }
  }
  .green {
    color: #19d933
  }
  .yellow {
    color: #f3990e
  }
  .red {
    color: #ff3045
  }
}
::v-deep {
  .view {
    span {
      color: #00AD84 !important;
    }
  }
}
</style>
