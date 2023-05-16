<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="openDialog()"
        >上传</el-button>
        <!-- <el-button
          class="filter-item"
          :disabled="!selection.length"
          type="danger"
          size="medium"
          icon="el-icon-delete"
          @click="deleteBatch"
        >刪除</el-button> -->
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">镜像分类 : </span> -->
          <el-select v-model="query.disk_classify" placeholder="镜像分类" clearable size="medium" @change="getRecords">
            <el-option
              v-for="item in imageDiskOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="query-conditions__item search">
          <!-- <span class="label">目标分类 : </span> -->
          <el-select v-model="query.target_classify" placeholder="目标分类" clearable size="medium" @change="getRecords">
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
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
          <!-- <el-button
            class="filter-item"
            icon="el-icon-search"
            type="primary"
            size="medium"
            @click="getRecords"
          >搜索</el-button> -->
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog :visible.sync="showFormDialog" :close-on-press-escape="escapeFlag"  @close="closeDialog" :title="(model.id ? '编辑' : '新增') + '镜像'">
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="镜像分类" prop="disk_classify">
          <el-select @change="changeDisk" v-model="model.disk_classify" placeholder="请选择">
             <el-option
              v-for="item in imageDiskOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item  label="镜像格式" prop="file_type">
          <el-select v-model="model.file_type" placeholder="请选择">
             <el-option
              v-for="item in imageFormatOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item  label="磁盘类型" prop="disk_type">
          <el-select v-model="model.disk_type" placeholder="请选择">
             <el-option
              v-for="item in diskTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="上传文件" key="files" prop="file">
          <FileUploader v-model='model.file' type="slice-chunk" :data="{ file_type: 'image' }"  />
        </el-form-item>
        <el-form-item v-else label="文件名称" key="filename">
          <span>{{model.file_name}}</span>
        </el-form-item>
        <el-form-item label="操作系统" prop="os">
          <el-input v-model='model.os' />
        </el-form-item>
        <el-form-item label="资源描述" prop="flag">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除虚拟资源" desc="您即将删除该虚拟资源, 确定删除?" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import {
  virtualImagePaging,
  virtualImageAdd,
  virtualImageUpdate,
  virtualImageDel
} from '@/api/resource'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { ImageDiskClassify, ImageTargetClassify, ImageFileTypes, diskTypeClassify } from '@/const/resource'
import FileUploader from '@/views/common/upload/file-uploader.vue'
import { mapToSelectionOptions } from '@/utils/'

export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination,
    FileUploader
  },
  setup() {
    const query = reactive({
      name: null,
      disk_classify: null,
      target_classify: null
    })

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(virtualImagePaging, query)
    }
  },
  data() {
    return {
      model: {
        name: '', // 镜像名称
        disk_classify: null, // 镜像分类
        target_classify: null, // 目标分类
        file_type: '', // 文件格式
        disk_type: '', // 磁盘类型
        file_path: '', // 文件
        file_name: '',
        file_size: '',
        file: '',
        os: '', // 操作系统
        desc: '' // 资源描述
      },
      escapeFlag:true, // 是否能够esc退出
      isEdit:false,
      imageDiskOptions: mapToSelectionOptions(ImageDiskClassify),
      imageTargetOptions: mapToSelectionOptions(ImageTargetClassify),
      diskTypeOptions: mapToSelectionOptions(diskTypeClassify),
      imageFormatOptions:[
        {label:'iso',value:'iso'},
        {label:'qcow2',value:'qcow2'},
        {label:'vmdk',value:'vmdk'}
      ],
      formFields: [
        {
          label: '镜像名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '目标分类',
          type: 'select',
          prop: 'target_classify',
          options: mapToSelectionOptions(ImageTargetClassify)
        },
      ],
      // TODO
      formRules: {
        name: [
          { required: true, message: '镜像名称不能为空', trigger: ['blur','change'] }
        ],
        file: [
          { required: true, message: '文件不能为空', trigger: ['blur','change'] }
        ],
        target_classify: [
            { required: true, message: '目标分类不能为空', trigger: 'change' }
          ],
        disk_classify: [
            { required: true, message: '镜像分类不能为空', trigger: 'change' }
          ],
        file_type: [
          { required: true, message: '镜像格式不能为空', trigger: 'change' }
        ],
        disk_type: [
          { required: true, message: '磁盘类型不能为空', trigger: 'change' }
        ]
      },
      showFormDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '名称' },
          { prop: 'disk_classify', label: '镜像分类' },
          { prop: 'target_classify', label: '目标分类' },
          { prop: 'os', label: '操作系统' },
          { prop: 'file_size', label: '大小' },
          { prop: 'desc', label: '资源描述' },
          { prop: 'create_time', label: '创建时间' },
          {
            label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i
                //       class='el-icon-edit'
                //       onclick={() => {
                //         this.edit(scope)
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
                  <el-button type='text' onclick={() => { this.edit(scope) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    postModel() {
      return this.serializeModel(this.model)
    },
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    openDialog() {
      this.initModel()
      this.isEdit = false
      this.showFormDialog = true
    },
    // 改变镜像分类，镜像格式会变化bugICR-44
    changeDisk(val) {
      switch (val) {
        case 1:
          this.imageFormatOptions = [
            {label:'iso',value:'iso'},
          ]
          break;
        case 2:
          this.imageFormatOptions = [
            {label:'qcow2',value:'qcow2'},
            {label:'vmdk',value:'vmdk'}
          ]
          break;
        default:
          this.imageFormatOptions = [
            {label:'iso',value:'iso'},
            {label:'qcow2',value:'qcow2'},
            {label:'vmdk',value:'vmdk'}
          ]
      }
      this.model.file_type = this.imageFormatOptions[0].value
    },
    // 弹框消失
    closeDialog() {
      this.initModel()
      this.$refs.form.resetFields()
    },
    initModel() {
      this.model = {
        name: '', // 镜像名称
        disk_classify: null, // 镜像分类
        target_classify: null, // 目标分类
        file_type: '', // 文件格式
        disk_type: '', // 磁盘类型
        file_path: '', // 文件
        file_name: '',
        file_size: '',
        file: '',
        os: '', // 操作系统
        desc: '' // 资源描述
      }
    },
    serializeModel(data) {
      const model = cloneDeep(data)
      function getMapKeyByValue(m, v) {
        for (const [k, val] of m.entries()) {
          if (val === v) {
            return k
          }
        }
      }
      if (typeof model.disk_classify !== 'number') {
        model.disk_classify = getMapKeyByValue(ImageDiskClassify, model.disk_classify)
      }
      if (typeof model.target_classify !== 'number') {
        model.target_classify = getMapKeyByValue(ImageTargetClassify, model.target_classify)
      }

      const { file } = model
      if (file) {
        model.file_path = file.url
        model.file_size = file.size
        model.file_name = file.name
        delete model.file
      }
      return model
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      // console.log(this.postModel);
      // if(!this.postModel.file_name && !this.postModel.file_path) {
      //   this.$message.success('请选择上传文件')
      //   return
      // }
      virtualImageAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    update() {
      virtualImageUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    edit(scope) {
      this.model = this.serializeModel(scope.row,'edit')
      this.isEdit = true
      this.showFormDialog = true
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
        virtualImageDel({
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
.question-form {
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
::v-deep {
  .el-form-item:nth-child(-n+4) {
    display: inline-block;
  }
  .el-form-item:nth-child(1),
  .el-form-item:nth-child(3) {
    margin-right: 70px;
  }
}
</style>
