<template>
  <div class="monitor">
    <topology
      ref="topology"
      class="topology"
      :scene-data="sceneData"
      :contextmenu-props="contextmenuProps"
      style="overflow: hidden;"
      @nodeClick="nodeClick"
    />
    <el-dialog
      :visible.sync="showDialog"
      :title="activeVideo.label"
      :before-close="closeDialog"
    >
      <div class="video">
        <video
          v-if="activeVideo.status === 1001"
          :src="activeVideo.url"
          autoplay
          controls
          controlslist="nodownload noplaybackrate"
          disablePictureInPicture
        />
        <div
          v-else-if="activeVideo.status === 1002"
          v-loading="loading"
          element-loading-text="转码中..."
          class="mask"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import topology from '../../../target/scene-target/topology/_editor.vue'
import { getlist } from '@/api/account'
import { drillRetrieve, vlogList, vlogRetrieve, drillPositionRetrieve, monitorRemote } from '@/api/drill'
import { scenetargetRetrieve } from '@/api/scene'
import { vmSocket } from '@/utils/ws'
import { BasePath } from '@/router/index'
import { cloneDeep } from 'lodash-es'
import { getVNCWebSocketUrl } from '@/utils/tools'

const colroCampMap = {
  0: '#ff6067',
  1: '#326BFF'
}

const baseOptions = [{
  value: 'view',
  label: '查看监控',
  leaf: false
},
{
  value: 'record',
  label: '查看录像',
  leaf: false
}]

export default {
  inject: ['drillId', 'mode', 'record'],
  components: {
    topology
  },
  props: {
    userId: {
      type: Number,
      default: 0
    }
  },
  data() {
    const vm = this
    return {
      sceneData: {
        id: '',
        data: []
      },
      activeVideo: {},
      showDialog: false,
      loading: true,
      viewLoading: false,
      list: [],
      contextmenuProps: {
        lazy: true,
        async lazyLoad(node, resolve) {
          const { level, path } = node
          const pathRoot = path?.[0] || ''
          let nodes = []
          switch (level) { // vm.mode演练方式：个人：0, 组队:1, 红蓝：2
            case 0:
              nodes = cloneDeep(baseOptions).slice(0, vm.record + 1)
              break
            case 1:
              if ([1, 2].includes(vm.mode)) {
                nodes = await vm.getUserList()
              } else {
                console.log(pathRoot)
                nodes = await vm.getVlogList(vm.userId, pathRoot)
              }
              break
            case 2:
              if ([1, 2].includes(vm.mode)) {
                console.log(pathRoot)
                nodes = await vm.getVlogList(node?.data?.value, pathRoot)
              }
              break
            default:
              break
          }
          resolve(nodes || [])
        }
      },
      activeNode: {}
    }
  },
  mounted() {
    const destroyedHooks = this._events?.['hook:destroyed']
    destroyedHooks.push(vmSocket.on('vlog', data => {
      console.log(data)
      const id = data?.scenarios_id
      if (!this.activeVideo?.value || !id || this.activeVideo.value !== id) return
      this.activeVideo.status = data.code
      if (data.code === 1001) {
        this.activeVideo.url = `/resource/${data.vlog_path}`
      } else if (data.code === 1003) {
        this.closeDialog()
        this.$message({
          type: 'error',
          message: '录像转码失败'
        })
      }
    }))

    this.initData()
  },
  methods: {
    initData() {
      this.getCampRetrieve().then(() => {
        this.getDrillData().then((res) => {
          const sceneId = res?.data?.data?.scene?.id || ''
          sceneId && this.getSceneData(sceneId)
        })
      })
    },
    getUserList() {
      return getlist({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          org_id: this.userId
        }
      }).then((res) => {
        const data = res?.data?.data || []
        const nodes = data.map(item => ({
          value: item.id,
          label: item.real_name,
          leaf: false
        }))
        return nodes || []
      })
    },
    getCampRetrieve() {
      return drillPositionRetrieve({ drill_id: this.drillId }).then(({ data }) => {
        this.list = data?.data || []
      })
    },
    getDrillData() {
      return drillRetrieve({ drill_id: this.drillId })
    },
    getSceneData(sceneId) {
      scenetargetRetrieve({ id: sceneId }).then((res) => {
        this.sceneData.id = sceneId
        const data = res?.data?.data || []
        this.setNodeColor(this.list, data)
        this.sceneData.data = data
        this.initTopology()
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
      this.$refs.topology && this.$refs.topology.init()
    },
    nodeClick(e) {
      this.activeNode = e.node
    },
    getVlogList(userId, pathRoot) {
      return vlogList({
        scenarios_info: {
          scenarios_id: this.drillId,
          scenarios: 'drill',
          element_id: this.activeNode?.data.id,
          user_id: userId
        }
      }).then((res) => {
        const data = res?.data?.data || {}
        const vlog_list = data?.vlog_list || []
        const videoList = vlog_list.map((item) => {
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
        const monitorList = scene_elements.map((item) => {
          const monitor = {
            value: item.instance_id,
            label: item.create_time,
            network_element_id: item.network_element_id,
            scene_uuid: item.scene_uuid,
            leaf: true
          }
          monitor.onclick = () => {
            this.viewMonitor(monitor, userId)
          }
          return monitor
        })
        let nodes = []
        if (pathRoot === 'view') {
          nodes = monitorList
        } else if (pathRoot === 'record') {
          nodes = videoList
        }
        return nodes
      })
    },
    closeDialog() {
      this.showDialog = false
      this.activeVideo = {}
    },
    viewMonitor(monitor, userId) {
      if (this.viewLoading) return
      this.viewLoading = true
      const params = {
        instance_id: monitor.value,
        scenarios_info: {
          scenarios_id: this.drillId,
          scenarios: 'drill',
          element_id: this.activeNode?.data.id,
          user_id: userId
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
      }).finally(() => {
        this.viewLoading = false
      })
    },
    playVlog(vlog) {
      if (this.viewLoading) return
      this.viewLoading = true
      this.activeVideo = vlog
      vlogRetrieve({ id: this.activeVideo.value }).then((res) => {
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
    }
  }
}
</script>
<style lang="scss" scoped>
  .monitor {
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    .cascader-panel {
      position: absolute;
      top: 0;
      left: 0;
    }
    .topology.team {
      height: calc(100% - 55px);
    }
  }

  .video {
    width: 652px;
    height: 495px;
    position: relative;
    .mask {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
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
    video {
      width: 100%;
      height: 100%;
    }
  }
</style>
