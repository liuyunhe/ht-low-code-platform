<template>
  <div class="inputs" ref="inputs" style="width: 100%">
    <vue-ueditor-wrap
            v-if="res && permission_sub!='n'"
      v-model="ueditorVal"
      :config="config_text"
    ></vue-ueditor-wrap>
  </div>
</template>

<script>
import utils from "@/utils.js";
import hotentUiUtils from "@/hotent-ui-util.js";
import { Base64 } from "js-base64";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "eip-font-ueditor",
  props: ["textValue", "permission"],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      res:true,
      config_text: {
        initialFrameHeight: 30,
        UEDITOR_HOME_URL:
          window.location.origin +
          "/" +
          window.location.pathname.split("/")[1] +
          "/static/ueditor/",
        toolbars: [],
        elementPathEnabled: false, //是否启用元素路径，默认是true显示
        wordCount: false, //是否开启字数统计
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex: 99,
        enableAutoSave: false,
        readonly: true,
      },
      data: {},
      ueditorVal: "",
    };
  },
  methods: {
    getObjectValue(text, t, v) {
      let start = "";
      let end = "";
      if(!text && v){
        return v;
      }
      let val2 = text.substring(text.indexOf("{") +2, text.indexOf("}")).split(".");
      if(val2.length == 1){
        return text;
      }
      let rtn = "";
      let regVal = null;
      let reg = /\{\{[\.\d\w]+\}\}/;
      let check = new RegExp("[\u4e00-\u9fa5]");
      //从左到右遍历text，将匹配到的bo数据替换到返回值中
      while((regVal = reg.exec(text)) != null){
        rtn += text.substr(0,regVal.index);
        let val = regVal[0];
        if(check.test(val.replace(/(\{\{)|(\}\})/g,"")) || !val.startsWith("{{data.")){
          rtn += val;
          text = text.substr(regVal.index + val.length);
          continue;
        }
        let length = val.length;
        val = val.replace(/(\{\{)|(\}\})/g,"");
        let arr = val.split(".").splice(1);
        if(arr.length == 2){
          //主表     ["mainEnt", "field"]
          if(t.data[arr[0]][arr[1]]){
            rtn += t.data[arr[0]][arr[1]];
          }
          text = text.substr(regVal.index + length);
        }else if(arr.length == 3){
          //子表     ["mainEnt", "sub_"+"subEnt", "field"]
          let subIndex = utils.getSomeAttributeFromParentElement(t.$el,"sub-index"); //子表下标
          let curData = t.data[arr[0]][arr[1]][subIndex] //子表单行数据
          if(curData[arr[2]]){
            rtn += curData[arr[2]];
          }
          text = text.substr(regVal.index + length);
        }
      }
      //循环结束后，将剩余的数据加到返回值中
      if(text){
        rtn += text;
      }
      return rtn;
      // let start = "";
      // let end = "";
      // if (!text && v) {
      //   return v;
      // }
      // start = text.substring(0, text.indexOf("{"));
      // end = text.substring(text.lastIndexOf("}") + 1, text.length);
      // let val = text
      //   .substring(text.indexOf("{") + 2, text.indexOf("}"))
      //   .split(".");
      // if (val.length == 1) {
      //   return text;
      // }
      // let check = new RegExp("[\u4e00-\u9fa5]");
      // val = val.filter((v) => {
      //   return v != "data";
      // });
      // if (check.test(val)) {
      //   return text;
      // }
      // if (val.length == 2) {
      //   //主表
      //   if (t.data[val[0]][val[1]]) {
      //     return start + t.data[val[0]][val[1]] + end;
      //   } else if (!start && !end) {
      //     return "''";
      //   }
      //   return start + "" + end;
      // } else if (val.length == 3) {
      //   //子表
      //   //获取子表的下标
      //   let subIndex = utils.getSomeAttributeFromParentElement(
      //     t.$el,
      //     "sub-index"
      //   );
      //   let attrArr = t.atter.split(".");
      //   let attr = attrArr[attrArr.length - 1];
      //   let data = t.data[val[0]][val[1]];
      //   data.forEach((v) => {
      //     if (v[val[2]] != v[attr]) {
      //       v[attr] = start + v[val[2]] + end;
      //     }
      //   });
      //   if (start + data[subIndex][val[2]] + end) {
      //     return start + data[subIndex][val[2]] + end;
      //   } else if (!start && !end) {
      //     return "''";
      //   }
      // }
    },
  },
  mounted() {
    let _this = this;
    _this.data = _this.$parent.$vnode.context.$vnode.context.data;
    let text = "";
    if (this.textValue) {
      text = Base64.decode(this.textValue);
      text = _this.getObjectValue(text, _this);
      _this.ueditorVal = text;
    }

    this.$root.$on("updateData",function (res) {
      let text = "";
      _this.data = _this.$parent.$vnode.context.$vnode.context.data;
      if (_this.textValue) {
        text = Base64.decode(_this.textValue);
        text = _this.getObjectValue(text, _this);
        _this.ueditorVal = text;
        _this.$forceUpdate();
      }
    })



  },
};
</script>
<style lang="scss" scoped>
div /deep/ .edui-default /deep/ .edui-editor {
  border: 0;
}
</style>
