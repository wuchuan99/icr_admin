import request from '@/utils/request'
import { withFlag } from './index'

const FLAG = 'stream'

export function getQuestionTemplate(data) {
  return request({
    url: '/question_manage/question/exportquestiontemplate',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'arraybuffer'
  })
}
