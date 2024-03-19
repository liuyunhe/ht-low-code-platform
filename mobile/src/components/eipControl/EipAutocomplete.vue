<template>
  <div class="inputs">
      <el-autocomplete
              v-if="inputWriteable && permission_sub!='n'"
              v-validate="inputValidate"
              :name="inputName"
              v-model="inputVal"
              :style="this.styles"
              :fetch-suggestions="querySearchAsync"
              :placeholder="placeholder?placeholder:'请输入内容'"
              @select="handleSelect"
      ></el-autocomplete>

    <ht-field-tail v-if="permission_sub!='n'" :fieldName="inputName" :readonly="!inputWriteable" :inputValue="calInputVal" ></ht-field-tail>
    <span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>

<script>
import utils from "@/utils.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";

export default {
  name: "eip-autocomplete",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "autoTiplist",
    "linkage",
    "ganged",
    "styles",
    "placeholder"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      inputValnew: "",
      options: [],
      config: {}
    };
  },
  computed: {
    inputVal: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    inputWriteable: function() {
      var getWriteable = utils.getWriteable(this.permission_sub);
      if (!getWriteable && this.inputVal.length > 0) {
        var inputValArr = [];
        if (this.inputVal && this.options.length > 0) {
          for (var a = 0; a < this.options.length; a++) {
            if (this.options[a].key == this.inputVal) {
              inputValArr.push(this.options[a].value);
              break;
            }
          }
        }
        this.inputValnew = inputValArr.join(",");
      }
      return getWriteable;
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
      let labeldesc = "";
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return this.name ? this.name : utils.getName();
      }
    },
    calInputVal: function(){
      return this.inputWriteable?this.inputValnew:this.inputVal;
    }
  },
  mounted() {
    const _me = this;
    const exp = this.linkage;
    if (exp && exp.length > 0 && this.$parent.isView) {
      const pInst = utils.getOnlineFormInstance(_me);
      _me.traces = {};
      exp.forEach(m => {
        m.effect.forEach(m => {
          const path = `permission.fields.${m.target}`;
          const oldVal = utils.getValueByPath(pInst, path);
          _me.traces[path] = oldVal;
        });

        _me.$watch(
          "inputVal",
          function(newVal, oldVal) {
            m.effect.forEach(ef => {
              const p = `permission.fields.${ef.target}`;
              let val = _me.traces[p];
              _me.$store.dispatch("index/delValidate", ef);
              utils.setValueByPath(pInst, p, val);
            });
            if (newVal !== oldVal && m.value === newVal) {
              m.effect.forEach(ef => {
                _me.$store.dispatch("index/delValidate");
                const p = `permission.fields.${ef.target}`;
                let val = _me.traces[p];
                if (m.value === newVal) {
                  val = ef.type;
                }
                if (!_me.inputWriteable) {
                  val = val === "n" ? val : "r";
                }
                _me.$store.dispatch("index/linkageValidate", ef);
                utils.setValueByPath(pInst, p, val);
              });
            }
          },
          { immediate: true }
        );
      });
    }
  },
  created() {
    this.options = this.autoTiplist ? JSON.parse(this.autoTiplist) : [];
    if (this.ganged && this.ganged.alias && this.options.length < 1) {
      this.$store.dispatch("form/getByAliasCq", this.ganged.alias).then(res => {
        this.config = res;
      });
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    querySearchAsync(queryString, cb) {
      var options = this.options;
      if (this.ganged && this.ganged.alias) {
        this.search(1, queryString, cb);
      } else {
        var results = queryString
          ? options.filter(this.createStateFilter(queryString))
          : options;
        cb(results);
      }
    },
    createStateFilter(queryString) {
      return state => {
        return (
          state.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
        );
      };
    },
    handleSelect(item) {},
    search(currentPage, param, cb) {
      if (!this.config) return;
      var str = this.config;
      const _this = this;
      var ganged = this.ganged;
      this.pageSize = str.pageSize;
      // if(str.needPage === 1){
      var pageBean = {
        pageBean: {
          page: currentPage ? currentPage : 1,
          pageSize: str.pageSize,
          showTotal: "true"
        }
      };
      if (param) {
        if (str.dsType == "dataSource") {
          let Base64 = require("js-base64").Base64;
          str.currentPage = currentPage ? currentPage : 1;
          if (JSON.stringify(ganged.bind) === "{}") {
            str.queryData = Base64.encode(
              JSON.stringify([{ key: ganged.valueBind, value: param }])
            );
          } else {
            var queryData = [];
            for (var key in ganged.bind) {
              const pInst = utils.getOnlineFormInstance(_this);
              const val = utils.getValueByPath(pInst, ganged.bind[key]);
              if (val) {
                queryData.push({ key: key, value: val });
              } else {
                queryData.push({ key: key, value: param });
              }
            }
            str.queryData = Base64.encode(JSON.stringify(queryData));
          }
        } else {
          var templatePa = this.config.dataParam;
          if (this.config.requestType == "POST" && templatePa) {
            var conditionfield = JSON.parse(str.conditionfield);
            conditionfield.forEach(ele => {
              const pInst = utils.getOnlineFormInstance(_this);
              const val = utils.getValueByPath(pInst, ganged.bind[ele.field]);
              if (val) {
                templatePa = templatePa.replace(
                  new RegExp("\\{" + ele.field + "\\}", "g"),
                  val
                );
              } else {
                templatePa = templatePa.replace(
                  new RegExp("\\{" + ele.field + "\\}", "g"),
                  param
                );
              }
            });
          } else {
          }
          str.pageBean = utils.parseToJson(templatePa);
        }
      } else {
        str.pageBean = pageBean;
        str.currentPage = currentPage ? currentPage : 1;
        str.queryData = "";
      }
      //}
      this.$store.dispatch("form/selectQuery", str).then(res => {
        _this.total = res.total;
        _this.options = [];
        res.rows.forEach(m => {
          var option = {};
          if (_this.ganged.valueBind) {
            option.value = m[ganged.valueBind];
          }
          if (_this.ganged.labelBind) {
            option.key = m[ganged.labelBind];
          }
          _this.options.push(option);
        });
        cb(_this.options);
      });
    }
  }
};
</script>

<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
>>> .el-autocomplete {
  display: block;
}
</style>
