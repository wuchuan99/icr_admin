import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

// iconfont
import '@/assets/css/iconfont.css'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

// element-tiptap
import { ElementTiptapPlugin } from 'element-tiptap'
// element-tiptap样式
import 'element-tiptap/lib/index.css'

import '@/styles/index.scss' // global css
// import  '@/styles/themes/dark/index.scss'
import '@/styles/themes/black/index.scss'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// import Avue from '@smallwei/avue'
// import '@smallwei/avue/lib/index.css'

import * as dayjs from 'dayjs' // date
import 'dayjs/locale/zh-cn' // import locale
dayjs.locale('zh-cn') // use locale

import * as filters from './plugin/filters'
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]) // 插入过滤器名和对应方法
})

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
Vue.use(VueCompositionAPI)
// Vue.use(Avue)
Vue.use(ElementTiptapPlugin, {
  /* 插件配置项 */
  lang: 'zh'
})
Vue.config.productionTip = false

// Element config
try {
  // disable close on clock modal or press esc
  ElementUI.Dialog.props.closeOnClickModal.default = false
  ElementUI.Dialog.props.closeOnPressEscape.default = false

  // message has close button
  const messageFn = ElementUI.Message
  const messageWrapperFn = (options) => {
    messageFn({ showClose: true, ...options })
  }
  Object.assign(messageWrapperFn, messageFn)
  ElementUI.Message = messageWrapperFn
  Vue.prototype.$message = messageWrapperFn
} catch (error) {
  console.error(error)
}

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
