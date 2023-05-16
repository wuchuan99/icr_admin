import {
  ref,
  onMounted,
  getCurrentInstance
} from '@vue/composition-api'
import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'

export default function useTableSelection() {
  const selection = ref([])

  const SelectActions = Vue.extend({
    props: {
      tableInstance: {
        type: Object,
        default: () => {}
      }
    },
    methods: {
      deleteBatch() {
        let listComponent = this.tableInstance

        // find first parent component which has deleteBatch method
        do {
          listComponent = listComponent.$parent
          if (listComponent.deleteBatch) {
            listComponent.deleteBatch()
            break
          }

        // eslint-disable-next-line no-prototype-builtins
        } while (!listComponent.hasOwnProperty('deleteBatch') && listComponent !== listComponent.$parent)
      },
      toggleAllSelection() {
        const store = this.tableInstance.store
        if (store.states.data && store.states.data.length === 0) {
          return
        }

        this.tableInstance.toggleAllSelection()
      }
    },
    render: function(h) {
      const store = this.tableInstance.store
      const tableInstance = this.tableInstance
      let disabled = true
      if (store.states?.data?.length) {
        if (store.states?.selectable) {
          disabled = !store.states.data.some((row) => store.states.selectable(row))
        } else {
          disabled = false
        }
      }
      return (
        <div>
          <el-checkbox
            disabled={ disabled }
            indeterminate={ store.states.selection.length > 0 && !store.states.isAllSelected }
            onchange={ this.toggleAllSelection }
            value={ store.states.isAllSelected } />
          <el-button type='text' style='color: #fff; margin-left: 23px;'
            nativeOn-click={ tableInstance.toggleAllSelection }
            disabled={ disabled }
          >全选</el-button>
          <el-button type='text' style='color: #ff6067' disabled={ store.states.selection.length <= 0 } nativeOn-click={ this.deleteBatch }>删除</el-button>
        </div>
      )
    }
  })

  const appendSelectActionsComponent = function(parentEl, vm) {
    const mountNode = document.createElement('div')
    const mountNodeId = uuidv4().replaceAll('-', '')
    mountNode.id = mountNodeId
    parentEl.insertBefore(mountNode, parentEl.firstChild)
    new SelectActions({
      propsData: {
        tableInstance: vm.proxy.$refs.table.$table
      }
    }).$mount(`[id='${mountNodeId}']`)
  }

  onMounted(() => {
    const vm = getCurrentInstance()
    const tableRef = vm.refs.table
    if (!tableRef) {
      throw new Error('useTableSelection hook should has a table ref')
    }
    const instanceRef = tableRef.$table ? tableRef.$table : tableRef
    instanceRef.$on('selection-change', val => {
      selection.value = val
    })

    // append actions to pagination element
    const paginationEl = vm.proxy.$el?.querySelector('.pagination-container')
    if (paginationEl) {
      appendSelectActionsComponent(paginationEl, vm)
    }
  })

  return {
    selection
  }
}
