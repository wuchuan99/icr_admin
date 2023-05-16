<script>
import {
  alonetargetRetrieve,
  alonetargetEdit,
  alonetargetRemote,
  alonetargetReboot,
  alonetargetFree,
  alonetargetPause,
  alonetargetUnpause,
  alonetargetSnapshot,
  alonetargetStatus } from '@/api/target'
import { BasePath } from '@/router/index'
import { v4 as uuidv4 } from 'uuid'
import StateButton from '@/views/common/state-button'
// import { TargetDeactiveState, TargetActiveState, TargetBuildingState, TargetSavingState } from './list.vue'

const statesMap = new Map([
  [0, 'init'],
  [1, 'view'],
  [2, 'creating'],
  [3, 'saving'],
  [4, 'rebooting'],
  [5, 'freeing'],
  [6, 'pausing'],
  [7, 'pause']
])

console.log('my map is ', statesMap)

export default {
  name: 'TargetViewer',
  components: {
    StateButton
  },
  props: {
    target: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {}
    }
  },
  inject: ['alonetargetList'],
  data() {
    return {
      operationDialogVisible: false,
      state: 'view',
      instance: {
        id: ''
      },
      states: [
        {
          state: 'init',
          tip: '调试',
          template: (
            <el-button
              key={uuidv4().slice(0, 8)}
              type='text'
              onclick={this.debug}
            >
              调试靶标
            </el-button>
          )
        },
        {
          state: 'creating',
          tip: '创建靶机中...',
          template: (
            <el-button key={uuidv4().slice(0, 8)} type='text'>
              <i class='el-icon-loading'></i>
              创建中
            </el-button>
          )
        },
        {
          state: 'view',
          tip: '查看靶机',
          template: (
            <el-button
              key={uuidv4().slice(0, 8)}
              type='text'
              onclick={() => {
                this.operationDialogVisible = true
              }}
            >
              查看靶机
            </el-button>
          )
        },
        {
          state: 'saving',
          tip: '保存中',
          template: (
            <el-button key={uuidv4().slice(0, 8)} type='text'>
              <i class='el-icon-loading'></i>
              保存中
            </el-button>
          )
        },
        {
          state: 'rebooting',
          tip: '重启中',
          template: (
            <el-button key={uuidv4().slice(0, 8)} type='text'>
              <i class='el-icon-loading'></i>
              重启中
            </el-button>
          )
        },
        {
          state: 'freeing',
          tip: '释放中',
          template: (
            <el-button key={uuidv4().slice(0, 8)} type='text'>
              <i class='el-icon-loading'></i>
              释放中
            </el-button>
          )
        },
        {
          state: 'pausing',
          tip: '暂停中',
          template: (
            <el-button key={uuidv4().slice(0, 8)} type='text'>
              <i class='el-icon-loading'></i>
              暂停中
            </el-button>
          )
        },
        {
          state: 'pause',
          tip: '查看靶机',
          template: (
            <el-button
              key={uuidv4().slice(0, 8)}
              type='text'
              onclick={() => {
                this.operationDialogVisible = true
              }}
            >
              查看靶机
            </el-button>
          )
        }
      ]
    }
  },
  computed: {
    curStateTemplate: function() {
      return this.states.find((item) => item.state === this.state)['template']
    }
  },
  watch: {
    target: {
      handler() {
        // if (this.state === 'creating') {
        //   return
        // }
        this.state = statesMap.get(this.target.running)
      },
      deep: !!1
    }
  },
  created() {
    this.state = statesMap.get(this.target.running)
    // console.log(this.state, this.target.running, statesMap)
    // if (this.state === 'creating') {
    //   this.pollingTargetStatus()
    // }
  },
  methods: {
    debug() {
      this.state = 'creating'
      alonetargetEdit({
        target_id: this.target.id
      })
        .then((res) => {
          this.instance.id = res.data?.data?.instance_id
          this.refreshTarget()
          return
        })
        // .then(() => {
        //   this.pollingTargetStatus()
        // })
        .finally(() => {
          this.refreshTargetStatus()
        })
    },
    pollingTargetStatus() {
      const clear = () => {
        this.refreshTarget()
        clearInterval(timer)
      }

      const maxtimes = 5 * 60
      let times = 0
      const timer = setInterval(() => {
        times++
        if (times >= maxtimes) {
          this.$message({
            message: '靶机启动超时, 请联系管理员',
            type: 'error'
          })
          clear()
        }

        alonetargetStatus({
          data: {
            target_ids: [this.target.id]
          }
        })
          .then((res) => {
            // temporary code
            if (res.data?.data?.[0]?.status?.code === 1003) {
              this.state = 'init'
              this.$message({
                message: '靶机创建失败, 请联系管理员',
                type: 'error'
              })
              clear()
              return
            }

            if (res.data?.data?.[0]?.status?.code === 1001) {
              this.state = 'view'
              this.$message({
                message: '靶机创建成功',
                type: 'success'
              })
              clear()
            }
          })
          .catch(() => {
            clear()
          })
      }, 1500)
    },
    refreshTarget() {
      return alonetargetRetrieve({
        target_id: this.target.id
      }).then((res) => {
        if (res.status === 0) {
          this.$emit('update:target', res.data?.data)
        }
      })
    },
    targetRemote() {
      return alonetargetRemote({
        target_id: this.target.id
      }).then(({ data }) => {
        const url = new URL(data.data.url)
        const path = `${BasePath}vnc/vnc_lite.html${url.search}&host=${url.hostname}&port=${url.port}`
        window.open(path)
      }).catch(() => {
        this.remoteErrorHandler()
      })
    },
    targetReboot() {
      return alonetargetReboot({
        target_id: this.target.id
      }).then((res) => {
        this.alonetargetList.getRecords()
        this.operationDialogVisible = false
        // this.$message({
        //   message: '重启成功',
        //   type: 'success'
        // })
      }).catch(() => {
        this.remoteErrorHandler()
      })
    },
    targetFree() {
      return alonetargetFree({
        target_id: this.target.id
      }).then((res) => {
        this.alonetargetList.getRecords()
        this.operationDialogVisible = false
      }).catch(() => {
        this.remoteErrorHandler()
      })
    },
    targetPause() {
      const alonetargetPauseApi = this.state === 'pause' ? alonetargetUnpause : alonetargetPause
      return alonetargetPauseApi({
        target_id: this.target.id
      }).then((res) => {
        this.alonetargetList.getRecords()
        this.operationDialogVisible = false
      }).catch(() => {
        this.remoteErrorHandler()
      })
    },
    targetSnapshot() {
      return alonetargetSnapshot({
        target_id: this.target.id
      }).then((res) => {
        this.alonetargetList.getRecords()
        this.operationDialogVisible = false
        // this.$message({
        //   message: '保存成功',
        //   type: 'success'
        // })
      }).catch(() => {
        this.remoteErrorHandler()
      })
    },
    refreshTargetStatus() {
      alonetargetStatus({
        data: {
          target_ids: [this.target.id]
        }
      }).then((res) => {
        let state = ''
        switch (res.data?.data?.[0]?.status?.code) {
          case 1001:
            state = 'view'
            break
          case 1002:
            state = 'creating'
            break
          case 1003:
          default:
            state = 'init'
            break
        }
        this.state = state
      })
    },
    remoteErrorHandler() {
      this.alonetargetList.getRecords()
      this.operationDialogVisible = false
    }
  },
  render() {
    return (
      <div
        type='text'
        class='el-button'
        size='mini'
        style='padding: 0; background: none; border: none;'
      >
        {this.curStateTemplate}
        <el-dialog
          title='靶机操作'
          style='text-align: left'
          width='730px'
          append-to-body
          custom-class='app-main'
          visible={this.operationDialogVisible}
          {...{
            on: {
              'update:visible': (val) => (this.operationDialogVisible = val)
            }
          }}
        >
          <div style='margin: 0 0px 15px 0;'>{`靶机正在${this.state === 'pause' ? '暂停' : '运行'}中...`}</div>
          <div class='alone-target-actions'>
            <state-button type='primary' key={uuidv4()} request={this.targetRemote.bind(this)} disabled={this.state === 'pause'} >远程连接</state-button>
            <state-button type='primary' key={uuidv4()} request={this.targetReboot.bind(this)} disabled={this.state === 'pause'} >重启靶机</state-button>
            <state-button type='primary' key={uuidv4()} request={this.targetFree.bind(this)} disabled={this.state === 'pause'} >释放靶机</state-button>
            <state-button type='primary' key={uuidv4()} request={this.targetPause.bind(this)} >{this.state === 'pause' ? '启动' : '暂停'}</state-button>
            <state-button type='primary' style='color: #fff;' key={uuidv4()} request={this.targetSnapshot.bind(this)} disabled={this.state === 'pause'} >保存快照</state-button>
          </div>
        </el-dialog>
      </div>
    )
  }
}
</script>

<style lang="scss" scoped>
.alone-target-actions {
  display: flex;
  justify-content: space-between;
  .el-button {
    &:before{
      content: none !important;
    }
  }
}
</style>
