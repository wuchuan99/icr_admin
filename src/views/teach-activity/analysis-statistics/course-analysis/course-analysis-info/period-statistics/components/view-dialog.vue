<template>
  <el-dialog
    ref="dialog"
    width="80%"
    :visible="visible"
    title="课时学习详情"
    @close="$emit('update:visible', false)"
  >
    <div class="details">
      <div class="operation-box">
        <div class="query-conditions">
          <div class="query-conditions__item search">
            <el-select v-model="query.org_id" placeholder="全部组织" clearable size="medium" @change="getRecords">
              <el-option
                v-for="item in orgs"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div class="search">
            <el-input
              v-model="query.name"
              placeholder="请输入用户名/姓名"
              size="medium"
              @keyup.enter.native="getRecords"
            >
              <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
            </el-input>
          </div>
        </div>
      </div>
      <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />
      <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    </div>
  </el-dialog>
</template>

<script>
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import IcrTable from '@/components/table'
import { getlist } from '@/api/organiza'
import { courseAnalysisAccountpaging } from '@/api/education_manage'
export default {
  components: {
    Pagination,
    IcrTable
  },
  props: {
    id: {
      type: [Number, String],
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      orgs: [],
      table: {
        columns: [
          { prop: 'username', label: '用户名' },
          { prop: 'real_name', label: '姓名' },
          { prop: 'org', label: '组织' }
          // { prop: 'name', label: '完成练习' }
        ]
      }
    }
  },
  setup() {
    const query = reactive({
      name: '',
      org_id: '',
      item_id: ''
    })
    return {
      query,
      ...usePagination(courseAnalysisAccountpaging, query, { removeEmpty: true })
    }
  },
  created() {
    this.query.item_id = this.id
    this.getOrgs()
  },
  mounted() {
    setTimeout(this.getRecords.bind(this))
  },
  methods: {
    getOrgs() {
      const search_info = {}
      if (this.participateType === 'player') {
        search_info.type = 1
      }
      getlist({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: search_info
      }).then(({ data }) => {
        this.orgs = data?.data || []
      })
    }
  }
}
</script>
<style scoped>

</style>
