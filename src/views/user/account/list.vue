<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          @click="openDialog()"
        >新增</el-button>
        <el-button
          class="filter-item"
          size="medium"
          @click="exportAccount"
        >导出</el-button>
        <el-button
          class="filter-item"
          size="medium"
          @click="showImportDialog = true"
        >导入</el-button>
        <span class="import-template-tip"> 想要批量导入? <a href="javascript:void(0);" @click="downloadImportTemplate"> 下载模板 </a> </span>
        <icr-dialog title="导入账号" :visible.sync="showImportDialog" width="500px" @confirm="importAccount">
          <el-upload
            ref="importAccount"
            action="/api/user_manage/account/import"
            name="_upload_files"
            :auto-upload="false"
            :data="{ flag: 'file' }"
            :headers="{ Authorization: token }"
            style="display:inline-block;"
            :show-file-list="true"
            :on-success="importAccountSuccess"
          >
            <el-button class="filter-item" type="primary" size="medium">选择文件</el-button>
          </el-upload>
          <p>请选择.xlsx文件, 请先下载导入模板 <a target="_blank" @click="downloadImportTemplate">账号新增模板.xlsx</a> </p>
        </icr-dialog>
        <!-- <el-button
          class="filter-item"
          :disabled="!selection.length"
          type="primary"
          size="medium"
          @click="statusswitchBatch('0')"
        >启用</el-button>
        <el-button
          class="filter-item"
          :disabled="!selection.length"
          type="primary"
          size="medium"
          @click="statusswitchBatch('1')"
        >禁用</el-button> -->
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">筛选组织 : </span> -->
          <el-select v-model="query.org_id" placeholder="筛选组织" clearable size="medium" @change="getRecords">
            <el-option
              v-for="item in orgs"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.info"
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
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog :visible.sync="showFormDialog" :title="(model.id ? '编辑' : '新增') + '账号'">
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        :inline="true"
        :option="{style: 'display: flex; flex-wrap: wrap; justify-content: space-between;'}"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item slot="prefix" prop="avatar" label="头像" required style="width: 100%;">
          <AvatarUpload v-model="model.avatar" />
        </el-form-item>
        <el-form-item label="组织" prop="org_ls">
          <el-cascader
            v-model="model.org_ls"
            :options="orgOptions"
            :props="{ multiple: true }"
            popper-class="userMul-cascader"
            style="width: 320px"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="model.phone" style="width: 320px" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="model.email" style="width: 320px" />
        </el-form-item>
        <el-form-item label="身份证" prop="card">
          <el-input v-model="model.card" style="width: 320px" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expiration_time">
          <el-date-picker
            v-model="model.expiration_time"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="{
              disabledDate(date) {
                return date < Date.now()
              }
            }"
            style="width: 320px"
          />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog :visible.sync="showResetPasswordDialog" width='600px' title='重置密码'>
      <icr-form
        ref="resetPasswdForm"
        :model="resetPasswordModel"
        :fields="resetPasswdFormFields"
        :rules="resetPasswdFormRules"
        @cancel="showResetPasswordDialog = false"
        @confirm="resetPassword"
      />
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除用户" :showInput="true" desc="您即将删除用户, 确定删除输入DELETE?" />
  </div>
</template>

<script>
import IcrDialog from '@/components/dialog.vue'
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import {
  accountPaging,
  accountAdd,
  accountUpdate,
  accountDel,
  getorg as getOrgs,
  getrole as getRoles,
  statusswitch,
  changepassword,
  accountImportTemplate,
  accountExport
} from '@/api/account'
import AvatarUpload from '@/views/common/avatar-upload.vue'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import md5 from 'blueimp-md5'
import { required } from '@/utils/validate-helper'
import { ResourcePrefix } from '@/const/common'
import { downloadResouce } from '@/utils'

const inputOption = {
  style: 'width: 320px'
}

export default {
  components: {
    IcrDialog,
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination,
    AvatarUpload
  },
  setup() {
    const query = reactive({
      info: '',
      org_id: ''
    })

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(accountPaging, query, { removeEmpty: false })
    }
  },
  data() {
    const validatePasswd = (rule, value, cb) => {
      if (value.length < 6) {
        return cb(new Error('密码长度不得小于6位'))
      }

      // if (this.model.password !== this.model.confirm_password) {
      //   return cb(new Error('两次输入密码不一致'))
      // }
      if (this.model.confirm_password !== '') {
        this.$refs.form.validateField('confirm_password')
      }
      this.$refs.form.clearValidate(['password'], ['confirm_password'])
      cb()
    }
    const validateConfirmPasswd = (rule, value, cb) => {
      if (value.length < 6) {
        return cb(new Error('密码长度不得小于6位'))
      }

      if (value !== this.model.password) {
        return cb(new Error('两次输入密码不一致'))
      }

      this.$refs.form.clearValidate(['password'], ['confirm_password'])
      cb()
    }

    const validateResetPasswd = (rule, value, cb) => {
      if (value.length < 6) {
        return cb(new Error('密码长度不得小于6位'))
      }

      // if (this.resetPasswordModel.password !== this.resetPasswordModel.confirm_password) {
      //   return cb(new Error('两次输入密码不一致'))
      // }
      if (this.resetPasswordModel.confirm_password !== '') {
        this.$refs.resetPasswdForm.validateField('confirm_password')
      }

      this.$refs.resetPasswdForm.clearValidate(['password'], ['confirm_password'])
      cb()
    }
    const validateConfirmResetPasswd = (rule, value, cb) => {
      if (value.length < 6) {
        return cb(new Error('密码长度不得小于6位'))
      }

      if (value !== this.resetPasswordModel.password) {
        return cb(new Error('两次输入密码不一致'))
      }

      this.$refs.resetPasswdForm.clearValidate(['password'], ['confirm_password'])
      cb()
    }

    return {
      showImportDialog: false,
      roles: [],
      orgs: [],
      orgOptions: [],
      lastPasswd: '',
      model: {
        username: '',
        name: '',
        password: '',
        confirm_password: '',
        role_id: '',
        real_name: '',
        avatar: '',
        address_name: '',
        org_ls: [],
        phone: '',
        email: '',
        card: '',
        expiration_time: ''
      },
      resetPasswordModel: {
        id: '',
        password: '',
        confirm_password: ''
      },
      formRules: {
        avatar: required('头像'),
        username: required('用户名'),
        name: required('昵称'),
        password: [
          required('密码'),
          { validator: validatePasswd, trigger: ['blur'] }
        ],
        confirm_password: [
          required('确认密码'),
          { validator: validateConfirmPasswd, trigger: ['blur'] }
        ],
        role_id: required('角色'),
        real_name: required('姓名'),
        org_ls: [
          { validator(rule, value, cb) {
            value.reduce((orgTypes, item) => {
              if (orgTypes.get(item[0])) {
                cb(new Error('单个组织类型中用户有且只能加入一个'))
              } else {
                orgTypes.set(item[0], true)
              }
              return orgTypes
            }, new Map())
            cb()
          }, trigger: ['blur', 'change'] }
        ]
      },
      showFormDialog: false,
      showResetPasswordDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          {
            prop: 'avatar', label: '头像', render: (scope) => {
              return (
                <img
                  src={ResourcePrefix + scope.row.avatar} alt=''
                  style={ scope.row.avatar ? 'width: 34px; height: 34px; vertical-align: middle;' : ''}
                />
              )
            }
          },
          { prop: 'username', label: '账号' },
          { prop: 'name', label: '昵称' },
          { prop: 'real_name', label: '姓名' },
          { prop: 'org_ls', label: '组织名称', render: (scope) => {
            return (<div class='org_detail'>{scope.row.org_ls.reduce((acc, item) => {
              acc.push(item.name)
              return acc
            }, []).join('、')}</div>)
          } },
          { prop: 'role', label: '角色' },
          { label: '状态', render: (scope) => {
            // { parseInt(scope.row.status) ? '启用' : '禁用' }
            return (<div>
              <el-switch
                value={ scope.row.status }
                oninput={ (val) => {
                  this.statusswitch([scope.row.id], scope.row.status).then(() => {
                    scope.row.status = val
                  })
                }}
                active-value={'1'} inactive-value={'0'}
              />
            </div>)
          } },
          {
            label: '操作',
            width: '280px',
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope) }}>编辑</el-button>
                  <el-button type='text' onclick={() => {
                    this.initResetPasswordModel()
                    this.showResetPasswordDialog = true
                    this.resetPasswordModel.id = scope.row.id
                  }}>重置密码</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      },
      resetPasswdFormFields: [
        {
          label: '密码',
          type: 'input',
          prop: 'password'
        },
        {
          label: '确认密码',
          type: 'input',
          prop: 'confirm_password'
        }
      ],
      resetPasswdFormRules: {
        password: [
          required('密码'),
          { validator: validateResetPasswd, trigger: ['blur'] }
        ],
        confirm_password: [
          required('确认密码'),
          { validator: validateConfirmResetPasswd, trigger: ['blur'] }
        ]
      },
      valueCopy: []
    }
  },
  computed: {
    ...mapGetters(['token']),
    formFields: function() {
      return [
        {
          label: '用户名',
          type: 'input',
          prop: 'username',
          inputOption
        },
        {
          label: '昵称',
          type: 'input',
          prop: 'name',
          inputOption
        },
        {
          label: '密码',
          type: 'input',
          prop: 'password',
          inputOption: { type: 'password', ...inputOption }
        },
        {
          label: '确认密码',
          type: 'input',
          prop: 'confirm_password',
          inputOption: { type: 'password', ...inputOption }
        },
        {
          label: '角色',
          type: 'select',
          prop: 'role_id',
          options: this.roles?.map(role => ({
            label: role.name,
            value: role.id
          })),
          inputOption
        },
        {
          label: '姓名',
          type: 'input',
          prop: 'real_name',
          inputOption
        }
        // {
        //   label: '组织',
        //   type: 'cascader',
        //   prop: 'org_ls',
        //   options: this.orgOptions,
        //   props: {
        //     multiple: true
        //   },
        //   inputOption
        // },
        // {
        //   label: '手机号',
        //   type: 'input',
        //   prop: 'phone',
        //   inputOption
        // },
        // {
        //   label: '邮箱',
        //   type: 'input',
        //   prop: 'email',
        //   inputOption
        // },
        // {
        //   label: '身份证',
        //   type: 'input',
        //   prop: 'card',
        //   inputOption
        // },
        // {
        //   label: '过期时间',
        //   type: 'datepicker',
        //   prop: 'expiration_time',
        //   'value-format': 'yyyy-MM-dd HH:mm:ss',
        //   'picker-options': {
        //     disabledDate(date) {
        //       return date < Date.now()
        //     }
        //   },
        //   inputOption: { ...inputOption, type: 'datetime' }
        // }
      ]
    },
    postModel() {
      const model = this.serializeModel(this.model)
      model.org_ls = model.org_ls.reduce((acc, item) => {
        acc.push({
          type: Number(item[0]),
          id: item[1]
        })
        return acc
      }, [])

      const shouldEncodePassword = !(this.lastPasswd && (this.lastPasswd === this.model.password))

      if (shouldEncodePassword) {
        model.password = md5(model.password)
        model.confirm_password = md5(model.confirm_password)
      }

      return model
    },
    postResetPasswordModel() {
      const model = cloneDeep(this.resetPasswordModel)
      model.confirm_password = this.model.password
      return {
        id: model.id,
        new_password: md5(model.password)
      }
    }
  },
  mounted() {
    this.initModel()
    this.getRecords()
    this.getOrgs()
    this.getRoles()
  },
  methods: {
    openDialog() {
      this.initModel()
      this.showFormDialog = true
    },
    initModel() {
      this.model = {
        username: '',
        name: '',
        password: '',
        confirm_password: '',
        role_id: '',
        address_name: '',
        real_name: '',
        avatar: '',
        org_ls: [],
        phone: '',
        email: '',
        card: '',
        expiration_time: ''
      }
    },
    initResetPasswordModel() {
      this.resetPasswordModel = {
        id: '',
        password: '',
        confirm_password: ''
      }
    },
    serializeModel(data) {
      const model = cloneDeep(data)
      model.confirm_password = model.password
      model.expiration_time = model.expiration_time || ''
      return model
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      accountAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    update() {
      accountUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    edit(scope) {
      this.model = this.serializeModel(scope.row)
      this.model.confirm_password = this.model.password
      this.model.org_ls = this.model.org_ls.reduce((acc, item) => {
        acc.push([String(item.type), this.orgs.find(org => org.name === item.name)?.id])
        return acc
      }, [])
      this.valueCopy = cloneDeep(this.model.org_ls)
      this.showFormDialog = true
      this.lastPasswd = this.model.password
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        accountDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    statusswitchBatch(status) {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this.statusswitch(ids, status)
    },
    statusswitch(ids, status) {
      return statusswitch({
        data: {
          ids: ids,
          status: status
        }
      })
    },
    getOrgs() {
      getOrgs().then(({ data }) => {
        const orgTypes = new Map([
          ['0', '竞赛团队'],
          ['1', '训练团队'],
          ['2', '培训班级']
        ])

        this.orgs = data?.data?.reduce((acc, item) => {
          acc.push(...item.org_ls)
          return acc
        }, [])
        this.orgOptions = data?.data?.reduce((acc, item) => {
          const typeCode = String(item.type)

          acc.push({
            label: orgTypes.get(typeCode) || '',
            value: typeCode,
            children: item.org_ls.map(org => {
              return {
                label: org.name,
                value: org.id
              }
            })
          })
          return acc
        }, [])
      })
    },
    getRoles() {
      getRoles().then(({ data }) => {
        this.roles = data?.data
      })
    },
    resetPassword() {
      if (this.resetPasswordModel.password !== this.resetPasswordModel.confirm_password) {
        return this.$message({
          message: '两次密码输入不一致',
          type: 'warning'
        })
      }

      changepassword({
        password_info: this.postResetPasswordModel
      }).then(() => {
        this.getRecords()
        this.showResetPasswordDialog = false
      })
    },
    downloadImportTemplate() {
      accountImportTemplate({
        ids: []
      }).then(res => {
        this.downloadPostResponse(res)
      })
    },
    importAccount() {
      this.$refs.importAccount && this.$refs.importAccount.submit()
    },
    importAccountSuccess(resp) {
      const { status, msg, data } = resp
      if (status !== 0) {
        this.$message({
          message: msg,
          type: 'error'
        })
      }

      if (data.error) {
        this.$message({
          message: '导入失败，请查看错误信息.xlsx',
          type: 'error'
        })
        setTimeout(() => {
          downloadResouce(data.error)
        }, 1000)
      }

      this.$refs.importAccount.clearFiles()
      this.showImportDialog = false
      this.getRecords()
    },
    exportAccount() {
      if (this.selection.length <= 0) {
        this.$message({
          type: 'warning',
          message: '请先选择要导出的用户'
        })
        return
      }

      accountExport({
        ids: this.selection.map(row => row.id)
      }).then(res => {
        this.downloadPostResponse(res)
      })
    },
    downloadPostResponse(res) {
      const title = res.headers['content-disposition'].split(';')[1].split('=')[1].split('"')[1]
      const filename = this.decodeUnicode(title)
      const bb = new Blob([res.data], { type: 'application/octet-stream' })
      const a = document.createElement('a')
      a.download = filename
      a.href = window.URL.createObjectURL(bb)
      a.click()
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    handleChange(arr) {
      let arr1 = []
      let arr2 = []
      arr1 = this.valueCopy.map((ele) => {
        return JSON.stringify(ele)
      })
      arr2 = this.model.org_ls.map((ele) => {
        return JSON.stringify(ele)
      })
      let c = arr1.concat(arr2).filter((cur, i, arr) => {
        return arr.indexOf(cur) === arr.lastIndexOf(cur)
      })
      c = JSON.parse(c[0])
      const newArr = []
      arr.forEach((ele) => {
        if (ele[0] === c[0]) {
          if (ele[1] === c[1]) {
            newArr.unshift(ele)
          }
        } else {
          newArr.push(ele)
        }
      })
      this.model.org_ls = newArr
      this.valueCopy = cloneDeep(this.model.org_ls)
    }
  }
}
</script>
<style lang="scss" scoped>

.import-template-tip {
  display: inline-block;
  margin-left: 20px;
  color: rgba($color: #fff, $alpha: .5);
}
.org_detail {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
::v-deep {
  .el-dialog .actions {
    margin-top: 0;
  }
  .el-table tr.el-table__row td.el-table__cell {
    padding: 12px 0;
  }
}
</style>
<style lang="scss">
.el-cascader__dropdown.userMul-cascader {
    .el-cascader-panel {
      >.el-cascader-menu:last-child {
        .el-checkbox {
          line-height: 1;
          width: 100%;
          height: 100%;
          z-index: 10;
          position: absolute;
          top: 0px;
          right: 0px;
          .el-checkbox__input {
            margin-top: 10px;
            margin-left: 20px;
          }
          .el-checkbox__inner {
            border-radius: 100%;
          }
          .el-checkbox__inner:after {
            border: none;
            width: 4px;
            height: 4px;
            border-radius: 100%;
            background-color: #fff;
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            transition: transform 0.15s ease-in;
          }
          .el-checkbox__input.is-checked .el-checkbox__inner::after {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .el-cascader-node__label {
          padding-left: 20px;
        }
      }
      >.el-cascader-menu:first-child {
        .el-checkbox {
          width: auto;
          height: auto;
          position: static;
          .el-checkbox__input {
            margin-top: 0;
            margin-left: 0;
          }
          .el-checkbox__inner {
            display: none;
          }
        }
        .el-cascader-node__label {
          padding-left: 0;
        }
      }
    }
  }
</style>
