<template>
  <div class="monitor">
    <iframe id="monitor_iframe" :src="url" frameborder="0" width="100%" height="100%" scrolling="no" />
  </div>
</template>
<script>
import { examMonitor } from '@/api/exam'
import { BasePath } from '@/router/index'
export default {
  inject: ['examId'],
  props: {
    userId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      url: ''
    }
  },
  mounted() {
    examMonitor({
      search_info: {
        exam_id: this.examId,
        account_id: this.userId
      }
    }).then((res) => {
      const url = new URL(res.data.vnc_url)
      const path = `${BasePath}vnc/vnc_lite.html${url.search}&host=${url.hostname}&port=${url.port}`
      this.url = path
    }).catch((err) => {
      console.error(err)
    })
  }
}
</script>
