import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function drillPaging(data) {
  return request({
    url: '/drill/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillAdd(data) {
  return request({
    url: '/drill/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillUpdate(data) {
  return request({
    url: '/drill/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillDel(data) {
  return request({
    url: '/drill/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillRetrieve(data) {
  return request({
    url: '/drill/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskPaging(data) {
  return request({
    url: '/drill/task/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskAdd(data) {
  return request({
    url: '/drill/task/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskDelete(data) {
  return request({
    url: '/drill/task/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillPositionAdd(data) {
  return request({
    url: '/drill/position/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillPositionRetrieve(data) {
  return request({
    url: '/drill/position/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillPositionDelete(data) {
  return request({
    url: '/drill/position/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillUserAdd(data) {
  return request({
    url: '/drill/user/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillUserDelete(data) {
  return request({
    url: '/drill/user/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillUserPaging(data) {
  return request({
    url: '/drill/user/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillOrgAdd(data) {
  return request({
    url: '/drill/org/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillOrgDelete(data) {
  return request({
    url: '/drill/org/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillOrgUpdate(data) {
  return request({
    url: '/drill/org/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillOrgPaging(data) {
  return request({
    url: '/drill/org/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskLogCount(data) {
  return request({
    url: '/drill/task/log/count',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskLogPaging(data) {
  return request({
    url: '/drill/task/log/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskLogHistory(data) {
  return request({
    url: '/drill/task/log/history',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillTaskLogUpdate(data) {
  return request({
    url: '/drill/task/log/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFoulAdd(data) {
  return request({
    url: '/drill/foul/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFoulDelete(data) {
  return request({
    url: '/drill/foul/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFoulPaging(data) {
  return request({
    url: '/drill/foul/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFoulUpdate(data) {
  return request({
    url: '/drill/foul/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFruitRetrieve(data) {
  return request({
    url: '/drill/task/fruit/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFruitPublish(data) {
  return request({
    url: '/drill/task/fruit/publish',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function drillFruitExport(data) {
  return request({
    url: '/drill/task/fruit/export',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'blob'
  })
}

export function drillFruitAnalyse(data) {
  return request({
    url: '/drill/task/fruit/analyse',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function vlogPaging(data) {
  return request({
    url: '/common/vlog/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function vlogList(data) {
  return request({
    url: '/common/vlog/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function vlogRetrieve(data) {
  return request({
    url: '/common/vlog/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function monitorRemote(data) {
  return request({
    url: '/common/vlog/monitorremote',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
