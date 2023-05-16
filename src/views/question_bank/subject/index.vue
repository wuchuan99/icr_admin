<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="initModel(), (showFormDialog = true)"
        >新增</el-button>
        <el-button class="filter-item" size="medium" icon="el-icon-upload" @click="openImportDialog">导入</el-button>
        <span class="import-button">
          <span>想要批量导入？请先</span>
          <!-- <a target="_blank" @click="downloadQuestionTemplate">题目模板.xlsx</a> -->
          <a :href="ResourcePrefix + 'default/模板-试题模板.xlsx'" target="_blank">下载模版</a>
        </span>
        <icr-dialog title="导入题库" :visible.sync="showImportDialog" width="500px" @confirm="importQuestion">
          <el-upload
            ref="importQuestion"
            action="/api/question_manage/question/importex"
            name="_upload_files"
            :auto-upload="false"
            :data="{ flag: 'file' }"
            :headers="{ Authorization: token }"
            style="display:inline-block;"
            :show-file-list="true"
            :on-success="importQuestionSuccess"
          >
            <el-button class="filter-item" size="medium">选择文件</el-button>
          </el-upload>

        </icr-dialog>
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">标签选择 : </span> -->
          <el-select v-model="query.tag" clearable size="medium" placeholder="标签选择" @change="getRecords">
            <el-option
              v-for="item in tags"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="query-conditions__item search">
          <!-- <span class="label">题目类型 : </span> -->
          <el-select v-model="query.category" clearable size="medium" placeholder="题目类型" @change="getRecords">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.desc"
            placeholder="请输入内容"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
          <!-- <el-button
            class="filter-item"
            icon="el-icon-search"
            type="primary"
            size="medium"
            @click="getRecords"
          >搜索</el-button> -->
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :options="tableOptions" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />

    <el-dialog
      :visible.sync="showFormDialog"
      :title="(model.id ? '编辑' : '新增') + '题目'"
    >
      <icr-form
        refs="form"
        :model="model"
        :fields="modelFormFields"
        :rules="formRules"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="题目标签" prop="tag" class="tags-wrapper">
          <div class="tags-input">
            <el-autocomplete
              ref="tagInput"
              v-model="inputTag"
              clearable
              autofocus
              :fetch-suggestions="tagSuggestions"
              @clear="tagInputClear"
            />
            <!-- <el-button size="small" type="primary" @click="addTag" style="margin-left:15px;">添加</el-button> -->
            <span class="addBtn" @click="addTag">添加</span>
          </div>
          <div class="tags">
            <el-tag v-for="tag in model.tag" :key="tag" class="tags-item" closable @close="removeTag(tag)">{{ tag }}</el-tag>
          </div>
        </el-form-item>

        <div
          v-if="model.category === types.single || model.category === types.multi"
          class="options-wrapper"
        >
          <el-form-item label="选项数量">
            <el-input-number v-model="optionCount" :min="1" :max="10" />
          </el-form-item>
          <div class="options">
            <el-form-item
              v-for="(val, key, index) in model.choice_detail"
              :key="key"
              :inline="true"
            >
              <el-input v-model="model.choice_detail[key]">
                <template slot="prepend">{{ '选项' + String.fromCharCode(65 + index) }}</template>
              </el-input>
            </el-form-item>
          </div>
        </div>

        <el-form-item label="答案" prop="answer" class="answer">
          <div v-if="model.category === types.single">
            <el-radio
              v-for="(val, key, index) in model.choice_detail"
              :key="key"
              v-model="model.answer"
              :label="String.fromCharCode(65 + index)"
            />
          </div>

          <div v-if="model.category === types.multi">
            <el-checkbox-group v-model="model.answer">
              <el-checkbox
                v-for="(val, key, index) in model.choice_detail"
                :key="key"
                :label="String.fromCharCode(65 + index)"
              />
            </el-checkbox-group>
          </div>

          <div v-if="model.category === types.judge">
            <el-radio v-model="model.answer" label="yes">正确</el-radio>
            <el-radio v-model="model.answer" label="no">错误</el-radio>
          </div>

          <div v-if="model.category === types.subject">
            <el-input
              v-model="model.answer[0]"
              type="textarea"
              :rows="6"
              placeholder="请输入答案"
              style="width: 100%;"
            />
          </div>
        </el-form-item>
        <el-form-item label="答案解析" prop="answer_analysis">
          <el-input
            v-model="model.answer_analysis"
            type="textarea"
            :rows="6"
            placeholder="请输入答案解析"
            style="width: 100%;"
          />
        </el-form-item>
      </icr-form>
    </el-dialog>

    <icr-confirm-delete ref="confirmDelete" title="删除题目" desc="您即将删除题目, 删除题目的同时会从试卷内删除该题目, 确定删除?" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import IcrDialog from '@/components/dialog.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection, useCurd } from '@/hooks'
import {
  questionPaging,
  tagList,
  questionAdd,
  questionDel,
  questionUpdate,
  questionEnable
} from '@/api/question'
import { getQuestionTemplate } from '@/api/download'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { downloadResouce } from '@/utils'
import { ResourcePrefix } from '@/const/common'

const JUDGE = 0
const SINGLE = 1
const MULTI = 2
const Subject = 4

const typeMap = new Map([
  [JUDGE, '判断题'],
  [SINGLE, '单选题'],
  [MULTI, '多选题'],
  [Subject, '主观题']
])

const typeOptions = Array.from(typeMap).map((v) => {
  return { label: v[1], value: v[0] }
})

const defaultOptionCount = 4

const LevelEasy = '简单'
const LevelMedium = '一般'
const LevelChallenge = '较难'
const LevelHard = '困难'

const levelMap = new Map([
  [LevelEasy, LevelEasy],
  [LevelMedium, LevelMedium],
  [LevelChallenge, LevelChallenge],
  [LevelHard, LevelHard]
])

const levelOptions = Array.from(levelMap).map((v) => {
  return { label: v[1], value: v[0] }
})

export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination,
    IcrDialog
  },
  setup() {
    const query = reactive({
      desc: ''
    })

    const { selection } = useTableSelection()

    return {
      query,
      selection,
      ...usePagination(questionPaging, query),
      ...useCurd({ removeFn: questionDel })
    }
  },
  data() {
    return {
      ResourcePrefix,
      model: {
        category: '',
        desc: '',
        difficulty: '',
        tag: [],
        answer: '',
        answer_analysis: '',
        choice_detail: {}
      },
      inputTag: '',
      tags: [],
      types: {
        judge: JUDGE,
        single: SINGLE,
        multi: MULTI,
        subject: Subject
      },
      directOptions: [
        { label: '方向1', value: 0 },
        { label: '方向2', value: 1 },
        { label: '方向3', value: 2 }
      ],
      typeOptions,
      levelOptions,
      modelFormFields: [
        {
          label: '题目类型',
          type: 'select',
          prop: 'category',
          inputOption: {
            options: typeOptions
          },
          itemOption: { required: true }
        },
        {
          label: '题目难度',
          type: 'select',
          prop: 'difficulty',
          inputOption: {
            options: levelOptions
          },
          itemOption: { required: true }
        },
        {
          label: '题目描述',
          type: 'input',
          prop: 'desc',
          inputOption: { type: 'textarea', autosize: { minRows: 4 }},
          itemOption: { required: true }
        }
      ],
      formRules: {
        category: [
          { required: true, message: '类型不能为空', trigger: 'blur' }
        ],
        difficulty: [
          { required: true, message: '难度不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ],
        answer: [
          { required: true, message: '答案不能为空', validator: (rule, value, cb) => {
            if (
              !value ||
              (Array.isArray(value) && !value.length) ||
              (value && value.length && !value[0])
            ) {
              return cb(new Error('答案不能为空'))
            }
            cb()
          }, trigger: 'blur' }
        ]
      },
      showFormDialog: false,
      showImportDialog: false,
      optionCount: defaultOptionCount,
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'desc', label: '题目描述' },
          {
            prop: 'answer',
            label: '题目答案',
            render: (scope) => {
              const clone = cloneDeep(scope.row.answer)

              const isJudge = scope.row.category === JUDGE
              let judgeStr = ''
              const judgeAns = clone[0] && clone[0].toLowerCase()
              if (judgeAns) {
                switch (judgeAns) {
                  case 'yes':
                    judgeStr = '正确'
                    break
                  case 'no':
                    judgeStr = '错误'
                    break
                }
              }

              return <div>{isJudge ? judgeStr : clone.sort().join(',')}</div>
            }
          },
          {
            label: '题目类型',
            render: (scope) => {
              return <div> {typeMap.get(scope.row.category)}</div>
            }
          },
          {
            label: '题目难度',
            prop: 'difficulty'
          },
          {
            label: '题目标签',
            render: (scope) => {
              const { tag } = scope.row
              return <div> {tag.join(',')}</div>
            }
          },
          { label: '设为练习', width: '150', render: scope => {
            const practiceSwitch = (
              <div>
                <el-switch
                  value={ scope.row.status }
                  oninput={ (val) => {
                    const data = cloneDeep(scope.row)
                    data.status = val
                    questionEnable({
                      question_id: scope.row.id,
                      question_status: val
                    }).then(res => {
                      if (res.status === 0) {
                        scope.row.status = val
                        this.$message({
                          type: 'success',
                          message: '更新成功'
                        })
                      }
                    })
                  }}
                  active-value={1} inactive-value={0}
                  style='margin-right: 8px;'
                />
                { scope.row.status ? '是' : '否' }
              </div>
            )
            return scope.row.category !== Subject ? practiceSwitch : ''
          } },
          {
            label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i
                //       class='el-icon-edit'
                //       onclick={() => {
                //         this.edit(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='删除' placement='top'>
                //     <i
                //       class='el-icon-delete'
                //       onclick={() => {
                //         this.delete(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                // </div>
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    $table() {
      return this.$refs.table
    },
    postModel() {
      const model = cloneDeep(this.model)
      model.answer instanceof Array ? '' : (model.answer = [model.answer])
      return model
    }
  },
  watch: {
    optionCount(newVal) {
      this.model.choice_detail = this.makeChoice(newVal)
    },
    'model.category': {
      handler(newVal) {
        if (newVal === this.types.multi) {
          this.model.answer = []
        } else {
          this.model.answer = []
        }
      },
      immediate: true
    }
  },
  created() {
    this.getTags()
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    makeChoice(count, cache = true) {
      return Array.apply(null, Array(count)).reduce((acc, val, index) => {
        const key = String.fromCharCode(65 + index)
        acc[key] = cache
          ? this.model.choice_detail[key]
            ? this.model.choice_detail[key]
            : val
          : val
        return acc
      }, {})
    },
    initModel() {
      this.inputTag = ''
      this.optionCount = defaultOptionCount
      this.model = {
        category: SINGLE,
        desc: '',
        tag: [],
        difficulty: '',
        answer: '',
        answer_analysis: '',
        choice_detail: this.makeChoice(this.optionCount, false)
      }
    },
    getTags() {
      tagList().then((res) => {
        if (res.data) {
          this.tags = res.data.data.map((item) => {
            return Object.assign({}, item, {
              label: item.name,
              value: item.name
            })
          })
        }
      })
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      questionAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
        this.getTags()
      })
    },
    update() {
      questionUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
        this.getTags()
      })
    },
    edit(scope) {
      this.inputTag = ''
      this.optionCount = Object.entries(scope.row.choice_detail).length

      this.model.category = scope.row.category
      setTimeout(() => {
        this.model = cloneDeep(scope.row)
        // this.model.tag = this.model.tag.map((v) => Number(v))
        if (this.model.category === JUDGE) {
          this.model.answer =
            this.model.answer && this.model.answer[0].toLowerCase()
        }

        if (this.model.category === SINGLE) {
          this.model.answer = this.model.answer && this.model.answer[0]
        }
        this.showFormDialog = true
      })
    },
    openImportDialog() {
      this.showImportDialog = true
    },
    importQuestion() {
      this.$refs.importQuestion && this.$refs.importQuestion.submit()
    },
    importQuestionSuccess(resp) {
      const { status, msg, data } = resp
      if (status !== 0) {
        this.$message({
          message: msg,
          type: 'error'
        })
      }

      if (data.error_file) {
        this.$message({
          message: '上传文件有误',
          type: 'error'
        })
        setTimeout(() => {
          downloadResouce(data.error_file)
        }, 1000)
      }

      this.$refs.importQuestion.clearFiles()
      this.showImportDialog = false
      this.getRecords()
      this.getTags()
    },
    downloadQuestionTemplate() {
      getQuestionTemplate().then(res => {
        const filename = res.headers['content-disposition'].split(';')[1].split('=')[1]
        const bb = new Blob([res.data], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(bb)
        a.click()
      })
    },
    tagSuggestions(query, cb) {
      const results = query ? this.tags.filter((tag) => {
        return tag.value.indexOf(query) >= 0
      }) : this.tags
      cb(results)
    },
    addTag() {
      if (!this.inputTag) return
      if (this.model.tag.indexOf(this.inputTag) >= 0) {
        return this.$message({
          message: '标签已存在',
          type: 'warning'
        })
      }
      this.model.tag.push(this.inputTag)
      this.inputTag = ''
    },
    removeTag(tag) {
      this.model.tag.splice(this.model.tag.indexOf(tag), 1)
    },
    tagInputClear() {
      document.activeElement.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog {
  min-width: 750px;
}
.question-form {
  min-width: 750px;
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 740px;
  }
}
.import-button {
  margin-left: 20px;
  span {
    color:rgba(255,255,255,0.5);
  }
}
.tags-wrapper {
  .tags {
    display: flex;
    flex-wrap: wrap;
    max-width: 660px;
    .tags-item {
      margin-right: 8px;
      margin-top: 8px;
      font-size: 14px;
    }
  }
  .addBtn {
    display: inline-block;
    width: 60px;
    background-color:rgba(255,255,255,0.1);
    border-left: 1px solid rgba(255,255,255,0.2);
    text-align: center;
    color: #00AD84;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
::v-deep {
  .options-wrapper .el-form-item {
    margin-bottom: 20px;
  }
  .options .el-form-item:nth-child(2n) .el-form-item__content {
    margin-left: 20px !important;
  }
  .options .el-input-group__prepend {
    width: 80px;
  }
  .el-autocomplete .el-input {
    width: 260px;
  }
}
</style>
