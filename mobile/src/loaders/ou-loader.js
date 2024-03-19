const loaderUtils = require("loader-utils");

module.exports = function(source){
    const options =loaderUtils.getOptions(this);
    // const commentLineList=options.comments || [];
    //将 main.js文件中的 new VConsole()语句注释
   return source.replace(/(new.*VConsole\(\)).*/,"//$1")
}