<template>
    <el-container  class="dialog-el-container">
      <el-aside v-if="customDialog.style == 2" style="width:23%" v-show="treeShow" class="tree-aside">
            <el-card>
              <div slot="header" class="clearfix">
                <span style="font-size:16px">{{leftTreeTitle}}</span>
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
        <el-main>
          <ht-table
                  @load="loadData"
                  :data="tableData"
                  :pageResult="pageResult"
                  :selectable="selectable"
                  :nopagination="nopagination"
                  :show-export="false"
                  @row-click="orgRowClick"
                  :show-custom-column="false"
                  ref="htTable"
                  justShowSearch
                  :pagerCount="5"
                  paginationJustify="end"
          >
            <template v-slot:search v-if="customDialog.conditionfield.length>0 && isShowSearch">
              <ht-table-search-panel :divide="3" :isFlexLayout="true">
                <ht-table-search-field
                        v-for="(item,$index) in customDialog.conditionfield"
                        :type="item.type"
                        :key="$index"
                        :label="item.comment"
                        :value-format="item.type == 'date'? 'yyyy-MM-dd HH:mm:ss':''"
                        :prop="item.field"
                        isAlignRight
                />
              </ht-table-search-panel>
            </template>
            <template>
              <ht-table-column align="center" :hidden="customDialog.selectNum!=1" width="40">
                <template v-slot="{row,index}">
                  <el-radio v-model="textRadio" :label="row[customDialog.displayfield[0].field]+index" />
                </template>
              </ht-table-column>
              <!-- <ht-table-column type="index" width="50" align="center" label="序号" /> -->
              <ht-table-column
                      v-for="(item,$index) in customDialog.displayfield"
                      :key="$index"
                      :prop="item.field"
                      :label="item.comment"
                      :sortable="true"
                      :show-overflow-tooltip="true"
              ></ht-table-column>
            </template>
          </ht-table>
        </el-main>
    </el-container>
</template>
<script>
import req from "@/request.js";
import hotentUiUtils from '@/hotent-ui-util.js'
import HtTable from '@/components/common/HtTable.vue'
export default {
  name: "custom-dialog-show-detail",
  props: {
    //自定义对话框的别名
    alias: {
      type: String,
      required: true
    },
    //自定义对话框的配置
    customDialog: {
      type: Object,
      required: true
    }
  },
  components:{HtTable},
  mounted() {
    const displayfield = JSON.stringify(this.customDialog.displayfield).toLowerCase();
    this.customDialog.displayfield = JSON.parse(displayfield);
    this.afterOpen();
  },
  data() {
    return {
      customDialogPostParam: [], //为REST接口且请求类型是POST，条件字段是固定值的参数
      customDialogGetUrl: "", //为REST接口且请求类型是GET，条件字段是固定值的请求地址
      selectionRadio: [], //ht-table列表单选选择的数据
      textRadio: "", //ht-table列表数据的单选按钮
      selectable: true, //表示ht-table列表第一列是否显示复选框
      isShowSearch: false, //是否显示高级搜索
      nopagination: false, //是否隐藏分页组件，false：显示，true：隐藏
      tableData: [], //ht-table列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      combinationTreeData:[],
      treeShow: true,
      leftTreeTitle:"",
      defaultProps:{
        childen:'children',
        label:'label'
      },
      nodeKey:"ID_",
      treeList:[],
      combinationTreeQuerys:[],
      queryParam:{},
    };
  },
  created() {
    this.initData();
  },
  methods: {
    //显示对话框
    initData() {
      this.customDialogPostParam = []; //清空为REST接口且请求类型是POST，条件字段是固定值的参数
      this.customDialogGetUrl = ""; //清空为REST接口且请求类型是GET，条件字段是固定值的请求地址
      this.selectionRadio = []; //清空ht-table列表单选选择的数据
      this.textRadio = ""; //清空ht-table列表数据单选按钮的选中状态
      this.isShowSearch = false; //不显示高级搜索
      //是否单选  1：单选；-1：多选
      if (this.customDialog.selectNum == 1) {
        this.selectable = false;
      } else {
        this.selectable = true;
      }
      //是否显示分页组件，true：显示，false：隐藏
      if (this.customDialog.needPage) {
        this.nopagination = false;
      } else {
        this.nopagination = true;
      }
      //判断是否有条件查询,且数据来源是数据源或者数据来源是REST接口且请求类型是POST
      if (
        this.customDialog.conditionfield.length > 0 &&
        (this.customDialog.dsType == "dataSource" ||
          (this.customDialog.dsType != "dataSource" &&
            this.customDialog.requestType == "POST"))
      ) {
        for (let i = this.customDialog.conditionfield.length - 1; i >= 0; i--) {
          //判断条件字段是否是参数传入并控制器的类型为单行文本框  （controllerType有值就代表控制器的类型为单行文本框，defaultType：1：参数传入，2：固定值 ）
          if (
            this.customDialog.conditionfield[i].controllerType &&
            this.customDialog.conditionfield[i].defaultType == "1"
          ) {
            this.isShowSearch = true; //显示高级搜索
            //如果条件字段为data类型，则控制器的类型为日期类型
            if (this.customDialog.conditionfield[i].dbType == "date") {
              this.customDialog.conditionfield[i].type = "date";
            } else {
              this.customDialog.conditionfield[i].type = "text";
            }
          } else {
            if (
              this.customDialog.dsType != "dataSource" &&
              this.customDialog.requestType == "POST"
            ) {
              this.customDialogPostParam.push(
                this.customDialog.conditionfield[i]
              ); //为REST接口且请求类型是POST，条件字段是固定值的参数
            }
            //如果是条件字段固定值就清除
            this.customDialog.conditionfield.splice(i, 1);
          }
        }
      }
      //判断是否有条件查询,且数据来源是REST接口且请求类型是GET
      if (
        this.customDialog.conditionfield.length > 0 &&
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "GET"
      ) {
        for (let i = this.customDialog.conditionfield.length - 1; i >= 0; i--) {
          //判断条件字段是否是固定值（defaultType：1：参数传入，2：固定值 ）
          if (this.customDialog.conditionfield[i].defaultType == "2") {
            //判断请求地址是否带有 ？
            if (this.customDialog.url.indexOf("?") == -1) {
              //无
              this.customDialog.url =
                this.customDialog.url +
                "?" +
                this.customDialog.conditionfield[i].comment +
                "=" +
                this.customDialog.conditionfield[i].defaultValue;
            } else {
              //有
              this.customDialog.url =
                this.customDialog.url +
                "&" +
                this.customDialog.conditionfield[i].comment +
                "=" +
                this.customDialog.conditionfield[i].defaultValue;
            }
            //如果是条件字段固定值就清除
            this.customDialog.conditionfield.splice(i, 1);
            this.customDialogGetUrl = this.customDialog.url;
            //判断条件字段是否是参数传入并控制器的类型为单行文本框（controllerType有值就代表控制器的类型为单行文本框，defaultType：1：参数传入，2：固定值 ）
          } else if (
            this.customDialog.conditionfield[i].controllerType &&
            this.customDialog.conditionfield[i].defaultType == "1"
          ) {
            this.isShowSearch = true; //显示高级搜索
          }
        }
      }
    },
    //加载数据
    async loadData(param, cb) {
      this.queryParam = param;
      //判断是否有来自组合对话框树型部分的查询参数
      if(this.combinationTreeQuerys && this.combinationTreeQuerys.length > 0){
        if(!param.querys){
          param.querys = [];
        }
        for(let i = 0;i<this.combinationTreeQuerys.length;i++){
          param.querys.push(this.combinationTreeQuerys[i]);
        }
      }
      //为REST接口且请求类型是POST，条件字段是固定值的参数
      if (
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "POST" &&
        this.customDialogPostParam.length > 0
      ) {
        for (let i = 0; i < this.customDialogPostParam.length; i++) {
          let operation=this.getOperation(this.customDialogPostParam[i].condition);
          //构建查询条件
          let obj = {
            group: "main",
            operation: operation,
            property: this.customDialogPostParam[i].field,
            relation: "AND",
            value: this.customDialogPostParam[i].defaultValue
          };
          if (param.querys && param.querys.length > 0) {
            param.querys.push(obj);
          } else {
            param.querys = [];
            param.querys.push(obj);
          }
        }
      }

      // post restful接口，并且配置了post参数。则以post参数作为请求参数
      if (
        this.customDialog.dsType != 'dataSource' &&
        this.customDialog.requestType == 'POST' &&
        this.customDialog.dataParam &&
        this.customDialog.dataParam.constructor == String 
      ) {
        // 构建上下文数据对象
        let ctx = {}
        param && param.querys && param.querys.forEach((element) => {
          ctx[element.property] = element.value
        })
        const exp = hotentUiUtils.parseExp(this.customDialog.dataParam, ctx)
        try {
          param = JSON.parse(exp)
        } catch (e) {
          this.$message.error(`POST参数不是有效的JSON格式${query.dataParam}`)
        }
      }

      //判断是否有条件查询,且数据来源是REST接口且请求类型是GET，并且判断参数传入是否填写了查询条件
      if (
        this.customDialog.conditionfield.length > 0 &&
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "GET" &&
        param.querys &&
        param.querys.length > 0
      ) {
        for (let i = this.customDialog.conditionfield.length - 1; i >= 0; i--) {
          //判断条件字段是否是参数传入并控制器的类型为单行文本框（controllerType有值就代表控制器的类型为单行文本框，defaultType：1：参数传入，2：固定值 ）
          if (
            this.customDialog.conditionfield[i].controllerType &&
            this.customDialog.conditionfield[i].defaultType == "1"
          ) {
            //参数传入填写了查询条件
            for (let j = 0; j < param.querys.length; j++) {
              //判断为REST接口且请求类型是GET，条件字段是固定值的请求地址是否为空
              if (this.customDialogGetUrl != "") {
                this.customDialog.url = this.customDialogGetUrl; //赋值为REST接口且请求类型是GET，条件字段是固定值的请求地址
              } else {
                this.customDialogGetUrl = this.customDialog.url;
              }
              //判断请求地址是否带有 ？
              if (this.customDialog.url.indexOf("?") == -1) {
                //无
                this.customDialog.url =
                  this.customDialog.url +
                  "?" +
                  param.querys[j].property +
                  "=" +
                  param.querys[j].value;
              } else {
                //有
                this.customDialog.url =
                  this.customDialog.url +
                  "&" +
                  param.querys[j].property +
                  "=" +
                  param.querys[j].value;
              }
            }
          }
        }
      } else {
        //判断为REST接口且请求类型是GET，条件字段是固定值的请求地址是否为空
        if (this.customDialogGetUrl != "") {
          this.customDialog.url = this.customDialogGetUrl; //赋值为REST接口且请求类型是GET，条件字段是固定值的请求地址
        }
      }
      let queryUrl =
        this.customDialog.dsType == "dataSource"
          ? "${form}/form/customDialog/v1/getListData?alias=" +
            this.alias +
            "&mapParam="
          : this.customDialog.url;
      let requestMethod = "POST";
      //如果自定义对话框列表查询数据不是数据源则请求方法为restful配置的请求方式
      if (this.customDialog.dsType != "dataSource") {
        requestMethod = this.customDialog.requestType;
      }
      //查询数据
      let response = await req
        .request({
          url: queryUrl,
          method: requestMethod,
          data: param
        })
        .finally(() => cb && cb());
      //如果数据来源是REST接口，且请求类型是GET
      if (
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "GET"
      ) {
        this.tableData = response.data;
        this.nopagination = true; //隐藏分页组件
      }
      //如果数据来源是REST接口且请求类型是POST
      if (
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "POST"
      ) {
        let rows = response.data[this.customDialog.listKey];
        let newRows = [];
        if(rows.length>0){
          for(let i=0;i<rows.length;i++){
            let data = rows[i];
            let keys = Object.keys(data);
            let objRows = {};
            keys.forEach(key => {
              objRows[key.toLowerCase()] = data[key];
            });
            newRows.push(objRows);
          }
        }
        if(newRows.length>0){
          this.tableData = newRows;
        }else{
          this.tableData = rows;
        }
        //如果有分页
        if (response.data[this.customDialog.pageKey]) {
          this.pageResult = {
            page: response.data[this.customDialog.pageKey],
            pageSize: response.data[this.customDialog.pageSizeKey],
            total: response.data[this.customDialog.totalKey]
          };
          this.nopagination = false; //显示分页组件
        } else {
          this.nopagination = true; //隐藏分页组件
        }
      }
      //如果数据来源是数据源
      if (this.customDialog.dsType == "dataSource") {

        if (response.data &&response.data.rows){
          this.tableData = response.data.rows;
          //如果有分页
          if (response.data.page) {
            this.pageResult = {
              page: response.data.page,
              pageSize: response.data.pageSize,
              total: response.data.total
            };
            this.nopagination = false; //显示分页组件
          } else {
            this.nopagination = true; //隐藏分页组件
          }
        }else{
          this.tableData=[];
          this.nopagination = true; //隐藏分页组件
        }
      }
    },
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      //是否单选  1：单选；-1：多选
      if (this.customDialog.selectNum === 1) {
        //选中单选按钮
        this.textRadio =
          event.currentTarget.children[0].children[0].children[0].__vue__.$refs.radio.value;
        this.selectionRadio = [row];
        this.$emit("orgRowClick", row);
      } else {
        //点击列表数据选中复选框
        this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      }
    },
    afterOpen(){
      //打开对话框之后加载树
      this.loadCombinationTree()
    },
    loadCombinationTree(){
      if(this.customDialog.style != 2){
        return ;
      }
      let combinationRule = JSON.parse(this.customDialog.combinationRule);
      this.combinationRule = combinationRule;
      let treeAlias = combinationRule.leftTree;
      //获取对话框数据
      req.get('${form}/form/customDialog/v1/getByAlias?alias='+treeAlias).then(resp=>{
        let treeDialog = resp.data;
        this.leftTreeTitle = treeDialog.name;
        let reqParam = {};
        let requestType = treeDialog.dsType == 'dataSource' ? 'GET' : treeDialog.requestType ? treeDialog.requestType : 'POST';
        let url = '${form}/form/customDialog/v1/getTreeData?alias=' + treeAlias + "&mapParam=";
        let paramsObj = {};
        if(treeDialog.dsType != 'dataSource'){
          url = treeDialog.url;
          let templatePa = treeDialog.dataParam;
          if(treeDialog.conditionfield){
            let conditions = JSON.parse(treeDialog.conditionfield);
            for(let i = 0 ; i < conditions.length ; i++){
              let con = conditions[i];
              if(requestType == 'POST'){
                if(templatePa){
                  templatePa = templatePa.replace(new RegExp('\\{' + con.field + '\\}', 'g'),con.defaultValue);
                }else{
                  paramsObj[con.field] = con.defaultValue;
                }
              }else{
                let ljChar = url.indexOf('?') == -1 ? '?' : '&';
                url = url + ljChar + con.field + '=' + con.defaultValue;
              }
            }
            if(templatePa){
              paramsObj = JSON.parse(templatePa);
            }
          }
        }
        let requestParams = {};
        requestParams.requestType = requestType;
        requestParams.url = url;
        requestParams.paramsObj = paramsObj;
        req.get(url).then(resp => {
          resp = resp.data;
          if(treeDialog.displayfield && treeDialog.resultfield){
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
              displayField.pvalue ? displayField.pvalue:'0',
              resultfield
            )
          }
        })
      })
    },
    combiTreeClick(paramObj,node,nodeComponent){
      //组合对话框点击左树
      //清空旧的
      this.combinationTreeQuerys.splice(0);
      let combinationRule = JSON.parse(this.customDialog.combinationRule);
      if(!combinationRule.rules || combinationRule.rules.length == 0){
        return ;
      }
      let rules = combinationRule.rules;
      for(let i = 0;i < rules.length ; i++){
        let value = paramObj[rules[i].treeField];
        let property = rules[i].listField;
        this.combinationTreeQuerys.push({
          property:property,
          value: value,
          group: "treeGroup",
          operation:this.getOperation(rules[i].condition),
          relation: "AND"
        })
      }
      //this.search();

      this.loadData(this.queryParam)
    },
    //获取运算符号
    getOperation(old){
      if(!old){
        return "";
      }else if(old == "EQ"){
        return "EQUAL";
      }else if(old == "EIC"){
        return "EQUAL_IGNORE_CASE"
      }else if(old == "LT"){
        return "LESS"
      }else if(old == "GT"){
        return "GREAT"
      }else if(old == "LE"){
        return "LESS_EQUAL"
      }else if(old == "GE"){
        return "GREAT_EQUAL"
      }else if(old == "NE"){
        return "NOT_EQUAL"
      }else if(old == "LK"){
        return "LIKE"
      }else if(old == "LFK"){
        return "LEFT_LIKE"
      }else if(old == "RHK"){
        return "RIGHT_LIKE"
      }else if(old == "ISNULL"){
        return "IS_NULL"
      }else if(old == "NOTNULL"){
        return "NOTNULL"
      }else if(old == "IN"){
        return "IN"
      }else if(old == "BETWEEN"){
        return "BETWEEN"
      } else{
        return "LIKE"
      }
    },
    toggleTree(){
      if(this.treeShow){
        this.treeShow = false;
        this.transtionWidth = "0%";
        this.toggleBtn = "el-icon-arrow-right"
      }else{
        this.treeShow = true;
        this.transtionWidth = "25%";
        this.toggleBtn = "el-icon-arrow-left"
      }
    },
    loadTree(node, resolve) {
      if (node) {
        let this_ = this
        let displayField = this_.customDialog.style == 2 ? this_.combiTreeDisplayField : this_.displayField
        resolve(this.treeList.filter(value => value[displayField.pid] === node.data[displayField.id]))
        if (this.showData && this.showData.length > 0) {
          setTimeout(() => {
            this.showData.forEach(v => {
              if (v.Pid == node.key) {
                this_.$refs.tree.setChecked(v, true)
              } else {
                this_.checkNode(v, this_)
              }
            })
          }, 400)
        }
      }
    },
    toTreeData(data, id, pid, name, pvalue, returnStr) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      //  let ztree=translateDataToTree(data,pid,id,name);
      //  function translateDataToTree(data,pid,id,name) {
      //    //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
      let parents = data.filter(value => value[id] == value[pid] || value[pid] == null || value[pid] == null || value[pid] == 0)
      if (!parents) {
        parents = data.filter(value => value[pid] !== 'undefined' && value[pid] != null && value[id] != value[pid])
      }
      return parents
    },
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.dialog-el-container{
  height: calc(100% - 20px)
}
.tree-aside{
  margin-right: 10px;
}
</style>
