<template>
  <div>
    <div class="container">
      <el-descriptions :column="1">
        <el-descriptions-item v-for="item in info" :key="item.title" :label="item.label">{{ item.val ? item.val : '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="container">
      <div class="title">IP地址</div>
      <el-descriptions :column="1">
        <el-descriptions-item v-for="(value, key, index) in ip" :key="index" :label="key">
          <div v-for="item in value" :key="item['OS-EXT-IPS-MAC:mac_addr']"> {{ item.addr }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import { clusterManageStackinstanceinfo } from '@/api/cluster_manage'
import dayjs from 'dayjs'
export default {
  props: {
    vitureId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      info: [
        {
          label: '名称',
          title: 'name'
        },
        {
          label: 'ID',
          title: 'id'
        },
        {
          label: '描述',
          title: 'description'
        },
        {
          label: '状态',
          title: 'status'
        },
        {
          label: '锁定',
          title: 'locked'
        },
        {
          label: '已创建',
          title: 'created_time'
        },
        {
          label: '时间',
          title: 'age'
        }
      ],
      ip: {},
      obj: {},
      arr: []
    }
  },
  mounted() {
    this.getDetail().then(() => {
      this.info = this.resolveArr(this.info, this.arr)
      this.ip = this.obj.IP_addresses
    })
  },
  methods: {
    getDetail() {
      return clusterManageStackinstanceinfo({
        instance_id: this.vitureId,
        search_item: 'overview'
      }).then(({ data }) => {
        this.obj = data.data
        for (const key in this.obj) {
          let val = this.obj[key]
          if (key === 'status') { // 处理状态字段
            if (val === 'ACTIVE') {
              val = '运行'
            } else if (val === 'PAUSED') {
              val = '暂停'
            }
          }
          if (key === 'locked') { // 处理锁定字段
            val = val ? 'True' : 'False'
          }
          if (key === 'created_time') { // 处理创建字段
            val = dayjs(val).format('YYYY-MM-DD HH:mm:ss')
          }
          if (key === 'age') { // 处理时间字段
            const days = parseInt((val / 60 / 60) / 24)
            const hours = parseInt((val / 60 / 60) % 24)
            const minutes = parseInt((val / 60) % 60)
            val = `${days ? days + '天' : ''}${hours ? hours + '小时' : ''}${minutes ? minutes + '分钟' : ''}`
          }
          this.arr.push({ title: key, val })
        }
      })
    },
    resolveArr(arr1, arr2) {
      return arr1.map(item => {
        const data = arr2.find(ele => item.title === ele.title)
        return {
          ...item,
          ...data
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding-bottom: 30px;
  border-bottom: 2px solid rgba(255,255,255,0.06);
  margin-bottom: 30px;
  .title {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
::v-deep {
  .el-descriptions-item__label:not(.is-bordered-label) {
    min-width: 75px;
    justify-content: flex-end;
    color: rgba(255,255,255,0.6);
    margin-right: 17px;
  }
  .el-descriptions-item__label.has-colon::after {
    left: 5px;
  }
  .el-descriptions-item__label.has-colon.no-colon::after {
    display: none;
  }
}
</style>
