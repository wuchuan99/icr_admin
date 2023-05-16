import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import chalk from './chalk.json'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  TransformComponent,
  DataZoomComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  TransformComponent,
  DataZoomComponent,
  LineChart,
  PieChart,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

echarts.registerTheme('chalk', chalk)

export default echarts
