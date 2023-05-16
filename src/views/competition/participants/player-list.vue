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
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="tableColumns" :data="records" />
    <el-dialog :visible.sync="showTableDialog" title="添加" @close="closeDialog">
      <PlayerListDialog
        ref="competitionUserDialog"
        :item-active="itemActive"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
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
import PlayerListDialog from './player-list-dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { competitionMemberAdd,
  competitionMemberDel, competitionMemberList, competitionMemberGroup
} from '@/api/competition'
import { ParticipantTypeMap, PlayerType } from './index.vue'
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
    PlayerListDialog,
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
      { prop: 'account', label: '账号' },
      { prop: 'name', label: '昵称' },
      { prop: 'real_name', label: '姓名' },
      { prop: 'org_name', label: '组织', render: (scope) => {
        return (<div>{ scope.row.org_name?.map(item => item.name)?.join(', ') }</div>)
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

    // only player && drill has group
    if (this.itemActive === PlayerType && competition.competition_model === CompetitionDrillModel) {
      tableColumns.splice(-1, 0, { label: '分组', render: (scope) => {
        return (
          <div>
            <el-select
              disabled={this.competition.going}
              allow-create
              filterable value={scope.row.group_name} oninput={ val => { this.group([scope.row.id], val) } }>
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
      data: [],
      showTableDialog: false,
      // loading: false,
      groupsMap: new Map([
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F']
      ]),
      tableColumns
    }
  },
  computed: {
    participantType: function() {
      return ParticipantTypeMap.get(this.itemActive)
    },
    defaultGroups: function() {
      // this.data.forEach?.(item => {
      //   const groupName = item.group_name
      //   if (!this.groupsMap.get(item.group_name) && groupName) {
      //     this.groupsMap.set(groupName, groupName)
      //   }
      // })

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
      competitionMemberAdd({
        data: {
          id: this.getCompetitionId(),
          u_ids: ids,
          user_type: this.participantType
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
        competitionMemberDel({
          data: {
            id: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    group(ids, group) {
      return competitionMemberGroup({
        data: {
          id: this.getCompetitionId(),
          info: ids.map(id => {
            return { id: id, group_name: group }
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
