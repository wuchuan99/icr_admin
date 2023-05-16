import {
  ref
} from '@vue/composition-api'

export default function useRequest(requestFn, option = {}) {
  const pending = ref(false)
  const immediate = option.immediate || false
  const fetch = function() {
    pending.value = true
    return Promise.resolve(requestFn()).catch(err => {
      pending.value = false
      throw err
    }).finally(() => {
      pending.value = false
    })
  }

  if (immediate) {
    fetch()
  }
  return {
    pending,
    fetch
  }
}
