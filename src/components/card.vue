<template>
  <div class='icr-card'>
    <div class='icr-card-header'>
      <slot name='header'></slot>
    </div>
    <div class='icr-card-body'>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/themes/black/vars.scss';
.icr-card{
  display: flex;
  flex-direction: column;
}

.icr-card-header {
  height: 48px;
  line-height: 48px;
  background: $--icr-card-bg-color;
  color: #fff;
  border: 1px solid $--icr-border-color-secondary;
  border-radius: 6px 6px 0px 0px;
  border-bottom: none;
}
.icr-card-body {
  flex: 1;
  border: 1px solid $--icr-border-color-secondary;
  padding-bottom: 24px;
  color: $--icr-color-text-primary;
}
</style>
