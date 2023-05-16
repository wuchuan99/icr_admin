import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function login(data) {
  return request({
    url: '/user_manage/account/login',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function getInfo(data) {
  return request({
    url: '/user_manage/account/info',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function logout(data) {
  return request({
    url: '/user_manage/account/logout',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function changepw(data) {
  return request({
    url: '/user_manage/account/changepw',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
