<template>
  <div :class="{'has-logo':showLogo}" class="sidebar">
    <logo v-if="showLogo" :collapse="false" />
    <el-scrollbar wrap-class="scrollbar-wrapper" class="sidebar-menu">
      <div class="logo" />
      <el-menu
        ref="menu"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      activeMenu: ''
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  watch: {
    '$route': {
      handler: function(val) {
        this.$nextTick(() => {
          const { path } = val
          console.log(this.$refs.menu.items)
          const pathList = Object.keys(this.$refs.menu.items)
          this.activeMenu = pathList.find(it => path.includes(it)) || path
        })
      },
      immediate: true
    }
  },
  mounted() {
    this.$store.dispatch('tagsView/setPathList', Object.keys(this.$refs.menu.items))
  }
}
</script>
