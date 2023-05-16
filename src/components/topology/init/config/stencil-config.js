export const StencilConfig = {
  title: '流程图',
  stencilGraphWidth: 234,
  // collapsable: true,
  groups: [
    // {
    //   title: '基本形状',
    //   name: 'basis',
    //   graphHeight: 88,
    //   layoutOptions: {
    //     rowHeight: 70
    //   }
    // },
    {
      title: '终端设备',
      name: 'terminal',
      graphHeight: 88,
      layoutOptions: {
        rowHeight: 70
      }
    },
    {
      title: '网络设备',
      name: 'network',
      graphHeight: 158,
      layoutOptions: {
        rowHeight: 70
      }
    }
  ],
  layoutOptions: {
    columns: 3,
    columnWidth: 70
  },
  search(cell, keyword) {
    return cell.label.indexOf(keyword) !== -1
  },
  placeholder: '搜索',
  notFoundText: 'Not Found'
}
