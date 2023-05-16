<template>
  <editor :id="tinymceId" :init="init" class="tinymce-textarea" />
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver'
import 'tinymce/icons/default/icons.js'
import 'tinymce/plugins/image'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/fullscreen'
const toolbar = [
  'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
  'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
]
export default {
  name: 'RichText',
  components: { Editor },
  props: {
    id: {
      type: String,
      default: function() {
        return (
          'vue-tinymce-' +
          +new Date() +
          ((Math.random() * 1000).toFixed(0) + '')
        )
      }
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    const _this = this
    return {
      tinymceId: this.id,
      hasInit: false,
      hasChange: false,
      init: {
        language_url: '/tinymce/zh_CN.js', // 语言包的路径
        language: 'zh_CN', // 语言
        skin_url: '/tinymce/skins/ui/oxide', // skin路径
        toolbar:
          'code undo redo restoredraft |  forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | \
        styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
        table image media charmap emoticons hr pagebreak insertdatetime print preview | fullscreen | bdmap indent2em lineheight formatpainter axupimgs',
        height: 300, // 编辑器高度
        branding: false, // 去水印
        elementpath: false, // 禁用编辑器底部的状态栏
        statusbar: false, // 隐藏编辑器底部的状态栏
        paste_data_images: true, // 允许粘贴图像
        menubar: false, // 隐藏最上方menu
        plugins: 'image,preview,fullscreen', // 图片插件
        images_upload_handler: (blobInfo, success, failure) => {
          // 这里可以请求接口
          success('data:image/jpeg;base64,' + blobInfo.base64())
        }, // 上传本地图片
        init_instance_callback: (editor) => {
          if (_this.value) {
            editor.setContent(_this.value)
          }
          _this.hasInit = true
          // 监听富文本内容的改变 将变化传回richtext的v-model
          editor.on('NodeChange Change KeyUp SetContent', () => {
            this.hasChange = true
            this.$emit('input', editor.getContent())
          })
        }
      }
    }
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() =>
          window.tinymce.get(this.tinymceId).setContent(val || '')
        )
      }
    }
  },
  mounted() {
    tinymce.init({})
  }
}
</script>

<style lang="scss" scoped>
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
</style>
