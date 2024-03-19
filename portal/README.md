# k6-portal

## Project setup
```
yarn install
```
### Compiles and hot-reloads for development
```
yarn run serve
```
### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

### 更多配置
See [Configuration Reference](https://cli.vuejs.org/config/).
---
## 2022-06-27优化打包配置
由于dll编译打包出来的verndor.dll.js文件过大，多达几M，为此进行拆分，以优先加载vue全家桶为基础(经过实践，UI组件库必须一起打包)，单独加载第三方的插件，达到一个优化的目的。

如果每次更新了如下的第三方插件库，必须重新执行

```
yarn run dll
```
再打包
```
yarn run build
```

### 更新修改记录
* 2022-06-27 第一次配合使用DllPlugin和DllReferencePlugin进行拆分
* 2022-11-29 wude 调整sso结构,可与读取项目外部sso配置
* 2022-11-29 wude 调整vue.config.js中baseUrl通过环境文件配置,租户名通过环境文件配置
* 2022-11-30 wude 增加了表单未提交的提示逻辑
* 2022-11-30 wude 修改了任务处理后跳转到下一个任务调整成返回上一页
* 2022-11-30 wude 调整form相关页面中的执行自定义脚本方法,抽到utils


