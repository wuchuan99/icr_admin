import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'desktop',
  label: '台式机',
  image:
    `${BasePath}images/topology/taishiji.svg`,
  icon: 'taishiji',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
