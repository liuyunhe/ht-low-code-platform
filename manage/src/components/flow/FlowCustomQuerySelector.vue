<template>
  <el-dialog
    class="hr-script-select"
    width="80%"
    title="选择关联查询"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    v-if="dialogVisible"
    top="8vh"
    append-to-body
  >
    <div class="selector-table-wrap">
      <div class="selector-table-left">
        <ht-table
          @load="loadData"
          :data="queryData"
          :pageResult="pageResult"
          ref="htTable"
          :show-export="false"
          :show-custom-column="false"
          :selectable="false"
          highlight-current-row
          @row-click="queryRowClick"
          quick-search-props="name,alias"
        >
          <template>
            <ht-table-column prop="name" label="名称" show-overflow-tooltip width="180">
              <template slot-scope="scope">
                <span>{{scope.row.name}}</span>
              </template>
            </ht-table-column>
            <ht-table-column prop="alias" label="别名" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{scope.row.alias}}</span>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </div>
      <div style="width:55%;float: left;margin-left: 5px;">
        <div>
          <table class="table table-bordered" style="width:100%">
            <tr>
              <th width="18%">关联查询名称</th>
              <td ng-bind>{{curQuery.name}}</td>
            </tr>
            <tr>
              <th width="18%">关联查询别名</th>
              <td>{{curQuery.alias}}</td>
            </tr>
            <tr>
              <th width="18%">对象名称</th>
              <td>{{curQuery.objName}}</td>
            </tr>
            <tr>
              <th width="18%">数据源别名</th>
              <td>{{curQuery.dsalias}}</td>
            </tr>
             <tr>
              <th width="18%">取值字段</th>
              <td>
                <ht-select
                :options="curResultFields"
                :props="{key:'field',value:'field'}"
                v-model="curQuery.valueField"
                validate="required"
                />
              </td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 5px;width:100%" v-if="curQuery.params">
          <table class="table table-bordered" style="width: 100%;">
            <tr>
              <th width="8%">名称</th>
              <th width="18%">参数类型</th>
              <th>参数说明</th>
              <th width="55%">参数值</th>
            </tr>
            <tr v-for="(param,$index) in curQuery.params" :key="$index">
              <td>{{param.paraName}}</td>
              <td>{{param.paraType}}</td>
              <td>{{param.paraDesc}}</td>
              <td>
                <el-select
                  v-model="param.valueType"
                  @change="param.value = '';"
                  placeholder="请选择"
                  class="valueType_select"
                  size="mini"
                  style="width: 70px;"
                >
                  <el-option label="固定值 " value="1"></el-option>
                  <el-option label="变量" v-if="!parentParam.test" value="0"></el-option>
                </el-select>

                <el-input v-model="param.value" size="mini" style="width: 55%;" />
                <label @click="setCurParam(param)">
                  <FlowVarSelector
                    v-if="param.valueType=='0'"
                    :defId="parentParam.defId"
                    @node-click="varTreeOnConfirm"
                  />
                </label>
              </td>
            </tr>
          </table>
        </div>
      </div>

       <el-dialog
        class="hr-script-select"
        width="60%"
        title="脚本执行结果"
        :visible.sync="resultDialogVisible"
        :close-on-click-modal="false"
        top="20vh"
        append-to-body
      >
      <el-input v-model="result" :disabled="true"  type="textarea"  :rows="20" />
      </el-dialog>
    </div>

    <span slot="footer" class="dialog-footer">

      <el-button
        v-if="!parentParam.test"
        type="primary"
        @click="handleClose(false)"
        size="medium"
      >确 定</el-button>
      <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
    </span>
    
  </el-dialog>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";

import FlowVarSelector from "@/components/flow/FlowVarSelector.vue";
export default {
  name: "hsScript",
  components: {
    FlowVarSelector,
  },
  data() {
    return {
      queryData: [], //单个节点按钮的配置信息
      dialogVisible: false, //是否显示设置节点按钮侧边栏
      curQuery: { params: [],valueField:'' },
      valueTypeList: [
        { key: "变量", value: "0" },
        { key: "固定值", value: "1" }
      ],
      parentParam: {},
      curEditParam: {},
      pageResult: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      titlePreview: "",
      aliasPreview: "",
      customDialogPreview: {},
      curUser: {id:'',name:''},
      startUser: {id:'',name:''},
      result:null,
      resultDialogVisible:false,
      curResultFields: [],
    };
  },
  methods: {
    showDilaog(param) {
      if (param.calc) {
        if (param.calc.params && param.calc.params.constructor == String) {
          param.calc.params = JSON.parse(param.calc.params);
          if (param.calc.params && param.calc.params.constructor == String) {
            param.calc.params = JSON.parse(param.calc.params);
          }
        }
        if (param.calc.alias) {
          let this_ = this;
          req
            .post(
              window.context.form + "/form/customQuery/v1/getByAlias",
                param.calc.alias
            )
            .then(response => {
              if (response.data) {
                this_.curQuery = { ...response.data, ...param.calc };
                this.curResultFields = response.data.resultfield ? eval("(" + response.data.resultfield + ")") : [];
              }
            });
        }
      }else{
        this.curQuery ={ params: [] ,valueField:''};
      }
      this.parentParam = param;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      let this_ = this;
      param.sorter = [{ property: "CREATE_TIME_", direction: "DESC" }]; //排序字段
      if(!param.querys){
        param.querys = [];
      }
      let obj = {
        group: "main",
        operation: "EQUAL",
        property: 'dsType',
        relation: "AND",
        value: 'dataSource'
      };
      param.querys.push(obj);
      req
        .post(window.context.form + "/form/customQuery/v1/list", param)
        .then(response => {
          this_.queryData = response.data.rows;
          this_.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    setCurParam(param) {
      this.curEditParam = param;
    },
    //点击列表某一条数据时触发
    queryRowClick(row, column, event) {
      if (this.curQuery && this.curQuery.alias == row.alias) {
        return;
      }
      this.curQuery = { params: [],valueField:'' };
      if (row) {
        this.curQuery.alias = row.alias;
        this.curQuery.name = row.name;
        this.curQuery.objName = row.objName;
        this.curQuery.dsalias = row.dsalias;
        let conditionfield = row.conditionfield ? eval("(" + row.conditionfield + ")") : {};
        
        for (const p of conditionfield) {
          p.paraName = p.field;
          p.paraType = p.defaultType;
          p.paraDesc = p.comment;
          p.paraCt = p.paraCt || "";
          p.valueType = "1";
          p.value = "";
        }
        this.curQuery.params = conditionfield;
        this.curResultFields = row.resultfield ? eval("(" + row.resultfield + ")") : [];
      } else {
        this.curQuery.alias = "";
        this.curQuery.name = "";
        this.curQuery.objName = "";
        this.curQuery.dsalias = "";
        this.curQuery.params = null;
      }
    },
    showDialogSelector(param) {
      this.curEditParam = param;
      let paraCt = this.curEditParam.paraCt;
      let paraCtBindKey = this.curEditParam.paraCtBindKey;
      let index = paraCt.indexOf(":");
      let alias = paraCt.substring(index + 1);
      let selectorType = paraCt.substring(0, index);
      if (selectorType == "cusdg") {
        this.openCustomDialog(alias);
      } else if (selectorType == "base") {
        this.$refs[alias].showDialog();
      }
    },
    //保存按钮
    handleClose(isTest) {
      if (this.curQuery.alias == null || this.curQuery.alias == "") {
        this.$message.error("请选择关联查询");
        return;
      }
      if (this.curQuery.valueField == null || this.curQuery.valueField == "") {
        this.$message.error("请选择取值字段");
        return;
      }
      let script =
        this.curQuery.name +
        "(";
      let desc = "【" + this.curQuery.alias + "】参数:(";
      let pass = true;
      for (let i = 0, p; (p = this.curQuery.params[i]); i++) {
        if (p.valueType == "1"){
          p.description = p.value;
        }else if (isTest) {
          this.$message.error("不支持使用变量测试");
          pass =false;
          return;
        }
        let str = p.description || p.value;
        desc += p.paraDesc + ":" + str + " ";
        script += this.dealValue(p) + " ";
        if (i < this.curQuery.params.length - 1) {
          script += ",";
          desc += ",";
        }
      }
      if (!pass) {
        return;
      }
      script += ")";

      desc += ")";
      desc += "，取值字段【";
      desc += this.curQuery.valueField;
      desc += "】";
      let params = this.curQuery.params;
      let data = {
        alias: this.curQuery.alias,
        name: this.curQuery.name,
        valueField: this.curQuery.valueField,
        params: params,
        script: script,
        desc: desc,
        description: desc
      };
      this.$emit("customQuerySelectorConfirm", data);
      this.dialogVisible = false;
    },
    //处理固定值string类型参数的格式
    dealValue(p) {
      if (p.paraType == "java.lang.String" && p.valueType == "1") {
        try {
          if(!p.value){
               p.value = '""';
          }else{
              p.value = '"' + eval(p.value) + '"';
          }
        } catch (e) {}
      }else if ((p.paraType == "java.lang.Boolean" || p.paraType == "java.lang.boolean")&& p.valueType == "1") {
        if(!p.value){
               p.value = 'false';
          }
      }
      return p.value;
    },
    varTreeOnConfirm(node) {
      this.curEditParam.value = node.pathValue;
      this.curEditParam.description = node.desc;
    },
    handleSavePreview(data) {
      Message.success("返回数据为：" + JSON.stringify(data));
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
.div_list {
  height: 30px;
  background: #e2e2e2;
  line-height: 30px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 10px;
}
>>> label.el-checkbox {
  margin: 5px 10px 0 0;
}
.ht {
  width: 300px;
}
.form-inline {
  float: left;
  width: 100%;
}
.left-label {
  width: 18%;
  float: left;
}
.control-label {
  word-break: break-all;
  text-align: right;
  color: #545252;
  font-size: 12px;
  padding: 0px 10px !important;
  font-weight: bold;
  line-height: 35px;
}
div >>> .box-card {
  margin-bottom: 20px;
}

div >>> .box-card .clearfix {
  padding-top: 20px;
}

div >>> .el-collapse-item__header {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
}

.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px 4px;
  vertical-align: middle;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0 !important;
}

.valueType_select >>> .el-input__inner {
  padding: 5px;
}
.table >>> .el-button {
  padding: 7px;
}
.hr-script-select >>> .el-dialog__body {
  padding: 10px;
}
.test-user-selector {
  width: 200px;
  display: inline-block;
  margin-right: 10px;
}
.selector-table-wrap{
  width: 100%;
  height: 500px;
  overflow-y: scroll;
  .selector-table-left{
    float: left;
    width:44%;
    height:100%
  }
}
</style>
