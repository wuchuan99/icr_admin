<template>
  <div class="scene-target-edit-baseinfo">
    <icr-form
      ref="form"
      class="baseinfo"
      :label-position="labelPosition"
      :model="sceneData"
      :fields="baseinfoFormFields"
      :rules="baseinfoFormRules"
      :display-actions="false"
      @confirm="confirm"
    >
      <el-form-item label="靶标描述" prop="desc">
        <el-input v-model="sceneData.desc" type="textarea" :autosize="{ minRows: 6 }" />
      </el-form-item>
      <template>
        <div class="submit-btn" style="padding-left: 80px">
          <el-button type="primary" @click="submitBaseinfo">下一步</el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </template>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import { required } from '@/utils/validate-helper'
export default {
  components: {
    IcrForm
  },
  props: {
    sceneData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      labelPosition: 'top',
      baseinfoFormFields: [
        {
          label: '靶标名称',
          type: 'input',
          prop: 'name'
        }
      ],
      baseinfoFormRules: {
        name: required('靶标名称')
      }
    }
  },
  created() {

  },
  mounted() {

  },
  methods: {
    submitBaseinfo() {
      this.$refs.form.confirm()
    },
    confirm() {
      this.$emit('submit')
    },
    goBack() {
      this.$router.push('/targets/scene-targets')
    }
  }
}
</script>
<style lang="scss" scoped>
  .scene-target-edit-baseinfo {
    width: 100%;
    border-top: 2px solid rgba(255, 255, 255, .1);
    ::v-deep .baseinfo {
       .actions {
        margin-left: 80px;
        text-align: left;
      }
    }
    .baseinfo {
      display: flex;
      // justify-content: center;
      margin-top: 40px;
    }
  }
</style>
