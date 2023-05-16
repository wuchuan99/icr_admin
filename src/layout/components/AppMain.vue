<template>
  <section class="app-main">
    <breadcrumb class="breadcrumb-container" />
    <transition name="fade-transform" mode="out-in">
      <!-- <keep-alive> -->
        <router-view :key="key" />
      <!-- </keep-alive> -->
    </transition>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'AppMain',
  components: {
    Breadcrumb
  },
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 90px);
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-direction: column;
}
.fixed-header+.app-main {
  padding-top: 86px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
