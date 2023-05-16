import axios from 'axios'
import {
  Message
} from 'element-ui'
import store from '@/store'
import {
  getToken,
  removeToken
} from '@/utils/auth'
import xss from 'xss'
import { BasePath } from '@/router'

const AuthHeader = 'Authorization'

const toastMessage = {
  'add': '新增成功',
  'update': '更新成功',
  'delete': '删除成功'
}
// 'add', 'update', 'delete' showToast
function successToast(res) {
  const toastList = ['add', 'update', 'delete']
  const pathArray = res.config.url.split('/')
  const intersection = toastList.filter(item => pathArray.indexOf(item) !== -1)
  if (intersection.length) {
    if (res.data.status === 0) {
      if (pathArray.includes('network_element')) { // 拓扑图禁止弹窗提示
        return
      }

      // some delete need to handled in component
      if (intersection[0] === 'delete' &&
        res.data?.data?.data?.code &&
        res.data?.data?.data?.code !== 0) return

      Message({
        message: toastMessage[intersection[0]],
        type: 'success',
        duration: 3 * 1000
      })
    }
  }
}
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers[AuthHeader] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response
    if (res.data.status === 0) {
      successToast(res)
    }

    // auth error
    const AuthInvalidStatusCodes = [-30007, -30008, -30009, -60001, -50002]
    if (AuthInvalidStatusCodes.indexOf(res.data.status) >= 0 &&
    // not not rejump
     location.pathname.indexOf('login') < 0
    ) {
      removeToken()
      location.href = `${BasePath}login`
      return
    }

    // license error
    const LicenseInvalidStatusCodes = [-50001]
    if (LicenseInvalidStatusCodes.indexOf(res.data.status) >= 0 &&
    // not not rejump
    location.pathname.indexOf('login') < 0
    ) {
      setTimeout(() => {
        removeToken()
        location.href = `${BasePath}login`
      }, 1500)
    }

    return res
  }

)
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response
    const data = res.data

    // export error
    if (res.config?.responseType === 'blob' && res.headers['content-type'].includes('application/json')) {
      const reader = new FileReader()
      reader.onload = () => {
        const { result } = reader
        const errorInfos = JSON.parse(result)
        const { status, msg } = errorInfos
        if (status !== 0) {
          Message({
            message: ` ${msg} `,
            type: 'error',
            duration: 5 * 1000
          })
        }
      }
      reader.onerror = (err) => {
        console.log(err)
      }
      reader.readAsText(data)
      return Promise.reject(new Error('Error'))
    }

    // pass application/octet-stream response
    if (res.headers['content-type'] && res.headers['content-type'].toLowerCase().indexOf('application/octet-stream') >= 0) {
      return res
    }

    // if the custom code is not 20000, it is judged as an error.
    if (data.status !== 0) {
      Message({
        message: ` ${data.msg} ` || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      //   // to re-login
      //   MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
      //     confirmButtonText: 'Re-Login',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning'
      //   }).then(() => {
      //     store.dispatch('user/resetToken').then(() => {
      //       location.reload()
      //     })
      //   })
      // }
      return Promise.reject(data)
      // return Promise.reject(new Error(` ${data.msg} `))
    }

    // 判断是否是文件格式，如果是文件，则不进行xss过滤
    if (res.headers['content-type'] && res.headers['content-type'].indexOf('application/octet-stream') >= 0) {
      return res
    }
    // 否则进行xss处理
    return JSON.parse(xss(JSON.stringify(data), {
      whiteList: [], // 白名单为空，表示过滤所有标签
      stripIgnoreTag: false, // 过滤所有非白名单标签的HTML
      stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
    }))
  },
  error => {
    console.log('err' + error) // for debug
    let msg = ''
    if (error.code === 'ECONNABORTED') {
      msg = '网络超时'
    }

    Message({
      message: msg || error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
