import {
  getToken
} from '@/utils/auth'

/**
 * @description: 筛选参数 去除''的可选参数
 * @param params 需要筛选的参数数组或对象
 * @return 筛选后的参数数组或对象
 */
export function filterParams(params) {
  const fParams = {}
  for (var k in params) {
    if (params.hasOwnProperty(k)) {
      if (typeof params[k] === 'object') {
        fParams[k] = filterParams(params[k])
      } else {
        if (params[k] || params[k] === 0) {
          fParams[k] = params[k]
        }
      }
    }
  }
  return fParams
}

/**
 * @description: 难度字典，暂时默认
 */
export const levelOption = [{
  id: 0,
  value: '初级'
}, {
  id: 1,
  value: '中级'
}, {
  id: 2,
  value: '高级'
}]

/**
 * 文件路径
 */
export const splitUrl = function(url) {
  return '/resource/' + url
}

/**
 * @description:获取VNCWebsocket链接
 * @param:VMKey
 * @return:返回转义后VNCWebsocket链接
 */
const VNCWEBSOCKET_PATH = '/ws/drill/'
export function getVNCWebSocketUrl(params) {
  const l = window.location
  const url = encodeURIComponent((l.protocol === 'https' ? 'wss://' : 'ws://') + l.hostname + ':' + l.port + VNCWEBSOCKET_PATH + '?authorization=' + getToken() + '&remote_key=' + params.remote_key + '&instance_id=' + params.instance_id)
  return url
}
