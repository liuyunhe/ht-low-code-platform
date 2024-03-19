<template>
  <div class="inputs" ref="inputs" style="width: 98%;">
    <ht-input
      size="small"
      v-if="isShowInput && permission_sub!='n'"
      placeholder="请输入内容"
      type="text"
      v-model="inputVal"
      :permission="permission_sub"
    >
      <template slot="append">
        <el-button
          btn="btn"
          style="margin-left: 20px"
          size="small"
          type="primary"
          :icon="this.icon"
          @click="customEvilJS()"
        >{{this.btnName}}</el-button>
      </template>
    </ht-input>
    <el-button
      v-if="!isShowInput && permission_sub!='n'"
      btn="btn"
      style="margin-left: 20px;"
      size="small"
      type="primary"
      :icon="this.icon"
      @click="customEvilJS()"
    >{{this.btnName}}</el-button>
  </div>
</template>
<script>
import utils from "@/utils.js";
import { Message, Loading } from "element-ui";
import { Base64 } from "js-base64";
import i18n from "@/lang/index.js";
import req from "@/request.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "eip-button",
  props: [
    "value",
    "name",
    "permission",
    "icon",
    "btnName",
    "attr",
    "htCustomScript",
    "isShowInput"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      unwatchAry: [],
      content: ""
    };
  },
  computed: {
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  mounted() {
    if (this.value) {
      this.inputVal = this.value;
    }
  },
  methods: {
    customEvilJS() {
      let _me = this;
      let htCustomScript = Base64.decode(this.htCustomScript);
      const formVm = utils.getOnlineFormInstance(_me);
      function evil() {
        let Fn = Function(
          "req",
          "data",
          "i18n",
          "Message",
          "Loading",
          "formVm",
          '_this',
          htCustomScript
        ); //一个变量指向Function，防止有些前端编译工具报错
        let result = Fn(req, formVm.data, i18n, Message, Loading, formVm,_me);
        return result;
      }
      let resultValue = evil();
      if (resultValue) {
        this.inputValue = resultValue;
        this.$emit("input", resultValue);
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: left;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}
</style>