<template>
  <div class="periodDetail app-container">
    <icr-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="ruleForms"
      :label-position="labelPosition"
      @cancel="resetForm"
      @confirm="submitForm"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          style="width: 320px"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="方向" prop="direction">
        <el-select
          v-model="form.direction_id"
          style="width: 320px"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in directionOption || []"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="level">
        <el-select
          v-model="form.level"
          style="width: 320px"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="item in levelOption"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="LOGO" prop="logo">
        <el-upload
          ref="upload"
          :file-list="form.logo"
          :class="{ hide: hideUpload }"
          :headers="myHeaders"
          action="/api/common/file/upload"
          :data="uploadData"
          accept=".jpg,.jpeg,.png,.gif,.bmg"
          name="_upload_files"
          list-type="picture-card"
          :limit="fileLimit"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :on-change="handleChange"
          :before-upload="beforeUpload"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <el-dialog :visible.sync="dialogVisible" style="text-align: center;" width="50%">
          <img width="80%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <el-form-item label="课程简介" prop="brief">
        <el-input
          v-model="form.brief"
          type="textarea"
          :autosize="{ minRows: 4 }"
        />
      </el-form-item>
      <el-form-item label="课程详情" prop="desc">
        <!-- <RichText v-if="isShow" id="periodRichText" v-model="form.outline" /> -->
        <el-tiptap
          v-model="form.desc"
          :extensions="extensions"
          :editor-properties="{parseOptions:{preserveWhitespace:'full'}}"
          height="500"
          width="888"
          :char-counter-count="false"
        />
      </el-form-item>
    </icr-form>
  </div>
</template>
<script>
// import RichText from "@/components/richtext/index.vue";
import {
  courseUpdate,
  courseAdd,
  directionList,
  courseRetrieve
} from '@/api/course'
import { filterParams, levelOption } from '@/utils/tools'
import { cloneDeep } from 'lodash-es'
import { extensions } from '@/const/tiptapRichText'
import { getToken } from '@/utils/auth'
import IcrForm from '@/components/form'
import { required } from '@/utils/validate-helper'
export default {
  name: 'CourseDetail',
  components: {
    // RichText
    IcrForm
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      labelPosition: 'left',
      propsid: null,
      isShow: true,
      dialogImageUrl: '',
      dialogVisible: false,
      hideUpload: false,
      myHeaders: { Authorization: getToken() },
      fileLimit: 1,
      form: {
        name: '',
        direction_id: '',
        level: '',
        logo: [],
        desc: ''
        // outline: ''
      },
      levelOption: levelOption,
      directionOption: [],
      uploadData: {
        flag: 'file',
        file_type: 'pic'
      },
      rules: {
        name: [
          required('名称'),
          { min: 1, max: 100, message: '长度在100个字符以内', trigger: 'blur' }
        ],
        logo: required('logo'),
        brief: required('课程简介'),
        desc: [
          required('课程详情'),
          {
            validator(rule, value, callback) {
              if (value === '<p></p>') {
                callback(new Error('课程详情不能为空'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      extensions
    }
  },
  watch: {
    'form.logo': function(file) {
      if (file.length) {
        this.hideUpload = true
      } else {
        this.hideUpload = false
      }
    }
    // "form.level": function (newValue) {
    //   if (newValue === -1) {
    //     this.form.level = "";
    //   }
    // },
    // "form.direction_id": function (newValue) {
    //   if (newValue === 0) {
    //     this.form.direction_id = "";
    //   }
    // },
  },
  created() {
    if (this.isEdit) {
      this.propsid = this.$route.query?.id
    }
    this.getDirectionOption()
  },
  destroyed() {
    this.isShow = false
  },
  methods: {
    getDirectionOption() {
      directionList().then((res) => {
        const { data } = res
        this.directionOption = data.data
        if (this.isEdit) {
          this.getDetail()
        }
      })
    },
    serizlize(model) {
      const c = cloneDeep(model)
      c.level = this.levelOption.reduce((acc, val, index) => {
        return acc || val.id === c.level
      }, false)
        ? c.level
        : ''
      c.direction_id = this.directionOption.reduce((acc, val, index) => {
        return acc || val.id === c.direction_id
      }, false)
        ? c.direction_id
        : ''
      return c
    },
    deSerizlize(model) {
      const c = cloneDeep(model)
      c.level = this.levelOption.reduce((acc, val, index) => {
        return acc || val.id === c.level
      }, false)
        ? c.level
        : -1
      c.direction_id = this.directionOption.reduce((acc, val, index) => {
        return acc || val.id === c.direction_id
      }, false)
        ? c.direction_id
        : 0
      return c
    },
    handleChange(file, fileList) {
      this.hideUpload = fileList.length >= this.fileLimit
    },
    handleRemove(file, fileList) {
      this.hideUpload = fileList.length >= this.fileLimit
      this.form.logo = []
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleSuccess(res, file) {
      if (res.status === 0) {
        this.dialogImageUrl = URL.createObjectURL(file.raw)
        this.form.logo = [
          { ...file, uploadUrl: res.data.file_relative_url[0] }
        ]
      } else {
        this.form.logo = []
        this.$message({
          type: 'warning',
          message: res.msg
        })
      }
    },
    beforeUpload(file) {
      const fileSize = file.size
      if (fileSize > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过5MB!')
        return false
      }
    },
    submitForm() {
      const params = {}
      if (this.propsid) {
        params.data = {
          id: this.propsid,
          ...this.deSerizlize(this.form),
          logo: this.form.logo[0].uploadUrl
        }
        courseUpdate(params).then((res) => {
          this.$router.push({ path: '/teach-activity/course-manage/course' })
        })
      } else {
        params.data = {
          ...filterParams(this.form),
          logo: this.form.logo[0].uploadUrl
        }
        courseAdd(params).then((res) => {
          this.$router.push({ path: '/teach-activity/course-manage/course' })
        })
      }
    },
    htmlDecodeByRegExp(str) {
      // richText过滤标签
      var s = ''
      if (str.length === 0) return ''
      s = str.replace(/&amp;/g, '&')
      s = s.replace(/&lt;/g, '<')
      s = s.replace(/&gt;/g, '>')
      s = s.replace(/&nbsp;/g, ' ')
      s = s.replace(/&#39;/g, "'")
      s = s.replace(/&quot;/g, '"')
      return s
    },
    resetForm() {
      // this.$refs[formName].resetFields()
      this.$router.push({ path: '/teach-activity/course-manage/course' })
    },
    getDetail() {
      courseRetrieve({ course_id: this.propsid }).then((res) => {
        const { data } = res
        // window.tinymce.get("periodRichText").setContent(this.htmlDecodeByRegExp(data.data.outline) || "");
        this.form = {
          ...this.serizlize(data.data),
          desc: this.htmlDecodeByRegExp(data.data.desc)
        }
        if (data.data.logo) {
          this.form.logo = [
            { url: `/resource/` + data.data.logo, uploadUrl: data.data.logo }
          ]
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
// .el-form-item {
//   width: 90%;
// }
// .avatar-uploader .el-upload {
//   border: 1px dashed #d9d9d9;
//   border-radius: 6px;
//   cursor: pointer;
//   position: relative;
//   overflow: hidden;
// }
// .avatar-uploader .el-upload:hover {
//   border-color: #409eff;
// }
// .avatar-uploader-icon {
//   border: 1px dashed #d9d9d9;
//   font-size: 28px;
//   color: #8c939d;
//   width: 150px;
//   height: 150px;
//   line-height: 150px;
//   text-align: center;
// }
// .avatar {
//   width: 150px;
//   height: 150px;
//   display: block;
// }
.icr-confirm {
  display: flex;
  justify-content: center;
}
.p100 {
  padding: 20px 100px;
}
.el-tiptap-editor--fullscreen {
  z-index: 1002;
}
</style>
<style>
.periodDetail .hide .el-upload--picture-card {
  display: none;
}
/*.periodDetail .el-upload-list__item{
  transition: none !important;
}  */
.periodDetail .el-upload-list__item .el-icon-close-tip {
  display: none !important;
}
</style>
