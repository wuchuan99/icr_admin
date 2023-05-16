import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function controlResourcePaging(data) {
  return request({
    url: '/pool_manage/control_resource/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function controlResourceRetrieve(data) {
  return request({
    url: '/pool_manage/control_resource/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function controlResourceUpdate(data) {
  return request({
    url: '/pool_manage/control_resource/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function controlResourceAdd(data) {
  return request({
    url: '/pool_manage/control_resource/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function controlPortPaging(data) {
  return request({
    url: '/pool_manage/control_resource/portpaging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function controlResourceDelete(data) {
  return request({
    url: '/pool_manage/control_resource/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
