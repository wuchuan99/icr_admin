/*  下载文件，param:url：下载地址   data：参数
 * @returns {PromiseLike<T | never> | Promise<T | never>}
 */
// export function downloadFile(url, data) {
//   return request({
//     url: url,
//     method: 'get',
//     params: data,
//     responseType: 'blob',
//     timeout: 1000 * 60 * 10
//   })
//     .then((res) => { // 处理返回的文件流
//       const blob = res.data
//       const a = document.createElement('a')
//       a.style.display = 'none'
//       const disposition = res.headers['content-disposition']
//       try {
//         const name = disposition.split(';')[1].split('=')
//         a.download = decodeURI(name[1])
//       } catch (err) {
//         console.warn('暂无文件名.请通知开发人员命名该文件')
//       }
//       try {
//         a.href = window.URL.createObjectURL(blob)
//       } catch (err) {
//         console.warn('暂无文件信息.请通知开发人员导入文件模版')
//       }
//       a.click()
//       a.remove()
//       window.setTimeout(function() {
//         window.URL.revokeObjectURL(blob)
//       }, 0)
//     })
// }
export function downloadFilePost(url, data) {
  return request({
    url: url,
    method: 'post',
    data: data,
    responseType: 'blob',
    timeout: 1000 * 60 * 10
  })
    .then((res) => { // 处理返回的文件流
      const blob = res.data
      const a = document.createElement('a')
      a.style.display = 'none'
      const disposition = res.headers['content-disposition']
      try {
        const name = disposition.split(';')[1].split('=')
        a.download = decodeURI(name[1])
      } catch (err) {
        console.warn('暂无文件名.请通知开发人员命名该文件')
      }
      try {
        a.href = window.URL.createObjectURL(blob)
      } catch (err) {
        console.warn('暂无文件信息.请通知开发人员导入文件模版')
      }
      a.click()
      a.remove()
      window.setTimeout(function() {
        window.URL.revokeObjectURL(blob)
      }, 0)
    })
}
// 自命名文件下载
export function downloadNoName(url, name) {
  return request({
    url: url,
    method: 'get',
    responseType: 'blob',
    timeout: 1000 * 60 * 10
  })
    .then((res) => { // 处理返回的文件流
      const blob = res.data
      const a = document.createElement('a')
      a.style.display = 'none'
      a.download = name
      try {
        a.href = window.URL.createObjectURL(blob)
      } catch (err) {
        console.warn('暂无文件信息.请通知开发人员导入文件模版')
      }
      a.click()
      a.remove()
      window.setTimeout(function() {
        window.URL.revokeObjectURL(blob)
      }, 0)
    })
}
// 判断附件是否符合格式
export const vaildAudio = (fileName) => {
  const audioSuffix = ['.et', '.ett', '.xls', '.xlt', '.xlsx', '.wps', '.wpt', '.doc', '.dot', '.docx'] // 格式
  const fileLen = fileName.length
  var reg = fileName.indexOf('.')
  if (reg != '-1') {
    return audioSuffix.some((val) => {
      const suffixLen = val.length
      const indexVal = fileName.toLowerCase().lastIndexOf(val)
      return fileLen - suffixLen === indexVal && indexVal !== -1
    })
  } else {
    return true
  }
}

// 判断附件是否有后缀名
export const vaildAudioSuffix = (fileName) => {
  var reg = fileName.indexOf('.')
  if (reg == '-1') {
    return true
  }
}

// 根据url路径下载文件
export const downloadFile = (url, fileName) => {
  const x = new XMLHttpRequest()
  x.open('GET', url, true)
  x.responseType = 'blob'
  x.onload = function(e) {
    var url = window.URL.createObjectURL(x.response)
    var a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setTimeout(() => {
      a.remove()
      window.URL.revokeObjectURL(a.href)
    }, 0)
  }
  x.send()
}
