<template>
  <div class="app-container">
    <div class="chapterList">
      <div class="chapterList-title">
        <el-button type="text" title="新增章节" class="opacity06 chapter_iconfont" icon="iconfont icon-zengjia" :disabled="!tableDrag" @click="initModel(), (showDialog = true), (isEdit = false)" />
      </div>
      <div class="chapterList-content">
        <ul
          id="left"
          v-loading="chapterLoading"
          element-loading-text="加载中..."
          element-loading-background="rgba(50, 52, 54, .8)"
        >
          <li
            :key="0"
            :class="{'active': search_info.chapter_id === 0, 'no_drop': tableDrag === false}"
            @click="() => handleClick(0)"
          >
            <span>全部</span>
          </li>
          <li
            v-for="item in chapterList"
            :key="item.id"
            :class="{'active': item.id == search_info.chapter_id, 'no_drop': tableDrag === false}"
            @click="() => handleClick(item.id)"
          >
            <div class="item-name text_ellipsis">
              <span style="margin-right:5px;">{{ item.chapter_order }}</span>
              <span :title="item.name">{{ item.name }}</span>
            </div>
            <div v-show="search_info.chapter_id !== 0 && search_info.chapter_id === item.id" class="item-button">
              <el-button :disabled="!tableDrag" type="text" class="opacity06 chapter_iconfont" icon="iconfont icon-bianji" @click="(e) => edit(item,e)" />
              <el-popconfirm title="您即将删除该章节，确认删除?" @confirm="() =>chapterDel(item)" @cancel="()=>{}">
                <el-button slot="reference" :disabled="!tableDrag" type="text" class="opacity06 chapter_iconfont" icon="iconfont icon-shanchu" />
              </el-popconfirm>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="classList">
      <div class="operation-box">
        <div class="operation">
          <el-button type="primary" class="filter-item" :disabled="!tableDrag" @click="createClass">新增课时</el-button>
          <!-- <el-button type="danger" class="filter-item" :disabled="!selection.length || !tableDrag" @click="deleteBatch">刪除课时</el-button> -->
          <transition name="slide-fade">
            <el-button v-show="search_info.chapter_id !== 0" class="filter-item" @click="tableDrag ? editSort() : saveSort()">
              <span v-if="tableDrag">编辑</span>
              <span v-else>保存</span>排序
            </el-button>
          </transition>
        </div>
      </div>
      <icr-table ref="table" class="fixed_table" row-key="id" :loading="loading" :columns="table.columns" :options="tableOptions" :data="tableData" />
      <div class="pagination-container" style="display: flex; justify-content: space-between;">
        <pagination
          v-if="search_info.chapter_id === 0"
          :total="total"
          :page.sync="page_info.page_num"
          :limit.sync="page_info.page_size"
          style="padding: 0 !important; height: 36px;"
          @pagination="getAllList"
        />
      </div>
    </div>
    <icr-confirm-delete
      ref="confirmDelete"
      :title="title"
      desc="您即将删除课时，确认删除？"
    />
    <!-- 新增/编辑章节 -->
    <el-dialog
      :visible.sync="showDialog"
      width="600px"
      :title="(isEdit ? '编辑' : '新增') + '章节'"
    >
      <icr-form
        :model="model"
        :rules="rules"
        :fields="modelFormFields"
        @cancel="showDialog = false"
        @confirm="submit"
        @submit.native.prevent
      />
    </el-dialog>
  </div>
</template>
<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { cloneDeep } from 'lodash-es'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { All_ItemPaging, itemPaging, itemDel, chapterPaging, chapterDelete, chapterAdd, chapterUpdate, itemSorting } from '@/api/course'
import { filterParams } from '@/utils/tools'
import { required } from '@/utils/validate-helper'
import Sortable from 'sortablejs'
import { useTableSelection } from '@/hooks'

export default {
  name: 'ClassList',
  components: { Pagination, IcrConfirmDelete, IcrForm, IcrTable },
  filters: { // 暂弃
    contentFrm: function(val) {
      const classContent = []
      const content = JSON.parse(val.replaceAll("'", '"'))
      const m = new Map([
        ['attachment', '附件'],
        ['video', '视频'],
        ['manual', '手册'],
        ['env', '环境'],
        ['handout', '讲义']
      ])
      m.forEach((item, k) => {
        if (content.hasOwnProperty(k) && content[k]) {
          classContent.push(m.get(k))
        }
      })
      return classContent.join('|')
    },
    addMinute: function(val) {
      return val + '分钟'
    }
  },
  setup() {
    const { selection } = useTableSelection()
    return {
      selection
    }
  },
  data() {
    return {
      course_id: null,
      loading: true,
      chapterLoading: true,
      search_info: {
        // condition: '',
        chapter_id: 0 // 章节
      },
      total: 0,
      page_info: {
        page_num: 1,
        page_size: 10
      },
      tableData: [],
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          { type: 'selection' },
          {
            label: '章节',
            render: (scope) => {
              return <div class='text_ellipsis'>{(scope.row?.chapter_order || '') + scope.row?.chapter + scope.row?.item_order}</div>
            }
          },
          { prop: 'name', label: '名称' },
          { prop: 'course', label: '课程' },
          { prop: 'classify', label: '类型' },
          { prop: 'content',
            label: '课件内容',
            render: (scope) => {
              return (
                <div class='text_ellipsis' >{ this.contentFrm(scope.row.content) }</div>
              )
            }
          },
          { prop: 'level', label: '难度' },
          { prop: 'duration', label: '学习时长',
            render: (scope) => {
              return (
                <div class='text_ellipsis' >{ this.addMinute(scope.row.duration) }</div>
              )
            }
          },
          {
            label: '操作',
            width: '250',
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.handleEdit(scope.row.id) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      },
      title: '删除课时',
      chapterList: [],
      showDialog: false,
      modelFormFields: [
        {
          label: '章节名称',
          type: 'input',
          prop: 'name'
        }
      ],
      model: {
        name: ''
      },
      rules: {
        name: [
          required('章节名称'),
          { min: 0, max: 32, message: '长度在32个字符以内', trigger: 'blur' }
        ]
      },
      isEdit: false, // 新增编辑
      sortable: null,
      oldList: [],
      newList: [],
      tableDrag: true
    }
  },
  created() {
    this.course_id = this.$route.query?.course_id
    this.getList()
    this.getChapterList()
    // this.initModel()
  },
  methods: {
    addMinute: function(val) {
      return val + '分钟'
    },
    contentFrm(val) {
      const classContent = []
      const content = JSON.parse(val.replaceAll("'", '"'))
      const m = new Map([
        ['attachment', '附件'],
        ['video', '视频'],
        ['manual', '手册'],
        ['env', '环境'],
        ['handout', '讲义']
      ])
      m.forEach((item, k) => {
        if (content.hasOwnProperty(k) && content[k]) {
          classContent.push(m.get(k))
        }
      })
      return classContent.join('、')
    },
    createClass() {
      this.$router.push({
        path: `/teach-activity/course-manage/course/classMange/created`,
        query: {
          course_id: this.course_id
        }
      })
    },
    getAllList() { // 全部列表
      this.loading = true
      this.search_info.course_id = this.course_id // 课程id
      const params = {
        page_info: this.page_info,
        search_info: filterParams(this.search_info)
      }
      delete params.search_info.chapter_id
      All_ItemPaging(params).then(res => {
        const { data } = res
        this.tableData = data.data
        this.total = data.total
        this.loading = false
      })
    },
    getItemList() { // 章节列表
      this.loading = true
      if (this.search_info.course_id) {
        delete this.search_info.course_id
      }
      const params = {
        search_info: filterParams(this.search_info)
      }
      itemPaging(params).then((res) => {
        const { data } = res
        this.tableData = data.data
        this.loading = false
        this.oldList = this.tableData.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },
    getList() {
      if (this.search_info.chapter_id === 0) {
        this.getAllList()
      } else {
        this.getItemList()
      }
    },
    handleFilter() {
      if (this.search_info.chapter_id === 0) {
        this.page_info.page_num = 1
        this.getAllList() // 全部列表
      } else {
        this.getItemList() // 章节列表
      }
    },
    handleEdit(id) {
      this.$router.push({
        path: `/teach-activity/course-manage/course/classMange/edit`,
        query: {
          id: id,
          course_id: this.course_id
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
        itemDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          if (this.tableData.length === 1 && this.page_info.page_num !== 1) {
            this.page_info.page_num -= 1
          }
          this.getList()
        })
      })
    },
    /*   章节  */
    getChapterList() { // 章节列表
      this.chapterLoading = true
      chapterPaging({ course_id: this.course_id }).then(res => {
        this.chapterList = res.data.data
        this.chapterLoading = false
      })
    },
    initModel() {
      this.model = {
        name: ''
      }
    },
    handleClick(id) {
      if (this.search_info.chapter_id === id) { // 避免按钮重复点击
        return false
      }
      // if (!e.target.dataset.id) {
      //   return false
      // }
      if (!this.tableDrag) { // 拖拽禁点
        return false
      }
      // current ID
      this.search_info.chapter_id = id
      if (id === 0) {
        this.table.columns.splice(1, 1, {
          label: '章节',
          render: (scope) => {
            return <div class='text_ellipsis'>{ (scope.row?.chapter_order || '') + scope.row?.chapter + scope.row?.item_order }</div>
          }
        })
        this.page_info.page_num = 1
        this.getAllList() // 全部列表
      } else {
        this.table.columns.splice(1, 1, {
          label: '排序',
          render: (scope) => {
            return <div class='text_ellipsis'>{ scope.row.item_order }</div>
          }
        })
        this.getItemList() // 章节列表
      }
    },
    clearGetList() {
      // this.search_info.condition = ''
      this.getList()
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      const params = {
        data: {
          course_id: this.course_id,
          name: this.model.name
        }
      }
      chapterAdd(params).then((res) => {
        this.showDialog = false
        this.getChapterList()
      })
    },
    update() {
      const params = {
        data: {
          id: this.model.id,
          course_id: this.course_id,
          name: this.model.name
        }
      }
      chapterUpdate(params).then((res) => {
        this.showDialog = false
        this.getChapterList()
      })
    },
    edit(item, e) {
      e.stopPropagation()
      // 编辑
      this.isEdit = true
      // const data = this.chapterList.find(item => item.id === this.search_info.chapter_id)
      this.model = cloneDeep(item)
      this.showDialog = true
    },
    chapterDel(item) {
      // e.stopPropagation()
      // 删除章节
      const params = {
        data: {
          type: 1,
          //  ids: [this.search_info.chapter_id]
          ids: [item.id]
        }
      }
      chapterDelete(params).then(() => {
        this.search_info.chapter_id = 0
        this.getList()
        this.getChapterList()
      })
      // this.tableDrag = true
    },
    sortTable() {
      const el = this.$refs.table.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0] // table
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        disabled: this.tableDrag,
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.tableData.splice(evt.oldIndex, 1)[0]
          this.tableData.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
    handleMouseEnter(e, id) {
      if (id === this.search_info.chapter_id || !this.tableDrag) {
        return false
      }
      const buttonElement = e.target.querySelector('.item-button')
      buttonElement.style = 'display: inline-block'
    },
    handleMouseLeave(e, id) {
      if (id === this.search_info.chapter_id || !this.tableDrag) {
        return false
      }
      const buttonElement = e.target.querySelector('.item-button')
      buttonElement.style = 'display: none'
    },
    editSort() {
      if (this.tableData.length) {
        this.$message({
          message: '拖动列表对课时进行排序',
          type: 'warning'
        })
        // this.clearGetList()
        this.getList()
        this.tableDrag = false
        this.$nextTick(() => {
          this.sortTable()
        })
      } else {
        this.$message({
          message: '暂无数据无法排序',
          type: 'warning'
        })
      }
    },
    saveSort() {
      const params = {
        data: {
          ids: this.newList
        }
      }
      itemSorting(params).then(res => {
        this.tableDrag = true
        this.dragDestroy()
        this.getList()
      })
    },
    dragDestroy() {
      this.$nextTick(() => {
        this.sortable.destroy()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/themes/black/vars';
.app-container{
  height: calc(100% - 62px);
}
.opacity06{
  opacity: 0.6;
}
.chapter_iconfont{
  color:#fff;
}
.no_drop{
    cursor:not-allowed;
    &:hover{
      color:#d1e5fa;
    }
  }
.app-container{
  display: flex;
  justify-content: space-between;
  .chapterList{ //章节
    width: 240px;
    height: 100%;
    box-sizing: border-box;
    margin-right: 20px;
    background-color: rgba(255,255,255,0.1);
    border-radius: 2px;
    .chapterList-title{
      padding:0 10px;
      height: 40px;
      line-height: 40px;
      box-sizing: border-box;
      border-bottom: 1px solid;
      border-color: rgba(255,255,255,0.1);
    }
    .chapterList-content{
      height: calc(100% - 40px);
      box-sizing: border-box;
    }
  }
  .classList{ //课时
    height: 100%;
    overflow-y: auto;
    flex: 1 1 auto;
    box-sizing: border-box;
  }
}
.search-buttons{
  padding-bottom: 10px;
  .search-buttons-item {
      margin: 0 10px 0 0;
    }
}
#left {
  width: 100%;
  height: 100%;
  overflow-y:auto;
  @import '@/styles/themes/black/customScroll.scss';
  margin: 0;
  padding: 0;
  li {
    width: 100%;
    padding: 8px 10px;
    list-style: none;
    // height: 34px;
    // line-height: 34px;
    color: $--icr-color-text-regular;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    .item {
      pointer-events: none;
    }
    &.active {
      color: #fff !important;
      background-color: rgba($--icr-bg-color-focus,0.1) !important;
    }
    // &:hover {
    //   background-color: rgba($--icr-bg-color-focus,0.1);
    //   color: #fff;
    // }
    &.no_drop{
      cursor:not-allowed;
      // &:hover{
      //   color: $--icr-color-text-regular;
      //   background-color: transparent;
      // }
    }
    .item-name{
      line-height: 18px;
      flex: 1;
    }
    .item-button{
      width: 46px;
      text-align: right;
      .el-button{
        &.el-button--text{
          &:first-of-type{
          margin-right: 5px;
        }
          margin: 0;
          pointer-events: auto;
          padding: 0;
        }
      }
    }
  }
}
.text_ellipsis{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.slide-fade-enter-active {transition: all .2s ease;}
.slide-fade-leave-active {transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);}
.slide-fade-enter, .slide-fade-leave-to{transform: translateX(5px);opacity: 0;}
</style>
