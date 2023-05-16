import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'text',
  label: '文本',
  image:
    `${BasePath}images/topology/wenben.svg`,
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
