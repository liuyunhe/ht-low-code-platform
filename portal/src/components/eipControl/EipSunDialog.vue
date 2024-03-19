<template>
  <div class="inputs" :style="{ display: 'inline-block', float: 'right' }">
    <el-button
      type="text"
      size="mini"
      :style="{ padding: '0px 5px' }"
      v-show="!initFillData"
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

    <el-dialog
      :visible.sync="customDialogShowList"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      append-to-body
      top="6vh"
      width="60%"
      @opened="afterOpen"
    >
      <el-container :style="style" style="overflow: auto">
        <!-- 组合对话框树 -->
        <el-aside
          v-if="customDialog.style == 2"
          style="width: 23%"
          v-show="treeShow"
        >
          <el-card>
            <div slot="header" class="clearfix">
              <span style="font-size: 16px">{{ leftTreeTitle }}</span>
            </div>
            <el-tree
              ref="combinationTree"
              :data="combinationTreeData"
              :props="defaultProps"
              :node-key="nodeKey"
              highlight-current
              @node-click="combiTreeClick"
              :check-on-click-node="true"
              lazy
              :load="loadTree"
            ></el-tree>
          </el-card>
        </el-aside>
        <el-divider
          direction="vertical"
          v-if="customDialog.style == 2"
        ></el-divider>
        <el-container>
          <el-header class="middle-header" v-if="querysShow">
            <div
              v-for="(condition, index) in conditionBind"
              :key="index"
              class="search-item"
            >
              <p style="font-size: 14px">{{ condition.comment }}:</p>
              <div v-if="condition.controllerType == '1'">
                <el-input
                  size="small"
                  style="width: 180px; padding: 10px 0; margin: 0 5px 0 5px"
                  clearable
                  :placeholder="placeholders[index]"
                  prefix-icon="el-icon-search"
                  v-model="queryParams[condition.field]"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </div>
              <div
                v-if="condition.controllerType == '2'"
                style="margin-right: 10px"
              >
                <el-radio
                  v-model="queryParams[condition.field]"
                  :label="itemR.key"
                  v-for="(itemR, $index1) in condition.config.options"
                  :key="$index1"
                  >{{ itemR.value }}</el-radio
                >
              </div>
              <div
                v-if="condition.controllerType == '3'"
                style="margin-right: 10px"
              >
                <ht-select
                  v-if="condition.config.choiceType == 'static'"
                  :placeholder="quickSearch"
                  v-model="queryParams[condition.field]"
                  :options="condition.config.options"
                ></ht-select>
                <eip-select-dia
                  v-else
                  v-model="queryParams[condition.field]"
                  :placeholder="quickSearch"
                  :ganged="{
                    alias: condition.config.customQuery.alias,
                    valueBind: condition.config.customQuery.valueBind,
                    noInit: '',
                    labelBind: condition.config.customQuery.labelBind,
                    gangedBind: '{}',
                    bind: condition.config.bind,
                  }"
                  :multiple="false"
                  :filterable="false"
                  :allowCreate="false"
                  :selectlist="[]"
                  :queryParams="queryParams"
                ></eip-select-dia>
              </div>
              <div
                v-if="condition.controllerType == '4'"
                style="margin-right: 10px"
              >
                <eip-tag
                  :tag-key="condition.config.tag"
                  :placeholder="quickSearch"
                  v-model="queryParams[condition.field]"
                  :filterable="condition.config.filterable"
                  :expand="condition.config.expand"
                ></eip-tag>
              </div>
            </div>
            <div class="btn-wrap">
              <el-button
                style="margin-left: 20px"
                size="small"
                type="primary"
                icon="el-icon-search"
                @click="search(true)"
                >查询</el-button
              >
              <el-button size="small" icon="el-icon-refresh" @click="reset"
                >重置</el-button
              >
            </div>
          </el-header>
          <el-main style="padding:0 20 0 20">
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
                type="index"
                width="50"
                align="center"
                label="序号"
              ></el-table-column>
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
            <el-row
              type="flex"
              justify="end"
              style="padding-top: 15px; justify-content: space-between"
              v-if="this.customDialog.needPage"
            >
              <el-button
                @click="toggleTree"
                :icon="toggleBtn"
                size="mini"
                type="default"
                v-if="customDialog.style == 2"
              ></el-button>
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
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancel">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="customDialogShowTree"
      :title="this.customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      top="6vh"
      width="40%"
    >
      <el-container :style="style" style="overflow: auto">
        <el-tree
          ref="tree"
          :data="props1"
          :props="defaultProps"
          :node-key="nodeKey"
          highlight-current
          @node-click="treeClick"
          @check-change="getChecked"
          :show-checkbox="this.customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="false"
          lazy
          :load="loadTree"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogTreeConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancelTree">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/utils.js";
import hotentUiUtils from "@/hotent-ui-util.js";
import { Message } from "element-ui";
import req from "@/request.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import EipTag from "@/components/eipControl/EipTag.vue";
import EipSelectDia from "@/components/eipControl/EipSelectDia.vue";
export default {
  components: { EipTag, EipSelectDia },
  name: "eip-dialog",
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
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      data: {
        qxdd: {},
      },
      inputSuffixWidth: 0,
      placeholderBo: "",
      quickSearch: "", //填写提示
      conditionBind: [], //参数查询字段
      nodeKey: "ID_", //树形数据父Id
      customDialogShowList: false,
      customDialogShowTree: false,
      selectOrgProps: {
        label: "name",
      },
      style: "", //对话框宽高
      selectOrgs: null,
      inputSuffixHeight: 33,
      config: null,
      updating: false,
      displayfield: [], //显示字段
      customDialog: {},
      queryParam: "", //查询条件输入的值
      props1: [],
      showData: [],
      checkBoxDataAll: [], //选中对象的集合
      defaultProps: {
        children: "children",
        label: "label",
      },
      propsData: [],
      querysShow: false, //是否显示搜索框
      undefineda: "",
      isCurrentChange: false, //是否不执行 orgTableSelection方法
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      param: [], //绑定的表单字段
      treeList: [],
      displayField: {},
      queryParams: [],
      placeholders: [],
      oldselectOrgs: [],
      combinationTreeData: [],
      combiTreeDisplayField: [],
      combinationTreeQuerys: [],
      combinationRule: {},
      toggleBtn: "el-icon-arrow-left",
      treeShow: true,
      transtionWidth: "25%",
      leftTreeTitle: "",
      writeable: true,
      isShow: true,
    };
  },
  watch: {
    props1: function (newVal, oldVal) {
      //树形
      if (this.showData != undefined && this.showData.length > 0) {
        const this_ = this;
        let data = [];
        for (let i = 0; i < this.showData.length; i++) {
          data.push(this.showData[i]);
        }
        setTimeout(() => {
          for (let i = 0; i < data.length; i++) {
            this_.$refs.tree.setChecked(data[i], true);
            this_.checkNode(data[i], this_);
          }
        }, 200);
      }
    },
  },
  mounted() {
    if (this.initFillData) {
      this.initTemplateData()
    }
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
  computed: mapState({
    total: (state) => state.dialog.total,
    dialogData: (state) => {
      return state.dialog.rows;
    },
    inputVal: function () {
      if (!this.value || this.value == "||[]") {
        this.checkBoxDataAll = [];
        // this.showData = [];
        return null;
      } else {
        let nameAry = this.value.split(",");
        if (this.value.indexOf("||") > 0) {
          nameAry = this.value.split("||")[0].split(",");
          // this.showData=JSON.parse(this.value.split("||")[1]);
        }
        //  this.showData =this.selectOrgs;
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
  }),
  created() {
    if (!this.placeholder) {
      this.placeholderBo = "请选择内容";
    } else {
      this.placeholderBo = this.placeholder;
    }
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
    checkNode(data, this_, pnode) {
      if (data.Pid) {
        let node = this_.$refs.tree.getNode(data.Pid);
        node.indeterminate = true;
        if (node.data.Pid) {
          this_.$refs.tree.getNode(node.data.Pid).indeterminate = true;
          this.checkNode(
            this_.$refs.tree.getNode(node.data.Pid).data,
            this_,
            this_.$refs.tree.getNode(node.data.Pid)
          );
        }
        if (!node.indeterminate) {
          node.indeterminate = true;
        }
      } else if (pnode && !pnode.indeterminate) {
        pnode.indeterminate = true;
      }
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which;
      if (keyCode == 13) {
        this.search();
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
      //第二次点击子表回填对话框 第一次选中的数据不是选中状态
      if(this_.selectOrgs){
        this_.selectOrgs.empty();
        this_.checkBoxDataAll.empty();
      }
      var alias = this.custdialog.custDialog.alias;
      this.$store.dispatch("form/getByAlias", alias).then((customDialog) => {
        if (!customDialog || !customDialog.alias) {
          Message.error("对话框别名【" + alias + "】不存在！");
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
        this_.quickSearch = ""; //填写提示 placeholder
        this_.conditionBind = [];
        let queryParams = [];
        let placeholders = [];
        if (userInputList.length > 0) {
          userInputList.forEach((ele) => {
            var obj = {};
            //条件查询参数（用户输入的） 文本框输入
            if (ele.defaultType == "1") {
              obj[ele.field] = "";
              queryParams.push(obj);
              this_.conditionBind.push(ele);
              placeholders.push("请输入" + ele.comment);
            }
          });
          this.$set(this, "queryParams", queryParams);
          this.$set(this, "placeholders", placeholders);
        }
        //判断是否显示条件查询输入框
        if (this_.quickSearch != "") {
          this_.querysShow = true;
        } else {
          this_.querysShow = false;
        }
        this_.quickSearch = "请输入" + this.quickSearch + "查询";
        this_.style = "height:" + customDialog.height + "px";
        if (window.screen.height && window.screen.height <= 900) {
          this.style = "height:440px";
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
    dialogConfirm() {
      if(!this.selectOrgs || this.selectOrgs.length==0){
        this.$message.error("请选择数据回填");
        return;
      }
      this.queryParam = "";
      this.customDialogShowList = false;
      this.calacInputSuffixHeight();
      this.syncInputValue();
    },
    //重置
    reset() {
      this.queryParams.forEach((paramObj) => {
        for (let key in paramObj) {
          this.queryParams[key] = "";
        }
      });
      //组合树重置
      if(this.$refs.combinationTree){
        let nodes = this.$refs.combinationTree.store.nodesMap;
        for (let key in nodes) {
          nodes[key].expanded = false;
        }
      }
      this.combinationTreeQuerys.splice(0);
      this.search(true);
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
      if (this.queryParams.length != 0 && this.queryParams[0] != "") {
        this.conditionBind.forEach((item, index) => {
          querys.push({
            property: item.field,
            value: this.queryParams[item.field],
            group: "main",
            operation: "LIKE",
            relation: "AND",
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
      //来自组合对话框的
      if (
        this.combinationTreeQuerys &&
        this.combinationTreeQuerys.length != 0
      ) {
        for (let i = 0; i < this.combinationTreeQuerys.length; i++) {
          querys.push(this.combinationTreeQuerys[i]);
        }
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
    async doQuery(param) {
      let paramLoadData = [];
      const pInst = utils.getOnlineFormInstance(this);
      //获取关联查询绑定的表单参数
      for (let i = 0; i < param.conditionfield.length; i++) {
        if (param.conditionfield[i].fieldPath != "") {
          let bindVal = utils.getValueByPath(
            pInst,
            param.conditionfield[i].fieldPath,
            null
          );
          let obj = { key: param.conditionfield[i].field, value: bindVal };
          paramLoadData.push(obj);
        }
      }

      let queryUrl =
        param.dsType == "dataSource"
          ? "${form}/form/customQuery/v1/doQuery?alias=" +
            param.alias +
            "&page=1"
          : param.url;
      let requestMethod = "POST";
      //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
      if (param.dsType != "dataSource") {
        requestMethod = param.requestType;
      }
      //查询数据
      req
        .request({ url: queryUrl, method: requestMethod, data: paramLoadData })
        .then((res) => {
          //判断是否有关联查询数据返回
          if (res.data.rows.length > 0) {
            //获取关联查询返回的表单参数
            for (let io = 0; io < param.resultfield.length; io++) {
              if (param.resultfield[io].fieldPath != "") {
                let val = "";
                for (let j = 0; j < res.data.rows.length; j++) {
                  if (res.data.rows[j][param.resultfield[io].field]) {
                    val =
                      val + res.data.rows[j][param.resultfield[io].field] + ",";
                  }
                }
                val = val.substring(0, val.length - 1);
                let pathArr = param.resultfield[io].fieldPath.split(".");
                if (pathArr.length == 3) {
                  //主表
                  utils.setValueByPath(
                    pInst,
                    param.resultfield[io].fieldPath,
                    val,
                    null
                  );
                } else if (pathArr.length == 4) {
                  //子表
                  let subData = pInst.data[pathArr[1]][pathArr[2]];
                  if (subData.length == 0) {
                    //子表没数据的情况
                    let subTabName = pathArr[2].replace("sub_", "");
                    //得到子表的所有字段
                    let subInitData =
                      pInst.data[pathArr[1]].initData[subTabName] || {};
                    //把数组里面的值为 null 转换为空字符串
                    let str = JSON.stringify(subInitData).replace(
                      /null/g,
                      '""'
                    );
                    let subData = JSON.parse(str);
                    for (var key in subData) {
                      //点添加时判断要新增子表记录中的孙表是否有值
                      if (key.indexOf("sub_") == 0 && subData[key].length > 0) {
                        subData[key] = []; //有则清空
                      }
                      //点添加时判断要新增子表记录中的字段是否有值
                      if (subData[key]) {
                        subData[key] = ""; //有则清空
                      }
                    }
                    //新增一条数据
                    pInst.data[pathArr[1]][pathArr[2]].push(subData);
                    //对话框关联查询返回的值赋值给绑定的字段
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[io].fieldPath,
                      val,
                      0
                    );
                  } else {
                    //子表有数据的情况
                    for (let p = 0; p < subData.length; p++) {
                      //对话框关联查询返回的值赋值给绑定的字段
                      utils.setValueByPath(
                        pInst,
                        param.resultfield[io].fieldPath,
                        val,
                        p
                      );
                    }
                  }
                }
              }
            }
          } else {
            //没有返回的值则清空
            //获取关联查询返回的表单参数
            for (let iop = 0; iop < param.resultfield.length; iop++) {
              if (param.resultfield[iop].fieldPath != "") {
                let pathArr = param.resultfield[iop].fieldPath.split(".");
                if (pathArr.length == 3) {
                  //主表
                  //赋值给绑定的字段
                  utils.setValueByPath(
                    pInst,
                    param.resultfield[iop].fieldPath,
                    "",
                    null
                  );
                } else if (pathArr.length == 4) {
                  //子表
                  let subData = pInst.data[pathArr[1]][pathArr[2]];
                  for (let p = 0; p < subData.length; p++) {
                    //对话框关联查询返回的值赋值给绑定的字段
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[iop].fieldPath,
                      "",
                      p
                    );
                  }
                }
              }
            }
          }
        });
    },
    // 同步选择结果
    syncInputValue() {
      var returnStr = JSON.parse(this.customDialog.resultfield)
      //拿到返回的字段
      var field = new Array([returnStr.length])
      var comment = new Array([returnStr.length])
      var str = []
      var ids = []
      for (var i = 0; i < returnStr.length; i++) {
        field[i] =
          this.customDialog.dsType == 'dataSource'
            ? returnStr[i].field.toLowerCase()
            : returnStr[i].field
        comment[i] =
          this.customDialog.dsType == 'dataSource'
            ? returnStr[i].comment.toLowerCase()
            : returnStr[i].comment
      }
      const this_ = this
      this.selectOrgs.forEach(row => {
        if (this_.checkBoxDataAll || this_.checkBoxDataAll.length < 1) {
          this_.checkBoxDataAll.push(row)
        } else if (
          JSON.stringify(this_.indexArray).indexOf(JSON.stringify(row)) == -1
        ) {
          this_.checkBoxDataAll.push(row)
        }
      })
      var s = this.selectOrgs

      if (this.customDialog.selectNum === 1) {
        var temp = ''
        for (var i = 0; i < comment.length; i++) {
          let encodeStr = encodeURIComponent(s[0][field[i]])
          temp += '"' + comment[i] + '":"' + encodeStr + '",'
        }
        if (temp != '') {
          temp = '{' + temp.substring(0, temp.length - 1) + '}'
        }
        str.push(JSON.parse(temp))
        ids.push(s[0].id)
      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = ''
          for (var j = 0; j < comment.length; j++) {
            let encodeStr = encodeURIComponent(s[i][field[j]])
            temp += '"' + comment[j] + '":"' + encodeStr + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(JSON.parse(temp))
          ids.push(s[i].id)
        }
      }
      const returnData = str
      const _this = this
      const formInst = utils.getOnlineFormInstance(this)
      try{
        let returnSize = returnData.length;
        //判断是否是一对一孙表
        if (_this.relation && _this.relation == 'onetoone') {
          if(returnSize>1){
            this_.$message.error("一对一孙表只能选择一条数据");
            this_.customDialogShowList = true;
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
              this_.$message.error("孙表数据已超过最大行数【"+this_.maxRow+"】");
              this_.customDialogShowList = true;
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
      }catch(e) {
        if(e.message!="EndIterative") throw e;
      };
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
        this_.$message.error("请选择数据回填");
        return;
      }
      this.$store.dispatch('dialog/setDialogData', [])
      var returnStr = JSON.parse(this.customDialog.resultfield)
      var field = new Array([returnStr.length])
      var comment = new Array([returnStr.length])
      var str = []
      for (var i = 0; i < returnStr.length; i++) {
        field[i] = returnStr[i].field
        comment[i] = returnStr[i].comment
      }
      if (this.customDialog.selectNum === 1) {
        var nodes = this.propsData[0]
        var temp = ''
        for (var i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",'
        }
        if (temp != '') {
          temp = '{' + temp.substring(0, temp.length - 1) + '}'
        }
        str.push(JSON.parse(temp))
      } else {
        var nodes = this.propsData
        nodes.forEach((item, k) => {
          var temp = ''
          for (var i = 0; i < comment.length; i++) {
            temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",'
            temp += '"' + comment[i] + '":"' + nodes[k][field[i]] + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(JSON.parse(temp))
        })
      }
      const returnData = str
      const formInst = utils.getOnlineFormInstance(this)
      try{
        let returnSize = returnData.length;
        //判断是否是一对一孙表
        if (this_.relation && this_.relation == 'onetoone') {
          if(returnSize>1){
            this_.$message.error("一对一孙表只能选择一条数据");
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
              this_.$message.error("孙表数据已超过最大行数【"+this_.maxRow+"】");
              this_.customDialogShowTree = true;
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
      }catch(e) {
        if(e.message!="EndIterative") throw e;
      };

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
    //树形查询
    searchTree(requestParams) {
      const this_ = this;
      let query =
        requestParams.requestType == "POST"
          ? req.post(requestParams.url, requestParams.paramsObj)
          : req.get(requestParams.url);
      query.then(function (response) {
        //显示字段配置
        let displayfield = JSON.parse(this_.customDialog.displayfield);
        this_.displayField = displayfield;
        //把对话框配置的显示字段显示名称赋值给树形的显示值
        this_.defaultProps.label = displayfield.displayName;
        this_.treeList = response.data;
        //得到要加载树的信息
        this_.props1 = this_.toTreeData(
          response.data,
          displayfield.id,
          displayfield.pid,
          displayfield.displayName,
          displayfield.pvalue ? displayfield.pvalue : 0
        );
      });
    },
    //加载树的信息
    toTreeData(data, id, pid, name, pvalue) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      return this.translateDataToTree(data, pid, id, name, pvalue);
    },
    translateDataToTree(data, pid, id, name, pvalue) {
      //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
      let parents = data.filter(
        (value) =>
          value[id] == value[pid] || value[pid] == null || value[pid] == pvalue
      );
      if (!parents) {
        parents = data.filter(
          (value) =>
            value[pid] !== "undefined" &&
            value[pid] != null &&
            value[id] != value[pid]
        );
      }
      return parents;
    },
    loadTree(node, resolve) {
      if (node) {
        let this_ = this;
        let displayField =
          this_.customDialog.style == 2
            ? this_.combiTreeDisplayField
            : this_.displayField;
        resolve(
          this.treeList.filter(
            (value) => value[displayField.pid] === node.data[displayField.id]
          )
        );
        if (this.showData && this.showData.length > 0) {
          setTimeout(() => {
            this.showData.forEach((v) => {
              if (v.Pid == node.key) {
                this_.$refs.tree.setChecked(v, true);
              } else {
                this_.checkNode(v, this_);
              }
            });
          }, 400);
        }
      }
    },

    afterOpen() {
      //打开对话框之后加载树
      this.loadCombinationTree();
    },
    loadCombinationTree() {
      if (this.customDialog.style != 2) {
        return;
      }
      let combinationRule = JSON.parse(this.customDialog.combinationRule);
      this.combinationRule = combinationRule;
      let treeAlias = combinationRule.leftTree;
      //获取对话框数据
      req
        .get("${form}/form/customDialog/v1/getByAlias?alias=" + treeAlias)
        .then((resp) => {
          let treeDialog = resp.data;
          this.leftTreeTitle = treeDialog.name;
          let reqParam = {};
          let requestType =
            treeDialog.dsType == "dataSource"
              ? "GET"
              : treeDialog.requestType
              ? treeDialog.requestType
              : "POST";
          let url =
            "${form}/form/customDialog/v1/getTreeData?alias=" +
            treeAlias +
            "&mapParam=";
          let paramsObj = {};
          if (treeDialog.dsType != "dataSource") {
            url = treeDialog.url;
            let templatePa = treeDialog.dataParam;
            if (treeDialog.conditionfield) {
              let conditions = JSON.parse(treeDialog.conditionfield);
              for (let i = 0; i < conditions.length; i++) {
                let con = conditions[i];
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
                  let ljChar = url.indexOf("?") == -1 ? "?" : "&";
                  url = url + ljChar + con.field + "=" + con.defaultValue;
                }
              }
              if (templatePa) {
                paramsObj = JSON.parse(templatePa);
              }
            }
          }
          let requestParams = {};
          requestParams.requestType = requestType;
          requestParams.url = url;
          requestParams.paramsObj = paramsObj;
          this.$store
            .dispatch("dialog/getTreeData", requestParams)
            .then((resp) => {
              if (treeDialog.displayfield && treeDialog.resultfield) {
                let displayField = JSON.parse(treeDialog.displayfield);
                let resultfield = JSON.parse(treeDialog.resultfield);
                this.defaultProps.label = displayField.displayName;
                this.treeList = resp;
                this.combiTreeDisplayField = displayField;
                this.combinationTreeData = this.toTreeData(
                  resp,
                  displayField.id,
                  displayField.pid,
                  displayField.displayName,
                  displayField.pvalue ? displayField.pvalue : "0",
                  resultfield
                );
              }
            });
        });
    },
    combiTreeClick(paramObj, node, nodeComponent) {
      //组合对话框点击左树
      //清空旧的
      this.combinationTreeQuerys.splice(0);
      let combinationRule = JSON.parse(this.customDialog.combinationRule);
      if (!combinationRule.rules || combinationRule.rules.length == 0) {
        return;
      }
      let rules = combinationRule.rules;
      for (let i = 0; i < rules.length; i++) {
        let value = paramObj[rules[i].treeField];
        let property = rules[i].listField;
        this.combinationTreeQuerys.push({
          property: property,
          value: value,
          group: "treeGroup",
          operation: this.getOperation(rules[i].condition),
          relation: "AND",
        });
      }
      this.search();
    },
    //获取运算符号
    getOperation(old) {
      if (!old) {
        return "";
      }
      if (old == "EQ") {
        return "EQUAL";
      }
      if (old == "LK") {
        return "LIKE";
      }
      if (old == "LFK") {
        return "LIKE";
      }
      if (old == "IN") {
        return "IN";
      }
    },
    toggleTree() {
      if (this.treeShow) {
        this.treeShow = false;
        this.transtionWidth = "0%";
        this.toggleBtn = "el-icon-arrow-right";
      } else {
        this.treeShow = true;
        this.transtionWidth = "25%";
        this.toggleBtn = "el-icon-arrow-left";
      }
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/ .el-button--mini {
  padding: 0px 15px;
  font-size: 12px;
  border-radius: 3px;
  height: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
/deep/ .el-button--info {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}
/deep/ .el-input__suffix {
  position: absolute;
  height: 100%;
  right: 0px !important;
  top: 0;
  text-align: center;
  color: #c0c4cc;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  pointer-events: none;
}
.el-input__inner[aria-invalid="true"] {
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
  height: unset !important;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .search-item {
    display: flex;
    // width: 33.33%;
    margin-right: 12px;
  }
  .btn-wrap {
    line-height: 50px;
  }
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
  height: calc(100% - 60px);
  overflow-y: auto;
  min-height: unset;
}
/deep/ .el-dialog__body {
  padding: 0;
  height: calc(100% - 120px);
  overflow-y: auto;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #f5f7fa;
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
@media (max-width: 1280px) {
  /deep/ .el-dialog {
    width: 96% !important;
    margin-top: 2vh !important;
  }
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
  &::-webkit-scrollbar {
    width: 0;
    background-color: transparent;
  }
}

/deep/ .el-dialog {
  height: 90%;
  min-height: 400px;
}
@media (max-height: 960px) {
  /deep/ .el-dialog__body .el-container {
    height: 100% !important;
  }
}
/deep/ .el-divider--vertical {
  height: 100%;
}
</style>
