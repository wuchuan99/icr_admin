<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
        >{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(to, from) {
      this.$store.commit('routeHistory/SET_FROM_ROUTE', from)
      this.$store.commit('routeHistory/SET_TO_ROUTE', to)
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      const matched = this.$route.matched.filter(
        (item) => item.meta && item.meta.title
      )
      // 将首页默认展示在第一个面包屑上
      // const first = matched[0]

      // if (!this.isDashboard(first)) {
      //   matched = [{ path: '/dashboard', meta: { title: 'Dashboard' }}].concat(matched)
      // }
      if (matched.length > 1) {
        const insertPosition = matched.length - 1
        let parent = matched[insertPosition].meta.parent
        while (parent) {
          const route = this.$router.resolve(parent).route
          matched.splice(insertPosition, 0, route)
          parent = route.meta.parent
        }
      }
      this.levelList = matched.filter(
        (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
      )
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return (
        name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
      )
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { fromRoute } = this.$store.state.routeHistory
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      if (path === fromRoute.path && fromRoute.fullPath !== fromRoute.path) {
        this.$router.push(fromRoute.fullPath)
      } else {
        this.$router.push(this.pathCompile(path))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .app-breadcrumb.el-breadcrumb {
//   display: inline-block;
//   font-size: 14px;
//   line-height: 50px;
//   margin-left: 8px;

//   .no-redirect {
//     color: #97a8be;
//     cursor: text;
//   }
// }
</style>
