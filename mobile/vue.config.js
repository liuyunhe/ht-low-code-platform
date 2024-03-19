const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const WebpackBar = require('webpackbar')
const loader = require('sass-loader')
//生产环境 && uat环境

const IS_PROD = process.env.NODE_ENV === 'production'
const dllPath = './public/js'
const dllReferencePath = '/mobilevue/js'
const dllOutputPath = './js'
/**
 * 读取所有的dll文件，并转换为DllReferencePlugin
 * @param {import('webpack').WebpackPluginInstance } plugins
 * */
const solveAllDllFilesToPlugin = plugins => {
  //获取json描述文件
  let files = fs.readdirSync(path.resolve(__dirname, dllPath))
  files = files.filter(file => /.json$/.test(file))
  //遍历,每一个文件转换为一个plugin并push进入plugins中
  files.forEach(file => {
    const item = new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(`${dllPath}/${file}`)
    })
    plugins.push(item)
  })
}

/**
 *
 * @param {string} src
 * @returns
 */
const resolve = src => {
  return path.resolve(__dirname, src)
}

module.exports = {
  baseUrl: '/mobilevue',
  outputDir: 'D:/BuildOutput/web/mobilevue',
  runtimeCompiler: true,
  devServer: {
    host: '0.0.0.0', //主机,可实现本地运行时别人也能访问
    port: 8082, //端口
    hot: true //开启热更新
  },
  configureWebpack: config => {
    config.plugins.push(
      new WebpackBar({
        color: '#85d', // 默认green，进度条颜色支持HEX
        basic: false, // 默认true，启用一个简单的日志报告器
        profile: false // 默认false，启用探查器。
      })
    )
    if (IS_PROD) {
      // gzip压缩
      // config.plugins = [
      //   ...config.plugins,
      //   new CompressionPlugin({
      //     // 要压缩的文件类型
      //     test: /\.js$|\.html$|\.css/,
      //     // 大于该尺寸的文件才压缩（单位byte)
      //     threshold: 10240,
      //     // 是否删除原文件
      //     deleteOriginalAssets: false
      //   }),
      //   new BundleAnalyzerPlugin({
      //     //模式
      //     analyzerMode: 'server',
      //     analyzerHost: '127.0.0.1',
      //     analyzerPort: 9876,
      //     reportFilename: 'report.html',
      //     defaultSizes: 'parsed',
      //     openAnalyzer: true,
      //     generateStatsFile: false,
      //     statsFilename: 'stats.json',
      //     statsOptions: null,
      //     logLevel: 'info',
      //   })
      // ];
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
      solveAllDllFilesToPlugin(config.plugins)
      // 将 dll 注入到 生成的 html 模板中
      config.plugins.push(
        new AddAssetHtmlPlugin({
          // dll文件位置
          filepath: path.resolve(__dirname, `${dllPath}/*.js`),
          // dll 引用路径
          publicPath: dllReferencePath,
          // dll最终输出的目录
          outputPath: dllOutputPath,
          //如果是我们开发的时候，就启用sourceMap来定位代码
          includeSourcemap: false
        })
      )
      //配置打包分析工具
      if (process.argv[process.argv.length - 1] === '--report') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            //模式
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 9001,
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
      // 正式的生产环境才删除调试语句
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = [
        'console.log'
      ]
      // config.output.filename = 'js/[name].[contentHash:8].js';
      // config.output.chunkFilename = 'js/[name].[contentHash:8].js';
    }
    config.resolveLoader.modules = ['node_modules', 'src/loaders']
  },
  chainWebpack: config => {
    config.devServer.disableHostCheck(true)
    // config.entry('index').add('babel-polyfill');
    if (IS_PROD) {
      // 配置打包时分包的数量上限和单个文件的最小尺寸(单位byte)
      config.plugin('chunkPlugin').use(webpack.optimize.LimitChunkCountPlugin, [
        {
          maxChunks: 10,
          minChunkSize: 10000 //100k以上才有分开的意义
        }
      ])

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
      //images 配置timestamp
      config.module
        .rule('images')
          .use('url-loader')
            .loader('url-loader')
            .options({
              nname:`img/[name].[contenthash:8].[ext]`,
              fallback:{
                loader:'file-loader',
                options: {
                  name: 'img/[name].[contenthash:8].[ext]'
                }
              }
            })
            .end()
          .end()
        .rule('main')
          .test(/main\.js$/)
          .use('ou-loader')
            .loader('ou-loader')
            .end()
          .end()
      // chunks拆分
      config.optimization.splitChunks({
        chunks: 'all', // 必须是三选一 initial同步，async异步，all同步或者异步
        automaticNameDelimiter: '-', //打包文件名默认连接符号
        cacheGroups: {
          //common是当有多个入口文件时使用  multi pages
          common: {
            name: 'chunk-common',
            minChunks: 2,
            maxInitialRequests: 5,
            priority: 1,
            reuseExistingChunk: true
          },
          //由于hotent-ui过大，也单独抽离
          hotentui: {
            name: 'chunk-hotent',
            test: /[\\/]node_modules[\\/]hotent-ui/,
            priority: -5,
            chunks: 'all',
            enforce: true
          },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            chunks: 'initial',
            priority: 3,
            reuseExistingChunk: true,
            enforce: true //强制抽离
          },
          components: {
            name: 'chunk-components',
            test: resolve('src/components'),
            minChunks: 1,
            chunks: 'async',
            priority: 4,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      })
      config.optimization.runtimeChunk('single')
    }
  },
  productionSourceMap: false //是否开启源代码定位
}
