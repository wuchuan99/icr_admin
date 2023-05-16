import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function roleAdd(data) {
  return request({
    url: '/user_manage/role/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function roleDel(data) {
  return request({
    url: '/user_manage/role/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function roleUpdate(data) {
  return request({
    url: '/user_manage/role/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function rolePaging(data) {
  return request({
    url: '/user_manage/role/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function roleRetrieve(data) {
  return request({
    url: '/user_manage/role/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function statusSwitch(data) {
  return request({
    url: '/user_manage/role/statusswitch',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function resources(data) {
  return request({
    url: '/user_manage/role/resources',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function roleaction(data) {
  return request({
    url: '/user_manage/role/roleaction',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

