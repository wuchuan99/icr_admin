<template>
  <div class="settings-task">
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="!scene || !scene.id || competition.going"
          @click="showTableDialog = true"
        >
          添加题目
        </el-button>
      </div>
      <div style="float: right"></div>
    </div>
    <icr-table
      ref="table"
      :columns="table.columns"
      :data="questions"
      :loading="loading"
      height="calc(100vh - 332px)"
    />
    <div class="actions">
      <el-button
        type="primary"
        :disabled="!scene || !scene.id || competition.going"
        @click="submit"
      >
        保存
      </el-button>
      <el-button :disabled="!scene || !scene.id || competition.going" @click="goBack">取消</el-button>
    </div>
    <el-dialog
      v-if="showTableDialog"
      width="60%"
      :visible.sync="showTableDialog"
      title="添加题目"
      @close="closeDialog"
    >
      <SceneRuleDialog
        v-if="showTableDialog"
        ref="sceneDialog"
        :scene-id="scene.id"
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
import SceneRuleDialog from './scene-rule-dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { downloadFile } from '@/utils/file'
import {
  competitionQuestionUpdate,
  competitionQuestionList,
  competitionQuestionTaskAdd,
  competitionQuestionTaskDelete
} from '@/api/competition'
import { ResourcePrefix } from '@/const/common'
import { debounce, cloneDeep } from 'lodash-es'
import { currentScene } from './scene.vue'
import emitter from 'element-ui/src/mixins/emitter'

export default {
  components: {
    IcrTable,
    IcrConfirmDelete,
    SceneRuleDialog
  },
  mixins: [emitter],
  inject: ['getCompetitionId', 'getCompetition'],
  props: {
  },
  data() {
    return {
      competition: this.getCompetition(),
      scene: {},
      sceneQuestion: {},
      questions: [],
      loading: false,
      table: {
        // 任务添加-表格配置
        columns: [
          { prop: 'name', label: '题目名称' },
          { prop: 'target', label: '题目目标' },
          { prop: 'desc', label: '题目描述' },
          {
            prop: 'writeup',
            minWidth: 160,
            label: '题目解析',
            className: 'answer',
            render: (scope) => {
              return (
                <div>
                  <span
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.writeup) }}
                  >
                    {scope.row.writeup.split('/').pop()}
                  </span>
                </div>
              )
            }
          },
          {
            label: '题目分值',
            render: (scope) => {
              return (
                <div>
                  <el-input-number
                    value={ scope.row.score }
                    oninput={val => { scope.row.score = val }}
                    size='mini'
                    min={ 1 }
                    disabled={ this.competition.going }
                  />
                </div>
              )
            }
          },
          {
            label: '操作',
            width: 100,
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => { this.delete(scope) }}
                    disabled={ this.competition.going }
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
  watch: {},
  mounted() {
    this.scene = cloneDeep(currentScene)
    this.getQuestionList()
  },
  methods: {
    getQuestionList() {
      if (!this.getCompetitionId()) return
      return new Promise((resolve, reject) => {
        this.loading = true
        competitionQuestionList({
          data: { id: this.getCompetitionId(), category: 3 }
        })
          .then((res) => {
            if (res.status === 0) {
              this.sceneQuestion = res.data?.data?.[0]
              this.questions = res.data?.data?.[0]?.rules
            }
            resolve(res)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    closeDialog() {
      this.showTableDialog = false
    },
    confirm(ids) {
      if (!ids.length) return
      competitionQuestionTaskAdd({
        data: { id: this.getCompetitionId(), task_ids: ids }
      }).then(res => {
        this.getQuestionList()
      }).finally(() => {
        this.closeDialog()
      })
    },
    submit() {
      if (!this.questions.length) {
        this.$message({
          type: 'warning',
          message: '请先添加题目'
        })
        return
      }
      const ruleList = this.questions.reduce((acc, item) => {
        acc.push({
          id: this.sceneQuestion.id,
          name: item.name,
          score: item.score
        })
        return acc
      }, [])

      return competitionQuestionUpdate({
        data: ruleList
      }).then(() => {
        this.dispatch('CompetitionEdit', 'next')
      })
    },
    update: debounce(function() {
      if (!this.questions.length) return
      const ruleList = this.questions.reduce((acc, item) => {
        acc.push({
          id: this.sceneQuestion.id,
          name: item.name,
          score: item.score
        })
        return acc
      }, [])

      return competitionQuestionUpdate({
        data: ruleList
      }).then(() => {
        this.getQuestionList()
      })
    }, 0),
    // 单项删除
    delete(scope) {
      this._delete(scope)
    },
    // 删除项目
    _delete(scope) {
      this.$refs.confirmDelete.prompt().then(() => {
        competitionQuestionTaskDelete({
          data: {
            id: this.getCompetitionId(),
            name: scope.row.name
          }
        }).then(res => {
          this.getQuestionList()
        })
      })
    },
    downLoadFile(url) {
      downloadFile(`${ResourcePrefix}${url}`, url.split('/').pop())
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.settings-task {
  ::v-deep {
    td.answer .cell span {
      color: #00CDA8;
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
  }
}
</style>
