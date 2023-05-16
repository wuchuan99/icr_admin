<template>
  <div>
    <!-- buttons -->
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="openDialog()"
        >新增</el-button>
      </div>
    </div>
    <!-- table -->
    <icr-table
      ref="table"
      class="fixed_table"
      :loading="loading"
      :columns="table.columns"
      :data="records"
    />
    <!-- dialog -->
    <el-dialog
      :visible.sync="showFormDialog"
      :title="(model.id ? '编辑' : '定义') + '设备'"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        class="question-form"
        :option="option"
        :rules="formRules"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="目标分类" prop="target_classify" class="text-inner">
          <span>{{ physicalModel.target_classify }}</span>
        </el-form-item>
        <el-form-item label="操作系统" prop="os" class="text-inner">
          <span>{{ physicalModel.os }}</span>
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="model.name" />
        </el-form-item>
        <el-form-item label="虚实控制器" prop="control_id">
          <el-select v-model="model.control_id" placeholder="请选择" @change="clearConnectInterface(),getInterfaceOption()">
            <el-option
              v-for="item in virtualRealOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="model.interface_settings.length"
          label="网络端口设置"
          prop="piece_setting"
        >
          <!-- <div
            v-for="(item, index) in model.interface_settings"
            :key="index"
            class="piece_box"
          >
            <span class="piece_name">端口{{ item.name }}的MAC地址</span>
            <el-input v-model="item.ip" />
          </div> -->
          <icr-table
            ref="settingsTable"
            :columns="settingsTable.columns"
            :data="model.interface_settings"
          />
        </el-form-item>
        <el-form-item label="资源描述" prop="desc">
          <el-input
            v-model="model.desc"
            type="textarea"
            :autosize="{ minRows: 6 }"
          />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除设备"
      desc="您即将删除该设备, 确定删除?"
    />
  </div>
</template>

<script>
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  physicalPaging,
  equipmentList,
  equipmentAdd,
  equipmentUpdate,
  equipmentDel
} from '@/api/resource'
import { controlResourcePaging, controlPortPaging } from '@/api/control_resource'
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { cloneDeep } from 'lodash-es'
export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete
  },
  data() {
    return {
      records: [],
      loading: false,
      showFormDialog: false,
      physicalModel: {},
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '名称' },
          { prop: 'target_classify', label: '目标分类' },
          { prop: 'os', label: '操作系统' },
          { prop: 'network_interface_num', label: '网口数量' },
          { prop: 'desc', label: '描述' },
          {
            label: '状态',
            render: ({ row }) => {
              if (row.status === '可用') {
                return <span class='greenText'>{row.status}</span>
              } else {
                return <span class='purpleText'>{row.status}</span>
              }
            }
          },
          {
            label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.edit(scope)
                    }}
                  >
                    编辑
                  </el-button>
                  <el-button
                    type='text'
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
      },
      settingsTable: {
        columns: [
          { prop: 'name', label: '设备端口名称' },
          { prop: 'ip', label: 'IP地址',
            render: (scope) => {
              return (
                <div>
                  <el-input
                    size='mini'
                    style='width:200px'
                    value = { this.model.interface_settings[scope.$index].ip}
                    oninput={val => { this.model.interface_settings[scope.$index].ip = val }}
                  />
                </div>
              )
            } },
          // onkeyup={val => { val= val.replace(/[^\d]/g, '') }}
          { prop: 'connect_interface', label: '控制器端口',
            render: (scope) => {
              return (
                <div>
                  <el-select
                    size='mini'
                    class='miniSelect'
                    value={this.model.interface_settings[scope.$index].connect_interface === 0 ? '' : this.model.interface_settings[scope.$index].connect_interface} onchange={ val => { this.model.interface_settings[scope.$index].connect_interface = val } }>
                    { this.interfaceOption?.map(item => {
                      return (<el-option disabled={this.getDisabled(item)} key={item.id} label={item.port_name} value={item.id}/>)
                    }) }
                  </el-select>
                  {/* <el-input-number
                    size='mini'
                    min={0}
                    precision={0}
                    value = { this.model.interface_settings[scope.$index].connect_interface}
                    onchange={val => { this.model.interface_settings[scope.$index].connect_interface = val }}
                  /> */}
                </div>
              )
            } }
        ]
      },
      model: {
        name: '', // 设备名称
        interface_settings: [], // 网络端口设置
        desc: '', // 资源描述
        control_id: '' // 虚实控制器
      },
      option: {
        'label-width': '100px'
      },
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      virtualRealOptions: [],
      interfaceOption: []
    }
  },
  created() {
    this.getPhysicalInfo()
    this.getcontrolResourceInfo()
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    getDisabled(item) {
      const selectIds = this.model.interface_settings.map(i => i.connect_interface)
      return !!(item.device_name || item.ip) || selectIds.includes(item.id) // 控制器有IP 或 设备名 或 端口已被选择，则禁选
    },
    getRecords() {
      if (!this.$route.params.id) return
      return new Promise((resolve, reject) => {
        this.loading = true
        equipmentList({
          search_info: { physical_resource_id: this.$route.params.id }
        })
          .then((res) => {
            if (res.data) {
              this.records = res.data.data
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    // 打开弹框
    openDialog() {
      this.initModel()
      this.physicalModel.network_interface.forEach((ele) => {
        this.model.interface_settings.push({ name: ele.value, ip: '', connect_interface: '', network_interface_id: ele.network_interface_id })
      })
      this.showFormDialog = true
      this.model.id = null
    },
    // 编辑项目
    edit(scope) {
      // const interface_settings = cloneDeep(scope.row.interface_settings)
      // interface_settings.forEach(i => { // 控制器connect_interface为0，代表无法连接，改为空
      //   if (i.connect_interface === 0) {
      //     i.connect_interface = ''
      //   }
      // })
      const { id, name, desc, interface_settings, control_id } = cloneDeep(scope.row) || {}
      this.model = { id, name, interface_settings, desc, control_id }
      this.getInterfaceOption() // 获取控制器list
      this.showFormDialog = true
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
        equipmentDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    // 初始化表单数据(模拟根据id查询物理资源)
    initModel() {
      this.model = {
        name: '', // 设备名称
        interface_settings: [], // 网络端口设置
        desc: '', // 资源描述
        control_id: ''// 虚实控制器
      }
    },
    // 关闭弹框
    closeDialog() {
      this.initModel()
    },
    // 提交
    submit() {
      this.model.id ? this.update() : this.create()
    },
    // 新增
    create() {
      equipmentAdd({
        data: { physical_resource_id: this.$route.params.id, ...this.model }
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    // 更新
    update() {
      equipmentUpdate({
        data: this.model
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    // 获得当前id物理资源信息
    getPhysicalInfo() {
      physicalPaging({
        page_info: { page_num: 1, page_size: 10 },
        search_info: { id: this.$route.params.id }
      }).then(({ data }) => {
        this.physicalModel = data.data[0]
      })
    },
    // 获取虚实控制器
    getcontrolResourceInfo() {
      controlResourcePaging({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: { }
      }).then(res => {
        res.data.data.map(item => {
          this.virtualRealOptions.push(Object.assign({}, { id: item.id, name: item.name }))
        })
      })
    },
    clearConnectInterface() {
      this.interfaceOption = []
      this.model.interface_settings.forEach(i => {
        i.connect_interface = ''
      })
    },
    // 获取控制器端口字典
    getInterfaceOption() {
      controlPortPaging({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: { control_id: this.model.control_id }
      }).then(res => {
        this.interfaceOption = res.data.data
      })
    }
  }
}
</script>

<style scoped lang="scss">
.question-form  {
  width: 870px;
}
// .piece_box {
//   float: left;
//   box-sizing: border-box;
//   margin-bottom: 10px;
//   width: 250px;
//   height: 58px;
//   background: rgba(255,255,255,0.10);
//   border-radius: 1px;
//   padding:7px;
//   margin-right: 10px;
//   &:nth-child(3n) {
//     margin-right: 0;
//   }
//   .piece_name {
//     display: block;
//     line-height: 1;
//   }
//   .piece_input {
//     display: inline-block;
//     width: 100px;
//   }
// }
.greenText {
  color: #68bf60;
}
.purpleText {
  color: #cbbdff;
}
.text-inner{
  display: inline-block;
  span {
    display: inline-block;
    width: 320px;
    height: 40px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    padding: 0 15px;
  }
}
.question-form .text-inner:nth-child(2n) {
  float: right;
}
::v-deep {
  .piece_box {
    .el-input {
      width: 100%;
      height: 24px;
      line-height: 24px;
      .el-input__inner {
        height: 24px;
      }
    }
  }
}
.miniSelect{
  width: 200px !important;
  ::v-deep {
     .el-input{
       width: auto;
    }
  }
}
</style>
