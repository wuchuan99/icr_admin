<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="search-buttons">
        <div class="search-buttons-left">
          <router-link :to="'/user/role/add'">
            <el-button class="search-buttons-item" icon="iconfont icon-tianjia search_icon" size="medium" type="primary"> 新增 </el-button>
          </router-link>
        </div>
        <!-- <div class="search">
          <el-button class="filter-item" icon="el-icon-search" type="primary">
            搜索
          </el-button>
        </div> -->
      </div>
    </div>
    <icr-table
      ref="table"
      class="fixed_table"
      :data="records"
      :columns="table.columns"
      :options="tableOptions"
    />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />

    <icr-confirm-delete
      ref="confirmDelete"
      :show-input="true"
      title="删除角色"
      desc="您即将删除角色, 删除后所有与角色关键的用户将失去功能权限, 确认删除请输入<b>DELETE</b>"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { statusSwitch, roleDel, rolePaging } from '@/api/role'
import { usePagination, useTableSelection } from '@/hooks/'
import { normalizeTime } from '@/utils'

export default {
  components: {
    Pagination,
    IcrTable,
    IcrConfirmDelete
  },
  setup() {
    const { selection } = useTableSelection()
    return {
      selection,
      ...usePagination(rolePaging)
    }
  },
  data() {
    return {
      showDialog: false,
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          { type: 'selection' },
          // {
          //   prop: 'id',
          //   label: 'ID'
          // },
          {
            prop: 'name',
            label: '名称'
          },
          {
            prop: 'desc',
            label: '描述'
          },

          // {
          //   prop: 'apis',
          //   label: '权限'
          // },
          { label: '创建时间', render: (scope) => {
            return (<div>{ normalizeTime(scope.row.create_time) }</div>)
          } },
          { label: '修改时间', render: (scope) => {
            return (<div>{ normalizeTime(scope.row.update_time) }</div>)
          } },
          {
            label: '状态',
            render: (scope) => {
              return (<div>
                <el-switch
                  value={ scope.row.status }
                  oninput={ (val) => {
                    this.toggleStatus(scope).then(() => {
                      scope.row.status = val
                    })
                  }}
                  active-value={1} inactive-value={0}
                  disabled={ scope.row.id === 1 }
                />
              </div>)
            }
          },
          {
            label: '操作',
            minWidth: '80px',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='停用' placement='top'>
                //     <i
                //       class={status ? 'el-icon-circle-check' : 'el-icon-circle-close'}
                //       style={status ? { 'color': '#22AB59' } : { 'color': 'red' }}
                //       onclick={() => {
                //         this.toggleStatus(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i
                //       class='el-icon-edit'
                //       onclick={() => {
                //         this.goEdit(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='删除' placement='top'>
                //     <i
                //       class='el-icon-delete'
                //       onclick={() => {
                //         this.delete(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                // </div>
                <div>
                  { scope.row.id !== 1 && <el-button type='text' onclick={() => { this.goEdit(scope) }}>编辑</el-button> }
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    toggleStatus(scope) {
      const oldStatus = scope.row.status
      return statusSwitch({
        data: {
          type: 1,
          ids: [scope.row.id],
          status: oldStatus ? 0 : 1
        }
      })
    },
    goEdit(scope) {
      this.$router.push({ name: 'RoleEdit', params: { id: scope.row.id }})
      console.log(scope.row)
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then((res) => {
        roleDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    search() {
      this.getRecords()
    }
  }
}
</script>
