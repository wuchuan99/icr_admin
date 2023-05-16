<template>
  <div style="color: #000">跳转中……</div>
</template>

<script>
import { setToken } from '@/utils/auth'
export default {
  props: {},
  data() {
    return {
      authorization: ''
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.authorization = this.queryURLParams(location.href)
    if (!this.authorization) return
    setToken(this.authorization)
    this.getInfo()
  },
  methods: {
    queryURLParams(urls) {
      const url = new URL(urls.replace('#/', ''))
      return url.searchParams.get('authorization')
    },
    async getInfo() {
      this.$store.commit('user/SET_TOKEN', this.authorization)
      await this.$store.dispatch('user/getInfo')
      this.$router.replace({ path: '/sys_operations/cluster_manage' })
    }
  }
}
</script>

<style scoped lang="scss"></style>
