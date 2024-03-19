<template>
  <div name="online-form">
    <v-runtime-template :template="html"/>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import form from "@/api/form.js";
import { Message } from "element-ui";
import { Loading } from "element-ui";
import VRuntimeTemplate from "v-runtime-template";
import { Base64 } from "js-base64";
import $ from 'jquery';

export default {
  name: "templatePreview",
  data() {
    return {
      alias:'',
      html: "",
      templateInfo: {},
      tableData: { selectRows: [], querys: "" },
      dialogExportVisible: false,
      dialogSubVisible: false,
      exportData: { getType: "all", expField: [] },
      displayFields: [],
      exportSellection: [],
      tabs: [],
      ents: [],
      searchForm: {},
      queryForm:{
        queryData:"",
      },
      formType:false,
      labelPosition: 'left',
      incons:"el-icon-arrow-down",
      options:{
        fullscreen: true,
        lock: true,
      },
      rows:[],
      pagination:{page:1,pageSize:30,showTotal:true},
      total:0,
    };
  },
  components: {
    VRuntimeTemplate,
  },
  watch: {
    alias: function(newVal) {
      if (newVal) {
        this.init();
      }
    }
  },
  mounted() {
    this.alias = this.$route.params.alias;
  },
  methods: {
    // 根据当前alias初始化
    init() {
      const loading = this.$loading(this.options);
      let _me = this;
      form.getTemplateDataListForm(this.alias)
        .then(result => {
          loading.close();
        if (result.state) {
            _me.html = result.value;
            this.search();
        }
      });
      form.getBpmDataTemplateInfo(this.alias)
        .then(result => {
          loading.close();
          if (result.state) {
            _me.templateInfo = result.value;
            if (_me.templateInfo.displayField) {
              let displayField = JSON.parse( _me.templateInfo.displayField);
              for (var i = 0; i < displayField.length; i++) {
                if (displayField[i].type) {
                  _me.displayFields.push(displayField[i]);
                }
              }
            }
          }
      });
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.pagination.pageSize = size;
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.pagination.page = currentPage;
      this.search();
    },
    search(str) {
      const loading = this.$loading(this.options);
      let params={};
      if (str == "find") {
        this.pagination.page = 1;
      }
      //判断为合并查询还是分开查询
      if(this.formType){
          params = this.getQueryFilter();
      }else{
          //判断是否配置了合并查询
          if($(".search-query").length>0){
            params = this.getConditionQuery();
          }else{
            params = this.getQueryFilter();
          }
      }
       form.getBpmTemplateByPagination(params)
        .then(result => {
          loading.close();
          this.rows = result.rows;
          this.total = result.total;
          this.pagination.page = result.page;
          this.pagination.pageSize = result.pageSize;
      });
    },
    getQueryFilter() {
      let operationMap = this.getSearchItems();
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      let params = { templateId: this.templateInfo.id };
      params.pagination = pageBean;
      if ($.isEmptyObject(this.searchForm)) {
        return params;
      } else {
        for (var key in this.searchForm) {
          if (
            typeof this.searchForm[key] != "undefined" &&
            this.searchForm[key] != ""
          ) {
            if(this.searchForm[key] instanceof Array) {
              for ( var i = 0; i <this.searchForm[key].length; i++){
                querys.push({
                  property: key,
                  value: this.searchForm[key][i],
                  group: "main",
                  operation: operationMap[key],
                  relation: "AND"
                });
              }
            }else{
              querys.push({
                property: key,
                value: this.searchForm[key],
                group: "main",
                operation: operationMap[key],
                relation: "AND"
              });
            }
          }
        }
        queryFilter = { pageBean: this.pagination, querys };
        params.pagination = queryFilter;
        return params;
      }
    },
    getSearchItems() {
      let searchItems = $(".search-item");
      let operationMap = {};
      let operationType = {
        like: "LIKE",
        equal: "EQUAL",
        between: "BETWEEN",
        left_like: "LEFT_LIKE",
        right_like: "RIGHT_LIKE"
      };
      if (searchItems) {
        for (var i = 0; i < searchItems.length; i++) {
          var operation = "=";
          if (typeof $(searchItems[i]).attr("ht-query") != "undefined") {
            operation = $(searchItems[i]).attr("operation");
            operationMap[$(searchItems[i]).attr("ht-query")] =
              typeof operationType[operation] != "undefined"
                ? operationType[operation]
                : operation;
          } else if (
            typeof $(searchItems[i])
              .children()
              .attr("ht-query") != "undefined"
          ) {
            operation = $(searchItems[i])
              .children()
              .attr("operation");
            operationMap[
              $(searchItems[i])
                .children()
                .attr("ht-query")
            ] =
              typeof operationType[operation] != "undefined"
                ? operationType[operation]
                : operation;
          }
        }
      }
      return operationMap;
    },
    getConditionQuery() {
      let searchAll = $(".search-query");
      let values="";
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      let params = { templateId: this.templateInfo.id };
      params.pagination = pageBean;
      if (this.queryForm.queryData=="") {
        return params;
      }else {
        if (typeof $($(searchAll[0]).children()[0]).attr("ht-quick-search") != "undefined") {
          values = $($(searchAll[0]).children()[0]).attr("ht-quick-search");
          var arr=values.split(",");
          for(let value of arr) {  
            querys.push({
              property: value,
              value: this.queryForm.queryData,
              group: "main",
              operation: "LIKE",
              relation: "OR"
            });
          };
        }
      }
      queryFilter = { pageBean: this.pagination, querys };
      params.pagination = queryFilter;
      return params;
    },
    //打开高级检索
    advanced() {
      this.formType=!this.formType;
      if(this.formType){
        this.incons="el-icon-arrow-up";
        this.queryForm.queryData="";
      }else{
        this.incons="el-icon-arrow-down";
        this.searchForm = {};
      }
    },
    //回车查询
    searchEnterFun:function(e){
        var keyCode = window.event? e.keyCode:e.which;
        if(keyCode == 13){
            this.search();
        }
    },
    reset() {
      this.queryForm.queryData="";
      this.searchForm = {};
      this.search();
    },
    handleSelectionChange(val) {
      this.tableData.selectRows = val;
    },
    deleted() {
      if (
        this.tableData.selectRows == null ||
        this.tableData.selectRows.length == 0
      ) {
        this.$message.warning("请选择文件删除!");
        return false;
      }
      this.$confirm("此操作将删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var s = "";
          for (var i = 0; i < this.tableData.selectRows.length; i++) {
            s +=
              s + this.tableData.selectRows[i][this.templateInfo.pkField] + ",";
          }
          s = s.substring(0, s.length - 1);
          let data = { ids: s, boAlias: this.templateInfo.boDefAlias };
          this.$store.dispatch("form/deleteTemplateDataById", data).then(() => {
            this.search();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    del(id) {
      this.$confirm("此操作将删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = { ids: id, boAlias: this.templateInfo.boDefAlias };
          this.$store.dispatch("form/deleteTemplateDataById", data).then(() => {
            this.search();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    operating(templateId, id, action, defId, isStartFlow) {
      if (!templateId) {
        templateId = this.templateInfo.id;
        action = "add";
      }
      var url = "/statement/template/form/" + this.alias + "/" + action;
      if (id) {
        url = url + "?id=" + id + "&";
      } else {
        url += "?";
      }
      var startFlowStr = "startFlow=false";
      if (action == "add" && defId) {
        startFlowStr = "startFlow=true";
      } else if (id && isStartFlow === false && defId) {
        startFlowStr = "startFlow=true";
      }
      this.$router.push(url + startFlowStr);
    },
    startFlow(id) {
      let data = {
        defKey: this.templateInfo.defId,
        businessKey: id,
        boAlias: this.templateInfo.boDefAlias
      };
      let loadingInstance = Loading.service({ fullscreen: true }); //开始
      this.$store.dispatch("storeProcess/startForm", data).then(result => {
        loadingInstance.close(); // 结束
        if (result.state) {
          this.$message.success(result.message);
          this.search();
        } else {
          this.disabled = false;
          this.$message.error(result.message);
        }
      });
    },
    //点击导出按钮
    exports() {
      this.dialogExportVisible = true;
    },

    //显示子表对话框
    showSubList(refId) {
      this.getSubEntsByFormKey(refId);
    },

    //确定导出
    submitExport() {
      if (!this.exportData || this.exportData.expField.length < 1) {
        this.$message({
          type: "info",
          message: "请选择要导出的字段！"
        });
        return;
      }
      let expField = "";
      for (var i = 0; i < this.exportData.expField.length; i++) {
        if (i > 0) {
          expField += ",";
        }
        expField += this.exportData.expField[i].name;
      }
      expField = Base64.encode(expField);
      let data = {
        boAlias: this.templateInfo.alias,
        getType: this.exportData.getType,
        expField: expField,
        filterKey: ""
      };
      data.query = this.getQueryFilter().pagination;
      let loadingInstance = Loading.service({ fullscreen: true }); //开始
      this.$store.dispatch("form/templateExport", data).then(() => {
        loadingInstance.close(); // 结束
        this.dialogExportVisible = false;
      });
    },

    //取消导出
    exportCancel() {
      this.dialogExportVisible = false;
      this.exportData.expField = [];
    },

    //取消子表对话框
    subCancel() {
      this.dialogSubVisible = false;
    },

    handleExportSelectionChange(val) {
      this.exportData.expField = [];
      if (val) {
        this.exportData.expField = val;
      }
    },

    //全选
    handleExportSelectAll() {
      this.exportData.expField = this.displayFields;
    },

    //排序
    sort(index, type) {
      if ("up" == type) {
        if (index === 0) {
          this.$message({
            message: "已经是列表中第一位",
            type: "warning"
          });
        } else {
          let temp = this.displayFields[index - 1];
          this.$set(this.displayFields, index - 1, this.displayFields[index]);
          this.$set(this.displayFields, index, temp);
        }
      } else {
        if (index === this.displayFields.length - 1) {
          this.$message({
            message: "已经是列表中最后一位",
            type: "warning"
          });
        } else {
          this.isTransition = true;
          let i = this.displayFields[index + 1];
          this.$set(this.displayFields, index + 1, this.displayFields[index]);
          this.$set(this.displayFields, index, i);
        }
      }
    },

    getSubEntsByFormKey(refId) {
      let _me = this;
      _me.tabs = [];
      if (!_me.ents || _me.ents.length < 1) {
        this.$store
          .dispatch("form/getSubEntsByFormKey", this.templateInfo.alias)
          .then(ents => {
            _me.ents = ents;
            this.getSubData(_me, refId);
          });
      } else {
        this.getSubData(_me, refId);
      }
    },

    getSubData(_me, refId) {
      _me.tabs = [];
      let ents = _me.ents;
      if (ents && ents.length > 0) {
        for (var i = 0; i < ents.length; i++) {
          var attributeList = ents[i].attributeList;
          var tab = {
            name: ents[i].tableName,
            title: ents[i].comment,
            attributeList: attributeList,
            comment: ents[i].comment
          };
          this.$store
            .dispatch("form/getSubData", { name: ents[i].name, refId: refId })
            .then(data => {
              if (data && data.length > 0) {
                tab.dataList = data;
              } else {
                tab.dataList = [];
              }
              _me.tabs.push(tab);
              this.dialogSubVisible = true;
            });
        }
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
>>> th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

>>> tr.todo-row {
  font-size: 13px;
  color: #000;
}

.el-container {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.i {
  margin-right: 4px;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject:hover {
  color: #2761ff;
}

>>> .el-dialog__body {
  padding: 15px 10px;
}

>>> .el-checkbox {
  margin-left: 15px;
}

>>> .el-radio {
  margin-left: 15px;
}

>>> .el-button{
  margin-left: 0px;
}
</style>
