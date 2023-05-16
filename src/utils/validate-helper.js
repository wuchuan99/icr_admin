import ipRegex from 'ip-regex'

export function required(fieldName = '', option = {}) {
  const defaultOpt = {
    required: true,
    message: `${fieldName}不能为空`,
    trigger: ['blur', 'change']
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isIpv4(fieldName = '', option = {}) {
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        if (ipRegex.v4({ exact: true }).test(value)) {
          if (option?.filterBroadcast) {
            const last = value.split('.')[3]
            if (['0', '255'].includes(last)) {
              cb(new Error(`IP地址的0和255不可用`))
            } else {
              cb()
            }
          } else {
            cb()
          }
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isMask(fieldName = '', option = {}) {
  const maskRegex = /^((254|252|248|240|224|192|128|0)\.0\.0\.0$)|(255\.(254|252|248|240|224|192|128|0)\.0\.0$)|(255\.255\.(254|252|248|240|224|192|128|0)\.0$)|(255\.255\.255\.(255|254|252|248|240|224|192|128|0))$/
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        if (maskRegex.test(value)) {
          cb()
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isInteger(fieldName = '', option = {}) {
  const IntegerRegex = /^[1-9]*[1-9][0-9]*$/
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        if (IntegerRegex.test(value)) {
          const max = option?.max
          if (max && value > max) {
            cb(new Error(`${fieldName}取值应在1~${max}之间`))
          } else {
            cb()
          }
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isDomainName(fieldName = '', option = {}) {
  const domainNameRegex = /^(([0-9]{1})|([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][-_.a-zA-Z0-9]{0,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,13}|[a-zA-Z0-9-]{2,30}.[a-zA-Z]{2,3})$/
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        if (domainNameRegex.test(value)) {
          cb()
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isMac(fieldName = '', option = {}) {
  const macRegex = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        if (macRegex.test(value)) {
          cb()
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}

export function isIpv4AndMask(fieldName = '', option = {}) {
  const defaultOpt = {
    trigger: ['blur', 'change'],
    validator: (rule, value, cb) => {
      if (value) {
        const regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/(\d|[1-2]\d|3[0-2]))?$/
        if (regex.test(value)) {
          if (ipRegex.v4({ exact: true }).test(value)) {
            cb()
          } else {
            if (['8', '16', '24'].includes(value.split('/')[1])) {
              cb()
            } else {
              cb(new Error('子网掩码目前支持:[8, 16, 24]'))
            }
          }
        } else {
          cb(new Error(`${fieldName}不正确`))
        }
      } else {
        option.required ? cb(new Error(`${fieldName}不能为空`)) : cb()
      }
    }
  }

  return {
    ...defaultOpt,
    ...option
  }
}
