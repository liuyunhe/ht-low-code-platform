<template>
  <div class="inputs">
  </div>
</template>
<script>
import utils from "@/utils.js";
import hotentUtils from "@/hotent-ui-util.js";
import CustomQuery from "@/components/eipControl/bus/CustomQuery.js";


export default {
  name: "eip-subtable-backfill",
  props: [
    "customQuery"
  ],
  data() {
    return {
    };
  },
  computed: {

  },
  mounted() {

    const pInst = utils.getOnlineFormInstance(this);
    let oldParams = "";
    let readyLoad = true;
    if(this.customQuery.path && this.customQuery.alias && this.customQuery.conditionfield.length>0 ){
      pInst.$watch(this.customQuery.path,(newV,oldV)=>{
        if(newV && newV.length>=1 && readyLoad ){
          let params = this.prepareLoadParams(newV,this.customQuery.conditionfield); 
          readyLoad = false;
          CustomQuery.load(this.customQuery.alias, params).then((data) => {
            this.backfill(newV,data);
            setTimeout(()=>{
              readyLoad = true;
            },800);
          });
        }
      },{ immediate: true });
    }
  },
  created() {

  },
  methods: {
    backfill(subArr,rows){

      if(this.customQuery.resultfield){
        subArr.forEach(subRow=>{
          let dbData = rows.filter(row=>{
            return row[this.customQuery.conditionfield[0].field] == subRow[this.customQuery.conditionfield[0].fieldPath]
          });
          if(dbData[0]){
            this.customQuery.resultfield.forEach(setting=>{
              if(setting.fieldPath){
                subRow[setting.fieldPath] = dbData[0][setting.field];
              }
            })  
          }
        });
      }
      const pInst = utils.getOnlineFormInstance(this);
      let subArrTemp =Object.assign([], subArr);
      eval("(pInst."+this.customQuery.path+"=subArrTemp)");
    },
    // 准备查询参数
    prepareLoadParams: function(subArr,condition) {
      let params = {};
      if (condition && !hotentUtils.isEmpty(condition)) {
        // 获取当前控件是否在子表某行中
        let { index } = hotentUtils.getSubScopeElAndIndex(this.$el);

        const pInst = utils.getOnlineFormInstance(this);
        Object.keys(condition).forEach(k => {
          let val = subArr.extractByKey(condition[k]["fieldPath"]);
          if (!hotentUtils.isEmpty(val)) {
            params[condition[k]["field"]] = val.join(",");
          }
        });
      }
      return params;
    },
    // 动态加载选项
    dynamicLoadOption: function() {
      const params = this.prepareLoadParams(this.ganged.bind);
      this.$emit("dynamic-options:load", this.ganged.alias, params);
    },
    // 动态加载选项返回值处理
    dynamicOptionResponse: function(alias, data) {
      if (
        this.ganged &&
        this.ganged.alias == alias &&
        this.ganged.valueBind &&
        this.ganged.labelBind
      ) {
        this.options = [];
        if (data && data.constructor == Array && data.length > 0) {
          data.forEach(d => {
            this.options.push({
              key: d[this.ganged.valueBind] + "",
              value: d[this.ganged.labelBind] + ""
            });
          });
        }
      } else if (
        this.ganged &&
        this.ganged.alias &&
        (!this.ganged.valueBind || !this.ganged.labelBind)
      ) {
        let name = this.inputName;
        this.$message.error(
          `下拉框【${name.split("-")[1]}】配置了动态选项，但是没有正确的配置选项绑定关系。`
        );
      }
    },
    // 触发绑定的关联查询
    relatedQueryLoad: function() {
      if (
        this.relatedQuery &&
        this.relatedQuery.constructor == Array &&
        this.relatedQuery.length > 0
      ) {
        // 遍历所有的关联查询，逐个触发
        this.relatedQuery.forEach(q => {
          const params = this.prepareLoadParams(q.condition);
          this.$emit("related-query:load", q.alias, params, q.result);
        });
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
