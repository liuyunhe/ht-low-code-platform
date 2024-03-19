<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="dataList"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button size="small" @click="$router.go(-1)" icon="el-icon-d-arrow-left">返回</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button size="small" @click="showDialog('')" icon="el-icon-plus" v-if="isIssure">添加</el-button>
        <!-- <el-button size="small" @click="save()" type="primary" icon="icon-f-right">保存</el-button> -->
        <ht-delete-button
          :url="'${uc}/uc/matrix/v1/data/remove/'+matrix.id"
          :htTable="$refs.htTable"
          pk="ID_"
        >删除</ht-delete-button>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          v-for="(item,$index) in colFields"
          :key="$index"
          :prop="item.field"
          :label="item.comment"
          :hidden="item.ftype == 'id' ||item.ftype == 'ck'"
          :show-overflow-tooltip="true"
        >
        <template slot="header" >
          <span><i class="icon-account" style="margin-right:4px;" v-if="item.ftype=='ro'"></i>{{item.comment}}</span>
        </template>
          <template v-slot="{row}">
            <span v-if="item.colDef.colType === 1">{{row[item.field]}}</span>
            <span v-if="item.colDef.colType === 2">{{parseUser(row[item.field])}}</span>
          </template>
        </ht-table-column>
        <ht-table-column label="操作" width="100">
          <template v-slot="{row}">
            <el-button type="primary" size="mini" @click="showDialog(row.ID_)">修 改</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog
      width="60%"
      top="8vh"
      :title="matrix.name"
      class="cd-column__dialog"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :inline="true" v-form data-vv-scope="matrixDataForm">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span style="font-size:16px;">条件字段</span>
          </div>
          <span v-for="(item) in colFields" :key="item.field">
            <ht-form-item :label="item.comment" v-if="item.ftype == 'cv'">
              <ht-select
                v-if="item.colDef.ctrlType === 'select'"
                clearable
                v-model="formData[item.field]"
                :options="options[item.colDef.queryAlias]"
                :props="{ key: 'value', value: 'value' }"
                class="ht-select"
                @focus="handleFocus(item.colDef,$event)"
                @change="handleChange"
                @clear="clearCond(item.colDef)"
              />
              <ht-input
                v-model="formData[item.field]"
                readonly
                v-if="item.colDef.ctrlType === 'dialog'"
                placeholder="请选择数据"
                class="ht-select"
              >
                <i
                  slot="suffix"
                  class="el-input__icon el-icon-circle-close"
                  @click="clearCond(item.colDef)"
                ></i>
                <el-button
                  slot="append"
                  icon="icon-archives"
                  @click="showCustomDialog(item.colDef)"
                ></el-button>
              </ht-input>
            </ht-form-item>
          </span>
        </el-card>
        <div style="margin-top:10px;"></div>
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span style="font-size:16px;">角色字段</span>
          </div>
          <span v-for="(item,$index) in colFields" :key="$index">
            <ht-form-item :label="item.comment" v-if="item.ftype == 'ro'">
              <userSelector
                v-model="formData[item.field]"
                :single="item.colDef.selectType ===1"
                v-if="item.colDef.colType === 2"
              />
            </ht-form-item>
          </span>
        </el-card>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="save">{{$t("eip.common.save")}}</el-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </el-dialog>

    <custom-dialog-show
      :title="titlePreview"
      ref="customDialogShow"
      :custom-dialog="customDialogPreview"
      :alias="aliasPreview"
      @return-all-data="handleSavePreview"
    ></custom-dialog-show>
    <!-- 自定义对话框树形预览 参数动态传入的--->
    <custom-dialog-show-tree
      :title="titlePreview"
      ref="customDialogShowTree"
      :custom-dialog="customDialogPreview"
      :alias="aliasPreview"
    ></custom-dialog-show-tree>
    <!-- 自定义对话框树形预览  参数没有动态传入的-->
    <eip-tree-dialog
      ref="eipTreeDialog"
      @return-all-data="handleSavePreview"
      :custom-dialog="customDialogPreview"
      :alias="aliasPreview"
      :ispreview="false"
    ></eip-tree-dialog>
  </div>
</template>
<script>
const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
const userSelector = () => import("@/components/selector/UserSelector.vue");
const customDialogShow = () =>
  import("@/views/form/customDialog/CustomDialogShow.vue");
const customDialogShowTree = () =>
  import("@/views/form/customDialog/CustomDialogShowTree.vue");
const eipTreeDialog = () =>
  import("@/views/form/customDialog/EipTreeDialog.vue");
import req from "@/request.js";
import htUtil from "@/hotent-ui-util.js";
import CustomQuery from "@/views/form/customquery/CustomQuery.js";
import form from "@/api/form.js";
export default {
  components: {
    eipUserSelector,
    customDialogShow,
    userSelector,
    customDialogShowTree,
    eipTreeDialog
  },
  data() {
    return {
      dialogVisible: false,
      dataList: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      matrix: {},
      colFields: [],
      formData: {},
      //自定义对话框
      aliasPreview: "",
      customDialogPreview: {},
      titlePreview: "",
      //关联查询的返回数据集合
      options: {},
      isIssure: false,
      dataSources: "mysql"
    };
  },
  mounted() {
    this.getSQLType();
    this.$validator = this.$root.$validator;
  },
  methods: {
    showDialog(id) {
      this.$http
        .get(
          "${uc}/uc/matrix/v1/data/getOneData?pk=" +
            `${id}` +
            "&matrixId=" +
            this.matrix.id
        )
        .then(
          resp => {
            this.formData = resp.data.data;
            if (this.formData) {
              for (let key in this.formData) {
                if (key.indexOf("ROLE_") == 0 && this.formData[key]) {
                  this.formData[key] = JSON.parse(this.formData[key]);
                }
              }
            }
            this.dialogVisible = true;
          },
          error => {}
        );
      this.getSelectOptions();
    },
    beforeCloseDialog() {
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      let id = this.$route.params.matrixId;
      let this_ = this;
      this.$http
        .post("${uc}/uc/matrix/v1/data/list/" + id, param)
        .then(
          resp => {
            let response = resp.data;
            this_.matrix = response.matrix;
            this_.isIssure = true;
            this_.colFields = response.colFields;
            /*if (this_.dataSources === "oracle" ){
              for (let i = 0; i < this_.colFields.length; i++) {
                const colFiled = this_.colFields[i];
                colFiled.field = colFiled.field.toUpperCase();
              }
            }else if ( this_.dataSources === "postgresql"){
              for (let i = 0; i < this_.colFields.length; i++) {
                const colFiled = this_.colFields[i];
                colFiled.field = colFiled.field.toLowerCase();
              }
            }*/
            this_.dataList = response.data.rows;
            this_.pageResult = {
              page: response.data.page,
              pageSize: response.data.pageSize,
              total: response.data.total
            };
          },
          error => {
          }
        )
        .finally(() => cb && cb());
    },
    save() {
      //条件字段至少填一个
      let hasCond = false;
      for (var key in this.formData) {
        if (key.indexOf("CONDK_") === 0 && this.formData[key]) {
          hasCond = true;
          break;
        }
      }
      if (!hasCond) {
        this.$message.warning("条件字段至少填一个");
        return;
      }
      this.$http
        .post(
          "${uc}/uc/matrix/v1/data/save/" + this.matrix.id,
          JSON.stringify(this.formData)
        )
        .then(
          resp => {
            if (resp.data.state) {
              this.$message.success(resp.data.message);
              this.beforeCloseDialog();
              this.$refs.htTable.load();
            } else {
              this.$message.error(resp.data.message);
            }
          },
          error => {}
        )
        .finally(() => {});
    },
    parseUser(val) {
      let fullnames = [];
      if (val && val != "null") {
        let list = JSON.parse(val);
        list.forEach(item => {
          fullnames.push(item.fullname);
        });
      }
      return fullnames.join(",");
    },
    showCustomDialog(colDef) {
      this.currColDef = colDef;
      this.dialogPreview(colDef.queryAlias);
    },
    //预览
    dialogPreview(alias) {
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
        //这里强制给对话框改为单选
        customDialog.selectNum = 1;
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
    handleSavePreview(list) {
      if (!list) {
        return;
      }
      if (list.length > 1) {
        this.$message.warning("请只选择一项！");
        return;
      }
      let data = list[0];
      let code = this.currColDef.code;
      let bindKey = this.currColDef.bindKey;
      let bindValue = this.currColDef.bindValue;
      let v1 = data[bindKey] || data[bindKey.toUpperCase()] || data[bindKey.toLowerCase()],
        v2 = data[bindValue] || data[bindValue.toUpperCase()] || data[bindValue.toLowerCase()];
      this.$set(this.formData, "CONDK_" + code, v1);
      this.$set(this.formData, "CONDV_" + code, v2);
    },
    getSelectOptions() {
      for (let i = 0; i < this.matrix.condList.length; i++) {
        const ele = this.matrix.condList[i];
        if (ele.ctrlType === "select") {
          //获取关联查询基本信息
          !this.options[ele.queryAlias] &&
            this.doCustomQuery(ele,ele.queryAlias);
        }
      }
    },
    doCustomQuery(colDef, alias){
      CustomQuery.load(alias, null)
        .then(data => {
          //判断是否有关联查询数据返回
          if (data.length > 0) {
            let bindKey = colDef.bindKey;
            let bindValue = colDef.bindValue;
            let option = [];
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              option.push({ key: item[bindKey], value: item[bindValue] });
            }

            this.$set(this.options, alias, option);
          }
        })
        .finally();
    },
    handleFocus(data, event) {
      this.currColDef = data;
    },
    handleChange(value, data) {
      if (data) {
        let code = this.currColDef.code;
        this.$set(this.formData, "CONDK_" + code, data.key);
      }
    },
    clearCond(colDef) {
      this.currColDef = colDef;
      let code = this.currColDef.code;
      this.$set(this.formData, "CONDK_" + code, "");
      this.$set(this.formData, "CONDV_" + code, "");
    },
    getSQLType() {
      // 获取数据库类型
      let this_ = this;
      form.getDataSource().then(resp => {
        this_.dataSources = resp.data[resp.data.length-1].dbType;
        this_.$refs.htTable.load();
      })
    }
  }
};
</script>
<style scoped>
.ht-select >>> .el-select.el-select--small {
  width: 350px;
}
.ht-select >>> .el-input.el-input--small {
  width: 350px;
}
.el-icon-circle-close {
  cursor: pointer;
}
.el-icon-circle-close:hover {
  transform: scale(1.5);
  -moz-transform: scale(1.5);
  -webkit-transform: scale(1.5);
  -o-transform: scale(1.5);
}
.ht-table-panel >>> .toolbar-panel {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>

