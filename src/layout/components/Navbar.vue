<template>
  <div class="navbar">
    <!-- <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    /> -->

    <div class="right-menu">
      <div class="time">
        <!-- <i class="el-icon-timer" style="font-size:19px;" /> -->
        <span style="display: inline-block; width: 150px; text-align: left; margin-left: 10px;"> {{ currentTime }} </span>
      </div>

      <el-dropdown trigger="click">
        <div class="user-state">
          <div class="avatar-wrapper">
            <img :src="ResourcePrefix + user.avatar" class="user-avatar">
          </div>

          <!-- <div class="user-info">
            <span class="name">{{ username }}</span>
            <span class="role"> 管理员 </span>
          </div> -->

          <!-- <i class="el-icon-caret-bottom" /> -->
        </div>

        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- <router-link to="/">
            <el-dropdown-item> 首页 </el-dropdown-item>
          </router-link> -->
          <div class="user-box">
            <img :src="ResourcePrefix + user.avatar" class="user-avatar">
            <div class="user-info">
              <span class="name">{{ user.username }}</span>
              <span class="role"> {{ user.role }} </span>
            </div>
          </div>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters, createNamespacedHelpers } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'
import dayjs from 'dayjs'
import { ResourcePrefix } from '@/const/common'
import { getUserInfo } from '@/utils/auth'

// const { mapState } = createNamespacedHelpers('user')

export default {
  // components: {
  //   Breadcrumb,
  //   Hamburger
  // },
  data() {
    return {
      currentTime: '',
      ResourcePrefix
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar']),
    // ...mapState({
    //   username: (state) => state.name,
    //   user: state => state
    // })
    user() {
      return getUserInfo()
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }, 1000)
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      // clean all tagsView incase next login user has no permission for previous open tagsView
      this.$store.dispatch('tagsView/delAllViews')
      // remove redirect path for same reason as above
      this.$router.push(`/login`)
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      // 便于ws重连
      window.location.reload()
    }
  }
}
</script>
