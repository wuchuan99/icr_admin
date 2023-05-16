<template>
  <div class="app-container">
    <icr-form
      ref="ruleForm"
      :model="ruleForm"
      :rules="formRules"
      label-width="110px"
      class="ruleForms"
      :label-position="labelPosition"
      @cancel="resetForm"
      @confirm="submitForm"
    >
      <el-form-item label="章节" prop="chapter">
        <el-select
          v-model="ruleForm.chapter_id"
          clearable
          style="width: 320px"
          placeholder="请选择"
        >
          <el-option
            v-for="item in chapterOption"
            :key="item.id"
            :label="item.chapter_order + item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" style="width: 320px" />
      </el-form-item>
      <el-form-item label="类型" prop="classify">
        <el-select
          v-model="ruleForm.classify"
          style="width: 320px"
          placeholder="请选择"
          @change="classifyChange"
        >
          <el-option
            v-for="item in classifyOption"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="level">
        <el-select
          v-model="ruleForm.level"
          style="width: 320px"
          placeholder="请选择"
        >
          <el-option
            v-for="item in levelOption"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学习时长" prop="duration">
        <el-select
          v-model="ruleForm.duration"
          style="width: 320px"
          placeholder="请选择"
        >
          <el-option
            v-for="item in durationOption || []"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="讲义">
        <!-- <el-input
          v-model="fileName.handout"
          style="width: 240px; float: left"
          disabled
        />
        <el-upload
          class="file-upload"
          :headers="myHeaders"
          action="/api/file/upload"
          name="_upload_files"
          accept=".pdf"
          :file-list="upLoadfile.handout"
          :data="{ ...uploadData, file_type: 'handout' }"
          :multiple="false"
          :on-success="(res, file) => handleSuccess(res, file, 'handout')"
          :on-exceed="handleExceed"
          :before-upload="(file) => beforeUpload(file, 'handout')"
        >
          <el-button size="small" type="primary">选择文件</el-button>
        </el-upload> -->
        <FileUploader v-model="ruleForm.content.handout" :data="{'file_type':'handout'}" accept=".pdf" :before-upload="(file) => beforeUpload(file, 'handout')" />
      </el-form-item>
      <el-form-item label="视频">
        <!-- <el-input
          v-model="fileName.video"
          style="width: 240px; float: left"
          disabled
        />
        <el-upload
          class="file-upload"
          :headers="myHeaders"
          action="/api/file/upload"
          name="_upload_files"
          accept=".mp4"
          :file-list="upLoadfile.video"
          :data="{ ...uploadData, file_type: 'video' }"
          :multiple="false"
          :on-success="(res, file) => handleSuccess(res, file, 'video')"
          :on-exceed="handleExceed"
          :before-upload="(file) => beforeUpload(file, 'video')"
        >
          <el-button size="small" type="primary">选择文件</el-button>
        </el-upload> -->
        <FileUploader v-model="ruleForm.content.video" :data="{'file_type':'video'}" accept=".mp4,.mov" :before-upload="(file) => beforeUpload(file, 'video')" />
      </el-form-item>
      <div v-if="ruleForm.classify === 0">
        <el-form-item label="附件">
          <!-- <el-input
            v-model="fileName.attachment"
            style="width: 240px; float: left"
            disabled
          />
          <el-upload
            class="file-upload"
            :headers="myHeaders"
            action="/api/file/upload"
            name="_upload_files"
            accept=".zip,.rar"
            :file-list="upLoadfile.attachment"
            :data="{ ...uploadData, file_type: 'attachment' }"
            :multiple="false"
            :on-success="(res, file) => handleSuccess(res, file, 'attachment')"
            :on-exceed="handleExceed"
            :before-upload="(file) => beforeUpload(file, 'attachment')"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload> -->
          <FileUploader v-model="ruleForm.content.attachment" :data="{'file_type':'attachment'}" accept=".zip,.rar" :before-upload="(file) => beforeUpload(file, 'attachment')" />
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="靶标类型" prop="target_type">
          <el-select
            v-model="ruleForm.target_type"
            clearable
            style="width: 320px"
            placeholder="请选择"
            @change="target_type_change"
          >
            <el-option
              v-for="item in TypeOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择靶标" prop="target_id">
          <el-select
            v-model="ruleForm.target_id"
            style="width: 320px"
            placeholder="请选择"
            @change="selectChange"
          >
            <el-option
              v-for="item in targetOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <p class="resource-tip">没有自己需要的靶标, 去<el-link class="resource-tip__link" @click="showTipDialog = true"> 添加靶标</el-link> </p>
        <el-form-item v-if="ruleOption.length > 1" label="选择判定规则" prop="rules">
          <el-select
            v-model="ruleForm.rules"
            style="width: 320px"
            placeholder="请选择"
            @change="rulesChange"
          >
            <el-option
              v-for="item in ruleOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <icr-table
          v-if="tableData.length"
          ref="table"
          style="width: 70%;padding-top:5px;margin-left:110px;"
          :data="tableData"
          :columns="table.columns"
          :options="tableOptions"
        />
        <!-- <el-table
          v-if="tableData.length"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 70%; margin-left:110px"
          stripe
        >
          <el-table-column
            prop="name"
            label="规则名称"
            width="180"
          />
          <el-table-column
            prop="category"
            label="技巧分类"
            width="180"
          />
          <el-table-column
            prop="judgment"
            label="判定方式"
          />
          <el-table-column
            prop="desc"
            label="规则描述"
          />
        </el-table> -->
      </div>
    </icr-form>
    <el-dialog
      title="请选择要创建的靶标类型"
      :visible.sync="showTipDialog"
      width="350px"
      class="btn-dialog"
    >
      <div style='display: flex; justify-content: space-between;'>
        <router-link to="/targets/file-targets">
          <el-button type="primary">文件靶标</el-button>
        </router-link>
        <router-link to="/targets/alone-targets">
          <el-button type="primary">单机靶标</el-button>
        </router-link>
        <!-- <router-link to="/resources/virtual">
          <el-button type="primary">场景靶标</el-button>
        </router-link> -->
      </div>
    </el-dialog>
  </div>
</template>
<script>
import FileUploader from '@/views/common/upload/file-uploader.vue'
import IcrForm from '@/components/form'
import IcrTable from '@/components/table'
import { required } from '@/utils/validate-helper'
import { itemAdd, itemUpdate, itemRetrieve, chapterPaging } from '@/api/course'
import { levelOption } from '@/utils/tools'
import { getToken } from '@/utils/auth'
import { filterParams } from '@/utils/tools'
import { filetargetList, filetargetRetrieve, alonetargetList, alonetargetRuleList } from '@/api/target'
export default {
  name: 'ClassDetail',
  components: {
    FileUploader,
    IcrForm,
    IcrTable
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          {
            prop: 'name',
            label: '规则名称',
            width: '180px'
          },
          {
            prop: 'category',
            label: '技巧分类',
            width: '180px'
          },
          {
            prop: 'judgment',
            label: '判定方式'
          },
          {
            prop: 'desc',
            label: '规则描述'
          }
        ]
      },
      tableData: [],
      showTipDialog: false,
      labelPosition: 'left',
      propsid: null, // 课时id
      course_id: null, // 课程id
      classifyOption: [
        {
          id: 0,
          value: '理论课'
        },
        {
          id: 1,
          value: '实验课'
        }
      ], // 课时类型
      TypeOption: [
        {
          id: 0,
          name: '文件靶标'
        }, {
          id: 1,
          name: '单机靶标'
        }
      ], // 靶标类型
      targetOption: [], // 选择靶标
      ruleOption: [], // 判定规则
      levelOption, // 难度
      ruleForm: {
        chapter_id: '',
        name: '',
        classify: 0,
        level: '',
        duration: '',
        target_type: '',
        target_id: '',
        rules: '',
        content: {
          handout: '',
          video: '',
          attachment: ''
        }
      },
      fileName: {
        handout: '',
        video: '',
        attachment: ''
      },
      myHeaders: { Authorization: getToken() },
      fileLimit: 1,
      upLoadfile: {
        handout: [], // 讲义
        video: [], // 视频
        attachment: [] // 附件
      },
      uploadData: {
        flag: 'file'
      },
      formRules: {
        name: [
          required('名称'),
          { min: 1, max: 100, message: '长度在100个字符以内', trigger: 'blur' }
        ],
        classify: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        level: [{ required: true, message: '请选择难度', trigger: 'change' }],
        duration: [
          { required: true, message: '请选择学习时长', trigger: 'change' }
        ],
        target_id: [{ required: true, message: '请选择靶标', trigger: ['blur', 'change'] }],
        rules: [{ required: true, message: '至少选择一条规则', trigger: 'change' }]
      },
      chapterOption: []
    }
  },
  computed: {
    durationOption() {
      const option = []
      for (let i = 5; i <= 60; i += 5) {
        option.push({
          id: i,
          value: i + '分钟'
        })
      }
      return option
    }
  },
  watch: {
    'ruleForm.content.handout': function(val) {
      const url = val.url ? val.url : val
      this.ruleForm.content.handout = url
    },
    'ruleForm.content.video': function(val) {
      const url = val.url ? val.url : val
      this.ruleForm.content.video = url
    },
    'ruleForm.content.attachment': function(val) {
      const url = val.url ? val.url : val
      this.ruleForm.content.attachment = url
    }
  },
  mounted() {
    this.course_id = this.$route.query?.course_id // 课程id
    if (this.isEdit) {
      // 编辑
      this.propsid = this.$route.query?.id // 课时id
      this.getchapterOptions()
      this.getDetail()
    } else {
      // 新增
      this.getchapterOptions()
    }
  },
  methods: {
    classifyChange(val) { // 课时类型
      // this.ruleForm.target_type = '' // 靶标类型
      // this.ruleForm.target_id = '' // 选择靶标
      // this.ruleForm.rules = '' // 选择判定规则

      // this.targetOption = [] // 选择靶标
      // this.ruleOption = [] // 选择判定规则
      // this.tableData = [] // 规则列表
      if (val === 0) {
        // 理论
        this.ruleForm.target_type = '' // 靶标类型
        this.ruleForm.target_id = '' // 选择靶标
        this.ruleForm.rules = '' // 选择判定规则

        this.targetOption = [] // 选择靶标
        this.ruleOption = [] // 选择判定规则
        this.tableData = [] // 规则列表
      } else {
        // 实验
        // this.upLoadfile.attachment = [] // 附件
        // this.fileName.attachment = ''
        this.ruleForm.content.attachment = '' // 附件
      }
    },
    target_type_change(val, type) { // 靶标类型
      if (type !== 'init') {
        this.ruleForm.target_id = '' // 选择靶标
        this.ruleForm.rules = '' // 判定规则
        this.targetOption = [] // 选择靶标
        this.ruleOption = [] // 判定规则
        this.tableData = [] // 规则列表
      }
      if (val === 0) {
        filetargetList().then(res => {
          const { data } = res.data
          this.targetOption = data
        })
      } else if (val === 1) {
        alonetargetList().then(res => {
          const { data } = res.data
          this.targetOption = data
        })
      }
    },
    selectChange(val, rules, type) { // 选择靶标
      if (type !== 'init') {
        this.ruleForm.rules = '' // 判定规则
        this.ruleOption = [] // 判定规则字典
        this.tableData = [] // 规则列表
      }
      if (this.ruleForm.target_type === 0) { // 文件靶标
        filetargetRetrieve({ target_id: val }).then(res => {
          const { data } = res.data
          this.ruleForm.rules = data.id // 一条规则，不显示判定规则下拉，列表默认展示仅有的一条
          this.tableData = [data]
        })
      } else if (this.ruleForm.target_type === 1) {
        // 单机靶标
        alonetargetRuleList({ target_id: val }).then(res => {
          const { data } = res.data
          this.ruleOption = data
          if (data.length === 1) { // 一条规则，不显示判定规则下拉，列表默认展示仅有的一条
            this.ruleForm.rules = data[0].id
            this.tableData = data
          }
          if (rules) {
            this.rulesChange(rules)
          }
        })
      }
    },
    rulesChange(val) { // 判定规则 列表回显
      const result = []
      this.ruleOption.forEach(item => {
        // if (val.includes(item.id)) {
        //   result.push(item)
        // }
        if (item.id === val) {
          result.push(item)
        }
      })
      this.tableData = result
    },
    getchapterOptions() {
      chapterPaging({ course_id: this.course_id }).then((res) => {
        this.chapterOption = res.data.data
      })
    },
    submitForm() {
      const params = {
        data: {
          ...this.ruleForm,
          content: filterParams(this.ruleForm.content),
          // content: {},
          rules: [this.ruleForm.rules]
        }
      }
      params.data.course_id = this.course_id
      if (this.ruleForm.classify === 0) {
        delete params.data.target_type // 靶标类型
        delete params.data.target_id // 选择靶标
        delete params.data.rules // 判定规则
      }
      // for (const i in this.upLoadfile) {
      //   if (this.upLoadfile[i].length) {
      //     const file = this.upLoadfile[i][0].uploadUrl
      //     params.data.content[i] = file
      //   }
      // }
      if (this.propsid) {
        params.data.id = this.propsid
        itemUpdate(params).then((res) => {
          window.history.back()
        })
      } else {
        itemAdd(params).then((res) => {
          window.history.back()
        })
      }
    },
    resetForm() {
      window.history.back()
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      )
    },
    handleSuccess(res, file, name) {
      if (res.status === 0) {
        this.fileName[name] = file.name
        this.upLoadfile[name] = [
          { ...file, uploadUrl: res.data.file_relative_url[0] }
        ]
      } else {
        this.$message({
          message: res.msg,
          type: 'warning'
        })
        this.fileName[name] = ''
        this.upLoadfile[name] = []
      }
    },
    beforeUpload(file, name) {
      const flieSize = file.size
      if (flieSize === 0) {
        this.$message.error('请勿上传无效文件！')
        return false
      }
      switch (name) {
        case 'handout':
          if (flieSize > 100 * 1024 * 1024) {
            this.$message.error('讲义大小不能超过100MB!')
            return false
          }
          break
        case 'video':
          if (flieSize > 1024 * 1024 * 1024) {
            this.$message.error('视频大小不能超过1G!')
            return false
          }
          break
        case 'attachment':
          if (flieSize > 100 * 1024 * 1024) {
            this.$message.error('附件大小不能超过100MB!')
            return false
          }
          break
      }
      // this.upLoadfile[name] = [file]
      // this.fileName[name] = ''
    },
    getDetail() {
      itemRetrieve({ item_id: this.propsid }).then((res) => {
        const { data } = res.data
        if (data.chapter_id === 0) {
          data.chapter_id = ''
        }
        this.ruleForm = {
          ...this.ruleForm,
          ...data,
          rules: data.rules.length ? data.rules[0] : '',
          content: {
            ...this.ruleForm.content,
            ...data.content
          }
        }
        // this.getFileMsg(data.content) // 上传
        if (data.classify === 1) {
          this.getTarget(this.ruleForm) // 靶标三联动
        }
      })
    },
    getTarget(val) {
      this.target_type_change(val.target_type, 'init')
      this.selectChange(val.target_id, val.rules, 'init')
    },
    getFileMsg(content) {
      for (const i in content) {
        this.fileName[i] = content[i].name
        this.upLoadfile[i] = [{ uploadUrl: content[i].url }]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.file-upload::v-deep {
  float: left;
  padding-left: 20px;
  .el-upload-list {
    display: none;
  }
}
.resource-tip {
  color: #fff;
  font-size: 14px;
  // padding-top:8px;
  margin-left: 110px;
  margin-top: -10px;
}
</style>
