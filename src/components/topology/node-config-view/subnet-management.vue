<template>
  <div class="subnet-management">
    <el-row>
      <el-button type="primary" @click="addBtnClick">添加子网</el-button>
    </el-row>
    <el-row>
      <div class="list">
        <div
          v-for="item in list"
          :key="item.id"
          class="item"
        >
          <div>{{ item.attrs.name }}</div>
          <div>{{ item.attrs.cidr }}</div>
          <div class="operation">
            <span @click="editBtnClick(item)">编辑</span>&nbsp;&nbsp;
            <span @click="delBtnClick(item)">删除</span>
          </div>
        </div>
      </div>
    </el-row>
    <el-dialog
      :title="row ? '编辑子网' : '新增子网'"
      :visible.sync="dialogVisible"
      width="540px"
      :before-close="dialogHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="dialogForm"
        label-width="90px"
        class="topologyDialogForm dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="dialogFormFields"
        @cancel="dialogHandleClose"
        @confirm="dialogSubmit"
        @submit.native.prevent
      >
        <el-form-item label="DHCP" prop="enable_dhcp">
          <el-switch
            v-model="dialogForm.enable_dhcp"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="switchChange"
          />
        </el-form-item>
        <template v-if="dialogForm.enable_dhcp">
          <el-form-item label="起始IP" prop="start">
            <el-input v-model="dialogForm.start" placeholder="请输入起始IP" />
          </el-form-item>
          <el-form-item label="终止IP" prop="end">
            <el-input v-model="dialogForm.end" placeholder="请输入终止IP" />
          </el-form-item>
        </template>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete
      ref="confirmDelete"
      :append-to-body="true"
      custom-class="app-main"
      title="删除子网"
      desc="您即将删除该子网, 确定删除?"
    />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { mapGetters } from 'vuex'
import {
  scenetargetSubnetAdd,
  scenetargetSubnetDelete,
  scenetargetSubnetUpdate,
  scenetargetSubnetPaging
} from '@/api/scene'
import { required, isIpv4, isMask, isInteger } from '@/utils/validate-helper'
import { checkIp } from '@/utils'

export default {
  name: 'SubnetManagement',
  components: {
    IcrForm,
    IcrConfirmDelete
  },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    graph: {
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogForm: {
        name: '',
        vid: '',
        subnet_ip: '',
        sub_mask: '',
        gateway_ip: '',
        enable_dhcp: true,
        start: '',
        end: ''
      },
      dialogRules: {
        name: [required('VLAN名称')],
        vid: [isInteger('VLAN ID', { required: true })],
        subnet_ip: [isIpv4('子网网段', { required: true })],
        sub_mask: [isMask('子网掩码', { required: true })],
        gateway_ip: [isIpv4('默认网关', { required: true, filterBroadcast: true })],
        start: [isIpv4('起始IP', { required: false, filterBroadcast: true })],
        end: [isIpv4('终止IP', { required: false, filterBroadcast: true })]
      },
      dialogFormFields: [
        {
          label: 'VLAN名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: 'VLAN ID',
          type: 'input',
          prop: 'vid'
        },
        {
          label: '子网网段',
          type: 'input',
          prop: 'subnet_ip'
        },
        {
          label: '子网掩码',
          type: 'input',
          prop: 'sub_mask'
        },
        {
          label: '默认网关',
          type: 'input',
          prop: 'gateway_ip'
        }
      ],
      list: [],
      row: null
    }
  },
  computed: {
    ...mapGetters(['sceneId'])
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      scenetargetSubnetPaging({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          scene_id: this.sceneId
        }
      }).then((res) => {
        if (res.status === 0) {
          this.list = res?.data?.data || []
        }
      })
    },
    switchChange(val) {
      if (!val) {
        this.dialogForm.start = ''
        this.dialogForm.end = ''
      }
    },
    dialogHandleClose() {
      this.dialogVisible = false
      this.row = null
      this.restFieldEmpty(this.dialogForm)
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          if (key === 'enable_dhcp') {
            target[key] = true
          } else {
            target[key] = ''
          }
        }
      }
    },
    dialogSubmit() {
      const vlanId = this.dialogForm.vid * 1
      const VLAN_ID_MAX = 4094
      if (vlanId > VLAN_ID_MAX) {
        return this.$message({
          message: 'vlan id取值范围为1~4094',
          type: 'error'
        })
      }
      if (!checkIp(this.dialogForm.gateway_ip, this.dialogForm.sub_mask, this.dialogForm.subnet_ip)) {
        return this.$message({
          message: '子网掩码与网关ip不匹配',
          type: 'error'
        })
      }
      if ((this.dialogForm.start && !this.dialogForm.end) || (!this.dialogForm.start && this.dialogForm.end)) {
        return this.$message({
          message: '起始ip和终止ip需同时指定',
          type: 'error'
        })
      }
      if (this.dialogForm.start && this.dialogForm.end) {
        if (
          !checkIp(this.dialogForm.start, this.dialogForm.sub_mask, this.dialogForm.subnet_ip) ||
          !checkIp(this.dialogForm.end, this.dialogForm.sub_mask, this.dialogForm.subnet_ip)
        ) {
          return this.$message({
            message: '子网掩码与ip分配池不匹配',
            type: 'error'
          })
        }

        const startAfter = this.dialogForm.start.split('.').slice(3).join('') * 1
        const endAfter = this.dialogForm.end.split('.').slice(3).join('') * 1
        if (startAfter > endAfter) {
          return this.$message({
            message: '起始ip应小于终止ip',
            type: 'error'
          })
        }

        const gateway_ip_after = this.dialogForm.gateway_ip.split('.').slice(3).join('') * 1
        if (gateway_ip_after >= startAfter && gateway_ip_after <= endAfter) {
          return this.$message({
            message: '网关ip不能在分配池之间',
            type: 'error'
          })
        }
      }
      const attrs = {
        ...this.dialogForm,
        allocation_pools: {
          start: this.dialogForm.start,
          end: this.dialogForm.end
        }
      }
      delete attrs.start
      delete attrs.end
      let method = ''
      let message = ''
      const params = {
        attrs,
        illustration_info: {}
      }
      if (this.row) {
        method = scenetargetSubnetUpdate
        message = '编辑子网成功！'
        params.id = this.row.id
      } else {
        method = scenetargetSubnetAdd
        message = '新增子网成功！'
        params.scene_id = this.sceneId
      }
      method({ data: params }).then((res) => {
        if (res.status === 0) {
          this.$message.success(message)
          this.dialogHandleClose()
          this.getList()
        }
      })
    },
    editBtnClick(row) {
      this.dialogVisible = true
      this.row = row
      this.dialogForm = {
        ...this.row.attrs,
        start: this.row.attrs.allocation_pools.start,
        end: this.row.attrs.allocation_pools.end
      }
      delete this.dialogForm.allocation_pools
    },
    addBtnClick() {
      this.dialogVisible = true
    },
    delBtnClick(row) {
      this.$refs.confirmDelete.prompt().then(() => {
        for (const node of this.graph.getNodes()) {
          const networkAdapter = node.data?.configData?.config?.networkAdapter || []
          const flag = networkAdapter.some(item => ((item.subnetId || item.subnet) === row.id))
          if (flag) {
            return this.$message({
              message: '已经有设备连接该子网，不能删除！',
              type: 'error'
            })
          }
        }
        scenetargetSubnetDelete({
          data: {
            type: 1,
            ids: [row.id]
          }
        }).then((res) => {
          if (res.status === 0) {
            this.$message.success('删除子网成功')
            this.getList()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .subnet-management {
    padding: 20px;
    .list {
      padding: 10px 0;
      .item {
        position: relative;
        background-color: #47484A;
        color: #fff;
        line-height: 30px;
        padding: 10px;
        margin-bottom: 10px;
        &:last-of-type {
          margin-bottom: 0;
        }
        .operation {
          display: none;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          span {
            cursor: pointer;
          }
        }
        &:hover {
          .operation {
            display: block;
          }
        }
      }
    }
  }
</style>
