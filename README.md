# icr-admin

## 文件目录结构
```
src                         源码目录
|-- api                     API接口
|-- assets                  静态资源
|-- components              UI 组件
|-- const                   项目常量
|-- hooks                   项目Hooks
|-- icons                   图标资源
|-- layout                  项目布局
|-- plugin                  插件
|-- router                  路由
|-- store                   vuex, 状态管理
|-- styles                  样式
    |-- themes              主题
        |-- dark            暗黑主题
|-- utils                   工具库
|-- vendors                 三方库
|-- views                   页面组件
    |-- common              页面共享业务组件
```

目录说明
- 公共UI组件维护 components 下
- 页面共享业务组件(例如: 上传组件) 维护在views/common 下
- 同一组件使用一种就好 避免重复轮子 以及不统一现象

## Project setup
```
yarn install
npm install
```

### Compiles and hot-reloads for development
```
yarn serve
npm run serve
```

### Compiles and minifies for production
```
yarn build
npm run build
```

### Run your unit tests
```
yarn test:unit
npm run test:unit
```

### Lints and fixes files
```
yarn lint
npm run lint
```

