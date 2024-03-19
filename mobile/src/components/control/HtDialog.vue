<template>
  <div class="inputs">
    <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
      <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
      <div v-if="inputWriteable" style="width: 100%;" class="el-select" @click="showDialog">
        <div class="el-select__tags" ref="tagSpans" style="width: calc(100% - 25px);">
          <span>
            <span
              class="el-tag el-tag--info el-tag--small"
              @click.stop
              v-for="(item,index) in inputVal"
              :key="item.value"
            >
              <span class="el-select__tags-text">{{item.value}}</span>
              <i class="el-tag__close el-icon-close" @click="removeSelectOrg(index)"></i>
            </span>
          </span>
        </div>
        <div class="el-input el-input--suffix">
          <input
            type="text"
            readonly="readonly"
            v-validate="inputValidate"
            v-model="inputVal"
            :name="inputName"
            autocomplete="off"
            class="el-input__inner"
            :placeholder="getPlaceholder"
            :style="{height: inputSuffixHeight + 'px'}"
          >
          <span class="el-input__suffix">
            <span class="el-input__suffix-inner">
              <i
                :class="this.custdialog.icon?'el-input__icon '+this.custdialog.icon:'el-input__icon icon-department'"
                :style="{fontSize:'17px',lineHeight: inputSuffixHeight + 'px'}"
              ></i>
            </span>
          </span>
        </div>
      </div>
    </el-tooltip>
    <span v-if="!inputWriteable">
      <span
        class="el-tag el-tag--info el-tag--small"
        style="margin-right: 8px;"
        @click.stop
        v-for="item in inputVal"
        :key="item.value"
      >
        <span class="el-select__tags-text">{{item.value}}</span>
      </span>
    </span>
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
              @keyup.enter.native="searchEnterFun"
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
              <el-table-column type="selection"  align="center" width="45" v-if="this.customDialog.selectNum != 1"></el-table-column>
              <el-table-column align="center" width="50" v-if="this.customDialog.selectNum === 1">
                <template slot-scope="scope">
                <!-- class="textRadio" -->
                <el-radio @selection-change="orgTableSelection"  :label="scope.$index"  v-model="undefineda" class="textRadio">&nbsp;

                </el-radio>

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
          :node-key="nodeKey"
          highlight-current
          default-expand-all
          @node-click="treeClick"
          @check-change="getChecked"
          :show-checkbox="this.customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="true"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="dialogTreeConfirm">确认</el-button>
        <el-button size="small" @click="dialogCancelTree">取 消</el-button>
      </span>
    </el-dialog>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import { mapState } from "vuex";
import utils from "@/utils.js";
import { Message } from "element-ui";

export default {
  name: "ht-dialog",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "atter",
    "single",
    "selectorconfig",
    "custdialog",
    "tooltipplacement"
  ],
  data() {
    return {
      nodeKey:"ID_",//树形数据父Id
      customDialogShowList: false,
      customDialogShowTree: false,
      selectOrgProps: {
        label: "name"
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
      showData:[],
      checkBoxDataAll: [],//选中对象的集合
      defaultProps: {
        children: "children",
        label: "label"
      },
      propsData: [],
      searchForm: {},
      querysShow: false, //是否显示搜索框
      undefineda:"",
      isCurrentChange:false  //是否不执行 orgTableSelection方法
    };
  },
  watch: {
    props1: function(newVal, oldVal) {
        //树形
        if(this.showData!=undefined&&this.showData.length>0){
          const this_ = this;
          let  data = [];
          for(let i =0;i<this.showData.length;i++){
            data.push(this.showData[i]);
          }
          setTimeout(() => {
            for(let i =0;i<data.length;i++){
              this_.$refs.tree.setChecked(data[i],true);
            }
          },200);
        }
    }
  },
  computed: mapState({
    pagination: state => state.dialog.pagination,
    total: state => state.dialog.total,
    dialogData: state => {
      return state.dialog.rows;
    },
    inputVal: function() {
      if (!this.value || this.value =='||[]') {
        this.checkBoxDataAll = [];
        // this.showData = [];
        return null;
      } else {
        let nameAry = this.value.split(",");
        if(!nameAry[nameAry.length-1]){
          nameAry.splice(nameAry.length-1,1);
        }
        if(this.value.indexOf("||")>0){
          nameAry=this.value.split("||")[0].split(",");
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
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    },
    // 是否有回填设置
    bindSet: function() {
      return this.selectorconfig ? this.selectorconfig.bind : null;
    },
    getPlaceholder: function() {
      return this.custdialog.name;
    }
  }),
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    //回车查询
    searchEnterFun:function(e){
        var keyCode = window.event? e.keyCode:e.which;
        if(keyCode == 13){
            this.search();
        }
    },
    handleSizeChange: function(size) {
      this.isCurrentChange = true;
      //每页下拉显示数据
      this.$store.dispatch("dialog/setPaginationSize", size).then(()=>{
          this.search();
      });
    },
    handleCurrentChange: function(currentPage) {
      const this_ = this;
      if(this.selectOrgs!=undefined&&this.selectOrgs.length>0){
        this.selectOrgs.forEach(row => {
          let res=this_.indexArray(this_.checkBoxDataAll,row);
          if(res==-1){
            this_.checkBoxDataAll.push(row);
          }
        });
      }
      this.isCurrentChange = true;
      //点击第几页
      this.$store.dispatch("dialog/setPaginationPageNum", currentPage).then(()=>{
          this.search();
      });
    },
    checkList(){
      const this_ = this;
      setTimeout(() => {
        //列表
        if(this_.checkBoxDataAll!=undefined&&this_.checkBoxDataAll.length>0){
          this_.checkBoxDataAll.forEach(row => {
            let res=this_.indexArray(this_.dialogData,row);
            this_.undefineda=res;
            if(res!=-1){
                this_.isCurrentChange=true;
                this_.toggleRowSelection(res,true);
            }
          });
        }
      }, 300);
    },
    toggleRowSelection(res,val){
        this.$refs.orgTable.toggleRowSelection(this.dialogData[res],val);
    },
    showDialog(item) {
      const this_ = this;
      var alias = this.custdialog.custDialog.alias;
      this.$store.dispatch("form/getByAlias", alias).then(customDialog => {
        if (!customDialog || !customDialog.alias) {
          Message.error("对话框别名【" + alias + "】不存在！");
          return;
        }
        if(customDialog.style==1){
          var displaylist = JSON.parse(customDialog.displayfield);
          this_.nodeKey = displaylist.id;
        }
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
    //判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item){
      if(array.length==0){
        return -1;
      }
      for (let i = 0; i <array.length ; i++) {
        if(JSON.stringify(array[i])==JSON.stringify(item)){
            return i;
        }
      }
      return -1;
    },
    //点击列表某一个复选框时触发
    onTableSelect(rows, row){
       this.isCurrentChange=false;
     //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
      let selected = (this.selectOrgs && this.selectOrgs.length>0) && this.indexArray(this.selectOrgs,row) !== -1;
      if(selected){
        this.isCurrentChange=true;
        let res=this.indexArray(this.selectOrgs,row);
        this.selectOrgs.splice(res,1);
      }
    },
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      if(this.customDialog.selectNum === 1){
        $(event.currentTarget.children[0].children[0].children[0]).trigger("click");
         this.selectOrgs=[];
         this.selectOrgs.push(row);
      }else if(this.customDialog.selectNum!=1){
        this.isCurrentChange=false;
        //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
        let selected = (this.selectOrgs && this.selectOrgs.length>0) && this.indexArray(this.selectOrgs,row) !== -1;
        if(selected){
          this.isCurrentChange=true;
          let res=this.indexArray(this.selectOrgs,row);
          this.selectOrgs.splice(res,1);
        }
        this.$refs.orgTable.toggleRowSelection(row);
      }
    },
    //列表复选框有改变时触发
    orgTableSelection(selection) {
      //多选
      if(this.customDialog.selectNum!=1 && !this.isCurrentChange){
         if(selection && selection.length>0){
            if(selection.length==1 && (!this.selectOrgs || this.selectOrgs.length==0)){
                this.selectOrgs = selection;
            }else if((!this.selectOrgs || this.selectOrgs.length==0) && selection.length>1){
                if(!this.selectOrgs){
                  this.selectOrgs=[];
                }
                for (let i = selection.length-1; i >=0 ; i--) {
                  this.selectOrgs.push(selection[i]);
                }
            }else{
                for (let i = selection.length-1; i >=0 ; i--) {
                  this.selectOrgs.push(selection[i]);
                  break;
                }
            }
          }
      }
    },
    dialogConfirm() {
      this.customDialogShowList = false;
      this.calacInputSuffixHeight();
      this.syncInputValue();
      // this.$store.dispatch("dialog/setDialogData", []);
    },
    //重置
    reset() {
      this.queryParam = "";
      this.search();
    },
    //查询
    search() {
      let querys = []; //查询条件
      let queryFilter = {};
      if(JSON.stringify(this.pagination)=="{}"){
           this.pagination = {"page":"1","pageSize":"10","showTotal":"true"};
      }
      let pageBean = { pageBean: this.pagination };
      if (this.queryParam != "") {
        var conditionfield = JSON.parse(this.customDialog.conditionfield);
        conditionfield.forEach(item => {
          querys.push({
            property: item.field,
            value: this.queryParam,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          });
        });
      }
      if (querys.length > 0) {
        queryFilter = { pageBean: this.pagination, querys };
        this.customDialog.pageBean = queryFilter;
        this.$store.dispatch("dialog/getlistJson", this.customDialog).then(()=>{
            this.checkList();
        });
      } else {
        this.customDialog.pageBean = pageBean;
        this.$store.dispatch("dialog/getlistJson", this.customDialog).then(()=>{
            this.checkList();
        });
      }
    },
    //树形查询
    searchTree(requestParams) {
      // if (this.props1.length < 1) {
        this.$store.dispatch("dialog/getTreeData", requestParams).then(res => {
          if (this.customDialog.displayfield && this.customDialog.resultfield) {
            var displayfield = JSON.parse(this.customDialog.displayfield);
            this.defaultProps.label=displayfield.displayName;
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
      // }
    },
    // 同步选择结果
    syncInputValue() {
      let subIndex = null;
      if (this.$el) {
        subIndex = utils.getSomeAttributeFromParentElement(
          this.$el,
          "data-index"
        );
      }
      var returnStr = JSON.parse(this.customDialog.resultfield);
      //拿到返回的字段
      var field = new Array([returnStr.length]);
      var comment = new Array([returnStr.length]);
      var str = [];
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
      var s =  this.selectOrgs;
      this.showData = [...this.selectOrgs];
      this.checkBoxDataAll = [...this.selectOrgs];
      if(this.customDialog.selectNum === 1){
        s=this.selectOrgs;
      }
      if (this.customDialog.selectNum === 1) {
        var temp = "";
        for (var i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
        }
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));

      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = "";
          for (var j = 0; j < comment.length; j++) {
            temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
          }
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(JSON.parse(temp));
        }
      }


      const pInst = utils.getOnlineFormInstance(this);
      const _this = this;
      this.custdialog.custDialog.mappingConf.forEach(con => {
        var val = "";
        var from="";
        if(_this.customDialog.dsType=="restful") {
          from = con.from;
        }else{
          from = con.from.toLowerCase();
        }
        str.forEach(item => {
          val += item[from] + ",";
        });
        this.$emit("input", val);
        if (this.atter == "data." + con["target"][0]) {
          val=val.substring(0, val.length - 1);
          utils.setValueByPath(
            pInst,
            "data." + con["target"][0],val,subIndex
          );
        } else if(this.atter == "searchForm." + con["target"][0]){
          utils.setValueByPath(
            _this,
            "searchForm." + con["target"][0],
            val.substring(0, val.length - 1),
            subIndex
          );
        } else {
          utils.setValueByPath(
            pInst,
            "data." + con["target"][0],
            val.substring(0, val.length - 1),
            subIndex
          );
        }
      });
    },
    //取消按钮
    dialogCancel() {
      const this_ = this;
      this_.$store.dispatch("dialog/setDialogData", []).then(()=>{
        this_.customDialogShowList = false;
        //判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
        if(!this_.inputVal){
          this_.selectOrgs=[];
        }else{
          this_.selectOrgs = [...this_.showData]
          this.checkBoxDataAll = [...this_.selectOrgs]
        }
      });
    },
    dialogTreeConfirm() {
      this.calacInputSuffixHeight()
      let subIndex = null;
      if (this.$el) {
        subIndex = utils.getSomeAttributeFromParentElement(
          this.$el,
          "data-index"
        );
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
      const pInst = utils.getOnlineFormInstance(this);
      this.custdialog.custDialog.mappingConf.forEach(con => {
        var val = "";
        str.forEach(item => {
          val += item[con.from] + ",";
        });
        if (this.atter == "data." + con["target"][0]) {
          utils.setValueByPath(
            pInst,
            "data." + con["target"][0],
            val.substring(0, val.length - 1),
            subIndex
          );
        } else if(this.atter == "searchForm." + con["target"][0]){
          utils.setValueByPath(
            pInst,
            "searchForm." + con["target"][0],
            val.substring(0, val.length - 1),
            subIndex
          );
        }else{
          utils.setValueByPath(
            pInst,
            "data." + con["target"][0],
            val.substring(0, val.length - 1),
            subIndex
          );
        }
      });
      //this.$emit("input", JSON.stringify(str));
      this.showData = [...this.propsData];//回显的值
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
    treeClick(data, n, i){
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
      if(this.customDialog.selectNum === 1){
        this.$emit("input", "");
        this.selectOrgs.splice(item,1);
        this.showData.splice(item,1);
      }else{
          this.inputVal.splice(item,1);
          // let removeId = this.showData[item];
          //树形
          if(this.propsData.length>0){
            this.propsData.splice(item,1);
          }
          //列表
          if(this.selectOrgs!=null){
            this.selectOrgs.splice(item,1);
            this.checkBoxDataAll.splice(item,1);
            this.selectOrgs.forEach(row => {
              // if(item.id ==removeId ){
              this.isCurrentChange=true;
              this.toggleRowSelection(row, false);
            // }
          });
          }
          this.calacInputSuffixHeight();
          let value="";
          this.inputVal.forEach(val => {
            value += val.value+ ",";
          });
          if(value.length>0){
            value=value.substring(0,value.length-1);
          }
          /*if(value!=""){
            value=value+"||"+JSON.stringify(this.showData);
          }*/
          this.$emit("input", value);
      }
    },
    calacInputSuffixHeight() {
      setTimeout(() => {
        if(!this.$refs.tagSpans) return;
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
        if(this.customDialog.dsType=='dataSource'){
        	for (var i = 0; i < this.displayfield.length; i++) {
                this.displayfield[i].field = this.displayfield[i].field.toLowerCase();
            }
        }
      }else if(this.dialogData.length>1){
        this.search();
      }
      if(this.dialogData.length > 0 && this.displayfield.length==0){
          this.search();
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield);
          if(this.customDialog.dsType=='dataSource'){
            for (var i = 0; i < this.displayfield.length; i++) {
                  this.displayfield[i].field = this.displayfield[i].field.toLowerCase();
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
      let ztree=translateDataToTree(data,pid,id,name);
      function translateDataToTree(data,pid,id,name) {
        //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
        let parents = data.filter(value => value[id] == value[pid] || value[pid] == null || value[pid] == null || value[pid] == 0);
        for(let i=0;i<parents.length;i++){
          parents[i].label=parents[i][name];
        }
        //把树数据有父节点的数据全部过滤掉（只留子节点的数据）
        let children = data.filter(value => value[pid] !== 'undefined' && value[pid] != null && value[id] != value[pid]);
        if(parents.length>0){
          let translator = (parents, children) => {
            parents.forEach((parent) => {
              children.forEach((current, index) => {
                if (current[pid] === parent[id]) {
                  let temp = JSON.parse(JSON.stringify(children));
                  temp.splice(index, 1);
                  translator([current], temp);
                  current.label=current[name];
                  typeof parent.children !== 'undefined' ? parent.children.push(current) : parent.children = [current];
                }
              });
            });
          };
          translator(parents, children);
          return parents;
        }else{
          return children;
        }
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
