<template>
  <div>
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="openDialog()"
        >新增</el-button>
      </div>
      <!-- search -->
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-select
            v-model="query.target_classify"
            clearable
            size="medium"
            @change="getRecords"
          >
            <el-option
              v-for="item in imageTargetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入内容"
            size="medium"
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
    </div>
    <!-- table -->
    <icr-table
      ref="table"
      class="fixed_table"
      :loading="loading"
      :columns="table.columns"
      :data="records"
    />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- dialog -->
    <el-dialog
      :visible.sync="showFormDialog"
      :title="(model.id ? '编辑' : '定义') + '资源属性'"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        :option="option"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="资源图片" prop="logo">
          <AvatarUpload ref="AvatarUpload" v-model="model.logo" />
          <div style="margin: 3px 0;">预设</div>
          <div v-for="(item, index) in logoList" :key="index" class="logoList" :class="model.logo == item ? 'selectLogo' : ''" @click="handleAvatar(item)">
            <img :src="splitUrl(item)" alt="" width="80px" height="80px">
          </div>
        </el-form-item>
        <el-form-item label="操作系统" prop="os">
          <el-input
            v-model="model.os"
          />
        </el-form-item>
        <el-form-item label="资源描述" prop="desc">
          <el-input
            v-model="model.desc"
            type="textarea"
            :autosize="{ minRows: 6 }"
          />
        </el-form-item>
        <el-form-item label="网络接口数量" prop="network_interface_num">
          <el-input-number
            v-model="model.network_interface_num"
            :min="0"
            :max="10"
            @change="inputNumChange"
          />
        </el-form-item>
        <div v-if="model.network_interface_num" class="network_interface_box">
          <el-form-item label="网络接口" class="network_interface_name" />
          <div class="network_interface_inner">
            <el-form-item
              v-for="(network_interface, index) in model.network_interface"
              :key="network_interface.name"
              :prop="'network_interface.' + index + '.value'"
              :rules="{
                required: true,
                message: '网络接口名称不能为空',
                trigger: 'blur'
              }"
              class="network_interface"
            >
              <div class="mouthpiece_box">
                <div class="mouthpiece_boxTop">
                  {{ network_interface.name }}
                </div>
                <div class="mouthpiece_boxBot">
                  <el-input v-model="network_interface.value" />
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </icr-form>
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除物理资源"
      desc="您即将删除该物理资源, 确定删除?"
    />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { mapToSelectionOptions } from '@/utils/'
import { ImageTargetClassify } from '@/const/resource'
import { usePagination, useTableSelection } from '@/hooks'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  physicalPaging,
  physicalAdd,
  physicalUpdate,
  physicalDel,
  physicalLogo
} from '@/api/resource'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrForm from '@/components/form'
import { cloneDeep } from 'lodash-es'
import AvatarUpload from '@/views/common/avatar-upload.vue'
import { splitUrl } from '@/utils/tools'

export default {
  components: {
    IcrTable,
    Pagination,
    IcrForm,
    IcrConfirmDelete,
    AvatarUpload
  },
  setup() {
    const query = reactive({
      name: null,
      target_classify: null
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(physicalPaging, query)
    }
  },
  data() {
    return {
      showFormDialog: false,
      imageTargetOptions: mapToSelectionOptions(ImageTargetClassify),
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '名称' },
          { prop: 'target_classify', label: '目标分类' },
          { prop: 'os', label: '操作系统' },
          { prop: 'network_interface_num', label: '网口数量' },
          { prop: 'equipment_num', label: '设备数量' },
          { prop: 'desc', label: '描述' },
          {
            label: '操作',
            width: '250',
            fixed: 'right',
            showOverflowTooltip: false,
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.$router.push(`/pool_manage/physics/${scope.row.id}`)
                    }}
                  >
                    设备管理
                  </el-button>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.edit(scope)
                    }}
                  >
                    编辑
                  </el-button>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.delete(scope)
                    }}
                  >
                    删除
                  </el-button>
                </div>
              )
            }
          }
        ]
      },
      model: {
        name: '', // 资源名称
        target_classify: null, // 目标分类
        os: '', // 操作系统
        desc: '', // 资源描述
        network_interface_num: 0, // 网络接口数量
        network_interface: [], // 网络接口
        logo: ''
      },
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        target_classify: [
          { required: true, message: '目标分类不能为空', trigger: 'change' }
        ],
        network_interface_num: [
          { required: true, message: '目标分类不能为空', trigger: 'change' }
        ],
        logo: [
          { required: true, message: '资源图片不能为空', trigger: 'change' }
        ]
      },
      formFields: [
        {
          label: '资源名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '目标分类',
          type: 'select',
          prop: 'target_classify',
          options: mapToSelectionOptions(ImageTargetClassify)
        }
      ],
      option: {
        'label-width': '110px'
      },
      logoList: [],
      splitUrl
    }
  },
  computed: {
    postModel() {
      return this.serializeModel(this.model)
    }
  },
  created() {},
  mounted() {
    this.getLogo()
    this.initModel()
    this.getRecords()
  },
  methods: {
    // 获取默认logo
    getLogo() {
      physicalLogo().then(res => {
        this.logoList = res.data.data
      })
    },
    // 打开弹框
    openDialog() {
      this.initModel()
      this.showFormDialog = true
      this.model.id = null
    },
    // 关闭弹窗
    closeDialog() {
      this.initModel()
      this.$refs.form.resetFields()
    },
    // 编辑项目
    edit(scope) {
      this.model = this.serializeModel({
        ...scope.row
      })
      this.showFormDialog = true
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        physicalDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    // 初始化表单数据
    initModel() {
      this.model = {
        name: '', // 资源名称
        target_classify: null, // 目标分类
        os: '', // 操作系统
        desc: '', // 资源描述
        network_interface_num: 0,
        network_interface: [], // 网络接口
        logo: ''
      }
    },
    // 提交
    submit() {
      this.model.id ? this.update() : this.create()
    },
    // 新增
    create() {
      physicalAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    // 更新
    update() {
      physicalUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    // 接口数量删增
    inputNumChange(currentValue, oldValue) {
      if (
        typeof currentValue !== 'undefined' &&
        typeof oldValue !== 'undefined'
      ) {
        this.model.network_interface_num = currentValue
        if (currentValue < oldValue) {
          // 减
          this.model.network_interface.length = currentValue
        } else if (currentValue > oldValue) {
          // 加
          for (let i = oldValue + 1; i <= currentValue; i++) {
            this.model.network_interface.push({
              network_interface_id: -1,
              name: `接口${i}`,
              value: `eth${i}`
            })
          }
        }
      } else {
        // 曾使得数字输入框为空值
        this.model.network_interface = []
        for (let j = 1; j <= currentValue; j++) {
          this.model.network_interface.push({
            network_interface_id: -1,
            name: `接口${j}`,
            value: `eth${j}`
          })
        }
      }
    },
    // 序列化model
    serializeModel(data) {
      const model = cloneDeep(data)
      function getMapKeyByValue(m, v) {
        for (const [k, val] of m.entries()) {
          if (val === v) {
            return k
          }
        }
      }
      if (typeof model.target_classify !== 'number') {
        model.target_classify = getMapKeyByValue(
          ImageTargetClassify,
          model.target_classify
        )
      }
      return model
    },
    handleAvatar(item) {
      this.$set(this.model, 'logo', item)
    }
  }
}
</script>

<style scoped lang="scss">
.network_interface_box {
  display: flex;
  .network_interface_name {
    margin-bottom: 0;
  }
  .network_interface_inner {
    display: flex;
    flex-wrap: wrap;
    width: 777px;
    ::v-deep .el-form-item:nth-last-child(-n+5) {
      margin-bottom: 0;
    }
    .network_interface {
      margin: 0 8px 30px 0;
      &:nth-child(5n) {
        margin-right: 0;
      }
      ::v-deep .el-form-item__content {
        line-height: 22px;
        margin-left: 0 !important;
      }
    }
  }
}
.mouthpiece_box {
  width: 149px;
  height: 58px;
  background-color: rgba(255, 255, 255, 0.1);
  .mouthpiece_boxTop {
    width: 100%;
    height: 28px;
    line-height: 28px;
    text-indent: 1em;
  }
  .mouthpiece_boxBot {
    box-sizing: border-box;
    width: 100%;
    height: 24px;
    padding: 0 5px;
    ::v-deep .el-input {
      height: 24px;
      width: auto;
      .el-input__inner {
        background-color: #323436;
        border-radius: 0;
        height: 24px;
      }
    }
  }
}
::v-deep .el-form{
  >.el-form-item:nth-child(-n+2) {
    display: inline-block;
  }
  >.el-form-item:nth-child(2) {
    margin-left: 26px;
  }
  .avatar-upload {
    width: 80px;
  }
}
.logoList{
  display: inline-block;
  margin-right: 5px;
  img{
    cursor: pointer;
  }
}
.selectLogo{
  position: relative;
    &::before{
      display: block;
      color:#00AD84;
      font-family: 'iconfont';
      content:'\e67d';
      font-size: 28px;
      position: absolute;
      left: 50%;
      top:50%;
      transform: translate(-50%, -50%);
     }
}
</style>
