<template>
  <div class="period-statistics">
    <div class="operation-box">
      <div class="operation title">课程：{{ courseName }}</div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-select v-model="query.classify" placeholder="全部类型" clearable size="medium" @change="getRecords">
            <el-option
              v-for="item in classifyOption"
              :key="item.tag"
              :label="item.name"
              :value="item.tag"
            />
          </el-select>
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
    <view-dialog v-if="visible" :id="row.item_id" :visible.sync="visible" />
  </div>
</template>

<script>
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import IcrTable from '@/components/table'
import ViewDialog from './components/view-dialog.vue'
import { selectList, courseAnalysisItempaging } from '@/api/education_manage'

const colorMap = new Map([
  [0, 'green'],
  [1, 'yellow'],
  [2, 'red']
])

export default {
  name: 'PeriodStatistics',
  components: {
    Pagination,
    IcrTable,
    ViewDialog
  },
  setup() {
    const query = reactive({
      name: '',
      classify: '',
      course_id: ''
    })
    return {
      query,
      ...usePagination(courseAnalysisItempaging, query, { removeEmpty: true })
    }
  },
  data() {
    return {
      courseName: this.$route.query?.courseName || '',
      classifyOption: [],
      levelOption: [],
      table: {
        columns: [
          { prop: 'name', label: '名称' },
          {
            prop: 'level',
            label: '难度',
            render: (scope) => {
              const value = this.levelOption.find(it => it.name === scope.row.level)
              const color = colorMap.get(value?.tag) || ''
              return <div class={color}>{scope.row.level}</div>
            }
          },
          {
            prop: 'classify',
            label: '类型',
            render: (scope) => {
              const item = this.classifyOption.find(it => it.tag === scope.row.classify)
              return <div>{ item?.name }</div>
            }
          },
          { prop: 'study_num', label: '学习人数', sortable: 'custom' },
          { prop: 'duration', label: '课程时长', sortable: 'custom' },
          {
            label: '操作',
            width: 150,
            render: (scope) => {
              return <el-button type='text' onclick={() => { this.look(scope.row) }} class='view'>查看</el-button>
            }
          }
        ]
      },
      visible: false,
      row: {}
    }
  },
  async mounted() {
    this.query.course_id = this.$route.params?.id
    if (!this.query.course_id) return
    await this.getSelectList()
    this.getRecords()
  },
  methods: {
    getSelectList() {
      const fetchs = []
      const props = ['classifyOption', 'levelOption']
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
      this.row = row
      this.visible = true
    }
  }
}
</script>
<style lang="scss" scoped>
.period-statistics {
  .title {
    font-size: 16px;
    line-height: 40px;
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
