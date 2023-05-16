<template>
  <div class="dns-server">
    <el-row>
      <el-button type="primary" @click="addBtnClick">添加DNS</el-button>
    </el-row>
    <el-row>
      <div class="list">
        <div
          v-for="item in list"
          :key="item.id"
          class="item"
        >
          <div>{{ item.domain }}</div>
          <div>{{ item.ip }}</div>
          <div class="operation">
            <span @click="editBtnClick(item)">编辑</span>&nbsp;&nbsp;
            <span @click="delBtnClick(item)">删除</span>
          </div>
        </div>
      </div>
    </el-row>
    <el-dialog
      :title="row ? '编辑DNS解析' : '添加DNS解析'"
      :visible.sync="dialogVisible"
      width="500px"
      :before-close="dialogHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="dialogForm"
        label-width="80px"
        class="topologyDialogForm dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="dialogFormFields"
        @cancel="dialogHandleClose"
        @confirm="dialogSubmit"
        @submit.native.prevent
      />
    </el-dialog>
    <icr-confirm-delete
      ref="confirmDelete"
      :append-to-body="true"
      custom-class="app-main"
      title="删除DNS服务器"
      desc="您即将删除该DNS, 确定删除?"
    />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { mapGetters } from 'vuex'
import { isIpv4, isDomainName } from '@/utils/validate-helper'
import {
  scenetargetDnsPaging,
  scenetargetDnsAdd,
  scenetargetDnsUpdate,
  scenetargetDnsDelete }
from '@/api/scene'
export default {
  name: 'DnsServer',
  components: {
    IcrForm,
    IcrConfirmDelete
  },
  data() {
    return {
      dialogVisible: false,
      dialogForm: {
        domain: '',
        ip: ''
      },
      dialogRules: {
        domain: [isDomainName('域名', { required: true })],
        ip: [isIpv4('IP地址', { required: true })]
      },
      dialogFormFields: [
        {
          label: '域名',
          type: 'input',
          prop: 'domain'
        },
        {
          label: 'IP地址',
          type: 'input',
          prop: 'ip'
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
      scenetargetDnsPaging({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        data: {
          scene_id: this.sceneId
        }
      }).then((res) => {
        if (res.status === 0) {
          this.list = res?.data?.data || []
        }
      })
    },
    dialogHandleClose() {
      this.dialogVisible = false
      this.row = null
      this.restFieldEmpty(this.dialogForm)
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          target[key] = ''
        }
      }
    },
    dialogSubmit() {
      let method = ''
      let message = ''
      const params = {
        attrs: {
          ...this.dialogForm
        }
      }
      if (this.row) {
        method = scenetargetDnsUpdate
        message = '编辑DNS服务器成功！'
        params.id = this.row.id
      } else {
        method = scenetargetDnsAdd
        message = '新增DNS服务器成功！'
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
      this.dialogForm = { ...row }
    },
    addBtnClick() {
      this.dialogVisible = true
    },
    delBtnClick(row) {
      this.$refs.confirmDelete.prompt().then(() => {
        scenetargetDnsDelete({
          data: {
            type: 1,
            id: row.id
          }
        }).then((res) => {
          if (res.status === 0) {
            this.$message.success('删除DNS服务器成功')
            this.getList()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .dns-server {
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
