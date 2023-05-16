import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function sysLogsPaging(data) {
  return request({
    url: '/sys_operations/sys_logs/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
