<template>
  <div class="rules" :class="classes.join(' ')">
    <div class="tools">
      <div class="senceName">{{ senceName || '' }}</div>
      <div class="zoom notDisabled">
        <el-button size="small" type="text" @click="changeSize(-0.1)"><i class="el-icon-minus" /></el-button>
        <el-dropdown class="zoom-percent" placement="bottom" @command="setZoom">
          <el-button size="small" type="text">{{ parseInt(scale * 100) }}%</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="2">200%</el-dropdown-item>
            <el-dropdown-item command="1">100%</el-dropdown-item>
            <el-dropdown-item command="0.5">50%</el-dropdown-item>
            <el-dropdown-item command="0.3">30%</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button size="small" type="text" @click="changeSize(0.1)"><i class="el-icon-plus" /></el-button>
        <el-button size="small" type="text" @click="setFullscreen"><i :class="fullscreen ? 'iconfont icon-guanbiquanping' : 'iconfont icon-quanping1'" /></el-button>
        <el-button size="small" type="text" @click="centerContent"><i class="iconfont icon-juzhong" /></el-button>
      </div>
      <div class="btns">
        <el-button size="small" @click="goBack">取消</el-button>
        <el-button size="small" type="primary" @click="submitRules">保存</el-button>
      </div>
    </div>
    <div class="rules_warp">
      <div class="tips">
        <i class="iconfont icon-info" />
        <span>点击拓扑中的元件添加判定规则</span>
      </div>
      <topology ref="topology" :scene-data="sceneData" :fullscreen-obj="fullscreenObj" style="flex: 1;overflow: hidden;" @show-dialog="showDialog" @changeScale="changeScale" />
      <div class="table rule-table">
        <icr-table
          ref="table"
          :loading="loading"
          :height="'calc(100vh - 250px)'"
          :columns="table.columns"
          :data="records"
        />
      </div>
    </div>
    <el-dialog
      :visible.sync="showFormDialog"
      :title="(model.id ? '编辑' : '新增') + '判定规则'"
      append-to-body
      custom-class="app-main"
    >
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submitForm"
      >
        <el-form-item label="解析过程" prop="writeup">
          <FileUploader v-model="model.writeup" :data="{ file_type: 'manual' }" accept=".pdf" />
        </el-form-item>
        <el-form-item
          v-if="model.judgment !== ManualJudgment"
          label="Flag值"
          prop="flag"
        >
          <el-input v-model="model.flag" />
        </el-form-item>
        <el-form-item label="靶标描述" prop="desc">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除规则" desc="您即将删除该判定规则, 确定删除?" />
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import IcrForm from '@/components/form'
import FileUploader from '@/views/common/upload/file-uploader.vue'
import IcrTable from '@/components/table'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import topology from '../topology/_editor.vue'
import { Categorys, ruleJudgments, ManualJudgment } from '@/const/resource'
import { mapToSelectionOptions } from '@/utils/'
import { required } from '@/utils/validate-helper'
import {
  scenetargetRetrieve,
  scenetargetRuleAdd,
  scenetargetRuleDelete,
  scenetargetRuleUpdate,
  // scenetargetRuleRetrieve,
  // scenetargetRuleList,
  scenetargetRulePaging
} from '@/api/scene'
export default {
  components: {
    IcrForm,
    FileUploader,
    IcrTable,
    IcrConfirmDelete,
    topology
  },
  props: {
    sceneId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      ManualJudgment,
      sceneData: {},
      table: {
        columns: [
          { prop: 'name', label: '规则名称' },
          { prop: 'category', label: '技巧分类' },
          { prop: 'judgment', label: '判定方式' },
          { prop: 'target', label: '判定目标' },
          {
            label: '操作',
            width: '120',
            showOverflowTooltip: false,
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope.row) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope.row) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      },
      records: [],
      loading: false,
      showFormDialog: false,
      model: {
        network_ele_id: '',
        target: '',
        name: '',
        category: null,
        judgment: null,
        writeup: '',
        flag: '',
        desc: ''
      },
      formFields: [
        {
          label: '判定目标',
          type: 'input',
          prop: 'target',
          disabled: true
        },
        {
          label: '规则名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '技巧分类',
          type: 'select',
          prop: 'category',
          options: mapToSelectionOptions(Categorys)
        },
        {
          label: '判定方式',
          type: 'select',
          prop: 'judgment',
          options: mapToSelectionOptions(ruleJudgments)
        }
      ],
      formRules: {
        name: required('规则名称'),
        category: required('技巧分类'),
        judgment: required('判定方式'),
        writeup: required('解析过程'),
        flag: required('flag值')
      },
      senceName: '', // 场景名称
      scale: 1, // 缩放刻度
      fullscreen: false, // 是否全屏
      classes: [], // 全屏类名列表
      fullscreenObj: { fullTarget: '.rules', otherEle: '.rule-table' } // 需要全屏的盒子/拓扑图左右两侧其他盒子类名
    }
  },
  computed: {
    postModel() {
      return this.serializeModel(this.model)
    }
  },
  watch: {
    'model.judgment': function(val) {
      if (val === 6) {
        this.model.flag = ''
      }
    }
  },
  mounted() {
    this.sceneId && this.getDetail()
  },
  methods: {
    getDetail() {
      return scenetargetRetrieve({
        id: this.sceneId
      }).then(res => {
        if (res.status === 0) {
          this.sceneData = res.data || {}
          this.senceName = this.sceneData?.scene.name
          this.$nextTick(() => {
            this.$refs.topology.init()
            this.getRecords()
          })
        }
      })
    },
    getRecords() {
      this.loading = true
      scenetargetRulePaging({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          scene_id: this.sceneId
        }}).then((res) => {
        this.records = res?.data?.data || []
      }).finally(() => {
        this.loading = false
      })
    },
    submitForm() {
      console.log('submit', this.model)
      this.model.id ? this.update() : this.create()
    },
    update() {
      scenetargetRuleUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    create() {
      scenetargetRuleAdd({
        data: {
          scene_id: this.sceneId,
          ...this.postModel
        }
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    showDialog(data) {
      this.showFormDialog = true
      this.initModel(data)
    },
    initModel(data) {
      this.model = {
        network_ele_id: data.id,
        target: data?.attrs?.name || '',
        name: '',
        category: null,
        judgment: null,
        writeup: '',
        flag: '',
        desc: ''
      }
    },
    edit(row) {
      this.showFormDialog = true
      this.model = this.serializeModel(row)
    },
    serializeModel(data) {
      const model = cloneDeep(data)
      model.writeup = model.writeup?.url ? model.writeup.url : model.writeup

      function getMapKeyByValue(m, v) {
        for (const [k, val] of m.entries()) {
          if (val === v) {
            return k
          }
        }
      }
      if (typeof model.category !== 'number') {
        model.category = getMapKeyByValue(Categorys, model.category)
      }
      if (typeof model.judgment !== 'number') {
        model.judgment = getMapKeyByValue(ruleJudgments, model.judgment)
      }

      return model
    },
    delete(row) {
      this.$refs.confirmDelete.prompt().then(() => {
        scenetargetRuleDelete({
          data: {
            type: 1,
            ids: [row.id]
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    submitRules() {
      this.fullscreen = false
      this.$emit('submit')
    },
    goBack() {
      this.$router.push('/targets/scene-targets')
    },
    changeSize(size) {
      this.$refs.topology.changeSize(size)
    },
    setZoom(command) {
      this.$refs.topology.setZoom(command)
    },
    centerContent() {
      this.$refs.topology.centerContent()
    },
    changeScale(scale) {
      this.scale = scale
    },
    setFullscreen() {
      this.fullscreen = !this.fullscreen
      if (this.fullscreen) {
        this.classes = ['topology-editor__fullscreen']
      } else {
        this.classes = []
      }
      this.$nextTick(() => {
        this.$refs.topology.setFullSceen(this.fullscreen)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/styles/themes/black/vars.scss";
  .topology-editor__fullscreen {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    z-index: 2000;
    .tools {
      background: $--icr-bg-color-regular;
    }
    .table {
      background: $--icr-bg-color-regular;
    }
  }
  .rules {
    width: 100%;
    height: 100%;
    border-top: 2px solid rgba(255, 255, 255, 0.1);
    .tools {
      height: 46px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px 0 15px;
      border-left: 2px solid rgba(255, 255, 255, 0.1);
      border-right: 2px solid rgba(255, 255, 255, 0.1);
      .senceName {
        font-size: 16px;
        font-weight: bold;
        max-width: calc(100% - 395px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .zoom{
      position: relative;
      font-size: 16px;
      .el-button{
        margin: 0 8px;
      }
      .zoom-percent {
        .el-button{
          padding: 5px 15px;
          margin: 0;
        }
      }
    }
    .zoom>.el-button:last-child{
      margin: 0 8px;
      position: relative;
      &:after{
        display: block;
        content: '';
        position: absolute;
        left: -10px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
    }
     .zoom:after{
        display: block;
        content: '';
        position: absolute;
        left: 0px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
      .zoom:before{
        display: block;
        content: '';
        position: absolute;
        right: 0px;
        top: -1px;
        width: 2px;
        height: 30px;
        background-color:$--icr-color-input-primary;
      }
    }
    .rules_warp {
      position: relative;
      height: calc(100% - 46px);
      display: flex;
      align-items: center;
      overflow: hidden;
      .tips {
        position: absolute;
        top: 15px;
        left: 15px;
        z-index: 999;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.6);
        i {
          margin-right: 6px;
        }
      }
      .table {
        width: 600px;
        height: 100%;
        overflow-y: auto;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-left: none;
        // ::v-deep {
        //   > div {
        //     height: 100%;
        //     .el-table {
        //       height: 100%;
        //       display: flex;
        //       flex-flow: column;
        //       .el-table__body-wrapper {
        //         flex: 1;
        //         overflow: auto;
        //         overflow-x: hidden;
        //         // .el-table__empty-block {
        //         //   height: 60px !important;
        //         // }
        //       }
        //     }
        //   }
        // }
      }
    }
    .question-form {
      .options {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
  ::v-deep {
    .el-form-item:nth-child(-n+2) {
      display: inline-block;
    }
    .el-form-item:nth-child(1) {
      margin-right: 70px;
    }
    .tools .el-button--text {
      color: #fff;
    }
  }
</style>
