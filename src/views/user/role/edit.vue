<template>
  <div class="app-container">
    <icr-form
      :model="model"
      :fields="fields"
      :rules="fieldRuls"
      class="ruleForms"
      @cancel="cancel"
      @confirm="submit"
    >
      <el-form-item label="角色权限" prop="permission" style="width:100%">
        <div style="display:inline-block;margin-right: 70px;vertical-align: top">
          <span>管理端</span>
          <el-tree
            ref="adminPermissionTree"
            :data="permissions.admin"
            :default-expand-all="true"
            show-checkbox
            node-key="tag"
            :props="permisionProps"
          />
        </div>
        <div style="display:inline-block;">
          <span>用户端</span>
          <el-tree
            ref="userPermissionTree"
            :data="permissions.user"
            :default-expand-all="true"
            show-checkbox
            node-key="tag"
            :props="permisionProps"
          />
        </div>
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 4}" />
      </el-form-item>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import { roleAdd, roleRetrieve, roleUpdate, resources } from '@/api/role'
import { cloneDeep, pick } from 'lodash-es'
import { required } from '@/utils/validate-helper'
import { roleType } from '@/const/role'
import { mapToSelectionOptions } from '@/utils/'

export default {
  components: {
    IcrForm
  },
  data() {
    return {
      id: '',
      permission: [],
      permissions: {
        admin: [],
        user: []
      },
      permisionProps: {
        children: 'children',
        label: 'name'
      },
      model: {
        name: '',
        desc: '',
        type: '',
        permission: {
          admin: [],
          user: []
        },
        status: 0
      },
      fields: [
        {
          label: '角色名称',
          type: 'input',
          prop: 'name',
          inputOption: { placeholder: '请输入内容', style: 'width: 320px;' },
          itemOption: { required: true }
        },
        {
          label: '角色类型',
          type: 'select',
          prop: 'type',
          options: mapToSelectionOptions(roleType)
        }
        // {
        //   label: '描述',
        //   type: 'input',
        //   prop: 'desc',
        //   inputOption: { type: 'textarea', autosize: { minRows: 4 }}
        // }
        // {
        //   label: '角色类型',
        //   type: 'select',
        //   prop: 'type',
        //   inputOption: {
        //     options: [
        //       { label: '导调方（讲师、演练导调）', value: 'guide' },
        //       { label: '测评方（裁判）', value: 'evaluation' },
        //       { label: '参演方（学员、演练人员、竞赛队员）', value: 'participating' },
        //       { label: '管理员', value: 'admin' }
        //     ]
        //   }
        // }
      ],
      fieldRuls: {
        name: [required('角色名称')],
        type: required('角色类型')
        // permission: [
        //   { validator: (rule, value, cb) => {
        //     console.log(this.postModel, this.postModel.permission?.length === 0)
        //     if (this.postModel.permission?.length === 0) {
        //       return cb(new Error('权限不能为空'))
        //     }
        //     cb()
        //   }, trigger: ['blur'], required: true }
        // ]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.model.id
    },
    roleId() {
      return Number(this.$route.params.id)
    },
    postModel() {
      const model = cloneDeep(this.model)
      const getSelectNodes = (root) => {
        const nodes = root.childNodes
        const ans = []
        const traverse = (node, parent) => {
          if (node.checked) {
            parent.push(node.data)
          } else {
            const cloneNode = cloneDeep(node)
            cloneNode.children = []
            for (let i = 0; i < node.childNodes.length; i++) {
              traverse(node.childNodes[i], cloneNode.children)
            }
            if (cloneNode.children.length) {
              const data = cloneNode.data
              data.children = cloneNode.children
              parent.push(data)
            }
          }
        }

        for (let i = 0; i < nodes.length; i++) {
          traverse(nodes[i], ans)
        }

        return ans
      }
      model.permission.admin = getSelectNodes(this.$refs.adminPermissionTree.root)
      model.permission.user = getSelectNodes(this.$refs.userPermissionTree.root)
      return model
    }
  },
  created() {
    this.getPermissions()
    if (this.roleId) {
      this.getRole()
    }
  },
  mounted() {
    // TODO 根据ID获取一行信息
  },
  methods: {
    initModel() {
      this.form = {
        name: '',
        desc: '',
        type: '',
        permission: {
          admin: [],
          user: []
        },
        status: 0
      }
    },
    getPermissions() {
      resources().then(res => {
        this.permissions = res.data.data
      })
    },
    // checked model's permisison on permission tree
    checkedModelPermissions(refName, refArray) {
      const permission = this.model.permission[refArray]
      const needCheckedPermissionKeys = []

      const loadCheckedKeys = function(permisison) {
        if (Array.isArray(permisison) && permisison.length) {
          permisison.forEach(p => {
            // only selected leaf node
            if (!p.children.length) {
              needCheckedPermissionKeys.push(p.tag)
            } else {
              loadCheckedKeys(p.children)
            }
          })
        }
      }

      loadCheckedKeys(permission)
      this.$refs[refName].setCheckedKeys(needCheckedPermissionKeys, true)
    },
    getRole() {
      roleRetrieve({
        id: this.roleId
      }).then(res => {
        this.model = res.data.data
        // response data has no id, so set it
        this.model.id = this.roleId
        this.checkedModelPermissions('adminPermissionTree', 'admin')
        this.checkedModelPermissions('userPermissionTree', 'user')
      })
    },
    cancel() {
      this.$router.push('/user/role')
    },
    submit() {
      this.isEdit ? this.update() : this.create()
    },
    create() {
      roleAdd({
        data: pick(this.postModel, ['name', 'desc', 'type']),
        permission: this.postModel.permission
      }).then((res) => {
        this.initModel()
        this.$router.push('/user/role')
      })
    },
    update() {
      roleUpdate({
        data: pick(this.postModel, ['id', 'name', 'desc', 'type']),
        permission: this.postModel.permission
      }).then(() => {
        this.$router.push('/user/role')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  width: 80%;
  margin-left: 10%;
}
::v-deep{
  .el-form-item:nth-child(-n+2) {
    display: inline-block;
  }
  .el-form-item:nth-child(1) {
    margin-right: 70px;
  }
}
</style>
