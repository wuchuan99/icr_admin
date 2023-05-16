<template>
  <div>
    <el-form ref="inner_form" :label-position="labelPosition" :model="model" v-bind="_option" v-on="_option" @submit.native.prevent>
      <slot name="prefix" />
      <el-form-item v-for="(item, index) in fields" :key="index" v-bind="item">
        <input-element :option="item" :model="model" :select-change="selectChange" />
      </el-form-item>
      <slot />
    </el-form>

    <div v-if="displayActions" class="actions" :style="{marginLeft:_option['label-width']}">
      <el-button :disabled="_option.disabled" type="primary" @click="confirm">{{ _confirmBtnTxt }}</el-button>
      <el-button @click="cancel">{{ _cancelBtnTxt }}</el-button>
    </div>
  </div>
</template>

<script>
import { Input, Select, Cascader, Switch, Slider, TimePicker, DatePicker, DateTimePicker, Upload, Rate, ColorPicker, Transfer } from 'element-ui'
import { debounce } from 'lodash-es'

export default {
  name: 'IcrForm',
  components: {
    InputElement: {
      functional: true,
      render: (h, ctx) => {
        const props = ctx.props
        const { type, prop } = props.option
        const inputOption = { ...props.option, ...props.option.inputOption, ...props.option.itemOption }

        const inputMap = {
          input: Input,
          select: Select,
          cascader: Cascader,
          switch: Switch,
          slider: Slider,
          timepicker: TimePicker,
          datepicker: DatePicker,
          datetimepicker: DateTimePicker,
          upload: Upload,
          rate: Rate,
          colorpicker: ColorPicker,
          transfer: Transfer
        }

        switch (type) {
          case 'radio':
            return (
              <div>
                { inputOption.options.map(item => {
                  return (
                    <el-radio
                      { ...{ props: item, attrs: item, domProps: item } }
                      value={props.model[prop]}
                      oninput={value => (props.model[prop] = value)}
                    >
                      { item.text }
                    </el-radio>
                  )
                }) }
              </div>
            )
          case 'select':
            return (
              <el-select
                { ...{ props: inputOption, attrs: inputOption, domProps: inputOption } }
                value={props.model[prop]}
                oninput={value => (props.model[prop] = value)}
                onchange={ value => props.selectChange(prop, value) }
              >
                { inputOption.options.map(item => {
                  return (
                    <el-option
                      { ...{ props: item, attrs: item, domProps: item } }

                    />
                  )
                })}
              </el-select>
            )
          default:
            // eslint-disable-next-line no-case-declarations
            const Component = inputMap[type]
            return (
              <Component
                { ...{ props: inputOption, attrs: inputOption, domProps: inputOption } }
                value={props.model[prop]}
                oninput={value => (props.model[prop] = value)}
              />
            )
        }
      }
    }
  },
  props: {
    model: Object,
    fields: Array,
    option: Object,
    cancelBtnTxt: String,
    confirmBtnTxt: String,
    displayActions: {
      type: Boolean,
      default() {
        return !!1
      }
    }
  },
  data() {
    return {
      defaultOption: {
        'label-width': '80px'
      },
      defaultCancelBtnTxt: '取消',
      defaultConfirmBtnTxt: '确认',
      labelPosition: 'right'
    }
  },
  computed: {
    _option() {
      return Object.assign({}, this.defaultOption, this.option, this.$attrs, this.$listeners)
    },
    _cancelBtnTxt() {
      return this.cancelBtnTxt || this.defaultCancelBtnTxt
    },
    _confirmBtnTxt() {
      return this.confirmBtnTxt || this.defaultConfirmBtnTxt
    }
  },
  mounted() {
    // watch parent dialog and clear form validate when dialog visible changed
    let parentDialog
    let cur = this
    do {
      if (cur.$parent?.$vnode?.componentOptions?.tag === 'el-dialog') {
        parentDialog = cur.$parent
        break
      }
      cur = cur.$parent
    } while (cur.$parent)
    if (parentDialog) {
      this.$watch(() => {
        return parentDialog.visible
      }, () => {
        this.$nextTick(this.clearValidate)
      })
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    confirm: debounce(function() {
      this.$refs.inner_form.validate((valid) => {
        if (valid) {
          this.$emit('confirm')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }, 1000, { leading: true, trailing: false }),
    resetFields() {
      this.$refs.inner_form.resetFields()
    },
    validateField(props, cb) {
      this.$refs.inner_form.validateField(props, cb)
    },
    clearValidate(props) {
      this.$refs.inner_form.clearValidate(props)
    },
    selectChange(prop, val) {
      this.$emit('select-change', {
        prop,
        val
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.actions {
    text-align: left;
}
</style>
