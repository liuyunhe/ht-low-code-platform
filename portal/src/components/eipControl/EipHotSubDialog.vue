<template>
  <div class="inputs" :style="{display:'inline-block',float:'right'}">
    <el-button type="text" size="mini" :style="{padding:'0px 5px'}" @click="showDialog">
      <i
        style="line-height: 10px"
        :class="this.custdialog.icon?'el-input__icon '+this.custdialog.icon:'el-input__icon icon-department'"
        :style="{fontSize:'13px'}"
      ></i>
      {{this.custdialog.name}}
    </el-button>

    <el-dialog
      :visible.sync="customDialogShowList"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      append-to-body
      :width="this.customDialog.width+'px'"
    >
      <el-container :style="this.style" style="overflow:auto;">
        <el-container>
          <el-header class="middle-header" v-if="querysShow">
            <el-input
              size="small"
              style="width:380px;padding: 10px 0"
              clearable
              :placeholder="this.comment"
              prefix-icon="el-icon-search"
              v-model="queryParam"
            ></el-input>
            <el-button
              style="margin-left: 20px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="search()"
            >查询</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
          </el-header>
          <el-main style="padding:0">
            <el-table
              :data="dialogData"
              ref="orgTable"
              stripe
              border
              height="485"
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              @select="onTableSelect"
              class="org-table"
              size="medium"
              style="width: 100%"
            >
              <el-table-column
                type="selection"
                align="center"
                width="45"
                v-if="this.customDialog.selectNum != 1"
              ></el-table-column>
              <el-table-column align="center" width="50" v-if="this.customDialog.selectNum === 1">
                <template slot-scope="scope">
                  <!-- class="textRadio" -->
                  <el-radio
                    @selection-change="orgTableSelection"
                    :label="scope.$index"
                    v-model="undefineda"
                    class="textRadio"
                  >&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
              <el-table-column
                v-for="field in displayfield"
                :key="field.field"
                :prop="field.field"
                :label="field.comment"
                style="width: 100%"
              ></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <el-row
              type="flex"
              justify="end"
              style="padding-top:15px;"
              v-if="this.customDialog.needPage"
            >
              <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="dialogConfirm">确认</el-button>
        <el-button size="small" @click="dialogCancel">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="customDialogShowTree"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      :width="this.customDialog.width+'px'"
    >
      <el-container :style="this.style" style="overflow:auto;">
        <el-tree
          ref="tree"
          :data="props1"
          :props="defaultProps"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="treeClick"
          @check-change="getChecked"
          :show-checkbox="this.customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="false"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="dialogTreeConfirm">确认</el-button>
        <el-button size="small" @click="dialogCancelTree">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/utils.js";
import { Message } from "element-ui";

export default {
  name: "ht-hot-subDialog",
  props: ["validate", "value", "btnName", "atter", "single", "custdialog"],
  data() {
    return {
      customDialogShowList: false,
      customDialogShowTree: false,
      selectOrgProps: {
        label: "btnName"
      },
      style: "", //对话框宽高
      selectOrgs: null,
      inputSuffixHeight: 30,
      config: null,
      updating: false,
      displayfield: [], //显示字段
      customDialog: {}, //
      comment: "",
      queryParam: "",
      props1: [],
      showData: [],
      checkBoxDataAll: [], //选中对象的集合
      defaultProps: {
        children: "childrens",
        label: "label"
      },
      propsData: [],
      querysShow: false, //是否显示搜索框
      undefineda: "",
      opMap:{'EQ':'EQUAL','GE':'GREAT_EQUAL','GT':'GREAT','LT':'LESS','LE':'LESS_EQUAL','IN':'IN','LK':'LIKE','LFK':'LEFT_LIKE','RHK':'RIGHT_LIKE'},
    };
  },
  computed: mapState({
    pagination: state => state.dialog.pagination,
    total: state => state.dialog.total,
    dialogData: state => {
      return state.dialog.rows;
    },
    inputVal: function() {
      if (!this.value) {
        return null;
      } else {
        let nameAry = this.value.split(",");
        if (this.value.indexOf("||") > 0) {
          nameAry = this.value.split("||")[0].split(",");
          this.showData = JSON.parse(this.value.split("||")[1]);
        }
        let idAry = null;
        let accountAry = null;
        let result = [];
        nameAry.forEach((m, i) => {
          let n = { value: m };
          result.push(n);
        });
        return result;
      }
    },
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
      return this.name ? this.name : utils.getName();
    },
    // 是否有回填设置
    bindSet: function() {
      return this.selectorconfig ? this.selectorconfig.bind : null;
    },
    getPlaceholder: function() {
      return this.custdialog.name;
    }
  }),
  mounted() {},
  created() {
    this.$validator = this.$root.$validator;
  },
  watch: {
    customDialogShowTree: function(newVal) {
      if (newVal) {
        this.checkBoxDataAll = [];
        if (this.inputVal && this.inputVal.constructor == Array) {
          this.selectOrgs = [...this.inputVal];
        } else {
          this.selectOrgs = [];
        }
      }
    },
    customDialogShowList: function(newVal) {
      if (newVal) {
        this.checkBoxDataAll = [];
        if (this.inputVal && this.inputVal.constructor == Array) {
          this.selectOrgs = [...this.inputVal];
        } else {
          this.selectOrgs = [];
        }
      }
    }
  },
  methods: {
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("dialog/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      const this_ = this;
      if (this.selectOrgs != undefined && this.selectOrgs.length > 0) {
        this.selectOrgs.forEach(row => {
          let res = this_.indexArray(this_.checkBoxDataAll, row);
          if (res == -1) {
            this_.checkBoxDataAll.push(row);
          }
        });
      }
      this_.selectOrgs = this_.checkBoxDataAll;
      //点击第几页
      this.$store.dispatch("dialog/setPaginationPageNum", currentPage);
      this.search();
    },
    checkList() {
      const this_ = this;
      setTimeout(() => {
        if (this_.selectOrgs != undefined && this_.selectOrgs.length > 0) {
          if (this_.selectOrgs == undefined || this_.selectOrgs.length == 0) {
            this_.selectOrgs = this_.checkBoxDataAll;
          }
          if (this_.selectOrgs != undefined && this_.selectOrgs.length > 0) {
            this_.selectOrgs.forEach(row => {
              let res = this_.indexArray(this_.dialogData, row);
              if (res != -1) {
                this_.$refs.orgTable.toggleRowSelection(
                  this_.dialogData[res],
                  true
                );
              }
            });
          }
        } else {
          if (this_.showData != undefined && this_.showData.length > 0) {
            this_.showData.forEach(row => {
              let res = this_.indexArray(this_.dialogData, row);
              if (res != -1) {
                this_.$refs.orgTable.toggleRowSelection(
                  this_.dialogData[res],
                  true
                );
              }
            });
          }
        }
      }, 250);
    },
    showDialog(item) {
      let selectNum = -1;
      let subRelationObj = $(item.target).parents("[sub-relation]");
      if (
        subRelationObj.length > 0 &&
        $(subRelationObj[0]).attr("sub-relation") == "onetoone"
      ) {
        selectNum = 1;
      }
      var alias = this.custdialog.custDialog.alias;
      this.$store.dispatch("dialog/setDialogData", []);
      this.$store.dispatch("form/getByAlias", alias).then(customDialog => {
        if (!customDialog || !customDialog.alias) {
          Message.error("对话框别名【" + alias + "】不存在！");
          return;
        }
        customDialog.selectNum = selectNum;
        var list = JSON.parse(customDialog.conditionfield);
        var param = {};
        list.forEach(ele => {
          if (ele.defaultType == "4") {
            param[ele.field] = ele.comment;
          }
        });
        this.style = "height:" + customDialog.height + "px";

        if (JSON.stringify(param) == "{}") {
          //没有动态传入的字段
          if (customDialog.style == 0) {
            this.customDialogShow({ alias: alias, customDialog: customDialog });
          } else {
            this.customDialogTreeShow({
              alias: alias,
              customDialog: customDialog
            });
          }
        } else {
         
        }
      });
    },
    indexArray(array, item) {
      var id = "";
      if (typeof item == "object") {
        id = item.id;
      } else {
        id = item;
      }

      for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
          return i;
        }
      }
      return -1;
    },
    onTableSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1;
      if (!selected) {
        let res = this.indexArray(this.checkBoxDataAll, row);
        this.checkBoxDataAll.splice(res, 1);
        if (this.checkBoxDataAll.length == 0) {
          this.selectOrgs = [];
        }
      }
    },
    orgRowClick(row, column, event) {
      if (this.customDialog.selectNum === 1) {
        $(event.currentTarget.children[0].children[0].children[0]).trigger(
          "click"
        );
        this.selectOrgs = [row];
      }
      this.$refs.orgTable.toggleRowSelection(row);
    },
    orgTableSelection(selection) {
      if (
        this.customDialog.selectNum != 1 &&
        selection &&
        selection.length > 0
      ) {
        this.selectOrgs = selection;
      }
    },
    dialogConfirm() {
      this.$store.dispatch("dialog/setDialogData", []);
      this.customDialogShowList = false;
      this.calacInputSuffixHeight();
      this.syncInputValue();
    }, //重置
    reset() {
      this.queryParam = "";
      this.search();
    },
    search() {
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      let _this = this;
      if (this.queryParam != "") {
        var conditionfield = JSON.parse(this.customDialog.conditionfield);
        conditionfield.forEach(item => {
          if(item.defaultType == '1'){
            querys.push({
              property: item.field,
              value: this.queryParam,
              group: "main",
              operation: _this.opMap[item.condition],
              relation: "OR"
            });
          } 
        });
      }
      //处理参数传入
      const conditions = this.custdialog.custDialog.conditions;
      const formInst = utils.getOnlineFormInstance(this);
      if(conditions && conditions.length>0 && formInst && formInst['data']){
        const curData = formInst['data'];
        conditions.forEach(item =>{
          if(item.defaultType == "3" && item.bind){
            let obj = {};
            item.field = item.field;
            const bindArray = item.bind.split('.');
            if(bindArray.length==3){
              const targetValue = curData[bindArray[1]][bindArray[2]];
              querys.push({
                property: item.field,
                value: targetValue,
                group: "type3",
                operation: _this.opMap[item.condition],
                relation: "AND"
              });
            }
          }
        });
      }
      if (querys.length > 0) {
        queryFilter = { pageBean: this.pagination, querys };
        this.customDialog.pageBean = queryFilter;
        this.$store.dispatch("dialog/getlistJson", this.customDialog);
      } else {
        this.customDialog.pageBean = pageBean;
        this.$store.dispatch("dialog/getlistJson", this.customDialog);
      }
      this.checkList();
    },
    searchTree(requestParams) {
      if (this.props1.length < 1) {
        this.$store.dispatch("dialog/getTreeData", requestParams).then(res => {
          if (this.customDialog.displayfield && this.customDialog.resultfield) {
            var displayfield = JSON.parse(this.customDialog.displayfield);
            this.defaultProps.label = displayfield.displayName;
            var resultfield = JSON.parse(this.customDialog.resultfield);
            this.props1 = this.toTreeData(
              res,
              displayfield.id,
              displayfield.pid,
              displayfield.displayName,
              displayfield.pvalue ? displayfield.pvalue : "0",
              resultfield
            );
          }
        });
      }
    },
    // 同步选择结果
    syncInputValue() {
      var returnStr = JSON.parse(this.customDialog.resultfield);
      //拿到返回的字段
      var field = new Array([returnStr.length]);
      var comment = new Array([returnStr.length]);
      var str = [];
      var ids = [];
      for (var i = 0; i < returnStr.length; i++) {
        field[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].field.toUpperCase()
            : returnStr[i].field;
        comment[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].comment.toUpperCase()
            : returnStr[i].comment;
      }
      const this_ = this;
      this.selectOrgs.forEach(row => {
        if (this_.checkBoxDataAll || this_.checkBoxDataAll.length < 1) {
          this_.checkBoxDataAll.push(row);
        } else if (
          JSON.stringify(this_.indexArray).indexOf(JSON.stringify(row)) == -1
        ) {
          this_.checkBoxDataAll.push(row);
        }
      });
      var s = this.checkBoxDataAll;

      if (this.customDialog.selectNum === 1) {
        var temp = "";
        for (var i = 0; i < comment.length; i++) {
          const va = s[0][field[i]];
          va = typeof(va)=='undefined'?'':va;
          temp += '"' + comment[i] + '":"' + va + '",';
        }
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(utils.parseToJson(temp));
        ids.push(s[0].id);
      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = "";
          for (var j = 0; j < comment.length; j++) {
            const va = s[i][field[j]];
            va = typeof(va)=='undefined'?'':va;
            temp += '"' + comment[j] + '":"' + va + '",';
          }
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(utils.parseToJson(temp));
          ids.push(s[i].id);
        }
      }
      const returnData = str;
      const _this = this;
      const formInst = utils.getOnlineFormInstance(this);
      let hotTableTarget = '';
      returnData.forEach(row => {
        var targetArray = null;
        var subLineData = {};
        this.custdialog.custDialog.mappingConf.forEach(con => {
          if (con.target[0]) {
            hotTableTarget = con.target[0];
            targetArray = con.target[0].split(".");
            var from = "";
            if (_this.customDialog.dsType == "restful") {
              from = con.from;
            } else {
              from = con.from.toUpperCase();
            }
            subLineData[targetArray[targetArray.length - 1]] = row[from];
          }
        });
        if (targetArray) {
          var subBo = formInst["data"][targetArray[0]][targetArray[1]];
          if (_this.customDialog.selectNum == 1 && subBo.length > 0) {
            subBo.shift();
          }
          //子表回填 自动把之前添加的字段且为空的也回填
          // if (formInst["data"][targetArray[0]][targetArray[1]]) {
          //   formInst["data"][targetArray[0]][targetArray[1]].forEach(obj => {
          //     for (let item in obj) {
          //       if (!obj[item]) {
          //         for (let subData in subLineData) {
          //           obj[item] = subLineData[item];
          //         }
          //       }
          //     }
          //   });
          // }
          subBo.push(subLineData);
          //把子表回填值存在控件的父组件中
          formInst.subBackfill.set(
            "data." + targetArray[0] + "." + targetArray[1],
            subLineData
          );
        }
      });
      if(hotTableTarget){
        formInst.hotTableFillback = hotTableTarget+'_timestamp_'+Date.parse(new Date());
      }
    },
    dialogCancel() {
      this.$store.dispatch("dialog/setDialogData", []);
      this.customDialogShowList = false;
      if (this.selectOrgs) {
        this.selectOrgs.forEach(item => {
          if (!this.inputVal || this.inputVal.indexOf(item) === -1) {
            this.$refs.orgTable.toggleRowSelection(item, false);
          } else {
            this.$refs.orgTable.toggleRowSelection(item, true);
          }
        });
      }
      // this.selectOrgs = this.inputVal ? this.inputVal : null;
    },
    dialogTreeConfirm() {
      this.$store.dispatch("dialog/setDialogData", []);
      var returnStr = JSON.parse(this.customDialog.resultfield);
      var field = new Array([returnStr.length]);
      var comment = new Array([returnStr.length]);
      var str = [];
      for (var i = 0; i < returnStr.length; i++) {
        field[i] = returnStr[i].field;
        comment[i] = returnStr[i].comment;
      }
      if (this.customDialog.selectNum === 1) {
        var nodes = this.propsData[0];
        var temp = "";
        for (var i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
        }
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(utils.parseToJson(temp));
      } else {
        var nodes = this.propsData;
        nodes.forEach((item, k) => {
          var temp = "";
          for (var i = 0; i < comment.length; i++) {
            temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
            temp += '"' + comment[i] + '":"' + nodes[k][field[i]] + '",';
          }
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(utils.parseToJson(temp));
        });
      }
      const returnData = str;
      const _this = this;
      const formInst = utils.getOnlineFormInstance(this);
      returnData.forEach(row => {
        var targetArray = null;
        var subLineData = {};
        this.custdialog.custDialog.mappingConf.forEach(con => {
          targetArray = con.target[0].split(".");
          var from = "";
          if (_this.customDialog.dsType == "restful") {
            from = con.from;
          } else {
            from = con.from.toUpperCase();
          }
          subLineData[targetArray[targetArray.length - 1]] = row[from];
        });
        if (targetArray) {
          var subBo = formInst["data"][targetArray[0]][targetArray[1]];
          if (_this.customDialog.selectNum == 1 && subBo.length > 0) {
            subBo.shift();
          }
          subBo.push(subLineData);
        }
      });
      //this.$emit("input", JSON.stringify(str));
      this.customDialogShowTree = false;
    },
    dialogCancelTree() {
      this.$store.dispatch("dialog/setDialogData", []);
      this.customDialogShowTree = false;
    },
    getChecked(data, checked, indeterminate) {
      if (this.customDialog.selectNum === 1) {
        this.propsData = [];
        this.propsData.push(data);
      } else {
        this.propsData = this.$refs.tree.getCheckedNodes();
      }
    },
    treeClick(data, n, i) {
      if (this.customDialog.selectNum === 1) {
        this.propsData = [];
        this.propsData.push(data);
      }
    },
    clearAllSelectOrgs() {
      this.selectOrgs = null;
      this.$refs.orgTable.clearSelection();
    },
    removeSelectOrgs() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      ary.forEach(item => {
        this.selectOrgs.remove(item);
        this.$refs.orgTable.toggleRowSelection(item, false);
      });
    },
    removeSelectOrg(item) {
      if (this.customDialog.selectNum === 1) {
        this.$emit("input", "");
      } else {
        this.inputVal.splice(item, 1);
        this.showData.splice(item, 1);
        this.calacInputSuffixHeight();
        let value = "";
        this.inputVal.forEach(val => {
          value += val.value + ",";
        });
        if (value.length > 0) {
          value = value.substring(0, value.length - 1);
        }
        if (value != "") {
          value = value + "||" + JSON.stringify(this.showData);
        }
        this.$emit("input", value);
      }
    },
    calacInputSuffixHeight() {
      setTimeout(() => {
        if (!this.$refs.tagSpans) return;
        if (this.$refs.tagSpans.offsetHeight) {
          this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5;
        } else {
          this.inputSuffixHeight = 30;
        }
        // 触发验证
        this.$validator.validate();
      }, 0);
    },
    customDialogShow(pageParam) {
      this.customDialogShowList = true;
      this.customDialog = pageParam.customDialog;
      this.customDialog.queryUrl =
        this.customDialog.dsType == "dataSource"
          ? "${form}/form/customDialog/v1/getListData?alias=" +
            this.customDialog.alias +
            "&mapParam=" +
            (this.customDialog.mapParam ? this.customDialog.mapParam : "")
          : this.customDialog.url;

      var conditionfield = JSON.parse(this.customDialog.conditionfield);
      if (!this.comment && conditionfield.length > 0) {
        conditionfield.forEach(item => {
          if (item.controllerType == 1 && item.dbType == "varchar") {
            this.comment += item.comment + ",";
          }
        });
        if (this.comment) {
          this.querysShow = true;
          this.comment =
            "通过" +
            this.comment.substring(0, this.comment.length - 1) +
            "查询";
        }
      }
      if (this.dialogData.length < 1) {
        this.search();
        this.displayfield = JSON.parse(pageParam.customDialog.displayfield);
        if (this.customDialog.dsType == "dataSource") {
          for (var i = 0; i < this.displayfield.length; i++) {
            this.displayfield[i].field = this.displayfield[
              i
            ].field.toUpperCase();
          }
        }
      }
    },
    customDialogTreeShow(pageParam) {
      this.customDialog = pageParam.customDialog;
      var customDialog = this.customDialog;
      var mapParam = "";
      if (pageParam.param != undefined) {
        mapParam = JSON.stringify(pageParam.param);
        mapParam = mapParam.substring(1, mapParam.length - 1);
      }
      var requestType =
        customDialog.dsType == "dataSource"
          ? "GET"
          : customDialog.requestType
          ? customDialog.requestType
          : "POST";
      var url =
        "${form}/form/customDialog/v1/getTreeData?alias=" +
        pageParam.alias +
        "&mapParam=" +
        mapParam;
      var paramsObj = {};
      if (customDialog.dsType != "dataSource") {
        url = customDialog.url;
        var templatePa = customDialog.dataParam;
        if (customDialog.conditionfield) {
          var conditions = JSON.parse(customDialog.conditionfield);
          for (var i = 0; i < conditions.length; i++) {
            var con = conditions[i];
            if (requestType == "POST") {
              if (templatePa) {
                templatePa = templatePa.replace(
                  new RegExp("\\{" + con.field + "\\}", "g"),
                  con.defaultValue
                );
              } else {
                paramsObj[con.field] = con.defaultValue;
              }
            } else {
              var ljChar = url.indexOf("?") == -1 ? "?" : "&";
              url = url + ljChar + con.field + "=" + con.defaultValue;
            }
          }
          if (templatePa) {
            paramsObj = JSON.parse(templatePa);
          }
        }
      }
      var requestParams = {};
      requestParams.requestType = requestType;
      requestParams.url = url;
      requestParams.paramsObj = paramsObj;
      this.searchTree(requestParams);
      this.customDialogShowTree = true;
    },
    toTreeData(data, id, pid, name, pvalue, returnStr) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      var ztree = translateDataToTree(data, pid, id, name);
      function translateDataToTree(data, pid, id, name) {
        let parents = data.filter(
          value =>
            value[id] == value[pid] ||
            value[pid] == null ||
            value[pid] == null ||
            value[pid] == 0
        );
        parents.label = parents[name];
        let childrens = data.filter(
          value =>
            value[pid] !== "undefined" &&
            value[pid] != null &&
            value[id] != value[pid]
        );
        let translator = (parents, childrens) => {
          parents.forEach(parent => {
            childrens.forEach((current, index) => {
              if (current[pid] === parent[id]) {
                let temp = JSON.parse(JSON.stringify(childrens));
                temp.splice(index, 1);
                translator([current], temp);
                current.label = current[name];
                typeof parent.childrens !== "undefined"
                  ? parent.childrens.push(current)
                  : (parent.childrens = [current]);
              }
            });
          });
        };
        translator(parents, childrens);

        return parents;
      }
      return ztree;
    }
  }
};
</script>
<style lang="stylus" scoped>
.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 440px;
  margin-top: 10px;
}

.middle-header {
  height: 52px !important;
}

.org-table {
  width: 100%;
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}

.select-tree-div {
  height: 500px;
  overflow-y: auto;
}

>>> .el-dialog {
  margin-top: 8vh !important;
}

>>> .el-dialog__body {
  padding: 0;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #F5F7FA;
}

>>> .el-main {
  padding: 0 20px !important;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
</style>