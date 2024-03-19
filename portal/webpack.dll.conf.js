const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

// dll文件存放的目录
const dllPath = 'public/js'

module.exports = {
  entry: {
    //vue全家桶,babel-polyfill放入vue全家桶
    vue: [
      'vue/dist/vue.esm.js',
      'vue-router',
      'vuex',
      'vue-amap',
      'babel-polyfill',
      'element-ui',
      'axios'
    ],
    jquery: ['jquery'],
    moment: ['moment'],
    echarts: ['echarts'],
    videoJs: ['video.js'],
    xlsx: ['xlsx'],
    pdfjsDist: ['pdfjs-dist'], //解决重复打包的问题
  },
  output: {
    path: path.join(__dirname, dllPath),
    filename: '[name].dll.js',
    // vendor.dll.js中暴露出的全局变量名
    // 保持与 webpack.DllPlugin 中名称一致
    library: '[name]_[hash]',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {vue$: 'vue/dist/vue.esm.js'},
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin(['*.*'], {
      root: path.join(__dirname, dllPath),
    }),
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'production',
      },
    }),
    //忽略 moment locale
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与 output.library 中名称一致
      name: '[name]_[hash]',
      context: process.cwd(),
    }),
  ],
}
