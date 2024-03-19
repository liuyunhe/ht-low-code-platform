<template>
  <div class="inputs">
	<el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
	  <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
		<el-select
		  @click.native="clickNative"
		  v-if="this.ganged"
		  v-show="inputWriteable"
		  v-validate="inputValidate"
		  :name="inputName"
		  v-model="inputVal"
		  size="small"
		  clearable
		  placeholder="请选择"
		  :filterable="filterable"
		  :allow-create="allowCreate"
		  reserve-keyword
		  :multiple="multiple"
		  ref="selected"
		  @blur="selectBlur"
		>
		  <el-option v-for="item in this.options" :key="item.key" :label="item.value" :value="item.key"></el-option>
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

		<el-select
		  v-if="inputWriteable && !this.ganged"
		  v-validate="inputValidate"
		  :name="inputName"
		  v-model="inputVal"
		  size="small"
		  clearable
		  :filterable="filterable"
		  :allow-create="allowCreate"
		  :multiple="multiple"
		  placeholder="请选择"
		>
		  <el-option v-for="item in this.options" :key="item.key" :label="item.value" :value="item.key"></el-option>
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
    <span v-if="!inputWriteable">{{!inputWriteable?inputValnew:inputVal}}</span>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";

export default {
  name: "ht-select",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "multiple",
    "selectlist",
    "linkage",
    "ganged",
	"tooltipplacement",
	"filterable",
	"allowCreate"
  ],
  data() {
    return {
      inputVal: [],
      inputValnew: "",
      config: {},
      total: 10,
      pageSize: 5,
      currentPage: 1,
      options: []
    };
  },
  watch: {
    inputVal: function(newVal, oldVal) {
      this.$emit("input", newVal);
    }
  },
  computed: {
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
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
    this.options = this.selectlist ? this.selectlist : [];
    const _me = this;
    const exp = this.linkage;
    if (exp && exp.length > 0 && (this.$parent.isView || this.$parent.$parent.$parent.isView)) {
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
            if (newVal !== oldVal && m.value == newVal) {
              m.effect.forEach(ef => {
                _me.$store.dispatch("index/delValidate");
                const p = `permission.fields.${ef.target}`;
                let val = _me.traces[p];
                if (m.value === newVal) {
                  val = ef.type;
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
    const ganged = this.ganged;
    //判断是否有参数绑定
    if (ganged && JSON.stringify(ganged.bind) !="{}" && this.config) {
      const bind = ganged.bind;
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
            _me.search(false, val);
          }
        },
        { deep: true }
      );
    }
    //回显(固定值)
    if (
      this.inputVal &&
      this.inputVal.length > 0 &&
      this.inputValnew == "" &&
      this.selectlist
    ) {
      let inputValArr = [];
      for (var a = 0; a < this.selectlist.length; a++) {
          //多选
          if (this.inputVal instanceof Array) {
              for (var i = 0; i < this.inputVal.length; i++) {
                  if (this.selectlist[a].key == this.inputVal[i]) {
                      inputValArr.push(this.selectlist[a].value);
                      this.inputVal[i] = this.selectlist[a].value;
                      break;
                  }
              }
          }else{//单选
              if (this.selectlist[a].key == this.inputVal) {
                  inputValArr.push(this.selectlist[a].value);
                  break;
              }
          }
      }
      //下拉框可创建条目 （多选）
      if(this.inputVal instanceof Array && inputValArr.length<this.inputVal.length){
        inputValArr = [...this.inputVal];
      }else if(this.inputVal instanceof String){ //下拉框可创建条目 （单选）
        if(inputValArr.length==0){
            inputValArr.push(this.inputVal ); 
        }
      }
      this.inputValnew = inputValArr.join(",");
    }
  },
  created() {
    this.options = this.selectlist ? this.selectlist : [];
    //动态传入
    if (this.ganged && this.ganged.alias && this.options.length < 1) {
      this.$store.dispatch("form/getByAliasCq", this.ganged.alias).then(res => {
        this.config = res;
        this.search();
      });
    }
    if (this.value && this.value.indexOf("[") == 0) {
      var selectVal = this.value.substr(0, this.value.length - 1);
      selectVal = selectVal.substr(1);
      if (selectVal === "") {
        this.inputVal = selectVal;
        return;
      }
      var selectVal2 = selectVal.split(",");
      var selectValnew = [];
      for (var i = 0; i < selectVal2.length; i++) {
        selectValnew.push(selectVal2[i].trim());
      }
      this.inputVal = selectValnew;
    } else {
      this.inputVal = this.value;
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    clickNative: function() {
      //动态传入
      if (this.ganged && this.ganged.alias && this.options.length < 1) {
        this.$store
          .dispatch("form/getByAliasCq", this.ganged.alias)
          .then(res => {
            this.config = res;
            this.search();
          });
      }
    },
    selectBlur: function(val) {
      this.search();
    },
    remoteMethod: function(val) {
      if (val) {
        this.search(false, val);
      } else {
        this.param = "";
        this.search();
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
      //回写（动态值）
      this.$store.dispatch("form/selectQuery", str).then(res => {
        _this.total = res.total;
        _this.options = [];
        res.rows.forEach(m => {
          var option = {};
          if (_this.ganged.valueBind) {
            option.key = m[ganged.valueBind];
          }
          if (_this.ganged.labelBind) {
            option.value = m[ganged.labelBind];
          }
          _this.options.push(option);
        });
        let inputValArr = [];
        for (let i = 0; i < _this.options.length; i++) {
          //多选
          if(_this.inputVal.length>0 && this.inputVal instanceof Array){
            for(let j = 0;j<_this.inputVal.length;j++){
                if (_this.inputVal[j] == _this.options[i].key) {
                  inputValArr.push(_this.options[i].value); 
                  _this.inputVal[j] = _this.options[i].value;
                  break;
                }
            }
          }else{
            //单选
            if (_this.inputVal == _this.options[i].key) {
              inputValArr.push(_this.options[i].value); 
              break;
            }
          }
        } 
        //下拉框可创建条目 （多选）
        if(_this.inputVal instanceof Array && inputValArr.length<_this.inputVal.length){
          inputValArr = [..._this.inputVal];
        }else if(_this.inputVal instanceof String){ //下拉框可创建条目 （单选）
          if(inputValArr.length==0){
              inputValArr.push(_this.inputVal ); 
          }
        }
         _this.inputValnew = inputValArr.join(",");
      });
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>