<template>
  <div class="settings-scene">
    <div class="tools">
      <div class="tools-left">
        <el-input v-model="scene.name" readonly style="flex: 1;margin-right: 30px;max-width: 320px">
          <template slot="append">
            <el-button
              type="text"
              style="padding: 13px 15px;color: #00AD84;"
              :disabled="competition.going"
              @click="showTableDialog = true"
            >选择演练场景</el-button></template>
        </el-input>

        <el-button
          v-if="canExposeNode"
          type="primary"
          :disabled="competition.going"
          @click="exposeNodes"
        >
          暴露节点
        </el-button>
        <div
          v-if="exposeNode"
          class="expose-node"
        >
          <div>当前暴露节点: {{ exposeNode.name }}</div>
          <div>当前暴露端口: {{ exposeNode.port }} </div>
        </div>
      </div>
      <div class="tools-right">
        <!-- <el-button :disabled="disabled" type="primary" @click="submit">保存</el-button> -->
      </div>
    </div>
    <Topology
      :key="topologyKey"
      ref="topology"
      class="topology"
      :scene-data="scene"
      :option="editorOption"
      style="overflow: hidden;"
    />
    <el-dialog
      width="80%"
      :visible.sync="showTableDialog"
      title="选择场景题目"
      @close="closeDialog"
    >
      <SceneDialog
        v-if="showTableDialog"
        ref="sceneDialog"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <dialog />
    <el-dialog
      v-if="showExposeDialog"
      :visible.sync="showExposeDialog"
      title="选择暴露端口"
    >
      <IcrForm
        :model="{}"
        @confirm="submitExposeNodes"
        @cancel="showExposeDialog = false"
      >
        <div
          v-for="(node, index) in selectNodes"
          :key="index"
        >
          <el-form-item
            label="节点名称"
          >
            {{ node.name }}
          </el-form-item>
          <el-form-item
            label="选择端口"
          >
            <el-select
              v-model="node.exposePorts"
            >
              <el-option
                v-for="item in node.ports"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </div>

      </IcrForm>
    </el-dialog>
  </div>
</template>

<script>
import { scenetargetRetrieve } from '@/api/scene'
import Topology from '../../../target/scene-target/topology/_editor.vue'
import SceneDialog from './scene-dialog.vue'
import IcrForm from '@/components/form.vue'
import {
  competitionQuestionAdd,
  // competitionQuestionDel,
  // competitionQuestionUpdate,
  competitionQuestionList,
  competitionQuestionTaskExpose,
  competitionQuestionTaskExposedinfo
} from '@/api/competition'
import { cloneDeep } from 'lodash-es'
import {
  CompetitionInvasionModel,
  CompetitionDrillModel,
  CompetitionRealWorldModel
} from '../../index.vue'

export let currentScene = null

export default {
  components: {
    Topology,
    SceneDialog,
    IcrForm
  },
  inject: ['getCompetitionId', 'getCompetition'],
  props: {
    drillData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      competition: this.getCompetition(),
      showTableDialog: false,
      showExposeDialog: false,
      selectNodes: [],
      exposeNode: null,
      exposeNodeModel: {
        name: '',
        port: ''
      },
      scene: {
        id: '',
        name: '',
        data: [],
        questionId: ''
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
            return !['RectBlock', 'TextBlock', 'VirtualNet', 'Layer2Switch', 'NetRouter'].includes(node.component)
          }
        }
      },
      list: []
    }
  },
  computed: {
    portOptions() {
      return this.selectNode?.data?.attrs?.port_info || []
    },
    canExposeNode() {
      const competition = this.getCompetition()
      return competition.competition_model === CompetitionInvasionModel || competition.competition_model === CompetitionDrillModel ||
        competition.competition_model === CompetitionRealWorldModel
    }
  },
  mounted() {
    currentScene = null
    this.getQuestionList()
      .then(() => {
        return this.getExposedNodesinfo()
      })
      .then(res => {
        if (res.data?.data?.length > 0) {
          const exposeNodeInfo = res.data?.data?.[0]
          const exposeNode = currentScene.data.find(node => node.id === exposeNodeInfo.network_ele_id)
          this.exposeNode = {
            name: exposeNode.attrs?.name,
            port: exposeNodeInfo.port?.[0]
          }
        }
      })
  },
  methods: {
    getQuestionList() {
      if (!this.getCompetitionId()) return
      return new Promise((resolve, reject) => {
        competitionQuestionList({
          data: { id: this.getCompetitionId(), category: 3 }
        })
          .then((res) => {
            if (res.status === 0) {
              if (res.data?.data?.length) {
                resolve(this.getSceneDetail(res.data?.data?.[0]?.scene_id))
              }
            }
          })
      })
    },
    submit() {
      this.$emit('submitSettings', { go: true })
    },
    closeDialog() {
      this.showTableDialog = false
    },
    confirm(data) {
      console.log(data)
      const scene = data?.[0] || {}
      this.scene.questionId = scene.id
      this.getSceneDetail(scene.id).then(() => {
        this.addSceneQuestion()
      })
    },
    getSceneDetail(id) {
      return scenetargetRetrieve({
        id
      }).then(res => {
        if (res.status === 0 && res.data) {
          this.scene.id = id
          this.scene.name = res.data?.scene?.name || ''
          this.scene.data = res.data?.data || []
          this.closeDialog()

          currentScene = cloneDeep(this.scene)
          setTimeout(() => {
            this.initTopology()
          })
        }
      })
    },
    addSceneQuestion() {
      competitionQuestionAdd({
        data: {
          c_id: this.getCompetitionId(),
          q_ids: [this.scene.questionId],
          category: 3
        }
      }).then((res) => {
        console.log(res)
      })
    },
    initTopology() {
      if (this.scene.id) {
        this.topologyKey++
        this.$nextTick(() => {
          this.$refs.topology && this.$refs.topology.init()
        })
      }
    },
    getSelectNodeIds() {
      const cells = this.$refs.topology?.graph?.getSelectedCells() || []
      const nodes = cells.filter(cell => cell.isNode())
      return nodes.map(node => node.data.id)
    },
    async exposeNodes() {
      const selectNodes = this.$refs.topology?.graph?.getSelectedCells() || []
      if (!selectNodes || !selectNodes.length) {
        this.$message({ type: 'warning', message: '请先选中节点' })
        return
      }

      const res = await this.getExposedNodesinfo()
      const exposeNodes = res.data?.data || []

      this.selectNodes = selectNodes.map(node => {
        const ports = exposeNodes.filter(item => item.network_ele_id === node.data.id)?.[0]?.port
        console.log('ports ', ports)
        const _node = {
          id: node.data.id,
          name: node.data?.attrs?.name ||
            node.data?.attrs?.port_name ||
            node.data?.attrs?.eth_name ||
            '',
          ports: node.data?.attrs?.nics ||
            node.data?.attrs?.inf ||
            node.data?.attrs?.port_info ||
            [],
          exposePorts: Array.isArray(ports) ? ports[0] : ports
        }
        // 解决不同设备端口字段名称不一致的问题
        _node.ports.map(port => {
          port.name = port.name || port.port_name || port.eth_name || ''
        })
        return _node
      })
      this.showExposeDialog = true
    },
    submitExposeNodes() {
      const nodes = this.selectNodes.map(node => {
        return {
          network_ele_id: node.id,
          port: Array.isArray(node.exposePorts) ? node.exposePorts : [node.exposePorts]
        }
      })

      const count = nodes?.reduce((acc, node, index) => {
        node.port?.map(port => {
          if (port) acc++
        })
        return acc
      }, 0)

      // at lesat must select one port
      if (count <= 0) {
        this.$message({
          type: 'warning',
          message: '请选择一个暴露端口'
        })
        return
      }

      const data = {
        id: this.getCompetitionId(),
        info: nodes
      }
      competitionQuestionTaskExpose({
        data
      }).then(res => {
        this.$message({ type: 'success', message: '设置成功' })
        this.showExposeDialog = false

        // setup exposeNode
        const exposeNodeInfo = data.info.find(node => node.port?.length > 0)
        const exposeNode = currentScene.data.find(node => node.id === exposeNodeInfo.network_ele_id)
        this.exposeNode = {
          name: exposeNode.attrs?.name,
          port: exposeNodeInfo.port?.[0]
        }
      })
    },
    async getExposedNodesinfo() {
      return await competitionQuestionTaskExposedinfo({
        data: { id: this.getCompetitionId() }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/styles/themes/black/vars.scss";
.settings-scene {
  overflow: hidden;
  height: inherit;
  .tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .tools-left {
      flex: 1;
      display: flex;
    }
    .expose-node {
      color: $--color-primary;
      line-height: 20px;
      margin-left: 20px;
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
      // .graph_node {
      //   &.layer2Switch,
      //   &.netRouter {
      //     pointer-events: all;
      //     cursor: pointer;
      //   }
      // }
    }
  }
  }
}
</style>
