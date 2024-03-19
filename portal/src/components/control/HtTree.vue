<template>
  <div class="inputs" ref="inputs" v-express>
    <el-tree :props="props" :load="loadNode" @node-click="handleNodeClick" lazy></el-tree>
  </div>
</template>
<script>
import utils from "@/utils.js";
import { Message, Loading } from "element-ui";
import { Base64 } from "js-base64";
import i18n from "@/lang/index.js";
import req from "@/request.js";
export default {
  name: "ht-cascader",
  props: ["name", "ganged", "script"],
  data() {
    let _this = this;
    return {
      config: null,
      props: {
        label: _this.ganged.labelBind,
        children: "children",
        isLeaf: "leaf"
      }
    };
  },
  computed: {},
  created() {},
  methods: {
    loadNode(node, resolve) {
      const _promise = this.search(node);
      _promise.then(function(nodes) {
        resolve(nodes);
      });
    },
    handleNodeClick(nodeData, node, treeComponent) {
      if (this.script) {
        let htCustomScript = Base64.decode(this.script);
        const formVm = utils.getOnlineFormInstance(this);
        function evil() {
          let Fn = Function(
            "nodeData",
            "node",
            "treeComponent",
            "req",
            "data",
            "i18n",
            "Message",
            "Loading",
            "formVm",
            htCustomScript
          ); //一个变量指向Function，防止有些前端编译工具报错
          let result = Fn(
            nodeData,
            node,
            treeComponent,
            req,
            formVm.data,
            i18n,
            Message,
            Loading,
            formVm
          );
          return result;
        }
        evil();
      }
    },
    async search(node) {
      if (!this.config) {
        const res = await this.$store.dispatch(
          "form/getByAliasCq",
          this.ganged.alias
        );
        this.config = res;
        this.restfulUlr = this.config.url;
      }
      var str = this.config;
      var ganged = this.ganged;
      if (node) {
        let param = "";
        if (node && node.data) {
          param = node.data[this.ganged.valueBind];
        }
        if (str.dsType == "dataSource") {
          let Base64 = require("js-base64").Base64;
          if (JSON.stringify(ganged.bind) === "{}") {
            str.queryData = Base64.encode(
              JSON.stringify([{ key: ganged.valueBind, value: param }])
            );
          } else {
            var queryData = [];
            for (var key in ganged.bind) {
              queryData.push({ key: key, value: param });
            }
            str.queryData = Base64.encode(JSON.stringify(queryData));
          }
        } else {
          var conditionfield = JSON.parse(str.conditionfield);
          var params = {};
          conditionfield.forEach(ele => {
            params[ele.field] = "";
            if (node && node.data) {
              params[ele.field] = node.data[ganged.bind[ele.field]];
            }
          });
          str.url = this.restfulUlr + utils.queryParams(params, true);
        }
      } else {
        str.queryData = "";
      }

      const queryRes = await this.$store.dispatch("form/selectQuery", str);
      return queryRes.rows;
    }
  }
};
</script>
<style lang="stylus" scoped></style>
