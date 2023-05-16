<template>
  <div class="settings-task">
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="disabled || !sceneData.id"
          @click="showTableDialog = true"
        >
          添加任务
        </el-button>
      </div>
      <div style="float: right">
        <el-button :disabled="disabled" type="primary" @click="submit">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </div>
    <icr-table
      ref="table"
      class="fixed_table"
      :columns="table.columns"
      :data="records"
      :loading="loading"
    />
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog
      v-if="showTableDialog"
      width="60%"
      :visible.sync="showTableDialog"
      title="添加任务"
      @close="closeDialog"
    >
      <task-dialog
        v-if="showTableDialog"
        ref="sceneDialog"
        :scene-id="sceneData.id"
        :drill-data="drillData"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除任务"
      desc="您即将删除该任务, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { drillTaskPaging, drillTaskAdd, drillTaskDelete } from '@/api/drill'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import taskDialog from './dialog_task.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { downloadFile } from '@/utils/file'
export default {
  components: {
    IcrTable,
    Pagination,
    taskDialog,
    IcrConfirmDelete
  },
  setup(props) {
    const query = reactive({
      drill_id: props.drillData.id,
      color: props.color
    })
    return {
      query,
      ...usePagination(drillTaskPaging, query)
    }
  },
  props: {
    drillData: {
      type: Object,
      default: () => {}
    },
    color: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      table: {
        // 任务添加-表格配置
        columns: [
          { prop: 'name', label: '任务名称' },
          { prop: 'target', label: '任务目标' },
          { prop: 'desc', label: '任务描述' },
          {
            prop: 'writeup',
            width: 500,
            label: '任务解析',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.writeup) }}
                  >
                    {scope.row.writeup.name}
                  </el-button>
                </div>
              )
            }
          },
          {
            label: '操作',
            width: 100,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    disabled={ this.disabled }
                    onclick={() => { this.delete(scope) }}
                  >
                  删除
                  </el-button>
                </div>
              )
            }
          }
        ]
      },
      showTableDialog: false
    }
  },
  computed: {
    sceneData() {
      return this.drillData.scene || { id: '', name: '' }
    },
    disabled() {
      return [1, 2].includes(this.drillData.status) || this.drillData.enable_status === 1
    }
  },
  watch: {},
  mounted() {
    this.getRecords()
  },
  methods: {
    closeDialog() {
      this.showTableDialog = false
    },
    confirm(ids) {
      this.create(ids)
    },
    create(ids) {
      return drillTaskAdd({
        data: {
          drill_id: this.drillData.id,
          task_ids: ids,
          color: this.color
        }
      }).then(() => {
        this.getRecords()
        this.showTableDialog = false
      })
    },
    submit() {
      this.$emit('submitSettings', { go: true })
    },
    goBack() {
      this.$router.push('/drill-manage/drill')
    },
    // 单项删除
    delete(scope) {
      this._delete(scope)
    },
    // 删除项目
    _delete(scope) {
      this.$refs.confirmDelete.prompt().then(() => {
        drillTaskDelete({
          data: {
            drill_id: this.drillData.id,
            type: 1,
            ids: [scope.row.id]
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    downLoadFile(file) {
      file.url && downloadFile(`/resource/${file.url}`, file.name)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
