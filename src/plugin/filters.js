import * as dayjs from 'dayjs'

export function dateFormat(val) {
  return dayjs(val).format('YYYY/MM/DD A h:mm:ss')
}
