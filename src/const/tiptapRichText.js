import {
  fileUpload
} from '../api/course'
import {
  splitUrl
} from '../utils/tools'
import {
  // 需要的 extensions
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  ListItem,
  BulletList,
  OrderedList,
  Image,
  Blockquote,
  TextAlign,
  FontSize,
  FontType,
  Fullscreen,
  Preview,
  TextHighlight,
  TextColor,
  FormatClear,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  History,
  TrailingNode,
  HardBreak,
  HorizontalRule,
  LineHeight,
  Indent
} from 'element-tiptap'

export const extensions = [
  new Doc(), // 必须项·标题模式
  new Text(), // 必须项·文本
  new Paragraph(), // 必须项·段落
  new Heading({
    level: 6
  }), // 标题等级
  new Bold(), // 粗体
  new Underline(), // 下划线
  new Italic(), // 斜体
  new Strike(), // 中划线
  new ListItem(), // 使用列表必须项
  new BulletList(), // 无序列表
  new OrderedList(), // 有序列表
  new Image({
    uploadRequest(file) {
      const fd = new FormData()
      fd.append('_upload_files', file)
      fd.append('file_type', 'pic')
      fd.append('flag', 'file')
      return fileUpload(fd).then(res => {
        return splitUrl(res.data.file_relative_url[0])
      })
    }
  }), // 图片
  new Blockquote(), // 引用
  new TextAlign(), // 文字对齐
  new FontSize(), // 字号
  new FontType(), // 字体
  new TextHighlight(), // 文本高亮
  new TextColor(), // 文本颜色
  new FormatClear(), // 清除格式
  new Table({
    resizable: false
  }), // 表格必须项
  new TableHeader(), // 表格必须项
  new TableCell(), // 表格必须项
  new TableRow(), // 表格必须项
  new History(), // 撤销
  new TrailingNode(), // 重做
  new HardBreak(), // 分隔线一起
  new HorizontalRule(), // 分隔线
  new LineHeight(), // 行距
  new Indent(), // 增加缩进、减少缩进
  new Preview(), // 预览
  new Fullscreen() // 全屏
]
