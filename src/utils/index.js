import dayjs from 'dayjs'
/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

export function mapToSelectionOptions(m) {
  return Array.from(m).map((v) => {
    return { label: v[1], value: v[0] }
  })
}

export function normalizeTime(time) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

export function genMac() {
  return 'XX:XX:XX:XX:XX:XX'.replace(/X/g, function() {
    return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16))
  })
}

export function genUnicastMac() {
  const randomMac = 'XX:XX:XX:XX:XX:XX'.replace(/X/g, function() {
    return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16))
  })
  return randomMac.substring(0, 1) + '02468ACE'.charAt(Math.floor(Math.random() * 8)) + randomMac.substring(2)
}

export function downloadResouce(filePath) {
  const prefix = '/resource'
  const path = `${prefix}/${filePath}`
  location.assign(path)
}

/**
* [isEqualIPAddress 判断两个IP地址是否在同一个网段]
* @param {[String]} w [默认网关 or ip地址]
* @param {[String]} y [子网掩码]
* @param {[String]} i [ip地址]
* @return {Boolean} [true or false]
*/
export function checkIp(w, y, i) {
  const to8Bit = (number) => {
    let result = parseInt(number).toString(2)
    while (result.length < 8) {
      result = '0' + result
    }
    return result
  }
  const ws = w.split('.')
  const ys = y.split('.')
  const is = i.split('.')
  for (const index in ws) {
    const cw = to8Bit(ws[index])
    const cy = to8Bit(ys[index])
    const ci = to8Bit(is[index])
    for (let jndex = 0; jndex < 8; jndex++) {
      if (cy[jndex] === '1') {
        if (cw[jndex] !== ci[jndex]) return false
      }
    }
  }
  return true
}

export function disposalRange(data, prop, index, min, max) {
  const IntegerRegex = /^[1-9]*[1-9][0-9]*$/
  let ref = null
  if (index || index === 0) {
    ref = this.$refs[prop][index]
  } else {
    ref = this.$refs[prop]
  }
  const key = ref['displayValue']
  if (key) {
    if (key === '0') {
      if (min || min === 0) {
        ref['userInput'] = min + ''
        data[prop] = min
      } else {
        data[prop] = 0
      }
    } else {
      if (IntegerRegex.test(key)) {
        if (min || min === 0) {
          if (parseInt(key) < min) {
            ref['userInput'] = key
          } else {
            if (max) {
              if (parseInt(key) < max) {
                ref['userInput'] = key
                data[prop] = parseInt(key)
              } else {
                ref['userInput'] = max + ''
                data[prop] = max
              }
            }
          }
        } else {
          data[prop] = parseInt(key)
        }
      } else {
        ref['userInput'] = null
        // if (min) {
        //   ref['userInput'] = min + ''
        //   data[prop] = min
        // } else {
        //   ref['userInput'] = null
        // }
      }
    }
  } else {
    data[prop] = undefined
  }
}

export function matchMask(mask, ip) {
  let sub_net = []
  const ip_explode = ip.split('.')
  const mask_explode = mask.split('.')
  for (var i = 0, num = ip_explode.length; i < num; i++) {
    const c = parseInt(ip_explode[i]) & parseInt(mask_explode[i])
    sub_net.push(c)
  }
  sub_net = sub_net.join('.')
  return sub_net === ip
}
