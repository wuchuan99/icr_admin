<template>
  <div class="card">
    <!-- <i class="el-icon-caret-right" /> -->
    <div class="card__header">
      <slot v-if="$slots.header" name="header" />
      <div v-else class="card__header_default">
        <span style="font-size:18px; font-weight: bold;" class="title">{{ title }}</span>
      </div>
    </div>
    <div class="card__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'IcrCard',
  props: {
    title: String
  }
}
</script>

