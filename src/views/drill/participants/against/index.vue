<template>
  <div class="against">
    <!-- buttons -->
    <div class="team_box">
      <div class="redTeam">
        <div class="operation-box">
          <!-- buttons -->
          <div class="operation">
            <el-button
              class="filter-item"
              type="primary"
              size="medium"
              :disabled="disabled"
              @click="AddTeamUser(0)"
            >
              添加红队
            </el-button>
          </div>
        </div>
        <team-list
          ref="redTeam"
          :color="0"
          :drill-id="drillData.id"
          :disabled="disabled"
          @del="del"
          @deleteAll="deleteAll"
        />
      </div>
      <div class="buleTeam">
        <div class="operation-box">
          <!-- buttons -->
          <div class="operation">
            <el-button
              class="filter-item"
              type="primary"
              size="medium"
              :disabled="disabled"
              @click="AddTeamUser(1)"
            >
              添加蓝队
            </el-button>
          </div>
        </div>
        <team-list
          ref="blueTeam"
          :color="1"
          :drill-id="drillData.id"
          :disabled="disabled"
          @del="del"
          @deleteAll="deleteAll"
        />
      </div>
    </div>
    <div style="margin-top: 16px">
      <el-button :disabled="disabled" type="primary" @click="submit">保存</el-button>
      <el-button @click="goBack">取消</el-button>
    </div>

    <el-dialog width="45%" :visible.sync="showTableDialog" title="添加队伍" @close="closeDialog">
      <teamuser-dialog
        v-if="showTableDialog"
        ref="teamuserDialog"
        :radio="true"
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
import TeamuserDialog from '../component/team_dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { drillOrgPaging, drillOrgAdd, drillOrgDelete } from '@/api/drill'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import TeamList from './team_list.vue'
export default {
  components: {
    TeamuserDialog,
    IcrConfirmDelete,
    TeamList
  },
  setup() {
    const query = reactive({
      drill_id: ''
    })
    return {
      query,
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
      color: '',
      showTableDialog: false
    }
  },
  computed: {
    disabled() {
      return [1, 2].includes(this.drillData.status) || this.drillData.enable_status === 1
    }
  },
  mounted() {},
  methods: {
    AddTeamUser(color) {
      this.color = color
      this.showTableDialog = true
    },
    closeDialog() {
      this.color = ''
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
          color: this.color
        }
      }).then(() => {
        this.showTableDialog = false
        if (this.color === 0) {
          this.$refs?.redTeam?.getRecords()
        } else if (this.color === 1) {
          this.$refs?.blueTeam?.getRecords()
        }
      })
    },
    // 单项删除
    del(scope) {
      this._delete([scope.row.id], scope.row.color)
    },
    // 批量删除
    deleteAll(ids, color) {
      this._delete(ids, color)
    },
    // 删除项目
    _delete(ids, color) {
      this.$refs.confirmDelete.prompt().then(() => {
        drillOrgDelete({
          data: {
            drill_id: this.drillData.id,
            type: 1,
            ids: ids
          }
        }).then(() => {
          if (color === 0) {
            this.$refs?.redTeam?.getRecords()
          } else if (color === 1) {
            this.$refs?.blueTeam?.getRecords()
          }
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
.against {
  .team_box {
    display: flex;
    >div {
      flex: 1;
      &.buleTeam {
        margin-left: 20px;
      }
    }
  }
}
</style>
