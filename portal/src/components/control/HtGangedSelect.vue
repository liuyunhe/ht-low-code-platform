<template>
  <div class="inputs">
	<el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
	  <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
		<el-select
		  @click.native="clickNative"
		  v-show="inputWriteable"
		  v-validate="inputValidate"
		  :name="inputName"
		  v-model="inputVal"
		  size="small"
		  clearable
		  placeholder="请选择"
		  filterable
		  remote
		  reserve-keyword
		  :remote-method="remoteMethod"
		  @change="binda"
		  ref="select"
		>
		  <el-option v-for="item in this.options" :key="item.value" :label="item.label" :value="item"></el-option>
		  <div
			v-if="this.config.needPage===1"
			class="text-center"
			style="position: sticky;background: #fff;height:30px;top:0;z-index:1"
		  >
			<a class="text-normal">
			  <el-pagination
				class="pagination"
				:page-sizes="[5]"
				layout="prev, next"
				@current-change="handleCurrentChange"
				:page-size="pageSize"
				:current-page="currentPage"
				:total="total"
			  />
			</a>
		  </div>
		</el-select>
    </el-tooltip>
    <span v-if="!inputWriteable">{{inputVal}}</span>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";

export default {
  name: "ht-gangedSelect",
  props: ["validate", "value", "name", "permission", "ganged","tooltipplacement"],
  data() {
    return {
      inputValnew: "",
      options: [],
      config: {},
      total: 10,
      inputVal:"",
      pageSize: 5,
      currentPage: 1
    };
  },
  watch: {
    inputVal: function(newVal, oldVal) {
      this.$emit("input", newVal.label);
    }
  },
  computed: {
    inputWriteable: function() {
      var getWriteable = utils.getWriteable(this.permission);

      return getWriteable;
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    }
  },
  mounted() {
    // this.$refs.select.$refs.reference.$refs.input.onblur = () => {
    //   this.search();
    // };
    const _me = this;
    const bind = this.ganged.bind;
    if (bind && this.config) {
      const formVm = utils.getOnlineFormInstance(_me);
      let keys = "";
      for (var key in bind) {
        keys =key;
      }
      formVm.$watch(
        _me.ganged.bind[key],
        function(newVal, oldVal) {
          for (var key in bind) {
            const pInst = utils.getOnlineFormInstance(_me);
            const val = utils.getValueByPath(pInst, bind[key]);
            this.$store
            .dispatch("form/getByAliasCq", _me.ganged.alias)
            .then(res => {
              _me.config = res;
              _me.search(false, val);
            });
           
          }
        },
        { deep: true }
      );
    }
  },
  created() {
    if (this.value) {
      this.inputVal = this.value;
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    clickNative: function() {
      if (this.ganged.alias && this.options.length < 1) {
        this.$store
          .dispatch("form/getByAliasCq", this.ganged.alias)
          .then(res => {
            this.config = res;
            this.search();
          });
      }
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage;
      this.search(currentPage);
    },
    search(currentPage, param) {
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
            option.label = m[ganged.labelBind];
          }
          _this.options.push(option);
        });
      });
    },
    binda: function(item) {
      let subIndex = null;
      if (this.$el) {
          subIndex = utils.getSomeAttributeFromParentElement(
            this.$el,
            "data-index"
          );
      }
      const _me = this;
      const exp = utils.parseToJson(this.ganged.gangedBind);
      const pInst = utils.getOnlineFormInstance(_me);
      if (exp && exp[this.ganged.labelBind]) {
        utils.setValueByPath(
          pInst,
          "data." + exp[this.ganged.labelBind],
          item.label,subIndex
        );
      }
      if (exp && exp[this.ganged.valueBind]) {
        utils.setValueByPath(
          pInst,
          "data." + exp[this.ganged.valueBind],
          item.value,subIndex
        );
      }
    },
    remoteMethod: function(val) {
      if (val) {
        this.search(false, val);
      } else {
        this.param = "";
        this.search();
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>