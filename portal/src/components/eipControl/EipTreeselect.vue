<template>
  <div class="inputs">
    <el-select
      v-if="inputWriteable  && this.ganged && permission_sub!='n'"
      v-validate="inputValidate"
      :name="inputName"
      v-model="inputVal"
      size="small"
      clearable
      @clear="clear"
      @remove-tag="handleSelectTagRemove"
      ref="treeselect"
      placeholder="请选择"
      :filterable="filterable"
      :filter-method="filterMethod"
      :multiple="multiple"
      @focus="selectBlur"
    >
      <el-option
        v-show="false"
        v-for="item in tempoptions"
        :value="item.key"
        :label="item.value"
        :key="item.key"
      ></el-option>
      <el-option value :disabled="true">
        <el-tree
          ref="treeselectElTree"
          node-key="key"
          :data="options"
          :highlight-current="true"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :props="defaultProps"
          @check="handleNodeClick"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          :show-checkbox="multiple"
          @check-change="handleCheckChange"
          :check-strictly="!cascade"
        ></el-tree>
      </el-option>
    </el-select>

    <ht-select
      @click.native="clickNative"
      v-if="!ganged"
      v-show="inputWriteable"
      :validate="inputValidate"
      :options="options"
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
      :permission="permission_sub"
    />
    <ht-field-tail
      :fieldName="inputName"
      :readonly="!inputWriteable"
      :inputValue="valueDesc"
      :tag-format-value="tagFormatValue"
    />
  </div>
</template>
<script>
import utils from "@/utils.js";
import hotentUtils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import req from "@/request.js";
export default {
  name: "eip-treeselect",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "multiple",
    "selectlist",
    "ganged",
    "filterable",
    "allowCreate",
    "styles",
    "customQuery",
    "cascade"
  ],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub_sub）
  data() {
    return {
      config: {},
      total: 10,
      pageSize: 5,
      currentPage: 1,
      options: [],
      tempoptions: [],
      valueDesc: "",
      tagFormatValue: [],
      defaultProps: {
        children: "children",
        label: "value"
      },
      newValidate: null,
      curSubIndex: null,
      preParams:null
    };
  },
  watch: {
    valueDesc: function(newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.tagFormatValue = newVal.split(",");
      }
    }
  },
  computed: {
    inputVal: {
      get() {
        if (this.multiple) {
          if (this.value) {
            return this.value.split(",");
          } else {
            return [];
          }
        } else if (this.value || this.value === 0) {
          return this.value + "";
        } else {
          return this.value;
        }
      },
      set(val) {
        if (this.multiple) {
          this.$emit("input", val.join(","));
        } else {
          this.$emit("input", val);
          if (!this.multiple && val) {
            //判断对话框是否绑定了关联查询
            if(this.customQuery&&this.customQuery.custQueryJson&&this.customQuery.custQueryJson.length>0){
              let custQueryJson = this.customQuery.custQueryJson;
              for(let i=0;i<custQueryJson.length;i++){
                if(custQueryJson[i].conditionfield.length>0){
                  this.doQuery(custQueryJson[i]);
                }else{
                  console.error("["+custQueryJson[i].comment+"]关联查询取值参数未绑定表单字段");
                }
              }
            }
          }
        }
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub);
    },
    inputValidate: function() {
      if (this.newValidate) {
        return this.newValidate;
      }
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
    }
  },
  mounted() {
    this.options = this.selectlist ? this.selectlist : [];
    const _me = this;
    let { subScopeEl } = hotentUtils.getSubScopeElAndIndex(_me.$el);
    if (subScopeEl) {
      this.curSubIndex = subScopeEl.dataset["index"];
    }
    const ganged = this.ganged;
    //判断是否有参数绑定
    if (
      ganged &&
      ganged.bind &&
      JSON.stringify(ganged.bind) != "{}" &&
      this.config
    ) {
      const bind = ganged.bind;
      const formVm = utils.getOnlineFormInstance(_me);
      for (var key in bind) {
        let paramDom = null;
        if (this.curSubIndex == null) {
          paramDom = document.querySelector('[model-name="' + bind[key] + '"]');
        } else {
          let subFiledName = bind[key].split(".")[3];
          paramDom = subScopeEl.querySelector(
            '[model-name="item.' + subFiledName + '"]'
          );
        }
        if (paramDom && paramDom.__vue__) {
          paramDom.__vue__.$watch("value", function(newVal, oldVal) {
            if (newVal != oldVal) {
              _me.search(false, newVal, true);
            }
          });
        }
      }
    }
  },
  created() {
    this.options = this.selectlist ? this.selectlist : [];
    //动态传入
    if (
      this.ganged &&
      this.ganged.alias &&
      this.options.length < 1 &&
      this.ganged
    ) {
      const this_ = this;
      this_.$store.dispatch("form/getByAliasCq", this_.ganged.alias).then(res => {
        this_.config = res;
        let objIsEmpty = this_.objIsEmpty(this_.ganged.bind);
        if(this_.ganged.noInit && this_.ganged.noInit == "true"){
          return;
        }
        if (this_.ganged && !objIsEmpty) {
          this_.handelInitGangedsearch();
        } else {
          this_.search(false, "");
        }
      });
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    handleSelectTagRemove(value){
      this.$refs.treeselectElTree.setChecked(value, false,this.cascade);
    },
    //判断对象里面的值是否为空
    objIsEmpty(obj){
      for(let key in obj){
        if(obj[key]){
          return false;
        }
      }
      return true;
    },
    async doQuery(param){
      let paramLoadData = [];
      const pInst = utils.getOnlineFormInstance(this);
      //获取关联查询绑定的表单参数
      for(let i=0;i<param.conditionfield.length;i++){
        if(param.conditionfield[i].fieldPath!=""){
          let bindVal = utils.getValueByPath(pInst, param.conditionfield[i].fieldPath, null);
          let obj = {key: param.conditionfield[i].field, value: bindVal};
          paramLoadData.push(obj);
        }
      }

      let queryUrl = param.dsType=="dataSource"?"${form}/form/customQuery/v1/doQuery?alias="+param.alias+"&page=1":param.url;
      let requestMethod ="POST";
      //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
      if(param.dsType!='dataSource'){
          requestMethod = param.requestType;
      }
      //查询数据
      req.request({url: queryUrl,method: requestMethod,data:paramLoadData}).then(res => {
        //判断是否有关联查询数据返回
        if(res.data.rows.length>0){
          //获取关联查询返回的表单参数
          for(let i=0;i<param.resultfield.length;i++){
            if(param.resultfield[i].fieldPath!=""){
              let val = "";
              for(let j =0;j<res.data.rows.length;j++){
                if(res.data.rows[j][param.resultfield[i].comment]){
                  val = val + res.data.rows[j][param.resultfield[i].comment]+",";
                }
              }
              val = val.substring(0,val.length-1);
              //赋值给绑定的字段
              utils.setValueByPath(pInst, param.resultfield[i].fieldPath,val, null);
            }
          }
        }else{
          //获取关联查询返回的表单参数
          for(let i=0;i<param.resultfield.length;i++){
            if(param.resultfield[i].fieldPath!=""){
              //赋值给绑定的字段
              utils.setValueByPath(pInst, param.resultfield[i].fieldPath,"", null);
            }
          }
        }
      });
    },
    handelInitGangedsearch: function() {
      const _me = this;
      let { subScopeEl } = hotentUtils.getSubScopeElAndIndex(_me.$el);
      if (subScopeEl) {
        this.curSubIndex = subScopeEl.dataset["index"];
      }
      const ganged = this.ganged;
      //判断是否有参数绑定
      if (ganged && JSON.stringify(ganged.bind) != "{}" && this.config) {
        const bind = ganged.bind;
        const formVm = utils.getOnlineFormInstance(_me);
        if (this.curSubIndex == null) {
          for (var key in bind) {
            const pInst = utils.getOnlineFormInstance(_me);
            const val = utils.getValueByPath(pInst, bind[key]);
            _me.search(false, val);
          }
        } else {
          for (var key in bind) {
            let subFiledName = bind[key].split(".")[3];
            let paramDom = subScopeEl.querySelector(
              '[model-name="item.' + subFiledName + '"]'
            );
            if (paramDom && paramDom.__vue__ && paramDom.__vue__.value) {
              let newVal = paramDom.__vue__.value + "";
              _me.search(false, newVal);
            }
          }
        }
      }
    },
    clear() {
      if (this.multiple) {
        this.tempoptions = [];
        this.$nextTick(function() {
          this.$refs.treeselectElTree.setCheckedKeys([], true);
        });
      } else {
        this.$refs.treeselectElTree.setCurrentNode({});
      }
    },
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
    handleCheckChange(data) {
      if (this.multiple) {
        let checkedNodes = this.$refs.treeselectElTree.getCheckedNodes();
        let modelValue = [];
        this.tempoptions = checkedNodes;
        for (let data of checkedNodes) {
          modelValue.push(data.key);
        }
        this.$emit("input", modelValue.join(","));
      }
    },
    handleNodeClick(data) {
      if (!this.multiple) {
        this.$emit("input", data.key);
        if (data.key) {
          //判断对话框是否绑定了关联查询
          if(this.customQuery&&this.customQuery.custQueryJson&&this.customQuery.custQueryJson.length>0){
            let custQueryJson = this.customQuery.custQueryJson;
            for(let i=0;i<custQueryJson.length;i++){
              if(custQueryJson[i].conditionfield.length>0){
                this.doQuery(custQueryJson[i]);
              }else{
                console.error("["+custQueryJson[i].comment+"]关联查询取值参数未绑定表单字段");
              }
            }
          }
        }
        this.$refs.treeselect.blur();
        setTimeout(() => {
          this.$validator.validate();
        });
      } else if (this.multiple) {
        let checkedNodes = this.$refs.treeselectElTree.getCheckedNodes();
        let modelValue = [];
        this.tempoptions = checkedNodes;
        for (let data of checkedNodes) {
          modelValue.push(data.key);
        }
        this.$emit("input", modelValue.join(","));
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.value.indexOf(value) !== -1;
    },
    filterMethod(query) {
      this.$refs.treeselectElTree.filter(query);
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
    search(currentPage, param, gangedChange) {
      //如果options有值，而且param参数一样，那么不需要重新获取数据
      let isParamsEq = hotentUtils.objectEquals(this.preParams, param);
      if(this.options && this.options.length>0 && isParamsEq){
        return;
      }
      this.preParams = param;

      this.options = [];
      if (gangedChange) {
        this.$emit("input", "");
      }
      let objIsEmpty = this.objIsEmpty(this.ganged.bind);
      if (
        !this.config ||
        (this.ganged.bind && !objIsEmpty && !param)
      )
        return;
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
              const val = utils.getValueByPath(
                pInst,
                ganged.bind[key],
                this.curSubIndex
              );
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
        if(res.rows && this.ganged.PId){
          res.rows = hotentUtils.tile2nest(res.rows,this.ganged.valueBind || 'key',this.ganged.PId);
        }
        if (this.config && this.config.dsType === "restful") {
          _this.options = res.rows;
          //tree数组转list
          this.addSelectList(_this.options);
          //处理只读回填显示
          if (
            _this.inputVal &&
            _this.inputVal.constructor == Array &&
            _this.inputVal.length > 0
          ) {
            for (let i = 0; i < _this.inputVal.length; i++) {
              this.findDesc(_this.options, _this.inputVal[i]);
            }
            //默认选中树节点
            if (this.inputWriteable) {
              this.$refs.treeselectElTree.setCheckedKeys(_this.inputVal);
            }
          } else {
            this.findDesc(_this.options, _this.inputVal);
          }
          if (this.valueDesc != "") {
            this.valueDesc = this.valueDesc.substring(
              0,
              this.valueDesc.length - 1
            );
          }

          return;
        }
        _this.total = res.total;
        _this.options = [];
        res.rows.forEach(m => {
          var option = m;
          if (_this.ganged.valueBind) {
            option.key = m[ganged.valueBind] + "";
          }
          if (_this.ganged.labelBind) {
            option.value = m[ganged.labelBind];
          }
          _this.options.push(option);
        });

        //tree数组转list
        this.addSelectList(_this.options);
        if (
          _this.inputVal &&
          _this.inputVal.constructor == Array &&
          _this.inputVal.length > 0
        ) {
          for (let j = 0; j < _this.inputVal.length; j++) {
            this.findDesc(_this.options, _this.inputVal[j]);
          }
          //默认选中树节点
          this.$nextTick(()=>{
            _this.$refs.treeselectElTree && _this.$refs.treeselectElTree.setCheckedKeys(_this.inputVal);
          })
        } else {
          this.findDesc(_this.options, _this.inputVal);
        }
        if (this.valueDesc != "") {
          this.valueDesc = this.valueDesc.substring(
            0,
            this.valueDesc.length - 1
          );
        }
      });
    },
    findDesc(list, key) {
      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].key == key) {
            this.valueDesc += list[i].value + ",";
            return;
          }
          if (list[i].children) {
            this.findDesc(list[i].children, key);
          }
        }
      }
    },
    addSelectList(list) {
      let valueFiled = (this.ganged.valueBind || '') == "key" ? '' : this.ganged.valueBind ;
      let labelFiled = (this.ganged.labelBind || '') == "value" ? '' : this.ganged.labelBind ;
      if (list && list.length > 0) {
        list.forEach(l => {
          if(valueFiled){
            l['key'] = l[valueFiled];
          }
          if(labelFiled){
            l['value'] = l[labelFiled];
          }
          this.tempoptions.push(l);
          if (l.children) {
            this.addSelectList(l.children);
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
div[aria-invalid='true'] /deep/ .el-input__inner, div[aria-invalid='true'] /deep/ .el-input__inner:focus {
  border-color: #f56c6c;
}

.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background-color: #fff;
}

.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: $--color-text-regular;
  height: 100%;
  line-height: 34px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  cursor: pointer;
}

li.el-select-dropdown__item.selected {
  font-weight: normal;
}
</style>
