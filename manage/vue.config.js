const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path')
const fs =require('fs')
const webpack = require('webpack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const dllPath='./public/js';
/**
 * 获得文件的路径
 * @param {string} src 
 */
const resolve =(src)=>{
    path.resolve(__dirname,src);
}
/**
 * 读取所有的dll文件，并转换为DllReferencePlugin
 * @param {import('webpack').WebpackPluginInstance } plugins
 * */
 const solveAllDllFilesToPlugin = (plugins) => {
  //获取json描述文件
  let files = fs.readdirSync(path.join(__dirname, dllPath))
  files = files.filter((file) => /.json$/.test(file))
  //遍历,每一个文件转换为一个plugin并push进入plugins中
  files.forEach((file) => {
    const item = new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(`${dllPath}/${file}`),
    })
    plugins.push(item)
  })
}
const publicPath = process.env.VUE_APP_BASE_URL;
module.exports = {
  baseUrl: publicPath,
  //baseUrl: '/manage', // 构建好的文件输出到哪里
  outputDir: `/web_build/tacj${publicPath}`, // 编译输出路径
  runtimeCompiler: true,
  devServer:{
    host: '0.0.0.0', //主机,可实现本地运行时别人也能访问
    port: 8080, //端口
    hot: true, //开启热更新
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
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
      //   new webpack.DllReferencePlugin({
      //     context: process.cwd(),
      //     manifest: require('./public/js/vendor-manifest.json')
      //   }),
      //   // 将 dll 注入到 生成的 html 模板中
      //   new AddAssetHtmlPlugin({
      //     // dll文件位置
      //     filepath: path.resolve(__dirname, './public/js/*.js'),
      //     // dll 引用路径
      //     publicPath: '/manage/js',
      //     // dll最终输出的目录
      //     outputPath: './js',
      //     includeSourcemap: false
      //   }),
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
          deleteOriginalAssets: false,
        })
      )
      solveAllDllFilesToPlugin(config.plugins)
      // 将 dll 注入到 生成的 html 模板中
      config.plugins.push(
        new AddAssetHtmlPlugin({
          // dll文件位置
          filepath: path.resolve(__dirname, `${dllPath}/*.js`),
          // dll 引用路径
          publicPath: `${publicPath}/js`,
          // dll最终输出的目录
          outputPath: './js',
          //如果是我们开发的时候，就启用sourceMap来定位代码
          includeSourcemap: false,
        })
      )
      //配置打包分析工具
      config.plugins.push(
        new BundleAnalyzerPlugin({
          //模式
          analyzerMode: 'server',
          analyzerHost: '127.0.0.1',
          analyzerPort: 8900,
          reportFilename: 'report.html',
          defaultSizes: 'parsed',
          openAnalyzer: true,
          generateStatsFile: false,
          statsFilename: 'stats.json',
          statsOptions: null,
          logLevel: 'info',
        })
      )
      // 删除调试语句
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];
    }
  },
  chainWebpack: config => {
    config.devServer.disableHostCheck(true);
    // config.entry('index').add('babel-polyfill');
    if (process.env.NODE_ENV === 'production') {
      // 配置打包时分包的数量上限和单个文件的最小尺寸
      config.plugin('chunkPlugin').use(webpack.optimize.LimitChunkCountPlugin, [{
        maxChunks: 8,
        minChunkSize: 10000
      }])
      config.output.filename('js/[name].[contenthash:8].js').end()
      config.output.chunkFilename('js/[name].[contenthash:8].js').end()
      config.plugin('extract-css').tap((args) => [
        {
          filename: `css/[name].[contenthash:8].css`,
          chunkFilename: `css/[name].[contenthash:8].css`,
        },
      ])
      //images
      config.module
        .rule('images')
        .use('url-loader')
        .tap((options) => {
          options.name = `img/[name].[contenthash:8].[ext]`
          options.fallback = {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[contenthash:8].[ext]',
            },
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
            test: /[\/]node_modules[\/]_?hotent-ui(.*)/,
            enforce: true,
          },
          nodesInitial: {
            name: 'chunk-nodesInitial',
            test: /[\/]node_modules[\/]/,
            priority: 10,
            minChunks: 1,
            chunks: 'initial', //仅打包同步引用的依赖
            reuseExistingChunk: true,
          },
          nodesAsync: {
            name: 'chunk-nodesAsync',
            test: /[\/]node_modules[\/]/,
            priority: 9,
            minChunks: 1,
            chunks: 'async', //仅打包异步引用的依赖
            reuseExistingChunk: true,
          }
        },
      })
      config.optimization.runtimeChunk('single')
    }
    //resolve hotent-ui bugs
    // config.resolve.alias
    // .set("hotent-ui",path.join(__dirname,"public/static/hotent-ui"))
    // .end()
    // .end()
  },
  // 不生成sourceMap
  productionSourceMap: false
}
