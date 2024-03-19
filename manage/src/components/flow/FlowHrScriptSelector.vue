<template>
  <el-dialog
    class="hr-script-select"
    width="80%"
    :title="(parentParam.test?'测试':'选择')+'人员脚本'"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    v-if="dialogVisible"
    top="8vh"
    append-to-body
  >
    <div style="width:100%;height:500px">
      <div style="float: left;width:44%;height:100%">
        <ht-table
          @load="loadData"
          :data="scriptData"
          :pageResult="pageResult"
          ref="htTable"
          :show-export="false"
          :show-custom-column="false"
          :selectable="false"
          highlight-current-row
          @row-click="orgRowClick"
          quick-search-props="methodName,methodDesc,classInsName"
        >
          <template>
            <ht-table-column prop="methodName" label="脚本别名" show-overflow-tooltip width="180">
              <template slot-scope="scope">
                <span v-if="scope.row.enable == 1">{{scope.row.methodName}}</span>
              </template>
            </ht-table-column>
            <ht-table-column prop="methodDesc" label="脚本描述" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.enable == 1">{{scope.row.methodDesc}}</span>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </div>
      <div style="width:55%;float: left;margin-left: 5px;">
        <div v-if="curScript.params">
          <table class="table table-bordered" style="width:100%">
            <tr>
              <th width="18%">脚本别名</th>
              <td ng-bind>{{curScript.methodName}}</td>
            </tr>
            <tr>
              <th width="18%">脚本描述</th>
              <td>{{curScript.methodDesc}}</td>
            </tr>
            <tr>
              <th width="18%">实例名</th>
              <td>{{curScript.classInsName}}</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 5px;width:100%" v-if="curScript.params">
          <table class="table table-bordered" style="width: 100%;">
            <tr>
              <th width="8%">名称</th>
              <th width="18%">参数类型</th>
              <th>参数说明</th>
              <th width="55%">参数值</th>
            </tr>
            <tr v-for="(param,$index) in curScript.params" :key="$index">
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
                    v-if="param.valueType=='0' &&  !parentParam.test"
                    :defId="parentParam.defId"
                    @node-click="varTreeOnConfirm"
                  />
                  <el-button
                    v-if="param.valueType=='1' && param.paraCt"
                    @click="showDialogSelector(param)"
                    size="mini"
                  >选择值</el-button>
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
      <form v-form style="display: inline-block;"> 
      <eip-user-selector
        class="test-user-selector"
        placeholder="选择测试用户"
        :single="true"
        :appendToBody="true"
        v-model="curUser.name"
        :config="{id:'curUser.id',account:'curUser.account'}"
      />
      <eip-user-selector
        class="test-user-selector"
        placeholder="选择测试流程发起人"
        :single="true"
        :appendToBody="true"
        v-model="startUser.name"
        :config="{id:'startUser.id',account:'startUser.account'}"
      />
     </form>

      
      <el-button type="primary" @click="handleClose(true)" size="medium">测试</el-button>
      <el-button
        v-if="!parentParam.test"
        type="primary"
        @click="handleClose(false)"
        size="medium"
      >确 定</el-button>
      <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
    </span>
    <!-- 用户选择对话框  -->
    <eip-user-dialog
      ref="user-selector"
      name="user-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 角色选择对话框  -->
    <eip-role-dialog
      ref="role-selector"
      name="role-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 维度选择对话框  -->
    <eip-demension-dialog
      ref="dem-selector"
      name="dem-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 职务选择对话框  -->
    <eip-job-dialog
      ref="job-selector"
      name="job-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 组织选择对话框  -->
    <eip-org-dialog
      ref="org-selector"
      name="org-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 岗位选择对话框  -->
    <eip-post-dialog
      ref="pos-selector"
      name="pos-selector"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />

    <!-- 自定义对话框列表预览 -->
    <custom-dialog-show
      :title="titlePreview"
      ref="customDialogShow"
      :custom-dialog="customDialogPreview"
      :alias="aliasPreview"
      @handle-save="dialogOnConfirm"
    ></custom-dialog-show>
    <!-- 自定义对话框树形预览 参数动态传入的--->
    <custom-dialog-show-tree
      :title="titlePreview"
      ref="customDialogShowTree"
      :custom-dialog="customDialogPreview"
      :alias="aliasPreview"
      @onConfirm="dialogOnConfirm"
    ></custom-dialog-show-tree>
    <!-- 自定义对话框树形预览  参数没有动态传入的-->
    <eip-tree-dialog
      ref="eipTreeDialog"
      :custom-dialog="customDialogPreview"
      :ispreview="false"
      @onConfirm="dialogOnConfirm"
      :alias="aliasPreview"
    ></eip-tree-dialog>
  </el-dialog>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";

import FlowVarSelector from "@/components/flow/FlowVarSelector.vue";

const eipUserDialog = () => import("@/components/dialog/EipUserDialog.vue");
const eipRoleDialog = () => import("@/components/dialog/EipRoleDialog.vue");
const eipDemensionDialog = () =>
  import("@/components/dialog/EipDemensionDialog.vue");
const eipJobDialog = () => import("@/components/dialog/EipJobDialog.vue");
const eipOrgDialog = () => import("@/components/dialog/EipOrgDialog.vue");
const eipPostDialog = () => import("@/components/dialog/EipPostDialog.vue");
const customDialogShow = () =>
  import("@/views/form/customDialog/CustomDialogShow.vue");
const customDialogShowTree = () =>
  import("@/views/form/customDialog/CustomDialogShowTree.vue");
const eipTreeDialog = () =>
  import("@/views/form/customDialog/EipTreeDialog.vue");
const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
export default {
  name: "hsScript",
  components: {
    FlowVarSelector,
    eipUserDialog,
    eipRoleDialog,
    eipDemensionDialog,
    eipJobDialog,
    eipOrgDialog,
    eipPostDialog,
    customDialogShow,
    customDialogShowTree,
    eipTreeDialog,
    eipUserSelector
  },
  data() {
    return {
      scriptData: [], //单个节点按钮的配置信息
      dialogVisible: false, //是否显示设置节点按钮侧边栏
      curScript: { params: [] },
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
      resultDialogVisible:false
    };
  },
  methods: {
    showDilaog(param) {
      if (param.calc) {
        if (param.calc.params && param.calc.params.constructor == String) {
          param.calc.params = JSON.parse(param.calc.params);
        }
        if (param.calc.scriptId) {
          let this_ = this;
          req
            .get(
              "${bpmRunTime}/runtime/conditionScript/v1/get?id=" +
                param.calc.scriptId
            )
            .then(response => {
              if (response.data) {
                this_.curScript = { ...response.data, ...param.calc };
              }
            });
        }
      }else{
        this.curScript ={ params: [] };
      }
      this.parentParam = param;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      let this_ = this;
      req
        .post(
          window.context.bpmRunTime + "/runtime/conditionScript/v1/list",
          param
        )
        .then(response => {
          this_.scriptData = response.data.rows;
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
    orgRowClick(row, column, event) {
      if (this.curScript && this.curScript.scriptId == row.id) {
        return;
      }
      this.curScript = { params: [] };
      if (row) {
        this.curScript.id = row.id;
        this.curScript.methodDesc = row.methodDesc;
        if (row.methodName) {
          this.curScript.methodName = row.methodName;
        }
        this.curScript.classInsName = row.classInsName;
        let tempArgument = row.argument ? eval("(" + row.argument + ")") : {};
        for (const p of tempArgument) {
          p.paraCt = p.paraCt || "";
          p.valueType = "1";
          p.value = "";
        }
        this.curScript.params = tempArgument;
      } else {
        this.curScript.id = "";
        this.curScript.methodDesc = "";
        this.curScript.params = null;
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
    openCustomDialog(alias) {
      const this_ = this;
      let url = "${form}/form/customDialog/v1/getByAlias?alias=" + alias;
      req.get(url).then(function(customDialog) {
        customDialog = customDialog.data;
        //格式化对话框的显示字段、返回字段、条件字段、排序字段
        customDialog.displayfield = JSON.parse(customDialog.displayfield);
        for (let i = 0; i < customDialog.displayfield.length; i++) {
          customDialog.displayfield[i].field = customDialog.displayfield[
            i
          ].field.toUpperCase();
        }
        customDialog.resultfield = JSON.parse(customDialog.resultfield);
        customDialog.sortfield = JSON.parse(customDialog.sortfield);
        customDialog.conditionfield = JSON.parse(customDialog.conditionfield);
        //列表
        if (customDialog.style == 0) {
          this_.aliasPreview = alias;
          this_.customDialogPreview = customDialog;
          this_.titlePreview = customDialog.name + "-对话框列表预览";
          setTimeout(() => {
            this_.$refs.customDialogShow.showDialog(); //显示自定义对话框列表预览弹框
          });
        } else {
          //树形
          this_.aliasPreview = alias;
          this_.customDialogPreview = customDialog;
          this_.titlePreview = customDialog.name + "-对话框树形预览";
          let param = {};
          if (customDialog.conditionfield.length > 0) {
            for (let i = customDialog.conditionfield.length - 1; i >= 0; i--) {
              //判断条件字段是否是动态传入（defaultType：4：动态传入，2：固定值 ）
              if (customDialog.conditionfield[i].defaultType == "4") {
                param[customDialog.conditionfield[i].field] =
                  customDialog.conditionfield[i].comment;
              }
            }
          }
          //有动态传入的字段
          if (JSON.stringify(param) != "{}") {
            customDialog.param = param;
            setTimeout(() => {
              this_.$refs.customDialogShowTree.showDialog(); //显示自定义对话框列表预览弹框
            });
          } else {
            setTimeout(() => {
              this_.$refs.eipTreeDialog.showDialog();
            });
          }
        }
      });
    },
    dialogOnConfirm(data) {
      this.setParam(this.curEditParam, this.curEditParam.paraCtBindKey, data);
    },

    setParam(param, key, aryData) {
      if (key) {
        key = key.toUpperCase();
      }
      let isString = param.paraType == "java.lang.String";
      let vals = "";
      let descriptions = "";
      if (typeof aryData === "object" && !isNaN(aryData.length)) {
        for (let i = 0; i < aryData.length; i++) {
          let obj = this.objectAttrToUpperCase(aryData[i]);
          let val = obj[key];
          let tmp = obj["name"]
            ? obj["name"]
            : obj["NAME"]
            ? obj["NAME"]
            : obj[key];
          vals += i == 0 ? val : "," + val;
          descriptions += i == 0 ? tmp : "," + tmp;
        }
      } else {
        vals = aryData[key];
        descriptions = aryData["name"] ? aryData["name"] : aryData[key];
      }
      param.value = isString ? '"' + vals + '"' : vals;
      param.description = descriptions;
    },
    objectAttrToUpperCase(oldObj) {
      let newObj = {};
      if (oldObj && oldObj.constructor == Object) {
        for (const key in oldObj) {
          newObj[key.toUpperCase()] = oldObj[key];
        }
      }
      return newObj;
    },
    //保存按钮
    handleClose(isTest) {
      if (this.curScript.id == null || this.curScript.id == "") {
        this.$message.error("请选择脚本");
        return;
      }
      let script =
        "" +
        this.curScript.classInsName +
        "." +
        this.curScript.methodName +
        "(";
      let desc = "【" + this.curScript.methodDesc + "】参数:(";
      let pass = true;
      for (let i = 0, p; (p = this.curScript.params[i]); i++) {
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
        if (i < this.curScript.params.length - 1) {
          script += ",";
          desc += ",";
        }
      }
      if (!pass) {
        return;
      }
      script += ")";
      desc += ")";
      let params = this.curScript.params;
      let data = {
        scriptId: this.curScript.id,
        params: params,
        script: script,
        desc: desc
      };
      if (!isTest) {
        this.$emit("scriptSelectorConfirm", data);
        this.dialogVisible = false;
      } else {
        let param = { script: script,userId:this.curUser.id,startId:this.startUser.id };
        let this_ =this;
        this.$http
          .post("${bpmRunTime}/runtime/conditionScript/v1/testScript", param)
          .then(function(resp) {
            let data = resp.data;
            if (data.state) {
              if (data.value && data.value.length > 0) {
                 this_.result = JSON.stringify(data.value);
                 this_.resultDialogVisible = true;
              }else{
                this_.$message.warning("未计算出人员,请检查参数配置");
              }
            } 
          });
      }
    },
    //处理固定值string类型参数的格式
    dealValue(p) {
      if (p.paraType == "java.lang.String" && p.valueType == "1") {
        try {
          if(!p.value){
               p.value = '""';
          }else if(p.value.indexOf('\"') <0){
              p.value = '"' + p.value + '"';
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
</style>
