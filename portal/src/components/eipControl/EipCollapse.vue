<template>
  <el-collapse :value="openDefaultArr" @change="handleChange" ref="collapse">
    <slot></slot>
  </el-collapse>
</template>
<script>
import PageBus from "@/components/eipControl/bus/PageBus.js";
export default {
  name: "eip-collapse",
  components: {},
  props: ["openDefault", "isVerify"],
  data() {
    return {
      openDefaultArr: this.openDefault ? this.openDefault : [],
      oldOpenDefaultArr: []
    };
  },
  mounted() {
    this.oldOpenDefaultArr = JSON.parse(JSON.stringify(this.openDefaultArr));
  },
  methods: {
    //折叠面板改变时,对折叠面板内的表单进行校验
    //1.关闭面板时,需要表单局部验证,验证不通过则需要中断关闭效果
    //2.面板点击事件 需要判断当前点击是否是关闭,当前展示的数组与上一个数组进行比较
    //3.需要知道,当前点击的面板是哪个面板.
    handleChange(val) {
      //1.是否开启 2.是否是关闭面板
      if (!this.isVerify || val.length > this.oldOpenDefaultArr.length) {
        this.oldOpenDefaultArr = val;
        return;
      }
      //得到被关闭的面板名
      let removeArr = JSON.parse(JSON.stringify(this.oldOpenDefaultArr));
      for (let y = 0; y < val.length; y++) {
        removeArr.remove(val[y]);
      }
      let erritems = [];
      let formElementAry = document.getElementsByName("online-form");
      let frmInst = formElementAry[0].__vue__;
      let childrens = frmInst.$refs.onlineForm.$refs;
      frmInst.$root.$validator.validateAll("custom-form").then(result => {
        if (!result) {
          let curEl = childrens[removeArr[0]].$el;
          this.$validator.errors.items.forEach(item => {
            if (curEl.contains(document.getElementsByName(item.field)[0])) {
              erritems.push(item);
            }
          });
        } 
        //拼接提示消息
        let msg = "";
        for (let item of erritems) {
          let fieldLabel = "";
          if (item.field) {
            fieldLabel = item.field;
          }
          if (item.field && item.field.indexOf("-") != -1) {
            fieldLabel = item.field.substr(item.field.indexOf("-") + 1);
          }
          msg += fieldLabel + " " + item.msg + "<br/>";
        }
        if (msg) {
          //重新打开折叠面板
          this.openDefaultArr = JSON.parse(
            JSON.stringify(this.oldOpenDefaultArr)
          );
          this.$notify.error({
            title: this.$t("common.errTip"),
            dangerouslyUseHTMLString: true,
            message: msg
          });
        }else {
          this.oldOpenDefaultArr = val;
        }
      });
    }
  },
  watch: {}
};
</script>
