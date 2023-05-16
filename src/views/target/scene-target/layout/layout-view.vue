<template>
  <div class="scene-target-layout-view">
    <div class="topology-operation">
      <div class="step">
        <!-- <i class="iconfont icon-zuojiantou" :class="{disabled: !historyState.canUndo}" @click="undoBtnClick" />
        <i class="iconfont icon-zuojiantou rotate" :class="{disabled: !historyState.canRedo}" @click="redoBtnClick" /> -->
      </div>
      <div class="zoom" :class="{'zoom-disabled': curDebuggerStatus === 1}">
        <i class="el-icon-minus" @click="subtractZoom" />
        <div type="primary" class="zoom-text" @mouseenter="isShowOptions = true" @mouseleave="isShowOptions = false">
          <span>{{ zoom }}</span>
          <div v-show="isShowOptions" class="zoom-options-box">
            <div class="zoom-options">
              <div class="prompt">
                <div
                  v-for="item in promptList"
                  :key="item.text"
                  class="prompt-item"
                >
                  <span class="text">{{ item.text }}</span>
                  <span class="shortcuts" v-html="item.shortcuts" />
                </div>
              </div>
              <div class="options">
                <div
                  v-for="item in zoomOptions"
                  :key="item"
                  class="option-item"
                  @click="zoomChange({zoom: item, set: true})"
                >
                  <span class="text">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <i class="el-icon-plus" @click="addZoom" />
      </div>
      <div class="next">
        <el-button @click="subnetManagementBtnClick">子网管理</el-button>
        <el-button @click="dnsBtnClick">DNS服务器</el-button>
        <el-button style="width: 122px;height: 40px;padding: 0;" @click="debugBtnClick">{{ debuggerStatusMap[curDebuggerStatus] }}</el-button>
        <el-button type="primary" @click="submitLayout">下一步</el-button>
      </div>
    </div>
    <div class="topology-view">
      <topology
        ref="topology"
        :scene-data="sceneData"
        :scene-tmp-uuid="sceneTmpUuid"
        :cur-debugger-status="curDebuggerStatus"
        @zoom-change="zoomChange"
        @history-change="historyChange"
      />
      <div v-show="curDebuggerStatus === 1" class="topology-mask" />
    </div>
    <!-- <topology v-if="isLoadTopology" /> -->
  </div>
</template>

<script>
import topology from '@/components/topology'
import { scenetargetStartup, scenetargetStartingstatus, scenetargetRelease, scenetargetSubnetSetdns } from '@/api/scene'
export default {
  components: {
    topology
  },
  props: {
    sceneData: {
      type: Object,
      default: () => {}
    }
    // isLoadTopology: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      isShowOptions: false,
      promptList: [
        {
          text: '放大',
          shortcuts: 'Ctrl + <span style="font-size: 18px">+</span>'
        },
        {
          text: '缩小',
          shortcuts: 'Ctrl + <span style="font-size: 18px">-</span>'
        },
        {
          text: '全览',
          shortcuts: 'F11'
        }
      ],
      zoomOptions: ['300%', '200%', '150%', '100%', '50%', '25%'],
      zoom: '100%',
      curDebuggerStatus: 0, // 0 未调试 1 正在调试 2 调试完成
      debuggerStatusMap: {
        0: '调试',
        1: '调试启动中...',
        2: '停止调试'
      },
      isDebuggering: false,
      isReleaseing: false,
      historyState: {
        canRedo: false,
        canUndo: false
      },
      sceneTmpUuid: '',
      pollingST: null
    }
  },
  created() {
    this.sceneTmpUuid = `debug_${this.sceneData.id}`
    this.scenetargetStartingstatusApi(this.sceneTmpUuid).then((res) => {
      if (res.status === 0) {
        if ([3, 2].includes(res.data.status)) {
          this.curDebuggerStatus = 0
        } else if (res.data.status === 0) {
          this.curDebuggerStatus = 1
          this.polling(this.sceneTmpUuid, 1)
        } else if (res.data.status === 1) {
          this.curDebuggerStatus = 2
        }
      }
    })
  },
  beforeDestroy() {
    clearTimeout(this.pollingST)
  },
  methods: {
    historyChange(data) {
      this.historyState.canRedo = data.canRedo
      this.historyState.canUndo = data.canUndo
    },
    undoBtnClick() {
      if (!this.historyState.canUndo) return
      this.$refs.topology.setUndo()
    },
    redoBtnClick() {
      if (!this.historyState.canRedo) return
      this.$refs.topology.setRedo()
    },
    addZoom() {
      const zoom = parseInt(this.zoom) + 10 + '%'
      this.zoomChange({ zoom, set: true })
    },
    subtractZoom() {
      const zoom = parseInt(this.zoom) - 10
      this.$refs.topology.setZoom(zoom / 100)
    },
    subnetManagementBtnClick() {
      if (this.curDebuggerStatus === 1) {
        return
      }
      this.$refs.topology.setComponentName('subnet')
    },
    dnsBtnClick() {
      if (this.curDebuggerStatus === 1) {
        return
      }
      this.$refs.topology.setComponentName('dns')
    },
    async debugBtnClick() {
      if (this.curDebuggerStatus === 0) {
        scenetargetSubnetSetdns({
          scene_id: this.sceneData.id
        }).then((res) => {
          if (res.status === 0) {
            this.debuggerStart()
          }
        })
      } else if (this.curDebuggerStatus === 2) {
        this.debuggerRelease()
      }
    },
    restDebuggerStatus() {
      this.curDebuggerStatus = 0
      this.isDebuggering = false
      this.sceneTmpUuid = ''
    },
    debuggerStart() {
      if (this.isDebuggering) return
      this.isDebuggering = true
      scenetargetStartup({
        data: {
          id: this.sceneData.id,
          debug: true
        }
      }).then((res) => {
        if (res.status === 0) {
          if (res?.data?.scene_tmp_uuid) {
            this.$message({ message: '调试启动中' })
            this.curDebuggerStatus = 1
            this.sceneTmpUuid = res.data.scene_tmp_uuid
            this.polling(res.data.scene_tmp_uuid, 1) // 开始轮询
          } else {
            this.restDebuggerStatus()
          }
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
          this.restDebuggerStatus()
        }
      }).catch(() => {
        this.restDebuggerStatus()
      })
    },
    scenetargetStartingstatusApi(sceneTmpUuid) {
      return scenetargetStartingstatus({
        scene_tmp_uuid: sceneTmpUuid
      })
    },
    polling(sceneTmpUuid, number) {
      const maxNumber = 10 * 60
      this.scenetargetStartingstatusApi(sceneTmpUuid).then((res) => {
        if (res.status === 0) {
          if (res.data.status === 3) {
            this.restDebuggerStatus()
          } else if (res.data.status === 0) {
            this.curDebuggerStatus = 1
            this.sceneTmpUuid = sceneTmpUuid
          } else if (res.data.status === 1) {
            this.curDebuggerStatus = 2
            this.sceneTmpUuid = sceneTmpUuid
            this.$refs.topology.closeDeviceConfig()
            return this.$message({
              message: '调试启动完成',
              type: 'success'
            })
          } else if (res.data.status === 2) {
            this.restDebuggerStatus()
            return this.$message({
              message: '调试启动失败, 请联系管理员',
              type: 'error'
            })
          }
          if (number > maxNumber) {
            // this.restDebuggerStatus()
            return this.$message({
              message: '调试启动超时, 请联系管理员',
              type: 'error'
            })
          }
          if (this.curDebuggerStatus === 1) {
            this.pollingST = setTimeout(() => {
              clearTimeout(this.pollingST)
              number++
              this.polling(sceneTmpUuid, number)
            }, 1000)
          }
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
          this.restDebuggerStatus()
        }
      }).catch(() => {
        this.restDebuggerStatus()
      })
    },
    debuggerRelease() {
      if (this.isReleaseing) return
      this.isReleaseing = true
      scenetargetRelease({
        scene_tmp_uuid: this.sceneTmpUuid
      }).then((res) => {
        this.isReleaseing = false
        if (res.status === 0) {
          this.$message({
            message: '调试已停止',
            type: 'success'
          })
          this.restDebuggerStatus()
          this.$refs.topology.closeDeviceConfig()
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          })
        }
      })
    },
    zoomChange(item) {
      this.zoom = item.zoom
      this.isShowOptions = false
      item.set && this.$refs.topology.setZoom(parseInt(item.zoom) / 100)
    },
    submitLayout() {
      // this.$refs.topology.getNodes()
      this.$emit('submit')
    }
  }
}
</script>
<style lang="scss" scoped>
  .scene-target-layout-view {
    font-family: MicrosoftYaHei, MicrosoftYaHei-Regular;
    // background: #1B1D20;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top: 0;
    height: 100%;
    .topology-operation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      padding-left: 35px;
      padding-right: 15px;
      width: 100%;
      i {
        cursor: pointer;
        font-size: 18px;
        &.disabled {
          cursor: not-allowed;
          color: #ccc
        }
      }
      .step {
        display: flex;
        align-items: center;
        i {
          &.rotate {
            margin-left: 33px;
            transform: rotate(180deg);
          }
        }
      }
      .zoom {
        display: flex;
        align-items: center;
        position: relative;
        &.zoom-disabled {
          cursor: not-allowed;
          .el-icon-minus, .el-icon-plus {
            pointer-events: none;
          }
          .zoom-text {
            pointer-events: none;
          }
        }
        .zoom-text {
          margin: 0 10px;
          // padding: 8px 10px;
          width: 58px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          cursor: pointer;
          position: relative;
          &:hover {
            background-color: #00d1ac;
            border-radius: 4px;
          }
          .zoom-options-box {
            position: absolute;
            left: 50%;
            top: 32px;
            transform: translate(-50%);
            width: 138px;
            padding-top: 8px;
            z-index: 10;
            text-align: left;
            .zoom-options {
              // background: #1B1D20;
              border: 2px solid rgba(255, 255, 255, 0.1);
              border-radius: 4px;
              font-size: 14px;
              line-height: 32px;
              .prompt {
                border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                padding: 13px 15px;
                .prompt-item {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  cursor: pointer;
                  .shortcuts {
                    opacity: .5;
                  }
                }
              }
              .options {
                padding: 13px 15px;
                .option-item {
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
      .next {
        display: flex;
        align-items: center;
        i {
          margin-right: 33px;
        }
      }
    }
    .topology-view {
      height: calc(100% - 48px);
      position: relative;
      .topology-mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 10;
      }
    }
  }
</style>
