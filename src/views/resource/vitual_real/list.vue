<template>
  <div class="app-container">
    <!-- 头部 -->
    <div class="top">
      <div class="operation_box">
        <div class="operation">
          <el-select
            v-model="query.control_id"
            size="medium"
            placeholder="选择控制器"
            @change="handleVirtualReal()"
          >
            <el-option
              v-for="item in virtualRealOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="buttons">
          <el-button type="text" icon="iconfont icon-zengjia" @click="openDialog" />
          <el-button type="text" icon="iconfont icon-bianji" :disabled="!query.control_id" @click="editItem" />
          <el-button type="text" icon="iconfont icon-shanchu" :disabled="!query.control_id" @click="deleteItem" />
        </div>
      </div>
      <div class="desc">
        <el-descriptions :column="4">
          <el-descriptions-item label="设备名称" label-class-name="title">{{ virtualRealInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="服务器网卡" label-class-name="title">{{ virtualRealInfo.service_interface }}</el-descriptions-item>
          <el-descriptions-item label="设备品牌" label-class-name="title">{{ controllerBrand.get(virtualRealInfo.brand) }}</el-descriptions-item>
          <el-descriptions-item label="设备型号" label-class-name="title">{{ virtualRealInfo.model }}</el-descriptions-item>
          <el-descriptions-item label="设备类型" label-class-name="title">{{ controllerType.get(virtualRealInfo.type) }}</el-descriptions-item>
          <el-descriptions-item label="管理IP" label-class-name="title">{{ virtualRealInfo.ip }}</el-descriptions-item>
          <el-descriptions-item label="管理端口" label-class-name="title">{{ virtualRealInfo.manager_port }}</el-descriptions-item>
          <el-descriptions-item label="管理协议" label-class-name="title">{{ controllerProtocol.get(virtualRealInfo.protocol) }}</el-descriptions-item>
          <el-descriptions-item label="管理账号" label-class-name="title">{{ virtualRealInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="管理密码" label-class-name="title">
            <div v-if="query.control_id">
              {{ canSee ? virtualRealInfo.password : passwordNoSee }}
              <i class="iconfont see" :class="canSee ? 'icon-kejian' : 'icon-bukejian'" @click="canSee=!canSee" />
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="控制器状态" label-class-name="title" :content-class-name="virtualRealInfo.status === 'online' ? 'green' : 'purpor'">{{ controllerStatus.get(virtualRealInfo.status) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <!-- table -->
    <icr-table
      ref="table"
      :loading="loading"
      :columns="table.columns"
      :data="records"
    />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除控制器"
      :desc="deleteDesc"
    />
    <!-- 添加编辑 -->
    <el-dialog
      :visible.sync="showFormDialog"
      :title="(model.id ? '编辑' : '添加') + '虚实结合控制器'"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        :option="option"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      />
    </el-dialog>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { usePagination } from '@/hooks'
import { controlResourcePaging, controlResourceAdd, controlResourceUpdate, controlResourceRetrieve,controlPortPaging,controlResourceDelete} from '@/api/control_resource'
import { mapToSelectionOptions } from '@/utils/'
import { cloneDeep } from 'lodash-es'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { controllerBrand, controllerType, controllerProtocol, controllerStatus, managerPortStatus } from '@/const/resource'
import { isIpv4, isInteger } from '@/utils/validate-helper'
export default {
  components: {
    IcrTable,
    Pagination,
    IcrForm,
    IcrConfirmDelete
  },
  setup() {
    const query = reactive({
      control_id: null
    })
    // const { selection } = useTableSelection()
    return {
      query,
      ...usePagination(controlPortPaging, query)
    }
  },
  data() {
    return {
      showFormDialog: false,
      descriptionData: {},
      model: {
        name: '',
        service_interface: '',
        brand: '',
        model: '',
        type: '',
        ip: '',
        manager_port: '',
        protocol: '',
        username: '',
        password: ''
      },
      formRules: {
        brand: [
          { required: true, message: '设备品牌不能为空', trigger: 'change' }
        ],
        type: [
          { required: true, message: '设备类型不能为空', trigger: 'change' }
        ],
        ip: [isIpv4('管理IP', { required: true })],
        manager_port: [isInteger('管理端口', { required: true, max: 65535 })],
        protocol: [
          { required: true, message: '管理协议不能为空', trigger: 'change' }
        ]
      },
      formFields: [
        {
          label: '设备名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '服务器网卡',
          type: 'input',
          prop: 'service_interface'
        },
        {
          label: '设备品牌',
          type: 'select',
          prop: 'brand',
          options: mapToSelectionOptions(controllerBrand)
        },
        {
          label: '设备型号',
          type: 'input',
          prop: 'model'
        },
        {
          label: '设备类型',
          type: 'select',
          prop: 'type',
          options: mapToSelectionOptions(controllerType)
        },
        {
          label: '管理IP',
          type: 'input',
          prop: 'ip'
        },
        {
          label: '管理端口',
          type: 'input',
          prop: 'manager_port'
        },
        {
          label: '管理协议',
          type: 'select',
          prop: 'protocol',
          options: mapToSelectionOptions(controllerProtocol)
        },
        {
          label: '管理账号',
          type: 'input',
          prop: 'username'
        },
        {
          label: '管理密码',
          type: 'input',
          prop: 'password'
        }
      ],
      option: {
        'label-width': '85px'
      },
      virtualRealOptions: [], // 控制器字典
      virtualRealList: [], // 控制器列表
      virtualRealInfo: '', // 当前控制器
      canSee: false,
      passwordNoSee: '********',
      table: {
        columns: [
          { prop: 'port_name', label: '端口号' },
          { prop: 'device_name', label: '设备名称' },
          { prop: 'ip', label: 'IP地址' },
          {
            label: '状态',
            render: ({ row }) => {
              switch (row.status) {
                case '离线':
                  return <span class='purpor'>{row.status}</span>
                case '可用':
                  return <span class='green'>{row.status}</span>
                case '占用':
                  return <span>{row.status}</span>
              }
            }
          }
        ]
      },
      deleteDesc: '控制器上挂有物理设备不可删除。确定删除该控制器?',
      controllerBrand,
      controllerType,
      controllerProtocol,
      controllerStatus
    }
  },
  computed: {
    postModel() {
      return this.serializeModel(this.model)
    }
  },
  created() {
    this.getcontrolResourceInfo()
  },
  mounted() {
    this.initModel()
  },
  methods: {
    // 打开弹框
    openDialog() {
      this.initModel()
      this.showFormDialog = true
      this.model.id = null
    },
    // 关闭弹窗
    closeDialog() {
      this.initModel()
      this.$refs.form.resetFields()
    },
    // 编辑条目
    editItem() {
      this.showFormDialog = true
      this.model = {
        ...this.virtualRealInfo
      }
    },
    // 单项删除
    deleteItem() {
      this._delete([this.query.control_id])
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        controlResourceDelete({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getcontrolResourceInfo()
        })
      })
    },
    // 初始化表单数据
    initModel() {
      this.model = {
        name: '',
        service_interface: '',
        brand: '',
        model: '',
        type: '',
        ip: '',
        manager_port: '',
        protocol: '',
        username: '',
        password: ''
      }
    },
    // 提交
    submit() {
      this.model.id ? this.update() : this.create()
    },
    // 新增
    create() {
      controlResourceAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getcontrolResourceInfo() // 获取字典
      })
    },
    // 更新
    update() {
      controlResourceUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.virtualRealInfo = cloneDeep(this.model)
        this.getRecords()
      })
    },
    // 虚实控制器
    getcontrolResource(query) {
      return new Promise((resolve, reject) => {
        controlResourcePaging({
          page_info: { page_num: 1, page_size: 10000 },
          search_info: query
        })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    // 虚实字典
    getcontrolResourceInfo() {
      this.getcontrolResource({}).then(res => {
        if (res.data.data.length) {
          this.query.control_id = res.data.data[0].id // 默认展示第一项
          this.handleVirtualReal() // 默认展示第一项info
          this.virtualRealOptions = res.data.data
        }
      })
    },
    // 切换控制器
    handleVirtualReal() {
      this.getcontrolResource({ id: this.query.control_id }).then(res => {
        this.$nextTick(() => {
          this.virtualRealInfo = res.data.data[0]
        })
      })
      this.getRecords()
    },
    // 序列化model
    serializeModel(data) {
      const model = cloneDeep(data)
      return model
    }
  }
}
</script>

<style scoped lang="scss">
.top {
  display: flex;
  .operation_box {
    width: 205px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    // .operation {
    //   float: none;
    //   height: 36px;
    // }
    .buttons {
      margin-top: 12px;
    }
  }
  .desc {
    flex: 1;
    .see {
      cursor: pointer;
      color: #00AD84;
      margin-left: 15px;
    }
  }
}
::v-deep {
  .el-button--text {
    color: #fff;
  }
  .green {
    color: #68BF60;
  }
  .purpor {
    color: #9382FF;
  }
  .title {
    min-width: 85px;
    justify-content: flex-end;
  }
  .el-form {
    .el-form-item:nth-child(-n+4) {
      display: inline-block;
    }
    .el-form-item:nth-child(6),
    .el-form-item:nth-child(7),
    .el-form-item:nth-child(n+9) {
      display: inline-block;
    }
    .el-form-item:nth-child(1),
    .el-form-item:nth-child(3),
    .el-form-item:nth-child(6),
    .el-form-item:nth-child(9) {
      margin-right: 50px;
    }
  }
}
</style>
