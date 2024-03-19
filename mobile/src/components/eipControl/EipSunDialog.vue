<template>
  <div class="inputs" :style="{ display: 'inline-block', float: 'right' }">
    <el-button
      type="text"
      size="mini"
      :style="{ padding: '0px 5px' }"
      @click="showDialog"
      v-if="isShow"
    >
      <i
        style="line-height: 10px"
        :class="
          this.custdialog.icon
            ? 'el-input__icon ' + this.custdialog.icon
            : 'el-input__icon icon-department'
        "
        :style="{ fontSize: '13px' }"
      ></i>
      {{ this.custdialog.name }}
    </el-button>

    <ht-sidebar-dialog
      :visible.sync="customDialogShowList"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      append-to-body
      width="100%"
    >
      <div :style="this.style">
        <el-header class="middle-header" v-if="querysShow">
          <el-input
            size="small"
            style="width: 98%; margin-top: 8px"
            clearable
            :placeholder="this.comment"
            prefix-icon="el-icon-search"
            v-model="queryParam"
            @change="search()"
          ></el-input>
        </el-header>
        <el-main style="padding-top: 10px !important">
          <el-table
            :data="dialogData"
            ref="orgTable"
            stripe
            border
            @row-click="orgRowClick"
            @selection-change="orgTableSelection"
            @select="onTableSelect"
            @select-all="selectAll"
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
            <el-table-column
              align="center"
              width="50"
              v-if="this.customDialog.selectNum === 1"
            >
              <template slot-scope="scope">
                <el-radio
                  @selection-change="orgTableSelection"
                  :label="scope.$index"
                  v-model="undefineda"
                  class="textRadio"
                  >&nbsp;</el-radio
                >
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              v-for="field in displayfield"
              :key="field.field"
              :prop="field.field"
              :label="field.comment"
              style="width: 100%"
            ></el-table-column>
          </el-table>
        </el-main>
        <el-footer>
          <el-row type="flex" justify="end" v-if="this.customDialog.needPage">
            <el-pagination
              small
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pagination.pageSize"
              layout="total, prev, pager, next"
              :total="total"
            ></el-pagination>
          </el-row>
        </el-footer>
      </div>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancel">取 消</el-button>
      </span>
    </ht-sidebar-dialog>

    <ht-sidebar-dialog
      :visible.sync="customDialogShowTree"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      width="100%"
    >
      <div :style="this.style">
        <el-tree
          ref="tree"
          :data="props1"
          :props="defaultProps"
          :node-key="nodeKey"
          highlight-current
          default-expand-all
          @node-click="treeClick"
          @check-change="getChecked"
          :show-checkbox="this.customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="false"
        ></el-tree>
      </div>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogTreeConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancelTree">取 消</el-button>
      </span>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/hotent-ui-util.js";
import { Notify } from "vant";

export default {
  name: "eip-sunDialog",
  components: {
    Notify,
  },
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "atter",
    "single",
    "selectorconfig",
    "custdialog",
    "placeholder",
    "tooltipplacement",
    'initFillData',
    'initFillDataType',
    'relation',
    'maxRow'
  ],
  data() {
    return {
      oldselectOrgs: [],
      isCurrentChange: false, //是否不执行 orgTableSelection方法
      customDialogShowList: false,
      customDialogShowTree: false,
      nodeKey: "ID_", //树形数据父Id
      selectOrgProps: {
        label: "name",
      },
      style: "", //对话框宽高
      selectOrgs: null,
      inputSuffixHeight: 30,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      config: null,
      updating: false,
      displayfield: [], //显示字段
      customDialog: {},
      comment: "",
      queryParam: "",
      props1: [],
      showData: [],
      checkBoxDataAll: [], //选中对象的集合
      defaultProps: {
        children: "childrens",
        label: "label",
      },
      propsData: [],
      querysShow: false, //是否显示搜索框
      undefineda: "",
      isShow: true,
    };
  },
  computed: mapState({
    total: (state) => state.dialog.total,
    dialogData: (state) => {
      return state.dialog.rows;
    },
    inputVal: function () {
      if (!this.value || this.value == "||[]") {
        this.checkBoxDataAll = [];
        return null;
      } else {
        let nameAry = this.value.split(",");
        if (this.value.indexOf("||") > 0) {
          nameAry = this.value.split("||")[0].split(",");
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
    inputWriteable: function () {
      return this.writeable
        ? utils.getWriteable(this.permission_sub)
        : this.writeable;
    },
    inputValidate: function () {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function () {
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
    },
    // 是否有回填设置
    bindSet: function () {
      return this.selectorconfig ? this.selectorconfig.bind : null;
    },
    getPlaceholder: function () {
      return this.custdialog.name;
    },
  }),
    mounted() {
    let requestType = window.location.href.split('?')[0].split('/')
    let isDoneList = window.location.href.split('/')
    if (
      requestType[requestType.length - 1] == 'get' ||
      requestType[requestType.length - 2] == 'get' ||
      isDoneList[isDoneList.length - 1] == 'doneList'
    ) {
      this.isShow = false
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    selectAll(selection) {
      if (this.oldselectOrgs != null && selection.length > 0) {
        for (let x = 0; x < selection.length; x++) {
          if (this.indexArray(this.oldselectOrgs, selection[x]) === -1) {
            this.oldselectOrgs.push(selection[x]);
          }
        }
        this.selectOrgs = _.cloneDeep(this.oldselectOrgs);
      } else {
        this.selectOrgs = _.cloneDeep(selection);
      }
    },
    handleSizeChange: function (size) {
      this.isCurrentChange = true;
      //每页下拉显示数据
      this.pagination.pageSize = size;
      this.search();
    },
    handleCurrentChange: function (currentPage) {
      const this_ = this;
      if (this.selectOrgs != undefined && this.selectOrgs.length > 0) {
        this.selectOrgs.forEach((row) => {
          let res = this_.indexArray(this_.checkBoxDataAll, row);
          if (res == -1) {
            this_.checkBoxDataAll.push(row);
          }
        });
      }
      this.isCurrentChange = true;
      //点击第几页
      this.pagination.page = currentPage;
      this.search();
    },
    checkList() {
      const this_ = this;
      setTimeout(() => {
        //列表
        if (
          this_.checkBoxDataAll != undefined &&
          this_.checkBoxDataAll.length > 0
        ) {
          this_.checkBoxDataAll.forEach((row) => {
            let res = this_.indexArray(this_.dialogData, row);
            this_.undefineda = res;
            if (res != -1) {
              this_.isCurrentChange = true;
              this_.toggleRowSelection(res, true);
            }
          });
        }
      }, 300);
    },
    toggleRowSelection(res, val) {
      this.$refs.orgTable.toggleRowSelection(this.dialogData[res], val);
    },
    showDialog(item) {
      const this_ = this;
      //第二次点击孙表回填对话框 第一次选中的数据不是选中状态
      if(this_.selectOrgs){
        this_.selectOrgs.empty();
        this_.checkBoxDataAll.empty();
      }
      var alias = this.custdialog.custDialog.alias;
      this.$store.dispatch("form/getByAlias", alias).then((customDialog) => {
        if (!customDialog || !customDialog.alias) {
          Notify({ type: "warning", message: "对话框别名【" + alias + "】不存在" });
          return;
        }
        if (customDialog.style == 1) {
          var displaylist = JSON.parse(customDialog.displayfield);
          this_.nodeKey = displaylist.id;
        }
        //对话框按表单字段查询（参数传入的）
        let bindList = this_.custdialog.custDialog.conditions;
        this_.param = []; //绑定的表单字段
        if (bindList.length > 0) {
          bindList.forEach((ele) => {
            //绑定表单字段
            if (ele.defaultType == "3" && ele.bind) {
              let obj = {};
              obj.field = ele.field;
              obj.bind = ele.bind;
              this_.param.push(obj);
            }
          });
        }
        //判断对话框查询是否有条件
        let userInputList = JSON.parse(customDialog.conditionfield);
        this_.comment = ""; //填写提示 placeholder
        this_.conditionBind = [];
        if (userInputList.length > 0) {
          if (!this_.comment && userInputList.length > 0) {
            userInputList.forEach(item => {
              if (item.controllerType == 1 && item.dbType == "varchar") {
                this_.comment += item.comment + ",";
              }
            });
            if (this_.comment) {
              this_.comment =
                "通过" +
                this_.comment.substring(0, this.comment.length - 1) +
                "查询";
            }
          }
        }
        //判断是否显示条件查询输入框
        if (this_.comment != "") {
          this_.querysShow = true;
        } else {
          this_.querysShow = false;
        }
        this_.style = "height:" + customDialog.height + "px";
        if (window.screen.height && window.screen.height <= 900) {
          this_.style = "height:440px";
        }
        if (customDialog.style == 0 || customDialog.style == 2) {
          //列表
          this_.customDialogShow({ alias: alias, customDialog: customDialog });
        } else if (customDialog.style == 1) {
          //树形
          this_.customDialogTreeShow({
            alias: alias,
            customDialog: customDialog,
          });
        }
      });
    },
    //判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1;
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i;
        }
      }
      return -1;
    },
    //点击列表某一个复选框时触发
    onTableSelect(rows, row) {
      this.isCurrentChange = false;
      //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
      let selected =
        this.selectOrgs &&
        this.selectOrgs.length > 0 &&
        this.indexArray(this.selectOrgs, row) !== -1;
      if (selected) {
        this.isCurrentChange = true;
        let res = this.indexArray(this.selectOrgs, row);
        this.selectOrgs.splice(res, 1);
      }
    },
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      if (this.customDialog.selectNum === 1) {
        $(event.currentTarget.children[0].children[0].children[0]).trigger(
          "click"
        );
        this.selectOrgs = [];
        this.selectOrgs.push(row);
      } else if (this.customDialog.selectNum != 1) {
        this.isCurrentChange = false;
        //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
        let selected =
          this.selectOrgs &&
          this.selectOrgs.length > 0 &&
          this.indexArray(this.selectOrgs, row) !== -1;
        if (selected) {
          this.isCurrentChange = true;
          let res = this.indexArray(this.selectOrgs, row);
          this.selectOrgs.splice(res, 1);
        }
        this.$refs.orgTable.toggleRowSelection(row);
      }
    },
    //列表复选框有改变时触发
    orgTableSelection(selection) {
      //全选的情况特殊处理(为了与原本功能逻辑不冲突,先复制一份旧的选中数据.然后拿到全选事件中去计算)
      this.oldselectOrgs = _.cloneDeep(this.selectOrgs);
      //多选
      if (this.customDialog.selectNum != 1 && !this.isCurrentChange) {
        if (selection && selection.length > 0) {
          if (
            selection.length == 1 &&
            (!this.selectOrgs || this.selectOrgs.length == 0)
          ) {
            this.selectOrgs = selection;
          } else if (
            (!this.selectOrgs || this.selectOrgs.length == 0) &&
            selection.length > 1
          ) {
            if (!this.selectOrgs) {
              this.selectOrgs = [];
            }
            for (let i = selection.length - 1; i >= 0; i--) {
              this.selectOrgs.push(selection[i]);
            }
          } else if (this.isCurrentChange && selection.length >= 10) {
            if (!this.selectOrgs) {
              this.selectOrgs = [];
            } else {
              for (let u = this.selectOrgs.length - 1; u >= 0; u--) {
                let res = this.indexArray(selection, this.selectOrgs[u]);
                if (res != -1) {
                  this.selectOrgs.splice(res, 1);
                }
              }
            }
            for (let i = 0; i < selection.length; i++) {
              this.selectOrgs.push(selection[i]);
            }
          } else {
            for (let i = selection.length - 1; i >= 0; i--) {
              this.selectOrgs.push(selection[i]);
              break;
            }
          }
        }
      }
    },
    //列表对话框确认事件
    dialogConfirm() {
      if(!this.selectOrgs || this.selectOrgs.length==0){
        Notify({ type: "warning", message: "请选择数据回填" });
        return;
      }
      this.calacInputSuffixHeight();
      this.syncInputValue();
    }, 
    //查询
    search(resetPagintion) {
      let querys = []; //查询条件
      let queryFilter = {};
      if (JSON.stringify(this.pagination) == "{}") {
        this.pagination = { page: 1, pageSize: 10, showTotal: "true" };
      }
      let pageBean = { pageBean: this.pagination };
      if (resetPagintion) {
        pageBean.pageBean = { page: 1, pageSize: 10, showTotal: "true" };
      }
      //用户输入的
     if (this.queryParam != "") {
        var conditionfield = JSON.parse(this.customDialog.conditionfield);
        conditionfield.forEach((item) => {
          querys.push({
            property: item.field,
            value: this.queryParam,
            group: "main",
            operation: "LIKE",
            relation: "OR",
          });
        });
      }
      //参数传入的查询拼接
      if (this.param) {
        const pInst = utils.getOnlineFormInstance(this);
        this.param.forEach((item) => {
          querys.push({
            property: item.field,
            value: utils.getValueByPath(pInst, item.bind),
            group: "main",
            operation: "LIKE",
            relation: "AND",
          });
        });
      }

      if (querys.length > 0) {
        queryFilter = { pageBean: pageBean.pageBean, querys };
        this.customDialog.pageBean = queryFilter;
        this.$store
          .dispatch("dialog/getlistJson", this.customDialog)
          .then(() => {
            this.checkList();
          });
      } else {
        this.customDialog.pageBean = pageBean;
        this.$store
          .dispatch("dialog/getlistJson", this.customDialog)
          .then(() => {
            this.checkList();
          });
      }
    },
    searchTree(requestParams) {
      if (this.props1.length < 1) {
        this.$store
          .dispatch("dialog/getTreeData", requestParams)
          .then((res) => {
            if (
              this.customDialog.displayfield &&
              this.customDialog.resultfield
            ) {
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
            ? returnStr[i].field.toLowerCase()
            : returnStr[i].field;
        comment[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].comment.toLowerCase()
            : returnStr[i].comment;
      }
      const this_ = this;
      this.selectOrgs.forEach((row) => {
        if (this_.checkBoxDataAll || this_.checkBoxDataAll.length < 1) {
          this_.checkBoxDataAll.push(row);
        } else if (
          JSON.stringify(this_.indexArray).indexOf(JSON.stringify(row)) == -1
        ) {
          this_.checkBoxDataAll.push(row);
        }
      });
      var s = this.selectOrgs;

      if (this.customDialog.selectNum === 1) {
        var temp = "";
        for (var i = 0; i < comment.length; i++) {
          let encodeStr = encodeURIComponent(s[0][field[i]]);
          temp += '"' + comment[i] + '":"' + encodeStr + '",';
        }
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));
        ids.push(s[0].id);
      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = "";
          for (var j = 0; j < comment.length; j++) {
            let encodeStr = encodeURIComponent(s[i][field[j]]);
            temp += '"' + comment[j] + '":"' + encodeStr + '",';
          }
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(JSON.parse(temp));
          ids.push(s[i].id);
        }
      }
      const returnData = str;
      const _this = this;
      const formInst = utils.getOnlineFormInstance(this);
      try {
        let returnSize = returnData.length;
        //判断是否是一对一孙表
        if (_this.relation && _this.relation == "onetoone") {
          if (returnSize > 1) {
            Notify({ type: "warning", message: "一对一孙表只能选择一条数据" });
            return;
          }
        }
        returnData.forEach(row => {
          var targetArray = null;
          var subLineData = {};
          _this.custdialog.custDialog.mappingConf.forEach(con => {
            if (con.target[0]) {
              targetArray = con.target[0].split(".");
              var from = "";
              if (_this.customDialog.dsType == "restful") {
                from = con.from;
              } else {
                from = con.from.toLowerCase();
              }
              subLineData[targetArray[targetArray.length - 1]] = decodeURIComponent(row[from]);
            }
          });
          if (targetArray) {
            //子表的下标
            let subIndex = utils.getSomeAttributeFromParentElement(_this.$el,"data-index");
            //判断孙表是否等于空
            if(!formInst["data"][targetArray[0]][targetArray[1]][subIndex][targetArray[2]]){
              //如果等于空则让它等于空数组
              formInst["data"][targetArray[0]][targetArray[1]][subIndex][targetArray[2]] = new Array();
            }
            let subBo = formInst["data"][targetArray[0]][targetArray[1]][subIndex][targetArray[2]];
            //判断是否大于孙表数据最大行数
            if(this_.maxRow !=0 && (subBo.length + returnSize)>this_.maxRow){
              Notify({ type: "warning", message: "孙表数据已超过最大行数【"+this_.maxRow+"】" });
              throw new Error("EndIterative");
            }
            //判断是否是一对一孙表
            if(_this.relation && _this.relation=="onetoone"){
              subBo.empty();
            }
            subBo.push(subLineData);
            returnSize--
          }
        });
        this.customDialogShowList = false;
      } catch (e) {
        if (e.message != "EndIterative") throw e;
      }
    },
    //取消按钮
    dialogCancel() {
      const this_ = this;
      this_.queryParam = "";
      this_.$store.dispatch("dialog/setDialogData", []).then(() => {
        this_.customDialogShowList = false;
        //判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
        if (!this_.inputVal) {
          this_.selectOrgs = [];
        } else {
          this_.selectOrgs = [...this_.showData];
          this.checkBoxDataAll = [...this_.selectOrgs];
        }
      });
    },
    dialogTreeConfirm() {
      const this_ = this;
      if(this_.propsData.length==0){
        Notify({ type: "warning", message: "请选择数据回填" });
        return;
      }
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
        str.push(JSON.parse(temp));
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
          str.push(JSON.parse(temp));
        });
      }
      const returnData = str;
      const formInst = utils.getOnlineFormInstance(this);
      try {
        let returnSize = returnData.length;
        //判断是否是一对一孙表
        if (this_.relation && this_.relation == "onetoone") {
          if (returnSize > 1) {
            Notify({ type: "warning", message: "一对一孙表只能选择一条数据" });
            this_.customDialogShowTree = true;
            return;
          }
        }
        returnData.forEach(row => {
          var targetArray = null;
          var subLineData = {};
          var pathArray = null;
          this.custdialog.custDialog.mappingConf.forEach(con => {
            targetArray = null;
            if(con.target[0]){
              targetArray = con.target[0].split(".");
            }
            if(con.target[0] && !pathArray){
              pathArray = con.target[0].split(".");
            }
            var from = "";
            if (this_.customDialog.dsType == "restful") {
              from = con.from;
            } else {
              from = con.from;
            }
            if(targetArray){
              subLineData[targetArray[targetArray.length - 1]] = row[from];
            }
          });
          if (pathArray) {
            //子表的下标
            let subIndex = utils.getSomeAttributeFromParentElement(this_.$el,"data-index");
            //判断孙表是否等于空
            if(!formInst["data"][pathArray[0]][pathArray[1]][subIndex][pathArray[2]]){
              //如果等于空则让它等于空数组
              formInst["data"][pathArray[0]][pathArray[1]][subIndex][pathArray[2]] = new Array();
            }
            var subBo = formInst["data"][pathArray[0]][pathArray[1]][subIndex][pathArray[2]];
             //判断是否大于孙表数据最大行数
            if(this_.maxRow !=0 && (subBo.length + returnSize)>this_.maxRow){
              Notify({ type: "warning", message: "孙表数据已超过最大行数【"+this_.maxRow+"】" });
              throw new Error("EndIterative");
            }
            //判断是否是一对一孙表
            if(this_.relation && this_.relation=="onetoone"){
              subBo.empty();
            }
            subBo.push(subLineData);
            returnSize--
          }
        });
        this.customDialogShowTree = false;
      } catch (e) {
        if (e.message != "EndIterative") throw e;
      }
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
    removeSelectOrg(item) {
      if (this.customDialog.selectNum === 1) {
        this.$emit("input", "");
        this.selectOrgs.splice(item, 1);
        this.showData.splice(item, 1);
      } else {
        this.inputVal.splice(item, 1);
        // let removeId = this.showData[item];
        //树形
        if (this.propsData.length > 0) {
          this.propsData.splice(item, 1);
        }
        if (this.showData.length > 0) {
          this.showData.splice(item, 1);
        }
        //列表
        if (this.selectOrgs != null) {
          this.selectOrgs.splice(item, 1);
          this.checkBoxDataAll.splice(item, 1);
          this.selectOrgs.forEach((row) => {
            // if(item.id ==removeId ){
            this.isCurrentChange = true;
            this.toggleRowSelection(row, false);
            // }
          });
        }
        this.calacInputSuffixHeight();
        let value = "";
        this.inputVal.forEach((val) => {
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
      this.syncInputValue();
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
      if (this.dialogData.length < 1) {
        this.pagination = { page: 1, pageSize: 10, showTotal: "true" };
        this.search();
        this.displayfield = JSON.parse(pageParam.customDialog.displayfield);
        if (this.customDialog.dsType == "dataSource") {
          for (var i = 0; i < this.displayfield.length; i++) {
            this.displayfield[i].field = this.displayfield[
              i
            ].field.toLowerCase();
          }
        }
      } else if (this.dialogData.length > 1) {
        this.search();
      }
      if (this.dialogData.length > 0 && this.displayfield.length == 0) {
        this.search();
        this.displayfield = JSON.parse(pageParam.customDialog.displayfield);
        if (this.customDialog.dsType == "dataSource") {
          for (var i = 0; i < this.displayfield.length; i++) {
            this.displayfield[i].field = this.displayfield[
              i
            ].field.toLowerCase();
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
          (value) =>
            value[id] == value[pid] ||
            value[pid] == null ||
            value[pid] == null ||
            value[pid] == 0
        );
        parents.label = parents[name];
        let childrens = data.filter(
          (value) =>
            value[pid] !== "undefined" &&
            value[pid] != null &&
            value[id] != value[pid]
        );
        let translator = (parents, childrens) => {
          parents.forEach((parent) => {
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
    },
  },
};
</script>
<style lang="stylus" scoped>
.middle-header {
  height: 40px !important;
}

>>> .el-header {
  padding-right: 0px !important;
  padding-left: 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

>>>.el-footer {
  height: 0px !important;
}

>>> .el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}

>>> .el-dialog__title {
  font-size: 15px;
  color: #333;
}

>>> .el-dialog__headerbtn {
  top: 12px;
}

.el-table {
  font-size: 12px;
}

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

>>> .el-dialog__body {
  height: calc(100% - 95px) !important;
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
  padding: 0 5px !important;
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