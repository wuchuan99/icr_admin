<template>
  <div class="jhj_Config">
    <div class="icrCollapse_item">
      <el-input v-model="formData.attrs.name" :disabled="disabled" size="mini" placeholder="组件名称" />
      <!-- <span class="item-title">靶机模板</span>
      <el-input size="mini" class="item-content" readonly>
        <template slot="append"><el-button type="text" :disabled="disabled">添加</el-button></template>
      </el-input> -->
    </div>
    <icr-collapse :title="`网络适配器`">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="add"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table ref="table" :columns="table.columns" :data="formData.attrs.port_info" />
    </icr-collapse>
    <el-dialog
      :visible.sync="showDialog"
      :before-close="handleClose"
      title="交换机接口设置"
      append-to-body
      custom-class="app-main"
      width="976px"
    >
      <icr-form
        ref="layerForm"
        class="layerForm"
        :model="model"
        :rules="rules"
        :disabled="disabled"
        @cancel="handleClose"
        @confirm="submit"
        @submit.native.prevent
      >
        <el-form-item label="接口名称" prop="port_name">
          <el-input v-model="model.port_name" />
        </el-form-item>
        <el-form-item label="网卡类型" prop="vni_type">
          <el-select
            v-model="model.vni_type"
            placeholder="请选择网卡类型"
          >
            <el-option
              v-for="item in vniTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="端口模式" prop="port_mode">
          <el-select
            v-model="model.port_mode"
            placeholder="请选择端口模式"
            @change="$set(model, 'subnet_id', '')"
          >
            <el-option key="access" label="access" value="access" />
            <el-option key="trunk" label="trunk" value="trunk" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="model.port_mode === 'access'" label="选择子网" prop="subnet_id">
          <el-select
            v-model="model.subnet_id"
            placeholder="请选择子网"
          >
            <el-option
              v-for="item in subnetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      width="400px"
      :visible.sync="TargetTemplateShowDialog"
      title="选择靶机模板"
      @close="TargetTemplateShowDialog = false"
    >
      <icr-table
        v-if="TargetTemplateShowDialog"
        ref="TargetTemplateTable"
        class="targetTemplateTable"
        :columns="TargetTemplateTable.columns"
        :data="TargetTemplateRecords"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="TargetTemplateSubmit">确认</el-button>
        <el-button @click="TargetTemplateShowDialog = false">取消</el-button>
      </div>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" :title="`删除${descTypeName}`" :desc="`您即将删除该${descTypeName}, 确定删除?`" />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrTable from '@/components/table'
import IcrCollapse from '../../components/collapse.vue'
import { v4 as uuidv4 } from 'uuid'
import {
  scenetargetSubnetList
} from '@/api/scene'
import { required } from '@/utils/validate-helper'
import { mapGetters } from 'vuex'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
export default {
  components: {
    IcrForm,
    IcrTable,
    IcrCollapse,
    IcrConfirmDelete
  },
  props: {
    formData: Object
  },
  inject: ['getEditor'],
  data() {
    return {
      descTypeName: '网络适配器',
      showDialog: false,
      isEdit: false,
      model: {},
      vniTypeOptions: [
        {
          id: '1',
          name: 'virto'
        }, {
          id: '2',
          name: 'e1000'
        }, {
          id: '3',
          name: 'rtl8139'
        }
      ],
      subnetOptions: [],
      rules: {
        port_name: [required('接口名称')],
        vni_type: [required('网卡类型')],
        port_mode: [required('端口模式')],
        subnet_id: [required('子网'), { required: false }]
      },
      table: {
        columns: [
          { prop: 'port_name', label: '接口名称' },
          { prop: 'port_mode', label: '端口模式' },
          {
            label: '',
            width: 60,
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope) }}><i class='iconfont icon-bianji' ></i></el-button>
                  <el-button type='text' disabled={ this.disabled } onclick={() => { this.confirmDelete(scope) }}><i class='iconfont icon-shanchu'></i></el-button>
                </div>
              )
            }
          }
        ]
      },
      showStaticRoutersFormDialog: false,
      TargetTemplateShowDialog: false,
      TargetTemplateTable: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '模板名称' }
        ]
      },
      TargetTemplateRecords: [{ name: 'openVSwitch' }],
      disabled: false
    }
  },
  computed: {
    ...mapGetters(['sceneId'])
  },
  watch: {
    'model.port_mode': function(val) {
      if (val === 'access') {
        this.rules.subnet_id = [required('子网')]
      } else {
        this.rules.subnet_id = [required('子网'), { required: false }]
      }
    }
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
  },
  mounted() {

  },
  methods: {
    TargetTemplateSubmit() {
      const checkList = this.$refs.TargetTemplateTable.getSelection()
      if (!checkList?.length) {
        return this.$message({
          type: 'error',
          message: '请选择模板'
        })
      }
      const name = checkList[0].name
      console.log(name)
      this.formData.attrs.image_info = name
      this.TargetTemplateShowDialog = false
    },
    getSubnetList() {
      scenetargetSubnetList({
        scene_id: this.sceneId
      }).then((res) => {
        this.subnetOptions = res?.data?.data || []
      })
    },
    add() {
      this.getSubnetList()
      this.isEdit = false
      this.showDialog = true
    },
    edit(item) {
      this.getSubnetList()
      this.isEdit = true
      this.showDialog = true
      this.model = {
        ...item.row
      }
    },
    confirmDelete(item) {
      this.$refs.confirmDelete.prompt().then(() => {
        this.delete(item)
      })
    },
    delete(item) {
      const self_eth_id_list = this.formData.connections.map(it => it.self_eth_id)
      if (self_eth_id_list.includes(item.row.id)) {
        return this.$message({
          message: '已经有链路链接该接口，请先修改链路设置！',
          type: 'error'
        })
      }
      this.formData.attrs.port_info.splice(item.$index, 1)
    },
    submit() {
      const name_list = this.formData.attrs.port_info.filter(item => item.id !== this.model.id).map(item => item.port_name)
      if (name_list.includes(this.model.port_name)) {
        return this.$message({
          message: '接口名称已存在',
          type: 'error'
        })
      }
      if (this.isEdit) {
        const index = this.formData.attrs.port_info.findIndex(ele => {
          return ele.id === this.model.id
        })
        this.formData.attrs.port_info.splice(index, 1, { ...this.model })
      } else {
        this.formData.attrs.port_info.push({
          id: uuidv4(),
          ...this.model
        })
      }
      this.handleClose()
    },
    handleClose() {
      this.model = {}
      this.showDialog = false
      this.$refs.layerForm.resetFields()
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .layerForm .el-form-item {
    display: inline-block;
  }
  .layerForm .el-form-item:nth-last-child(-n+2) {
    margin-bottom: 0;
  }
  .el-form-item:nth-child(2n-1) {
    margin-right: 70px;
  }

  .targetTemplateTable {
    .el-table__header {
      tr {
        th {
          font-size: 14px !important;
          padding: 12px 0 !important;
          color: rgba(255, 255, 255, 0.7) !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }
    tr.el-table__row {
      td {
        padding: 16px 0 !important;
      }
    }
  }
}
</style>

