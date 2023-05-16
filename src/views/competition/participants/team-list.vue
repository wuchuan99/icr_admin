<template>
  <div>
    <!-- buttons -->
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="competition.going"
          @click="addCompetitionUser"
        >
          新增
        </el-button>
        <el-button
          v-if="isDrillModel"
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="competition.going"
          @click="initBatchGroup()"
        >
          批量分组
        </el-button>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="tableColumns" :data="records" />
    <el-dialog :visible.sync="showTableDialog" title="添加" @close="closeDialog">
      <TeamListDialog
        ref="competitionUserDialog"
        :item-active="itemActive"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <!-- 批量分组弹窗 -->
    <el-dialog :visible.sync="showGroupDialog" title="批量分组" width="600px">
      <div style="display: flex;justify-content: space-between;">
        <icr-table :loading="false" :columns="groupTableColumns" :data="selectedRecords" style="width: 60%" />
        <div>
          <p style="margin-top: 0;">将左侧队伍分组到</p>
          <el-select v-model="batchGroupValue">
            <el-option
              v-for="item in defaultGroups"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="dialog-footer" style="margin-top: 20px;">
        <el-button type="primary" @click="batchGroup">确定</el-button>
        <el-button @click="showGroupDialog = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除参与人员"
      desc="您即将删除该参与人员, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import TeamListDialog from './team-list-dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { competitionMemberOrgAdd, competitionMemberOrgDel, competitionMemberList, competitionMemberOrgGroup } from '@/api/competition'
import { ParticipantTypeMap } from './index.vue'
import { CompetitionDrillModel } from '@/views/competition/index.vue'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

export default {
  setup() {
    const query = reactive({
    })
    const { selection } = useTableSelection()
    return {
      selection,
      query,
      ...usePagination(competitionMemberList, query)
    }
  },
  components: {
    IcrTable,
    TeamListDialog,
    IcrConfirmDelete,
    Pagination
  },
  inject: ['getCompetitionId', 'getCompetition'],
  props: {
    itemActive: {
      type: String,
      default: 'teacher'
    }
  },
  data() {
    const competition = this.getCompetition()
    const tableColumns = [
      { type: 'selection', selectable: () => {
        return !competition.going
      } },
      { prop: 'name', label: '队伍' },
      { prop: 'count', label: '人数' },
      {
        label: '操作',
        width: 100,
        fixed: 'right',
        render: (scope) => {
          return (
            <div>
              <el-button
                type='text'
                disabled={this.competition.going}
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
    ]

    // only drill has group
    if (competition.competition_model === CompetitionDrillModel) {
      tableColumns.splice(-1, 0, { label: '分组', render: (scope) => {
        return (
          <div>
            <el-select
              disabled={this.competition.going}
              allow-create
              filterable value={scope.row.group_name} oninput={ val => { this.group([scope.row.o_id], val) } }>
              { this.defaultGroups?.map(item => {
                return (<el-option key={item.value} label={item.label} value={item.value} />)
              }) }
            </el-select>
          </div>
        )
      } })
    }

    return {
      competition,
      groupsMap: new Map([
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F']
      ]),
      data: [],
      showTableDialog: false,
      showGroupDialog: false,
      selectedRecords: [],
      // loading: false,
      batchGroupValue: '',
      tableColumns
    }
  },
  computed: {
    isDrillModel() {
      return this.competition.competition_model === CompetitionDrillModel
    },
    participantType: function() {
      return ParticipantTypeMap.get(this.itemActive)
    },
    groupTableColumns: function() {
      return this.tableColumns.slice(1, 3)
    },
    defaultGroups: function() {
      this.records.forEach?.(item => {
        const groupName = item.group_name
        if (!this.groupsMap.get(item.group_name) && groupName) {
          this.groupsMap.set(groupName, groupName)
        }
      })

      const groups = []
      this.groupsMap.forEach((v, k) => {
        groups.push({
          label: v,
          value: k
        })
      })
      return groups
    }
  },
  watch: {
    itemActive() {
      this.getRecords()
    }
  },
  mounted() {
    this.query.id = this.getCompetitionId()
    this.query.user_type = this.participantType
    this.getRecords()
    this.$watch(() => {
      return this.$refs.table.$table.selection
    }, () => {
      this.selectedRecords = this.$refs.table.$table.selection
    })
  },
  methods: {
    // getList() {
    //   if (!this.getCompetitionId()) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     competitionMemberList({
    //       data: {
    //         id: this.getCompetitionId(),
    //         user_type: this.participantType
    //       }
    //     })
    //       .then((res) => {
    //         if (res.data) {
    //           this.data = res.data.data
    //         }
    //         resolve(res)
    //       })
    //       .catch((err) => {
    //         console.error(err)
    //         reject(err)
    //       })
    //       .finally(() => {
    //         this.loading = false
    //       })
    //   })
    // },
    addCompetitionUser() {
      this.showTableDialog = true
    },
    closeDialog() {
      this.$refs.competitionUserDialog.initData()
      this.showTableDialog = false
    },
    confirm(ids) {
      if (!ids || !ids?.length) {
        this.$message({
          type: 'error',
          message: '请先勾选参与人员'
        })
        return
      }
      competitionMemberOrgAdd({
        data: {
          id: this.getCompetitionId(),
          orgs: ids
        }
      }).then(() => {
        this.showTableDialog = false
        this.getRecords()
      })
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.o_id])
    },
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.o_id)
        return acc
      }, [])
      this._delete(ids)
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        competitionMemberOrgDel({
          data: {
            id: this.getCompetitionId(),
            orgs: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    initBatchGroup() {
      if (!this.selectedRecords?.length) {
        return this.$message({
          type: 'warning',
          message: '未选择任何数据'
        })
      }
      this.batchGroupValue = ''
      this.showGroupDialog = true
    },
    batchGroup() {
      const ids = this.selectedRecords.map(item => item.o_id)
      this.group(ids, this.batchGroupValue).then(() => {
        this.showGroupDialog = false
      })
    },
    group(ids, group) {
      return competitionMemberOrgGroup({
        data: {
          id: this.getCompetitionId(),
          orgs: ids.map(id => {
            return { o_id: id, group_name: group }
          })
        }
      }).then(res => {
        this.getRecords()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table-tag {
  overflow:hidden;
  text-overflow:ellipsis;
}
::v-deep {
  .el-dialog {
    width: 80%;
    max-width: 80%;
    padding-top: 20px;
    padding-bottom: 30px;
    margin-top: 50px !important;
    max-height: calc(100% - 100px);
    .el-dialog__body {
      padding-top: 25px;
      padding-bottom: 0;
    }
  }
}
</style>
