<template>
  <div>
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="exportReport"
        >导出成果</el-button>
        <el-button
          class="filter-item"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="publishDislogVisible = true"
          :disabled="publishStatus"
          v-if="this.scope === 0"
        >{{ publishStatus ? '成果已公布' : '公布成果' }}</el-button>
      </div>
    </div>
    <div class="table_list">
      <div class="table_list_item" v-for="item in list" :key="item.color">
        <div v-if="mode === 2" class="team_name">{{ item.color === 0 ? '红方阵营' : '蓝方阵营' }}</div>
        <icr-table
          class="fixed_table"
          ref="table"
          :height="mode === 2 ? 'auto': 'calc(100vh - 271px)'"
          :columns="item.columns"
          :data="item.records"
          :loading="loading"
        />
      </div>
    </div>
    <IcrDialog
      title="公布成绩"
      width="400px"
      :visible.sync="publishDislogVisible"
      @confirm="reportPublish"
    >
      <span>确定公布本次演练成果吗?</span>
    </IcrDialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrDialog from '@/components/dialog.vue'
import { drillFruitRetrieve, drillFruitPublish, drillFruitExport } from '@/api/drill'
import { cloneDeep } from 'lodash-es'
const finalMap = new Map([
  [-1, '待人工判定'],
  [0, '未完成'],
  [1, '完成']
])
export default {
  components: { IcrTable, IcrDialog },
  inject: ['drillId', 'mode', 'scope'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      publishDislogVisible: false,
      loading: false,
      basisColumns: [
        {
          width: 260,
          prop: 'name',
          label: '名称',
          fixed: 'left'
        },
        {
          width: 100,
          prop: 'total_score',
          label: '总成绩',
          sortable: true,
        },
        {
          width: 100,
          prop: 'sort',
          label: '排名',

        }
      ],
      list: []
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      if (!this.drillId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        drillFruitRetrieve({
          drill_id: this.drillId
        })
          .then((res) => {
            if (res.data) {
              this.detail = res.data?.data?.detail || []
              for (const it of this.detail) {
                const head = it?.head || []
                const columns = this.getColumn(head)
                const body = it?.body || []
                const records = body?.map((item, i) => {
                  const columData = {
                    sort: i + 1,
                    name: item.name,
                    total_score: item.total_score
                  }
                  if (item?.task_log?.length) {
                    for (const task of item.task_log) {
                      columData[`task${task.id}`] = task.final
                    }
                  }
                  return columData
                })
                this.list.push({
                  color: it.color,
                  columns,
                  records
                })
              }
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    reportPublish() {
      drillFruitPublish({ drill_id: this.drillId }).then(() => {
        this.$message.success('公布成功')
        this.$emit('publish-status', true)
      }).finally(() => {
        this.publishDislogVisible = false
      })
    },
    exportReport() {
      drillFruitExport({
        data: {
          id: this.drillId
        }
      }).then(res => {
        const title = res.headers['content-disposition'].split(';')[1].split('=')[1].split('"')[1]
        const filename = this.decodeUnicode(title)
        const bb = new Blob([res.data], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(bb)
        a.click()
        this.$message.success('导出成功')
      })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    getColumn(head) {
      const columns = cloneDeep(this.basisColumns)
      if(this.mode === 2){ //红蓝对抗剔除排名
        columns.pop()
      }
      const task_list = []
      for (const task of head) {
        const length = task.name.length * 14 + 40
        task_list.push({
          'min-width': length > 100 ? length : 100,
          prop: `task${task.id}`,
          label: task.name,
          render: (scope) => {
            return (
              <div>{ finalMap.get(scope.row[`task${task.id}`]) }</div>
            )
          }
        })
      }
      if(task_list.length === 1){
        delete columns[0].width
        columns[0]['min-width'] = task_list[0]['min-width']
      }
      columns.splice(1, 0, ...task_list)
      return columns
    }
  }
}
</script>
<style lang="scss" scoped>
$--icr-color-table-fixed1: #47494A;
$--icr-color-table-fixed2: #404244;
::v-deep {
  .el-table {
    .el-table__fixed,
    .el-table__fixed-right
    {
      pointer-events: none;
      .el-table__fixed-header-wrapper {
        pointer-events: all;
      }
    }
    .el-table__fixed-header-wrapper .el-table__header thead tr th:nth-last-child(2) {
      background-color: $--icr-color-table-fixed1;
    }
    .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row td:nth-last-child(2) {
      background-color: $--icr-color-table-fixed2;
    }
    .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row.el-table__row--striped td:nth-last-child(2){
      background-color: $--icr-color-table-fixed1;
    }
  }
}

.table_list {
  .table_list_item {
    margin-bottom: 20px;
    &:last-of-type {
      margin-bottom: 0;
    }
    .team_name {
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
