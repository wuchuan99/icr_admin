<template>
  <div class="scene-target-list">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="addSceneTargetClick"
        >新增</el-button>
      </div>
      <div class="query-conditions">
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入内容"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />

    <icr-confirm-delete ref="confirmDelete" title="删除靶标" desc="您即将删除该场景, 确定删除?" />
  </div>
</template>

<script>
// import SceneTargetEdit from './edit.vue'
import { reactive } from '@vue/composition-api'
import { usePagination, useTableSelection } from '@/hooks'
import { scenetargetPaging } from '@/api/scene'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  scenetargetReversal,
  scenetargetSceneCopy,
  scenetargetDelete
} from '@/api/scene'
export default {
  components: {
    // SceneTargetEdit,
    IcrTable,
    Pagination,
    IcrConfirmDelete
  },
  setup() {
    const query = reactive({
      name: ''
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(scenetargetPaging, query)
    }
  },
  data() {
    return {
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '场景名称' },
          { prop: 'desc', label: '场景描述' },
          { prop: 'nodes', label: '资源规模' },
          { prop: 'debug_status', label: '调试状态' },
          { prop: 'enable_status', label: '是否启用', minWidth: 100,
            render: (scope) => {
              return (
                <div>
                  <el-switch
                    value={ scope.row.enable_status }
                    oninput={ (val) => { this.reversalScenetarget(scope.row, val) }}
                    active-value={1} inactive-value={0}
                    style='margin-right: 8px;'
                  />
                  { scope.row.enable_status ? '启用' : '不启用' }
                </div>
              )
            }
          },
          {
            label: '操作',
            width: '220',
            fixed: 'right',
            showOverflowTooltip: false,
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.editSceneTargetClick(scope.row) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.copyScenetarget(scope.row.id) }}>创建副本</el-button>
                  <el-button type='text' onclick={() => { this.scenetargetDelete(scope.row) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      },
      dialogVisible: false,
      id: ''
    }
  },
  created() {

  },
  mounted() {
    this.getRecords()
  },
  methods: {
    addSceneTargetClick() {
      this.$router.push('/targets/scene-targets/add?new=1')
    },
    editSceneTargetClick(row) {
      this.$router.push(`/targets/scene-targets/${row.id}`)
    },
    scenetargetEdit(row) {
      this.$router.push(`/targets/scene-targets/${row.id}`)
    },
    scenetargetDelete(row) {
      this.delete([row.id])
    },
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this.delete(ids)
    },
    delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        scenetargetDelete({
          data: {
            type: 1,
            ids: ids
          }
        }).then((res) => {
          if (res.status === 0) {
            this.getRecords()
          }
        })
      })
    },
    reversalScenetarget(row, val) {
      // incase status is string
      if (isNaN(row.enable_status) || row.enable_status === val) {
        row.enable_status = val
        return
      }
      scenetargetReversal({
        id: row.id
      }).then(res => {
        if (res.status === 0) {
          this.getRecords()
        }
      })
    },
    copyScenetarget(id) {
      scenetargetSceneCopy({ scene_id: id }).then(() => {
        this.$message.success('创建成功')
        this.getRecords()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .scene-target-list {
    ::v-deep .el-dialog__wrapper {
      .scene-target-edit-dialog {
        padding: 0;
        .el-dialog__header {
          display: none;
        }
        .el-dialog__body {
          padding: 0;
        }
      }
    }
  }
</style>
