import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'rectangular',
  label: '矩形',
  image:
    `${BasePath}images/topology/juxing.svg`,
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
