import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function getlist(data) {
  return request({
    url: '/user_manage/org/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function addorg(data) {
  return request({
    url: '/user_manage/org/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function updateorg(data) {
  return request({
    url: '/user_manage/org/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function deleteorg(data) {
  return request({
    url: '/user_manage/org/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function searchorg(data) {
  return request({
    url: '/user_manage/org/match',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// rewrite code
export function orgPaging(data) {
  return request({
    url: '/user_manage/org/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function orgAdd(data) {
  return request({
    url: '/user_manage/org/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function orgUpdate(data) {
  return request({
    url: '/user_manage/org/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function orgDel(data) {
  return request({
    url: '/user_manage/org/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
