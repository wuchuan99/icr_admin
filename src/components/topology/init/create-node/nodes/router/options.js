import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'router',
  label: '路由器',
  image:
    `${BasePath}images/topology/luyouqi.svg`,
  icon: 'luyouqi',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
