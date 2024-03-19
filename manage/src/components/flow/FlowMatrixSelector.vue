<template>
  <el-dialog
    class="hr-script-select"
    width="70%"
    title="选择角色矩阵"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    v-if="dialogVisible"
    top="8vh"
    append-to-body
  >
    <el-row :gutter="15">
      <el-col :span="10">
        <el-card>
          <ht-table
            @load="loadData"
            :data="data"
            :pageResult="pageResult"
            ref="htTable"
            :show-export="false"
            :show-custom-column="false"
            :selectable="false"
            highlight-current-row
            @row-click="queryRowClick"
            quick-search-props="name,code"
            :defaultQuerys="[{property: 'isDele', value: 0, group: 'main', operation: 'EQUAL', relation: 'AND'}]"
          >
            <template>
              <ht-table-column prop="name" label="名称" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{scope.row.name}}</span>
                </template>
              </ht-table-column>
              <ht-table-column prop="code" label="别名" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span>{{scope.row.code}}</span>
                </template>
              </ht-table-column>
            </template>
          </ht-table>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card>
          <el-form data-vv-scope="matrixForm">
            <div>
              <table class="table table-bordered" style="width:100%">
                <tr>
                  <th width="18%">矩阵名称</th>
                  <td ng-bind>{{curMatrix.name}}</td>
                </tr>
                <tr>
                  <th width="18%">矩阵别名</th>
                  <td>{{curMatrix.code}}</td>
                </tr>
                <tr>
                  <th width="18%">返回角色列</th>
                  <td>
                    <ht-select
                      :options="curRoleList"
                      :props="{key:'code',value:'name'}"
                      v-model="curMatrix.roleCode"
                      validate="required"
                      @change="roleCodeChange"
                    />
                  </td>
                </tr>
              </table>
            </div>
            <div style="margin-top: 5px;width:100%" v-if="curMatrix.params">
              <table class="table table-bordered" style="width: 100%;">
                <tr>
                  <th width="18%">条件名称</th>
                  <th width="12%">条件别名</th>
                  <th width="15%">参数类型</th>
                  <th>参数值
                      <el-tooltip placement="top">
                        <div slot="content">比较的是条件字段的id值，而不是text值</div>
                        <i class="el-icon-question" />
                      </el-tooltip>
                </th>
                </tr>
                <tr v-for="(param,$index) in curMatrix.params" :key="$index">
                  <td>{{param.name}}</td>
                  <td>{{param.code}}</td>
                  <td>{{param.paraType}}</td>
                  <td>
                    <ht-input
                      v-model="param.value"
                      size="mini"
                      :validate="{required:param.valueType!='2'}"
                      :disabled="param.valueType=='2'"
                      :readonly = "param.valueType == '0'"
                      placeholder
                    >
                      <el-select
                        v-model="param.valueType"
                        placeholder="请选择"
                        @change="param.value =''"
                        class="valueType_select"
                        size="mini"
                        style="width: 70px;"
                        slot="prepend"
                      >
                        <el-option label="变量" v-if="!parentParam.test" value="0"></el-option>
                        <el-option label="固定值" value="1"></el-option>
                        <el-option label="为空" value="2"></el-option>
                      </el-select>
                      <label @click="setCurParam(param)" slot="append" v-if="param.valueType=='0'">
                        <FlowVarSelector :defId="parentParam.defId" @node-click="varTreeOnConfirm" />
                      </label>
                    </ht-input>
                  </td>
                </tr>
              </table>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-dialog
        class="hr-script-select"
        width="60%"
        title="脚本执行结果"
        :visible.sync="resultDialogVisible"
        :close-on-click-modal="false"
        top="20vh"
        append-to-body
      >
        <el-input v-model="result" :disabled="true" type="textarea" :rows="20" />
      </el-dialog>
    </el-row>

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
import { Message } from "element-ui";
import utils from "@/hotent-ui-util.js";
import FlowVarSelector from "@/components/flow/FlowVarSelector.vue";
export default {
  name: "matrix-selector",
  components: {
    FlowVarSelector
  },
  data() {
    return {
      data: [], //单个节点按钮的配置信息
      dialogVisible: false, //是否显示设置节点按钮侧边栏
      curMatrix: { params: [], roleCode: "" },
      parentParam: {},
      curEditParam: {},
      pageResult: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      result: null,
      resultDialogVisible: false,
      curRoleList: []
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
        if (param.calc.code) {
          let this_ = this;
          req
            .get(
              window.context.uc +
                "/uc/matrix/v1/getByCode?code=" +
                param.calc.code
            )
            .then(response => {
              if (response.data) {
                this_.curMatrix = { ...response.data, ...param.calc };
                this.curRoleList = response.data.roleList;
              } else {
                this.curMatrix = { params: [], roleCode: "" };
              }
            });
        }
      } else {
        this.curMatrix = { params: [], roleCode: "" };
      }
      this.parentParam = param;
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      this.$http
        .post("${uc}/uc/matrix/v1/listDetail", param)
        .then(
          resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
          },
          error => {
            reject(error);
          }
        )
        .finally(() => cb());
    },
    setCurParam(param) {
      this.curEditParam = param;
    },
    //点击列表某一条数据时触发
    queryRowClick(row, column, event) {
      if (this.curMatrix && this.curMatrix.code == row.code) {
        return;
      }
      this.curMatrix = { params: [], roleCode: "" };
      if (row) {
        this.curMatrix.code = row.code;
        this.curMatrix.name = row.name;
        let params = [];

        for (let i = 0; i < row.condList.length; i++) {
          let ele = { ...row.condList[i] };
          let p = {
            valueType: "0",
            value: "",
            paraType: "java.lang.String",
            name: ele.name,
            code: ele.code
          };
          params.push(p);
        }

        this.curMatrix.params = params;
        this.curRoleList = row.roleList;
      } else {
        this.curMatrix.code = "";
        this.curMatrix.name = "";
        this.curMatrix.params = null;
      }
    },
    //保存按钮
    handleClose(isTest) {
      utils
        .validateForm(this, "matrixForm")
        .then(() => {
          if (!this.curMatrix.code) {
            this.$message.error("请选择【角色矩阵】");
            return;
          }
          let script = this.curMatrix.name + "(";
          let desc = "【" + this.curMatrix.code + "】参数:(";
          let pass = true;
          for (let i = 0, p; (p = this.curMatrix.params[i]); i++) {
            if (p.valueType == "1") {
              p.description = p.value;
            } else if (isTest) {
              this.$message.error("不支持使用变量测试");
              pass = false;
              return;
            }
            //去掉用户输入的双引号
            if(p.valueType=='1' && p.value && p.value.startsWith('"') && p.value.endsWith('"')){
              p.value = p.value.substring(1);
              p.value = p.value.substring(0,p.value.length-1);
              p.description = p.value;
            }
            let str = p.description || p.value;
            desc += p.name + ":" + str + " ";
            script += p.value + " ";
            if (i < this.curMatrix.params.length - 1) {
              script += ",";
              desc += ",";
            }
          }
          if (!pass) {
            return;
          }
          script += ")";

          desc += ")";
          desc += "，返回角色列【";
          desc += this.curMatrix.roleName;
          desc += "】";
          let params = this.curMatrix.params;
          let data = {
            code: this.curMatrix.code,
            name: this.curMatrix.name,
            roleCode: this.curMatrix.roleCode,
            roleName: this.curMatrix.roleName,
            params: params,
            script: script,
            desc: desc,
            description: desc
          };
          this.$emit("confirm", data);
          this.dialogVisible = false;
        })
        .catch(reason => {
          this.$message.warning("请正确填写表单信息");
        });
    },
    //处理固定值string类型参数的格式
    dealValue(p) {
      if (p.paraType == "java.lang.String" && p.valueType == "1") {
        try {
          if (!p.value) {
            p.value = '""';
          } else {
            p.value = '"' + eval(p.value) + '"';
          }
        } catch (e) {}
      } else if (
        (p.paraType == "java.lang.Boolean" ||
          p.paraType == "java.lang.boolean") &&
        p.valueType == "1"
      ) {
        if (!p.value) {
          p.value = "false";
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
    },
    roleCodeChange(val, data) {
      this.curMatrix.roleName = data.name;
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
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
