const AliasPlugin = require('enhanced-resolve/lib/AliasPlugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

'use strict'

const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title

const isDev = process.env.NODE_ENV === 'development'
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 8887
// const port = process.env.port || process.env.npm_config_port || 8887 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: isDev ? '/' : '/admin/',
  outputDir: 'dist',
  assetsDir: 'static',
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    compress: true,
    overlay: { // 让浏览器 overlay 同时显示警告和错误
      warnings: true,
      errors: true
    },
    open: true, // 是否打开浏览器
    host: '0.0.0.0',
    port: '8080', // 代理断就
    proxy: {
      '/api': {
        target: process.env.API_URL,
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        // ws: true, // 是否启用websockets
        pathRewrite: {
          '^/api': 'api'
        }
      },
      '/resource': {
        target: process.env.API_URL,
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        pathRewrite: {
          '^/resource': 'resource'
        }
      },
      '/ws': {
        target: process.env.API_URL,
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        ws: true, // 是否启用websockets
        pathRewrite: {
          '^/ws': 'ws'
        }
      }
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    devtool: isDev ? 'eval-source-map' : 'none',
    resolve: {
      alias: {
        '@': resolve('src')
      },
      // Fix Duplicate use of selection JSON ID cell
      plugins: [new AliasPlugin('described-resolve', [
        {
          name: 'prosemirror-tables',
          alias: [
            resolve('node_modules/tiptap-utils/node_modules/prosemirror-tables'),
            resolve('node_modules/prosemirror-tables')
          ]
        }
      ], 'resolve')]
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')

          config.plugin('bunlde-analyzer')
            .use(BundleAnalyzerPlugin, [{ analyzerMode: 'disabled', generateStatsFile: false }])
        }
      )
  },
  // element 图标乱码问题 https://github.com/PanJiaChen/vue-element-admin/issues/3526
  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: 'expanded' }
      }
    }
  }
}
