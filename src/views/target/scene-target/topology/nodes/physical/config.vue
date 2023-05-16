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
      <el-button slot="header-actions" :disabled="disabled" type="text"></el-button>
      <icr-table ref="table" :columns="table.columns" :data="formData.attrs.port_info" />
    </icr-collapse>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrCollapse from '../../components/collapse.vue'
import { mapGetters } from 'vuex'
export default {
  components: {
    IcrTable,
    IcrCollapse
  },
  props: {
    formData: Object
  },
  inject: ['getEditor'],
  data() {
    return {
      descTypeName: '网络适配器',
      table: {
        columns: [
          { prop: 'networkName', label: '接口名称' },
          { prop: 'name', label: '端口名称' }
        ]
      },
      disabled: false
    }
  },
  computed: {
    ...mapGetters(['sceneId'])
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
  },
  mounted() {
  },
  methods: {
    getSubnetList() {
      // scenetargetSubnetList({
      //   scene_id: this.sceneId
      // }).then((res) => {
      //   this.subnetOptions = res?.data?.data || []
      // })
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

