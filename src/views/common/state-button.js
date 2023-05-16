import { useRequest } from '@/hooks'

export default {
  name: 'state-button',
  props: {
    request: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const { fetch, pending: pending } = useRequest(props.request)
    return {
      fetch,
      pending
    }
  },
  render() {
    return (
      <el-button loading={ this.pending } { ...{ props: this.$attrs } } onclick={this.fetch}>
        { this.$slots.default }
      </el-button>
    )
  }
}
