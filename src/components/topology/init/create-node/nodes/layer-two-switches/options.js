import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'layerTwoSwitches',
  label: '二层交换机',
  image:
    `${BasePath}images/topology/ercengjiaohuanji.svg`,
  icon: 'ercengjiaohuanji',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
