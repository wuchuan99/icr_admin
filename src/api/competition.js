import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function competitionPaging(data) {
  return request({
    url: '/competition/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionAdd(data) {
  return request({
    url: '/competition/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionUpdate(data) {
  return request({
    url: '/competition/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionDel(data) {
  return request({
    url: '/competition/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionRetrieve(data) {
  return request({
    url: '/competition/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionEnable(data) {
  return request({
    url: '/competition/enable',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionList(data) {
  return request({
    url: '/competition/question/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionAdd(data) {
  return request({
    url: '/competition/question/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionDel(data) {
  return request({
    url: '/competition/question/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionUpdate(data) {
  return request({
    url: '/competition/question/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionTaskAdd(data) {
  return request({
    url: '/competition/question/task/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionTaskDelete(data) {
  return request({
    url: '/competition/question/task/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionTaskExpose(data) {
  return request({
    url: '/competition/question/task/exposed',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionQuestionTaskExposedinfo(data) {
  return request({
    url: '/competition/question/task/exposedinfo',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberList(data) {
  return request({
    url: '/competition/member/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberAdd(data) {
  return request({
    url: '/competition/member/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberDel(data) {
  return request({
    url: '/competition/member/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberGroup(data) {
  return request({
    url: '/competition/member/org/singlegroup',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberOrgAdd(data) {
  return request({
    url: '/competition/member/org/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberOrgDel(data) {
  return request({
    url: '/competition/member/org/del',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionMemberOrgGroup(data) {
  return request({
    url: '/competition/member/org/group',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationList(data) {
  return request({
    url: '/competition/violation/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationAdd(data) {
  return request({
    url: '/competition/violation/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationUpdate(data) {
  return request({
    url: '/competition/violation/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationDel(data) {
  return request({
    url: '/competition/violation/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationSimilarity(data) {
  return request({
    url: '/competition/violation/similarity',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationDiff(data) {
  return request({
    url: '/competition/violation/diff',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionViolationStudent(data) {
  return request({
    url: '/competition/violation/student',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationUserList(data) {
  return request({
    url: '/competition/operation/userlist',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationView(data) {
  return request({
    url: '/competition/operation/view',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationRecordList(data) {
  return request({
    url: '/competition/operation/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationAnalysis(data) {
  return request({
    url: '/competition/operation/analysis',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationMakingPaper(data) {
  return request({
    url: '/competition/operation/makingpaper',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationScoreOrder(data) {
  return request({
    url: '/competition/operation/scoreorder',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationPublishScore(data) {
  return request({
    url: '/competition/operation/publishscore',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationExportOrder(data) {
  return request({
    url: '/competition/operation/exportorder',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'blob'
  })
}

export function competitionOperationMonitor(data) {
  return request({
    url: '/competition/operation/monitor',
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

export function competitionOperationPublishstatus(data) {
  return request({
    url: '/competition/operation/publishstatus',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function competitionOperationSubmitlog(data) {
  return request({
    url: '/competition/operation/submitlog',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
