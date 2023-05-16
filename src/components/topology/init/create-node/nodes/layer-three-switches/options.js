import { BasePath } from '@/router/index'
import nodeData from './node-data'
export default {
  name: 'layerTwoSwitches',
  label: '三层交换机',
  image:
    `${BasePath}images/topology/sancengjiaohuanji.svg`,
  icon: 'sancengjiaohuanji',
  attrs: {
    width: 36,
    height: 36,
    refX: '50%',
    refX2: -18
  },
  data: nodeData
}
