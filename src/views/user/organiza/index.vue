<template>
  <div class="app-container">
    <el-form :model="form" :label-width="formLabelWidth">
      <el-row :gutter="26">
        <el-col :span="16">
          <el-button type="primary" icon="iconfont icon-tianjia search_icon" size="medium" @click="addAuter('add')"> 新增</el-button>
          <el-button size="medium" icon="iconfont icon-shanchu search_icon" type="danger" @click="delOrganiza()"> 删除</el-button>
        </el-col>
        <el-col :span="6">
          <el-input v-model="form.name" autocomplete="off" placeholder="请输入关键字" />

        </el-col>
        <el-col :span="2">
          <el-button size="big" type="primary" @click="search()">搜索</el-button>
        </el-col>
      </el-row>
    </el-form>
    <avue-crud :row-style="rowStyle" :data="data" :option="option" :page.sync="page" :table-loading="tableLoading" @on-load="getList()" @selection-change="selectionChange" @current-change="currentChange">
      <template slot="menu" slot-scope="scope">
        <!-- <el-button type="primary" size="mini" @click.native="handleEdit(scope.row,'edit')">编辑</el-button> -->
        <el-tooltip content="编辑" placement="top">
          <i class="el-icon-edit" @click="handleEdit(scope.row)" />
        </el-tooltip>
        <el-tooltip content="下级组织" placement="top">
          <i class="el-icon-delete" @click="delOrganizaOnes(scope.row,)" />
        </el-tooltip>
        <!-- <el-button type="danger" size="mini" @click.native="delOrganizaOnes(scope.row)">删除</el-button> -->
        <!-- <el-button type="primary" size="mini" @click.native="downOrganiza(scope.row)">下级组织</el-button> -->
      </template>
    </avue-crud>
    <el-dialog :title="title=='add'?'新增组织':'编辑组织'" width="440px" :visible.sync="addOrganizaDialog">
      <el-form ref="addOrganiza" :model="addOrganiza" :rules="addOrganizaRules" label-width="80px" :label-position="labelPosition">
        <el-col :span="22">
          <el-form-item label="组织名称" prop="name">
            <el-input v-model="addOrganiza.name" placeholder="请输入组织名称" />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item label="组织类型" prop="type">
            <el-select v-model="addOrganiza.type" placeholder="请选择组织类型" style="width:100%">
              <el-option v-for="item in orgTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="actions">
        <el-button @click="addOrganizaDialog = false">取消</el-button>
        <el-button v-if="title=='add'" type="primary" @click="sureAddOrg('addOrganiza')">确认</el-button>
        <!-- <el-button v-if="title=='edit'" type="primary" @click="changeOrg('addOrganiza')">修 改</el-button> -->
        <el-button v-else type="primary" @click="changeOrg('addOrganiza')">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog title="删除组织" width="440px" :visible.sync="delusername">
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
import { tableOption } from '@/const/organiza'
import { getlist, addorg, updateorg, deleteorg } from '@/api/organiza'
import { mapGetters } from 'vuex'
export default {

  data() {
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
      formLabelWidth: '80px',
      delusername: false,
      delForm: {},
      title: '',
      delObj: {},
      form: { name: '' },
      option: tableOption,
      data: [],
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        layout: 'total,prev,pager, next',
        pageSize: 2
      },
      tableLoading: false,
      addOrganizaDialog: false,
      addOrganiza: {},
      addOrganizaRules: {
        name: [
          { required: true, message: '请输入组织名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择组织类型', trigger: 'blur' }
        ]
      },
      orgTypeList: [
        {
          label: '竞赛团队',
          value: 0
        }, {
          label: '训练团队',
          value: 1
        }, {
          label: '培训班级',
          value: 2
        }
      ],
      delRuleForm: {
        delText: [{ validator: validatedelText, trigger: 'blur' }]
      }
    }
  },
  created() {

  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    rowStyle({ row, column, rowIndex }) {
      if (rowIndex % 2 !== 0) {
        return {
          backgroundColor: '#2c3d60'
        }
      }
    },
    getList() {
      this.tableLoading = true
      const page_info = { page_num: this.page.currentPage, page_size: '2' }
      const search_info = { name: this.form.name }
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
    addAuter(sys) {
      this.title = sys
      this.addOrganizaDialog = true
      this.addOrganiza = {}
    },
    currentChange(val) {
      this.page.currentPage = val
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
    sureAddOrg(Form) {
      const obj = {}
      obj.data = this.addOrganiza
      this.$refs[Form].validate((valid) => {
        if (valid) {
          addorg(obj).then(res => {
            this.getList()
            this.addOrganizaDialog = false
          })
        } else {
          return false
        }
      })
    },
    changeOrg(Form) {
      const obj = {}
      obj.data = this.addOrganiza
      this.$refs[Form].validate((valid) => {
        if (valid) {
          updateorg(obj).then(res => {
            this.getList()
            this.addOrganizaDialog = false
          })
        } else {
          return false
        }
      })
    },
    handleEdit(row, data) {
      this.title = data
      this.addOrganizaDialog = true
      //  this.addOrganiza = {}
      this.addOrganiza = row
    },
    delOrganizaOnes(row) {
      this.delusername = true
      const obj = {}
      obj.data = {}
      obj.data.ids = [row.id]
      this.delObj = obj
    },
    delOrganiza() {
      this.delusername = true
    },
    delSure(Form) {
      this.$refs[Form].validate((valid) => {
        if (valid) {
          deleteorg(this.delObj).then(res => {
            this.getList()
            this.delusername = false
            this.delObj = {}
          })
        } else {
          return false
        }
      })
    },
    search() {
      this.getList()
    }
  }
}
</script>
<style  lang="scss">

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
