<template>
  <div class="team">
    <!-- buttons -->
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="disabled"
          @click="AddTeamUser"
        >
          添加队伍
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
      :loading="loading"
      :columns="columns"
      :data="records"
    />
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog width="45%" :visible.sync="showTableDialog" title="添加队伍" @close="closeDialog">
      <teamuser-dialog
        v-if="showTableDialog"
        ref="teamuserDialog"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除参与人员"
      desc="您即将删除该队伍, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import TeamuserDialog from '../component/team_dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { drillOrgPaging, drillOrgAdd, drillOrgDelete } from '@/api/drill'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
export default {
  components: {
    IcrTable,
    Pagination,
    TeamuserDialog,
    IcrConfirmDelete
  },
  setup() {
    const query = reactive({
      drill_id: ''
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(drillOrgPaging, query)
    }
  },
  props: {
    drillData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      list: [],
      columns: [
        { type: 'selection', selectable: () => {
          return !this.disabled
        } },
        { prop: 'name', label: '团队名称' },
        { prop: 'count', label: '团队人数' },
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
                  onclick={() => {
                    this.delete(scope)
                  }}
                >
                  删除
                </el-button>
              </div>
            )
          }
        }
      ],
      showTableDialog: false
    }
  },
  computed: {
    disabled() {
      return [1, 2].includes(this.drillData.status) || this.drillData.enable_status === 1
    }
  },
  mounted() {
    this.query.drill_id = this.drillData.id
    this.getRecords()
  },
  methods: {
    AddTeamUser() {
      this.showTableDialog = true
    },
    closeDialog() {
      this.showTableDialog = false
    },
    confirm(ids) {
      if (!ids?.length) {
        return this.$message({
          type: 'error',
          message: '请先勾选参与人员'
        })
      }
      drillOrgAdd({
        data: {
          drill_id: this.drillData.id,
          org_ids: ids,
          color: 0
        }
      }).then(() => {
        this.showTableDialog = false
        this.getRecords()
      })
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        drillOrgDelete({
          data: {
            drill_id: this.drillData.id,
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    submit() {
      this.$emit('submitUserInfo')
    },
    goBack() {
      this.$router.push('/drill-manage/drill')
    }
  }
}
</script>

<style scoped lang="scss">
</style>
