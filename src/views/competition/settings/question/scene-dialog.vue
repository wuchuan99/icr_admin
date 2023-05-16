<template>
  <div>
    <div class="operation-box" style="justify-content: end;">
      <!-- <div class="tag-container">
        <span class="title">题目标签：</span>
        <div class="tags" :class="showAllFlag ? 'show-all' : ''">
          <span
            class="tag-item"
            :class="tagActive === -1 ? 'active' : ''"
            @click="changeTags()"
          >
            全部
          </span>
          <span
            v-for="item in tags"
            :key="item.id"
            class="tag-item"
            :class="tagActive === item.id ? 'active' : ''"
            @click="changeTags(item.id)"
          >
            {{ item.name }}
          </span>
        </div>
        <div class="tag-item"><i class="el-icon-d-arrow-left" @click="showAll" /></div>
      </div> -->
      <div class="query-conditions">
        <el-input
          v-model="sceneQuery.name"
          placeholder="请输入内容"
          size="medium"
          class="search"
          @keyup.enter.native="getRecords"
        >
          <i
            slot="suffix"
            class="el-input__icon iconfont icon-sousuo"
            @click="getRecords"
          />
        </el-input>
      </div>
    </div>
    <icr-table
      ref="table"
      :columns="questionTable.columns"
      :data="records"
      :loading="loading"
      row-key="id"
      @select="select"
    />
    <div class="bottom-box">
      <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">添 加</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { questionPaging, tagList } from '@/api/question'
import { scenetargetPaging } from '@/api/scene'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive, toRefs } from '@vue/composition-api'
export default {
  components: {
    IcrTable,
    Pagination
  },
  props: {
    itemActive: {
      type: Number,
      default: 3
    }
  },
  setup(props) {
    const { itemActive } = toRefs(props)
    const query = reactive({
      desc: '',
      category: null,
      tag: null,
      target_classify: 3
    })
    const sceneQuery = reactive({ name: '', enable_status: 1 })
    const { selection } = useTableSelection()
    if (itemActive.value !== 3) {
      return {
        query,
        selection,
        ...usePagination(questionPaging, query)
      }
    } else {
      return {
        query,
        sceneQuery,
        selection,
        ...usePagination(scenetargetPaging, sceneQuery)
      }
    }
  },
  data() {
    return {
      questionTable: {
        // 题目添加-表格配置
        columns: [
          { type: 'selection', reserveSelection: true },
          { prop: 'name', label: '题目名称' },
          { prop: 'desc', label: '题目描述' },
          { prop: 'nodes', label: '节点' }
        ]
      },
      tags: [], // 添加题目-标签
      tagActive: -1,
      showAllFlag: false
    }
  },
  computed: {},
  watch: {
    itemActive(val) {
      if (val !== 3) {
        this.query.category = val
      }
      this.getRecords()
    }
  },
  mounted() {
    if (this.itemActive !== 3) {
      this.query.category = this.itemActive
    }
    this.getTags()
    this.getRecords()
  },
  methods: {
    getTags() {
      tagList().then((res) => {
        if (res.data) {
          this.tags = res.data.data
        }
      })
    },
    changeTags(id) {
      this.query.tag = id || null
      this.tagActive = id || -1
      this.getRecords()
    },
    closeDialog() {
      this.initData()
      this.$emit('closeDialog')
    },
    confirm() {
      const rows = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val)
        return acc
      }, [])
      if (!rows.length) {
        this.$message({ type: 'warning', message: '请选择一个场景题目' })
        return
      }

      this.$emit('confirm', rows)
    },
    // 初始化弹框
    initData() {
      this.$refs.table.$refs.table.clearSelection()
      this.tagActive = -1
      this.query.tag = null
      this.getRecords()
    },
    // 标签全部展开
    showAll() {
      this.showAllFlag = !this.showAllFlag
    },
    select(selection, row) {
      // 只允许一个题目选中
      if (selection.length > 1) {
        const row = selection.pop()
        this.$refs.table.$refs.table.clearSelection()
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.operation-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
  min-height: 40px;
  height: auto;
  .tag-container {
    display: flex;
    max-width: 80%;
    .title {
      width: 75px;
      white-space: nowrap;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      height: 42px;
      overflow: hidden;
      transition: all 1s;
      line-height: 1.5;
      &.show-all {
        height: auto;
      }
    }
    .tag-item {
      background: transparent;
      border-radius: 1px;
      margin-left: 30px;
      cursor: pointer;
      text-align: center;
      &.active {
        color: #00ad84;
      }
    }
  }
}
.table-tag {
  overflow:hidden;
  text-overflow:ellipsis;
}
.bottom-box {
  position: relative;
  .total {
    position: absolute;
    top: 15px;
    left: 100px;
    color: #f6bf53;
  }
}
.dialog-footer {
  margin-top: 20px;
}
::v-deep {
  .el-table tr.el-table__row td {
    padding: 12px 0;
  }
  .pagination-container {
    // hidden toggle all button
    & > div:nth-child(1) {
      display: none;
    }

    padding: 10px 14px !important;
    height: 52px;
    .el-button.el-button--text:last-child {
      display: none;
    }
  }
  .el-icon-d-arrow-left {
    font-size: 18px;
    position: relative;
    top: 10px;
    transform: rotate(270deg);
  }
  .show-all + .tag-item {
    .el-icon-d-arrow-left {
      transform: rotate(90deg);
    }
  }
}
</style>
