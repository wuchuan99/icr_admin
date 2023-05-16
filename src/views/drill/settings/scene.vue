<template>
  <div class="settings-scene">
    <div class="tools">
      <div class="tools-left">
        <el-input v-model="sceneData.name" :disabled="disabled" readonly style="flex: 1;margin-right: 30px;max-width: 560px">
          <template slot="append">
            <el-button
              type="text"
              style="padding: 13px 15px;color: #00AD84;"
              :disabled="disabled"
              @click="showTableDialog = true"
            >选择演练场景</el-button></template>
        </el-input>
        <div>
          <el-button
            :disabled="disabled"
            icon="iconfont icon-duiwu"
            type="danger"
            @click="setCamp(0)"
          >设为红方阵营</el-button>
          <el-button
            :disabled="disabled"
            icon="iconfont icon-duiwu"
            type="primary"
            style="background: #326BFF;border: 1px solid #326BFF;"
            @click="setCamp(1)"
          >设为蓝方阵营</el-button>
          <el-button
            :disabled="disabled"
            @click="delCamp"
          >取消阵营</el-button>
        </div>
      </div>
      <div class="tools-right">
        <el-button :disabled="disabled" type="primary" @click="submit">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </div>
    <topology
      :key="topologyKey"
      ref="topology"
      class="topology"
      :scene-data="sceneData"
      :option="editorOption"
      style="overflow: hidden;"
    />
    <el-dialog
      width="80%"
      :visible.sync="showTableDialog"
      title="选择演练场景"
      @close="closeDialog"
    >
      <scene-dialog
        v-if="showTableDialog"
        ref="sceneDialog"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <dialog />
  </div>
</template>

<script>
import { scenetargetRetrieve } from '@/api/scene'
import { drillPositionAdd, drillPositionRetrieve, drillPositionDelete } from '@/api/drill'
import topology from '../../target/scene-target/topology/_editor.vue'
import sceneDialog from './dialog_scene.vue'
import { cloneDeep } from 'lodash-es'
const colroCampMap = {
  0: '#ff6067',
  1: '#326BFF'
}
export default {
  components: {
    topology,
    sceneDialog
  },
  props: {
    drillData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showTableDialog: false,
      sceneData: {
        id: '',
        name: '',
        data: []
      },
      topologyKey: 0,
      editorOption: {
        selecting: {
          enabled: true,
          rubberband: true,
          multiple: true,
          useCellGeometry: true,
          showNodeSelectionBox: true,
          pointerEvents: 'none',
          filter(node) {
            return !['RectBlock', 'TextBlock', 'VirtualNet'].includes(node.component)
          }
        }
      },
      list: []
    }
  },
  computed: {
    disabled() {
      return [1, 2].includes(this.drillData.status) || this.drillData.enable_status === 1
    }
  },
  created() {
    this.sceneData.id = this.drillData?.scene?.id || ''
    this.sceneData.name = this.drillData?.scene?.name || ''
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      await this.getCampRetrieve()
      this.sceneData.id && this.getSceneDetail()
    },
    submit() {
      this.$emit('submitSettings', { go: true })
    },
    closeDialog() {
      this.showTableDialog = false
    },
    confirm(data) {
      const row = data?.[0] || {}
      if (this.sceneData.id === row.id) {
        this.showTableDialog = false
        return
      }
      this.$emit('submitSettings', {
        go: false,
        id: row.id,
        name: row.name,
        callback: () => {
          this.sceneData.id = row.id || ''
          this.sceneData.name = row.name || ''
          this.initData()
          this.showTableDialog = false
          this.$message.closeAll()
        }
      })
    },
    getCampRetrieve() {
      return drillPositionRetrieve({ drill_id: this.drillData.id }).then(({ data }) => {
        this.list = data?.data || []
      })
    },
    getSceneDetail() {
      return scenetargetRetrieve({
        id: this.sceneData.id
      }).then(res => {
        if (res.status === 0 && res.data) {
          const data = res.data.data || []
          this.setNodeColor(this.list, data)
          this.sceneData.data = data
          this.initTopology()
        }
      })
    },
    setNodeColor(list, data) {
      for (const item of data) {
        const camp = list.find(it => (item.id === it.network_element_id))
        if (item?.illustration_info?.data?.styleObject) {
          if (camp) {
            item.illustration_info.data.styleObject.color = colroCampMap[camp.color]
          } else {
            item.illustration_info.data.styleObject.color = '#fff'
          }
        }
      }
    },
    initTopology() {
      if (this.sceneData.id) {
        this.topologyKey++
        this.$nextTick(() => {
          this.$refs.topology && this.$refs.topology.init()
        })
      }
    },
    goBack() {
      this.$router.push('/drill-manage/drill')
    },
    getSelectNodeIds() {
      const cells = this.$refs.topology?.graph?.getSelectedCells() || []
      const nodes = cells.filter(cell => cell.isNode())
      return nodes.map(node => node.data.id)
    },
    setCamp(color) {
      const ids = this.getSelectNodeIds()
      if (!ids?.length) {
        return this.$message({
          type: 'info',
          message: '请选择拓扑图上的元件！'
        })
      }
      drillPositionAdd({
        data: {
          drill_id: this.drillData.id,
          network_element_ids: ids,
          color
        }
      }).then(() => {
        this.$message.closeAll()
        this.$message({
          type: 'success',
          message: '设置阵营成功！'
        })
        this.refreshCamp()
      })
    },
    delCamp() {
      const ids = this.getSelectNodeIds()
      if (!ids?.length) {
        return this.$message({
          type: 'info',
          message: '请选择拓扑图上的元件！'
        })
      }
      const campIds = this.list.map(it => it.network_element_id)
      const isCamp = ids.some(it => campIds.includes(it))
      if (!isCamp) {
        return this.$message({
          type: 'info',
          message: '请至少选择一个有阵营的元件！'
        })
      }
      drillPositionDelete({
        data: {
          type: 1,
          drill_id: this.drillData.id,
          ids
        }
      }).then(() => {
        this.$message.closeAll()
        this.$message({
          type: 'success',
          message: '取消阵营成功！'
        })
        this.refreshCamp()
      })
    },
    refreshCamp() {
      this.getCampRetrieve().then(() => {
        const data = cloneDeep(this.sceneData.data)
        this.setNodeColor(this.list, data)
        this.sceneData.data = data
        this.$refs.topology?.renderNodes()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.settings-scene {
  overflow: hidden;
  .tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .tools-left {
      flex: 1;
      display: flex;
    }
    ::v-deep {
      .el-button {
        .iconfont {
          font-size: 14px;
        }
      }
    }
  }
  .topology {
    height: calc(100% - 56px);
    ::v-deep {
    .x6-node {
      pointer-events: none;
      .graph_node {
        &.layer2Switch,
        &.netRouter {
          pointer-events: all;
          cursor: pointer;
        }
      }
    }
  }
  }
}
</style>
