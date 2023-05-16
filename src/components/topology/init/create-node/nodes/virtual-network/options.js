import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'virtualNetwork',
  label: '虚拟网络',
  image:
    `${BasePath}images/topology/monihulianwang.svg`,
  icon: 'monihulianwang',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
