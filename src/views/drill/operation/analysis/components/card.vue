<template>
  <div class="card">
    <!-- <i class="el-icon-caret-right" /> -->
    <div class="card__header">
      <slot v-if="$slots.header" name="header" />
      <div v-else class="card__header_default">
        <span style="font-size:20px;" class="title">{{ title }}</span>
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
<style lang="scss" scoped>
.card {
  padding: 20px 30px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  position: relative;
  .card__header {
    margin-bottom: 20px;
    position: relative;
    .title {
      position: relative;
      display: block;
      width: 100%;
      padding-left: 16px;
      padding-bottom: 5px;
      font-size: 18px;
      line-height: 1;
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 8px;
        height: 20px;
        background: #e46c6c;
        border-radius: 2px;
      }
    }
  }
  .card__body {
    position: relative;
  }
}
</style>
