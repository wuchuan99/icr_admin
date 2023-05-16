import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'notebook',
  label: '笔记本',
  image:
    `${BasePath}images/topology/bijiben.svg`,
  icon: 'bijiben',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
