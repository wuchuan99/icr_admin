<template>
  <component :is="uploader" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import NormalUploader from './normal-uploader.vue'
import SliceChunkUploader from './slice-chunk-uploader.vue'
export default {
  props: {
    type: {
      type: String,
      default: 'normal'
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    uploader: function() {
      switch (this.type) {
        case 'slice-chunk':
          return SliceChunkUploader
        case 'normal':
        default:
          return NormalUploader
      }
    }
  }
}
</script>
