<template>
  <div class="app-container">
    <el-form :model="form" :label-width="formLabelWidth">
      <el-row :gutter="26">
        <el-col :span="16">
          <el-button type="primary" icon="iconfont icon-tianjia search_icon" size="medium" @click="addAuter('add')"> 新增</el-button>
          <el-button size="medium" icon="iconfont icon-shanchu search_icon" type="danger" @click="delAuter()"> 删除</el-button>
          <el-button type="primary" size="medium" icon="el-icon-upload" @click="input()">导入</el-button>
          <el-button size="medium" type="primary" icon="el-icon-download search_icon" @click="output()">导出</el-button>
          <el-button type="primary" size="medium" icon="el-icon-circle-check search_icon" @click="changeSwitch('up')">启用</el-button>
          <el-button size="medium" type="primary" icon="el-icon-remove-outline search_icon" @click="changeSwitch('down')">禁用</el-button>
        </el-col>
        <el-col :span="6">
          <el-input v-model="form.keyword" autocomplete="off" placeholder="请输入关键字" />

        </el-col>
        <el-col :span="2">
          <el-button size="big" type="primary" @click="search()">搜索</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-form :model="searchForm">
      <el-row :gutter="26">
        <el-col :span="8">
          <el-form-item label="筛选组织" prop="org_id">
            <el-select v-model="searchForm.org_id" class="fillcell" placeholder="请选择组织" clearable style="width:80%" @change="blur" @clear="clear">
              <el-option v-for="item in orgTypeList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <avue-crud :row-style="rowStyle" :data="data" :option="option" :page.sync="page" :table-loading="tableLoading" @on-load="getList()" @selection-change="selectionChange" @current-change="currentChange">
      <template slot="menu" slot-scope="scope">
        <!-- <el-button size="small" @click.native="tip" icon="el-icon-share"></el-button> -->
        <el-tooltip content="编辑" placement="top">
          <i class="el-icon-edit" @click="handleEdit(scope.row,'edit')" />
        </el-tooltip>
        <el-tooltip content="重置密码" placement="top">
          <i class="el-icon-unlock" @click="resetPassword(scope.row,'edit')" />
        </el-tooltip>
        <el-tooltip :content="scope.row.status == '1'?'禁用':'启用'" placement="top">
          <i :class="scope.row.status == '1'?'el-icon-circle-check':'el-icon-circle-close'" :style="{color:scope.row.status == '1'?'#22AB59':'red'}" @click="changeStatus(scope.row,'edit')" />
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <i class="el-icon-delete" @click="delPople(scope.row,'edit')" />
        </el-tooltip>

        <!-- <el-button type="primary" size="mini" @click.native="handleEdit(scope.row,'edit')">编辑</el-button> -->
        <!-- <el-button type="primary" size="mini" @click.native="resetPassword(scope.row)">重置密码</el-button>
        <el-button type="primary" size="mini" @click.native="changeStatus(scope.row)">{{scope.row.status == '1'?'禁用':'启用'}}</el-button>
        <el-button type="danger" size="mini" @click.native="delPople(scope.row)">删除</el-button> -->
      </template>
    </avue-crud>
    <el-dialog :title="title=='add'?'新增用户':'编辑用户'" width="60%" :visible.sync="dialogFormVisible">
      <accout-form :rule-form="ruleForm" :title="title" @cancel="dialogFormVisible = false" @sure="sure" />
      <!-- <div slot="footer" class="dialog-footer">
        <el-button @click="sure()">确 认</el-button>
          <el-button @click="dialogFormVisible = false">关 闭</el-button>
      </div> -->
    </el-dialog>
    <el-dialog title="重置密码" width="25%" :visible.sync="resetpassword">
      <el-form ref="resetpasswordForm" :model="resetpasswordForm" :rules="resetPasswordFormRules" :label-position="labelPosition" label-width="80px">
        <el-col :span="22">
          <el-form-item label="密 码" prop="password">
            <el-input v-model="resetpasswordForm.password" type="password" autocomplete="new-password" placeholder="请输入密码" />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item label="确认密码" prop="confirm_password">
            <el-input v-model="resetpasswordForm.confirm_password" type="password" autocomplete="off" placeholder="请确认密码" />
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="actions">
        <el-button @click="resetpassword = false">取消</el-button>
        <el-button type="primary" @click="changePassWord('resetpasswordForm')">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog title="删除账号" width="440px" :visible.sync="delusername">
      <el-form ref="delForm" :model="delForm" :rules="delRuleForm">
        <el-row>
          <el-col :span="24">
            <p style="margin: 0 10%;margin-bottom: 20px;">你即将删除账号，删除后不可恢复，请确认删除请输入<span style="font-weight: 800;">"DELETE"</span></p>
          </el-col>
          <el-col :span="14" style="margin-left:80px">
            <el-form-item prop="delText">
              <el-input
                v-model="delForm.delText"
                placeholder="DELETE"
                style="max-width: 160px;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="actions">
        <el-button @click="delusername = false">取消</el-button>
        <el-button type="primary" @click="delSure('delForm')">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { tableOption } from '@/const/account'
import { getlist, addauter, dellist, changepassword, statusswitch, searchinfo, getorg } from '@/api/account'
import AccoutForm from './form.vue'
import { mapGetters } from 'vuex'
import md5 from 'blueimp-md5'
export default {
  components: {
    AccoutForm
  },

  data() {
    var validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.resetpasswordForm.confirm_password !== '') {
          this.$refs.resetpasswordForm.validateField('confirm_password')
        }
        callback()
      }
    }
    var validatePasswordSure = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.resetpasswordForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var validatedelText = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('输入DELETE'))
      } else if (value !== 'DELETE') {
        callback(new Error('输入不正确'))
      } else {
        callback()
      }
    }
    return {
      labelPosition: 'left',
      searchForm: {
        org_id: ''
      },
      data: [
      ],
      orgTypeList: [],
      ruleForm: {
        username: '',
        name: '',
        password: '',
        confirm_password: '',
        role_id: '',
        address_name: '',
        org_id: '',
        phone: '',
        email: '',
        card: '',
        expiration_time: ''
      },
      title: '',
      tableLoading: false,
      resetpasswordForm: {},
      resetpassword: false,
      option: tableOption,
      rowPasswordId: '',
      formLabelWidth: '120px',
      form: { keyword: '' },
      rowId: '',
      delObj: {},
      delusername: false,
      delForm: {},
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        layout: 'total,prev,pager, next',
        pageSize: 2
      },
      dialogFormVisible: false,
      resetPasswordFormRules: {
        password: [
          { validator: validatePassword, trigger: 'blur', required: true }
        ],
        confirm_password: [
          { validator: validatePasswordSure, trigger: ['blur', 'change'], required: true }
        ]
      },
      delRuleForm: {
        delText: [{ validator: validatedelText, trigger: 'blur' }]
      }

    }
  },
  created() {
    this.getList()
    getorg().then(item => {
      this.orgTypeList = item.data.data
    })
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    blur() {
      this.tableLoading = true
      const page_info = { page_num: this.page.currentPage, page_size: '10' }
      const search_info = { info: this.form.keyword, org_id: this.searchForm.org_id }
      const obj = {}
      obj.page_info = page_info
      obj.search_info = search_info
      getlist(obj).then(res => {
        this.data = res.data.data
        this.page.total = res.data.total
        this.page.currentPage = res.data.cur_page
        this.tableLoading = false
      })
    },
    clear() {
      this.searchForm.org_id = ''
      this.blur()
    },
    rowStyle({ row, column, rowIndex }) {
      if (rowIndex % 2 !== 0) {
        return {
          backgroundColor: '#2c3d60'
        }
      }
    },
    getList() {
      this.tableLoading = true
      const page_info = { page_num: this.page.currentPage, page_size: '10' }
      const search_info = { info: this.form.keyword, org_id: this.searchForm.org_id }
      const obj = {}
      obj.page_info = page_info
      obj.search_info = search_info
      getlist(obj).then(res => {
        this.data = res.data.data
        console.log(res.data.total)
        this.page.total = res.data.total
        this.page.currentPage = res.data.cur_page
        this.tableLoading = false
      })
    },
    // submit(){
    //   console.log(this.model)
    // },
    addAuter(tit) {
      this.title = tit
      this.dialogFormVisible = true
      // console.log(this.model)
    },
    sure() {
      this.getList()
    },
    changePassWord(delForm) {
      const obj = {}
      obj.password_info = {
        id: this.rowId,
        new_password: md5(this.resetpasswordForm.password)
      }
      // obj.password_info.new_password = md5(obj.new_password )
      this.$refs[delForm].validate((valid) => {
        if (valid) {
          changepassword(obj).then(res => {
            this.getList()
            this.resetpassword = false
            this.resetpasswordForm = {}
          })
        } else {
          return false
        }
      })
    },
    resetPassword(row) {
      this.resetpasswordForm = {}
      this.resetpassword = true
      this.rowId = row.id
    },
    delPople(row) {
      this.delusername = true
      // this.rowPasswordId = row.id
      this.delObj.data = { ids: [row.id] }
      // dellist(obj).then(res=>{
      //   console.log(obj)
      //   this.getList()
      // })
    },
    delSure(Form) {
      this.delusername = false
      this.$refs[Form].validate((valid) => {
        if (valid) {
          dellist(this.delObj).then(res => {
            this.getList()
            // this.delusername = false
            this.delObj = {}
          })
        } else {
          return false
        }
      })
    },
    currentChange(val) {
      this.page.currentPage = val
      this.getList()
    },
    delAuter() {
      this.delusername = true
    },
    changeStatus(row) {
      const obj = {}
      obj.data = {}
      obj.data.ids = [row.id]
      obj.data.status = row.status
      statusswitch(obj).then(res => {
        this.getList()
      })
    },
    input() {},
    output() {},
    changeSwitch(sys) {
      const obj = {}
      obj.data = this.delObj.data
      sys == 'up' ? obj.data.status = '0' : obj.data.status = '1'
      statusswitch(obj).then(res => {
        this.getList()
      })
    },

    search() {
      this.getList()
    },
    selectionChange(val) {
      this.delObj.data = {}
      const arr = []
      val.forEach(item => {
        arr.push(item.id)
      })
      this.delObj.data = { ids: arr }
      console.log(this.delObj)
    },
    handleEdit(row, tle) {
      this.ruleForm = {}
      console.log(row)
      this.title = tle
      this.dialogFormVisible = true
      row.confirm_password = row.password
      console.log(row)
      this.ruleForm = row
    }
  }
}
</script>
<style  lang="scss">
  .onButton{
    color: blue;
  }
  .downButton{
    color:red;
  }
  .el-card .el-card__body .avue-crud__menu{
    display: none !important
  }
  .el-card {
    background: #1D2B48;
  }
  .el-row{
    margin-bottom: 20px;
  }
  .avue-crud .el-table th {
    background-color: #2c3d60;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
.el-table__fixed::before, .el-table__fixed-right::before{
  background-color: #1D2B48;
}
.el-table__body tr.hover-row > td, .el-table__body tr.hover-row.current-row > td, .el-table__body tr.hover-row.el-table__row--striped > td, .el-table__body tr.hover-row.el-table__row--striped.current-row > td{
  background: #334fac ;
}
.el-loading-mask{
  background: #2c3d60;
}
</style>
