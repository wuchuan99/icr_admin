import {
  ref,
  watch
} from '@vue/composition-api'

function removeEmpty(obj) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') return obj
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => !(v === '' || v == null || v === undefined))
      .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
  )
}

export default function usePagination(fetchListFn, query = {}, option = { removeEmpty: true }) {
  const records = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)

  const getRecords = () => {
    const queryParams = option.removeEmpty ? removeEmpty(query) : query

    const params = Object.assign({
      page_info: {
        page_num: page.value,
        page_size: limit.value
      }
    }, {
      search_info: queryParams
    })

    return new Promise((resolve, reject) => {
      loading.value = true
      fetchListFn(params).then(res => {
        if (res.data) {
          total.value = res.data.total
          records.value = res.data.data
        }
        resolve(res)
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        loading.value = false
      })
    })
  }

  watch(page, () => getRecords())
  watch(limit, () => {
    // #ICR-26 cancel invalid reuqest
    const offset = (page.value - 1) * limit.value
    if (total.value !== 0 && total.value <= offset) {
      return
    }
    getRecords()
  })

  return {
    loading,
    records,
    total,
    page,
    limit,
    getRecords
  }
}
