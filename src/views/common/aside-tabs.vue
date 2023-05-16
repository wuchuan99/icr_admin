<script>
import { Tabs } from 'element-ui'
export default {
  name: 'AsideTabs',
  extends: Tabs,
  props: {
    headerTitle: String
  },
  render(h) {
    const {
      type,
      handleTabClick,
      handleTabRemove,
      handleTabAdd,
      currentName,
      panes,
      editable,
      addable,
      tabPosition,
      stretch
    } = this
    const newButton =
      editable || addable ? (
        <span
          class='el-tabs__new-tab'
          on-click={handleTabAdd}
          tabindex='0'
          on-keydown={(ev) => {
            if (ev.keyCode === 13) {
              handleTabAdd()
            }
          }}
        >
          <i class='el-icon-plus'></i>
        </span>
      ) : null
    const navData = {
      props: {
        currentName,
        onTabClick: handleTabClick,
        onTabRemove: handleTabRemove,
        editable,
        type,
        panes,
        stretch
      },
      ref: 'nav'
    }
    const header = (
      <div class={['el-tabs__header', `is-${tabPosition}`]}>
        {newButton}
        { this.headerTitle && <div class='aside-tabs-header-title'> { this.headerTitle } </div> }
        { this.$slots['header-btn'] }
        <tab-nav {...navData}></tab-nav>
        { this.$slots['header-suffix'] }
      </div>
    )
    const panels = <div class='el-tabs__content'>{this.$slots.default}</div>
    return (
      <div
        class={{
          'aside-tabs': true,
          'el-tabs': true,
          'el-tabs--card': type === 'card',
          [`el-tabs--${tabPosition}`]: true,
          'el-tabs--border-card': type === 'border-card'
        }}
      >
        {tabPosition !== 'bottom' ? [header, panels] : [panels, header]}
      </div>
    )
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/themes/black/vars.scss';

.aside-tabs {
  ::v-deep {
     .el-tabs__active-bar {
      display: none;
    }
    .el-tabs__nav-wrap:after {
      display: none;
    }
    .el-tabs__header {
      background: $--icr-color-input-primary;
      position: relative;
    }
    .aside-tabs-header-title {
      margin: 0;
      color: rgba($color: #fff, $alpha: 0.4);
      cursor: default;
      height: 40px;
      line-height: 40px;
      padding: 0 14px;
      text-align: center;
      border-bottom: 2px solid $--icr-color-input-primary;
    }
    .el-tabs__item {
      text-align: left;
      height: 30px;
      line-height: 30px;
      padding: 0 10px !important;
      margin: 4px;
      min-width: 160px;
      &:hover {
        color: $--icr-color-text-primary;
        background: $--color-primary;
      }
      &.is-active {
        color: $--icr-color-text-primary;
        background: $--color-primary;
      }
    }
    // is-top
    .el-tabs__header.is-top {
      background: none;

      .el-tabs__nav {
        background: $--icr-color-input-primary;
      }
      .el-tabs__item {
        height: 32px;
        line-height: 32px;
        text-align: center;
        min-width: 120px;
      }
    }
  }
}
</style>
