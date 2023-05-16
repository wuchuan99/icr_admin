<template>
  <div class="monitor">
    <icr-table v-if="!showTopology" ref="table" class="fixed_table" :columns="tableColumns" :data="records" :loading="loading" />
    <div v-else>
      <el-select
        v-if="currentCompetition.competition_type === CompetitionTeamType"
        v-model="selectedUser"
        class="select-user"
      >
        <el-option
          v-for="(item, index) in userList"
          :key="index"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div class="tips">
        <i class="iconfont icon-info" />
        <span>点击节点查看监控</span>
      </div>
      <Topology
        ref="topology"
        class="topology"
        :scene-data="sceneData"
        :contextmenu="contextmenu"
        :contextmenu-props="contextmenuProps"
        @nodeClick="getNodeVlogList"
      />
      <el-button
        type="primary"
        style="margin-top: 10px;"
        @click="showTopology = false"
      >
        返回
      </el-button>
      <el-dialog
        :visible.sync="showDialog"
        :title="activeVideo.label"
        :before-close="closeDialog"
      >
        <div
          v-loading="videoLoading"
          element-loading-text="视频加载中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          class="video"
        >
          <video
            :src="activeVideo.url"
            autoplay
            controls
            controlslist="nodownload noplaybackrate"
            disablePictureInPicture
          />
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import IcrTable from '@/components/table'
import { competitionOperationMonitor } from '@/api/competition'
import { scenetargetRetrieve } from '@/api/scene'
import Topology from '@/views/target/scene-target/topology/_editor.vue'
import { vlogList, vlogRetrieve, monitorRemote } from '@/api/drill'
import { getlist } from '@/api/account'
import { vmSocket } from '@/utils/ws'
import { CompetitionResolveModel, CompetitionHybridModel, CompetitionTeamType } from '@/views/competition/index.vue'
import { currentCompetition } from '../index.vue'
import { BasePath } from '@/router/index'
import { getVNCWebSocketUrl } from '@/utils/tools'

const VideoStatus = {
  Ok: 1001,
  Transforming: 1002,
  UnTransform: 1003
}

export default {
  inject: ['competitionId'],
  components: { IcrTable, Topology },
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      CompetitionTeamType,
      currentCompetition,
      showTopology: false,
      showDialog: false,
      viewLoading: false,
      activeVideo: {},
      loading: false,
      records: [],
      tableColumns: [
        { prop: 'title', label: '题目' },
        { prop: 'qc_count', label: '虚拟机数量' },
        { prop: 'status', label: '环境状态' },
        { label: '操作', width: 100, fixed: 'right', render: (scope) => {
          return (
            <div>
              <el-button type='text' onclick={ () => {
                this.viewEnv(scope)
              } }> 打开环境 </el-button>
            </div>
          )
        } }
      ],
      sceneData: {},
      videoList: [],
      monitorList: [],
      userList: [],
      selectedUser: null,
      contextmenuProps: {
        expandTrigger: 'hover'
      },
      activeNode: {}
    }
  },
  computed: {
    contextmenu() {
      return [
        {
          value: 'view',
          label: '查看监控',
          children: this.monitorList
        },
        {
          value: 'record',
          label: '查看录像',
          children: this.videoList
        }
      ]
    },
    videoLoading() {
      return this.activeVideo.status === VideoStatus.Transforming
    }
  },
  mounted() {
    const destroyedHooks = this._events?.['hook:destroyed']
    destroyedHooks.push(vmSocket.on('vlog', data => {
      const id = data?.scenarios_id
      if (!this.activeVideo?.value || !id || this.activeVideo.value !== id) return
      this.activeVideo.status = data.code
      if (data.code === 1001) {
        this.activeVideo.url = `/resource/${data.vlog_path}`
      } else if (data.code === 1003) {
        this.closeDialog()
        // this.blankClick()
        this.$message({
          type: 'error',
          message: '录像转码失败'
        })
      }
    }))

    this.getMonitorInfo()

    // 组队赛
    if (currentCompetition.competition_type === CompetitionTeamType) {
      this.getUserList()
    }
  },
  methods: {
    getMonitorInfo() {
      const data = {
        c_id: currentCompetition.id
      }

      if (this.user.id) {
        data['u_id'] = this.user.id
      }

      if (this.user.o_id) {
        data['o_id'] = this.user.o_id
      }

      competitionOperationMonitor({ data }).then((res) => {
        console.log('monitor resp ', res)
        this.records = res.data?.data || []
      })
    },
    viewEnv(scope) {
      const targetId = scope.row.target_id

      // resolve model or hybrid model
      if (CompetitionResolveModel === currentCompetition.competition_model ||
      CompetitionHybridModel === currentCompetition.competition_model
      ) {
        this.sceneData.data = [
          {
            attrs: {
              id: targetId,
              styleObject: {
                color: 'rgba(255, 255, 255, 1)',
                fontSize: '50px'
              }
            },
            dev_type: 'pc',
            illustration_info: {
              component: 'desktop',
              data: {
                id: targetId,
                styleObject: {
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: '50px'
                }
              },
              id: 'c5995cbd-f907-4de4-bcf2-34cd6dc8e211',
              position: { x: 0, y: 0 },
              shape: 'vue-shape',
              size: { width: 50, height: 50 },
              view: 'vue-shape-view',
              zIndex: 1
            }
          }
        ]
        this.showTopology = true
        this.$nextTick(() => {
          this.$refs.topology && this.$refs.topology.init()
        })
        return
      }

      scenetargetRetrieve({ id: targetId }).then(res => {
        this.sceneData.id = targetId
        this.sceneData.data = res?.data?.data || []
        this.showTopology = true
        this.$nextTick(() => {
          this.$refs.topology && this.$refs.topology.init()
        })
      })
    },
    getNodeVlogList(e) {
      this.activeNode = e.node
      const data = {
        scenarios_info: {
          scenarios_id: this.competitionId,
          scenarios: 'competition',
          element_id: e.node?.data.id,
          user_id: this.user.id || this.user.o_id
        }
      }

      if (currentCompetition.competition_type === CompetitionTeamType) {
        data.user_id = this.selectedUser
      } else {
        data.user_id = this.user.id
      }

      vlogList(data).then((res) => {
        const data = res?.data?.data || {}
        const vlog_list = data?.vlog_list || []
        this.videoList = vlog_list.map((item) => {
          const vlog = {
            value: item.id,
            label: item.create_time,
            url: `/resource/${item.filepath}`,
            status: item.status,
            leaf: true
          }
          vlog.onclick = () => {
            this.playVlog(vlog)
          }
          return vlog
        })
        const scene_elements = data?.scene_elements || []
        this.monitorList = scene_elements.map(item => {
          const monitor = {
            value: item.instance_id,
            label: item.create_time,
            network_element_id: item.network_element_id,
            scene_uuid: item.scene_uuid,
            leaf: true
          }
          monitor.onclick = () => {
            this.viewMonitor(monitor)
          }
          return monitor
        })
      })
    },
    playVlog(vlog) {
      if (this.viewLoading) return
      this.viewLoading = true
      this.activeVideo = vlog
      vlogRetrieve({ id: vlog.value }).then((res) => {
        const data = res?.data?.data || {}
        this.activeVideo.status = data.code
        if (data.code === 1001) {
          this.activeVideo.url = `/resource/${data.info}`
          this.showDialog = true
        } else if (data.code === 1002) {
          this.showDialog = true
        } else if (data.code === 1003) {
          this.$message({
            type: 'error',
            message: '转码失败，录像已失效！'
          })
        }
      }).finally(() => {
        this.viewLoading = false
      })
    },
    viewMonitor(monitor) {
      console.log(monitor)
      if (this.viewLoading) return
      this.viewLoading = true
      const params = {
        instance_id: monitor.value,
        scenarios_info: {
          scenarios_id: this.competitionId,
          scenarios: 'competition',
          element_id: this.activeNode?.data.id,
          user_id: this.user.id
        }
      }
      monitorRemote(params).then(({ data }) => {
        const { instance_id, remote_key, url } = data?.data
        const web_url = url || ''
        if (!web_url) {
          return this.$message({
            type: 'error',
            message: '获取监控失败'
          })
        }
        const wsUrl = getVNCWebSocketUrl({
          remote_key: remote_key,
          instance_id: instance_id
        })
        const vncUrl = new URL(web_url)
        const path = `${BasePath}vnc/vnc_lite.html${vncUrl.search}&host=${vncUrl.hostname}&port=${vncUrl.port}&view_only=true&wsUrl=${wsUrl}`
        window.open(path)
        // const web_url = res?.data?.web_url || ''
        // if (!web_url) {
        //   return this.$message({
        //     type: 'error',
        //     message: '获取监控失败'
        //   })
        // }
        // const url = new URL(web_url)
        // const path = `${BasePath}vnc/vnc_lite.html${url.search}&host=${url.hostname}&port=${url.port}&view_only=true`
        // window.open(path)
      }).finally(() => {
        this.viewLoading = false
      })
    },
    closeDialog() {
      this.showDialog = false
      this.activeVideo = {}
    },
    getUserList() {
      getlist({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          org_id: this.user.o_id
        }
      }).then((res) => {
        this.userList = res?.data?.data || []
        if (this.userList.length) {
          this.selectedUser = this.userList[0].id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .topology {
    min-height: 520px;
  }
  .monitor {
    .select-user {
      position: absolute;
      top: -55px;
      left: 400px;
      display: block;
      z-index: 10;
    }
    .tips {
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.6);
      i {
        margin-right: 6px;
      }
      margin-bottom: 7px;
    }
    .videoList {
      display: grid;
      grid-template-columns: repeat(4, 355px);
      // grid-template-rows: repeat(auto-fill, auto);
      grid-gap: 20px;
      .video {
        width: 355px;
        height: 200px;
        video {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .mask {
    width: 480px;
    height: 270px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 4px;
    i {
      font-size: 36px;
      cursor: pointer;
    }
    ::v-deep {
      .el-loading-mask {
        background-color: rgba(255,255,255,0.05) !important;
        .el-loading-spinner {
          margin-top: -40px;
        }
      }
    }
  }

  .video {
    width: 652px;
    height: 495px;
    video {
      width: 100%;
      height: 100%;
    }
  }
</style>
