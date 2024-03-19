const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const WebpackBar = require('webpackbar')
const chalk = require('chalk')

// dll文件存放的目录
const dllPath = 'public/js'

//构建我们自己的上线测试环境uat
const IS_UAT = process.env.NODE_ENV === 'uat'
//判断生产环境，少写一点代码
const IS_PROD = process.env.NODE_ENV === 'production'
const resolve = src => {
  return path.resolve(__dirname, src)
}
/**
 * 读取所有的dll文件，并转换为DllReferencePlugin
 * */
const solveAllDllFilesToPlugin = config => {
  let plugins = []
  //获取json描述文件
  let files = fs.readdirSync(dllPath)
  files = files.filter((file) => /.json$/.test(file))
  //遍历,每一个文件转换为一个plugin并push进入plugins中
  files.forEach((file, index) => {
    let item = {}
    if (/\.json$/.test(file)) {
      item = new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest:require(`./${dllPath}/${file}`)
      })
      plugins.push(item)
    }
  })
  config.plugins = [...config.plugins, ...plugins]
}

const publicPath = process.env.VUE_APP_BASE_URL;
const title = process.env.VUE_APP_TITLE;
const dayjs = require('dayjs')
const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
module.exports = {
  //baseUrl: '/fvue', //
  //outputDir: 'fvue', // 编译输出路径
  baseUrl: process.env.NODE_ENV === 'development' ? '/' : publicPath,
  outputDir: `/web_build/tacj${publicPath}`, // 编译输出路径
  runtimeCompiler: true,
  //开发环境下配置
  devServer: {
    useLocalIp: true,
    //host: '0.0.0.0', //主机,可实现本地运行时别人也能访问
    //port: 8082, //端口
    hot: true, //开启热更新
    open: false,
    noInfo: false,
    progress: false,
    // 错误、警告在页面弹出
    overlay: {
      warnings: false,
      errors: true,
    },
  },
  configureWebpack: config => {
    // // 配置 htmlplugin
    // config.plugins.push(
    //   new HtmlWebpackPlugin({
    //     templateParameters: {
    //       BASE_URL: '/fvue/'
    //     },
    //     title: '法律事务管理系统',
    //     template: 'public/index.html',
    //     favicon: 'public/favicon.ico'
    //   })
    // )
    config.plugins.push(
      new WebpackBar({
        name: title, // 标题
        color: '#06FF2C', // 进度条颜色
        /* profile: true,
        fancy: false,
        basic: true, */
        reporter: {
          /**在（重新）编译开始时调用 */
          start(context) {
            console.log(
              chalk.yellow(
                `----------------- 编译开始   ${time} -------------------`
              )
            )
          },
          change(context) {
            // 在监视模式下更改文件时调用
            console.clear()
            console.log(
              chalk.yellow(
                `----------------- 开始热加载 ${time} -------------------`
              )
            )
          },
          done(context) {
            // 编译完成时调用
            console.log(
              chalk.yellow(
                `----------------- 编译完成,请充分测试!   ${time} -------------------`
              )
            )
          },
          /**最后执行 */
          afterAllDone(context) {
            console.log(
              chalk.redBright(`\n> 请充分测试!\n`)
            )
          },
        },
      }),
    )
    if (IS_PROD || IS_UAT) {
      config.plugins.push(
        new CompressionPlugin({
          // 使用gzip压缩
          algorithm: 'gzip',
          // 要压缩的文件类型
          test: /\.js$|\.html$|\.css$|\.svg$/,
          filename: '[path].gz[query]', // 压缩后的文件名(保持原文件名，后缀加.gz)
          // 大于该尺寸的文件才压缩（单位byte)
          threshold: 10240, //超过10k就压缩
          minRatio: 0.8, // 压缩率小于1才会压缩
          // 是否删除原文件
          deleteOriginalAssets: false
        })
      )
      // 将 dll 注入到 生成的 html 
      solveAllDllFilesToPlugin(config)
      config.plugins.push(
        new AddAssetHtmlPlugin({
          // dll文件位置
          filepath: path.resolve(__dirname, `./${dllPath}/*.js`),
          // dll 引用路径
          //publicPath: `/fvue/vendor`,
          publicPath: `${publicPath}/vendor`,
          // dll最终输出的目录
          outputPath: './vendor',
          //如果是我们开发的时候，就启用sourceMap来定位代码
          includeSourcemap: false
        })
      )
      if (process.argv[process.argv.length - 1] === '--report') {
        //配置打包分析工具
        config.plugins.push(
          new BundleAnalyzerPlugin({
            //模式
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 8889,
            reportFilename: 'report.html',
            defaultSizes: 'parsed',
            openAnalyzer: true,
            generateStatsFile: false,
            statsFilename: 'stats.json',
            statsOptions: null,
            logLevel: 'info'
          })
        )
      }
      //删除调试语句
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = [
        'console.log'
      ]
    }

  },
  chainWebpack: config => {
    config.devServer.disableHostCheck(false)
    // config.entry('index').add('babel-polyfill');
    if (IS_PROD || IS_UAT) {
      //配置打包时分包的数量上限和单个文件的最小尺寸
      config.plugin('chunkPlugin').use(webpack.optimize.LimitChunkCountPlugin, [
        {
          maxChunks: 10, //降低该数值禁止过多的chunk
          minChunkSize: 10000
        }
      ])
    }
    if (IS_PROD) {
      /* 2022-06-20 ccwgq: 生产部署时及时更新新功能,防止缓存干扰 */
      //js 和css配置
      config.output.filename('js/[name].[contenthash:8].js').end()
      config.output.chunkFilename('js/[name].[contenthash:8].js').end()
      config.plugin('extract-css').tap(args => [
        {
          filename: `css/[name].[contenthash:8].css`,
          chunkFilename: `css/[name].[contenthash:8].css`
        }
      ])
      config
        .plugin('ignore')
        .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)) //忽略/moment/locale下的所有文件
      //images
      config.module
        .rule('images')
        .use('url-loader')
        .tap(options => {
          options.name = `img/[name].[contenthash:8].[ext]`
          options.fallback = {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[contenthash:8].[ext]'
            }
          }
          return options
        })
      //ccwgq 2022-06-27 拆分chunks
      config.optimization.splitChunks({
        chunks: 'all', // 必须是三选一 initial同步，async异步，all同步或者异步
        automaticNameDelimiter: '-', //打包文件名默认连接符号
        cacheGroups: {
          hotentUI: {
            name: 'chunk-hotentUI',
            priority: 30,
            minChunks: 1,
            test: /[\\/]node_modules[\\/]_?hotent-ui/,
            enforce: true
          },
          nodesInitial: {
            name: 'chunk-nodesInitial',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 1,
            chunks: 'initial', //仅打包同步引用的依赖
            reuseExistingChunk: true
          },
          nodesAsync: {
            name: 'chunk-nodesAsync',
            test: /[\\/]node_modules[\\/]/,
            priority: 9,
            minChunks: 1,
            chunks: 'async', //仅打包异步引用的依赖
            reuseExistingChunk: true
          },
          components: {
            name: 'chunk-components',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 1,
            reuseExistingChunk: true //重用已经存在的chunk
          }
        }
      })
      config.optimization.runtimeChunk('single')
    }
  },
  // uat环境开启代码定位
  productionSourceMap: IS_UAT
}
