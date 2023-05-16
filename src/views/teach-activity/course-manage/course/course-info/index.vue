<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="search-buttons">
        <div class="search-buttons-left">
          <router-link :to="'/teach-activity/course-manage/course/create'">
            <el-button
              type="primary"
              size="medium"
              icon="iconfont icon-tianjia search_icon"
              class="search-buttons-item"
            >
              新增
            </el-button>
          </router-link>
          <!-- <el-button
            class="search-buttons-item"
            type="danger"
            size="medium"
            icon="iconfont icon-shanchu search_icon"
            :disabled="!selection.length"
            @click="deleteBatch"
          >
            刪除
          </el-button> -->
          <router-link :to="'/teach-activity/course-manage/course/direction'">
            <el-button class="search-buttons-item" size="medium">
              方向管理
            </el-button>
          </router-link>
        </div>
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-select
            v-model="query.direction"
            placeholder="课程方向"
            clearable
            class="filter-item"
            @change="getRecords()"
          >
            <el-option
              v-for="item in directionOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="query-conditions__item search">
          <el-select
            v-model="query.level"
            class="filter-item"
            placeholder="课程难度"
            clearable
            @change="getRecords()"
          >
            <el-option
              v-for="item in levelOption"
              :key="item.id"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入内容"
            @keyup.enter.native="getRecords()"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
          <!-- <el-button
            class="filter-item"
            icon="iconfont icon-sousuo search_icon"
            type="primary"
            size="medium"

          >
            搜索
          </el-button> -->
        </div>
      </div>
    </div>
    <icr-table
      ref="table"
      class="fixed_table"
      :data="records"
      :loading="loading"
      :columns="table.columns"
      :options="table.options"
    />
    <pagination
      :total.sync="total"
      :page.sync="page"
      :limit.sync="limit"
    />
    <icr-confirm-delete
      ref="confirmDelete"
      :title="title"
      desc="您即将删除课程，删除课程的同时会删除课程关联的课时，确定删除？"
    />
  </div>
</template>
<script>
import { reactive } from '@vue/composition-api'
import IcrTable from '@/components/table'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { coursePaging, directionList, courseDel } from '@/api/course'
import { levelOption } from '@/utils/tools'
import { usePagination, useTableSelection } from '@/hooks'
export default {
  name: 'CourseList',
  components: {
    Pagination,
    IcrTable,
    IcrConfirmDelete
  },
  setup() {
    const query = reactive({ direction: '', level: '', name: '' })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(coursePaging, query)
    }
  },
  data() {
    return {
      table: {
        columns: [
          {
            type: 'selection'
          },
          {
            prop: 'name',
            label: '名称'
          },
          {
            prop: 'direction',
            label: '方向'
          },
          {
            prop: 'level',
            label: '难度'
          },
          {
            prop: 'item_num',
            label: '课时数'
          },
          {
            prop: 'creator',
            label: '创建者'
          },
          {
            label: '操作',
            width: '250',
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i
                //       class='iconfont icon-bianji tables_icon'
                //       onclick={() => {
                //         this.handleEdit(scope.row.id)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='课时管理' placement='top'>
                //     <i
                //       class='iconfont icon-keshiguanli tables_icon'
                //       onclick={() => {
                //         this.handleMange(scope.row.id)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='删除' placement='top'>
                //     <i
                //       class='iconfont icon-shanchu tables_icon'
                //       onclick={() => {
                //         this.delete(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                // </div>
                <div>
                  <el-button type='text' onclick={() => { this.handleMange(scope.row.id) }}>编辑课时</el-button>
                  <el-button type='text' onclick={() => { this.handleEdit(scope.row.id) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ],
        options: {
          stripe: true
        }
      },
      directionOption: [],
      levelOption,
      title: '删除课程'
    }
  },
  computed: {
    $table() {
      return this.$refs.table
    }
  },
  mounted() {
    this.getRecords()
    this.getDirectionList()
  },
  methods: {
    getDirectionList() {
      directionList().then((res) => {
        const { data } = res
        this.directionOption = data.data
      })
    },
    handleEdit(id) {
      this.$router.push({
        path: `/teach-activity/course-manage/course/edit`,
        query: {
          id: id
        }
      })
    },
    handleMange(id) {
      this.$router.push({
        path: `/teach-activity/course-manage/course/classMange`,
        query: {
          course_id: id
        }
      })
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
      this.$refs.confirmDelete.prompt().then(() => {
        courseDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
