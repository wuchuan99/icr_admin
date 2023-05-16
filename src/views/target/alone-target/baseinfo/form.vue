<template>
  <icr-form
    class="baseinfo"
    ref="form"
    :model="value"
    :fields="baseinfoFormFields"
    :rules="baseinfoFormRules"
    confirm-btn-txt="下一步"
    @cancel="() => { $router.push('/targets/alone-targets') }"
    @confirm="submitBaseinfo"
    v-if="display"
  >
    <el-form-item label='选择资源' prop='image_info.image_id' style='width: 240px'>
      <el-select v-model='value.image_info.image_id'>
        <el-option
          v-for="(item, key) in resources"
          :key="key"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <p class="resource-tip">没有需要的资源, 去<el-link class="resource-tip__link" @click='showTipDialog = true'>添加资源</el-link> </p>
    <el-form-item label='目标分类' prop='target_classify'>
      <el-select v-model="value.target_classify">
        <el-option
          v-for="item in targetClassifyOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label='操作系统'>
      <el-input v-model='value.os' style="width='240px;'" disabled />
    </el-form-item>
    <el-form-item label='靶标描述' prop='desc'>
      <el-input v-model='value.desc' type='textarea' :autosize="{ minRows: 6 }" />
    </el-form-item>
    <el-dialog
      title='请选择要创建的类型'
      :visible.sync="showTipDialog"
      width="350px"
      class="btn-dialog"
    >
      <!-- <div style='display: flex; justify-content: space-between;'> -->
      <div style="text-align: center;">
        <!-- <router-link to='/pool_manage/physics'>
          <el-button type="primary">物理资源</el-button>
        </router-link> -->
        <router-link to='/pool_manage/virtual'>
          <el-button type="primary">虚拟资源</el-button>
        </router-link>
      </div>
    </el-dialog>
  </icr-form>
</template>

<script>
import IcrForm from '@/components/form'
import { mapToSelectionOptions } from '@/utils/'
import {
  TargetVirtualType,
  TargetPhysicsType,
  TargetTypes,
  ImageTargetClassify
} from '@/const/resource'
import { virtualImageList } from '@/api/resource'
import { required } from '@/utils/validate-helper'

export default {
  components: {
    IcrForm
  },
  props: {
    value: Object
  },
  data() {
    const targetClassifyOptions = mapToSelectionOptions(ImageTargetClassify)
    return {
      targetClassifyOptions,
      showTipDialog: false,
      image: null,
      resources: [],
      createMethod: 1,
      baseinfoFormFields: [
        {
          label: '靶标名称',
          type: 'input',
          prop: 'name',
          style: 'width: 320px'
        },
        {
          label: '靶标类型',
          type: 'select',
          prop: 'type',
          style: 'width: 320px',
          options: mapToSelectionOptions(TargetTypes)
        }
      ],
      baseinfoFormRules: {
        name: required('靶标名称'),
        type: required('靶标类型'),
        'image_info.image_id': required('资源'),
        target_classify: required('目标分类')
      },
      image_id: '',
      display: false
    }
  },
  watch: {
    'value.type': {
      handler(newVal) {
        switch (newVal) {
          case TargetVirtualType:
            virtualImageList().then(({ data }) => {
              const resources = data.data.map(item => ({
                label: item.name,
                value: item.image_id,
                ...item
              }))
              let found = false
              resources.map(res => {
                if (res.image_id === this.value.image_info?.image_id) {
                  found = true
                }
              })
              if (!found && this.value.image_info?.image_id) {
                resources.push({
                  label: this.value.image_info?.name,
                  value: this.value.image_info?.image_id
                })
              }

              this.resources = resources
              this.display = true
            })
            return
          case TargetPhysicsType:
            this.resources = []
            return
        }
      },
      immediate: !!1
    },
    'value.image_info.image_id': {
      handler(newVal) {
        const image = this.resources.find(image => image.image_id === newVal)
        if (image) {
          this.value.image_info.name = image.name
          this.value.target_classify = image.target_classify
          this.value.os = image.os
        }
      },
      immediate: !!1
    }
  },
  mounted() {
    if (!this.value.id) {
      this.display = true
    }
  },
  methods: {
    submitBaseinfo() {
      this.$emit('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.baseinfo {
  max-width: 800px;
}

.resource-tip {
  color: #fff;
  font-size: 14px;
  position: relative;
  margin: 0;
  margin-left: 160px;
  height: 24px;
  line-height: 24px;
  top: -10px;
  left: 63px;
}
.resource-tip__link {
  position: relative;
  top: -1px;
}
</style>
