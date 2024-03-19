<template>
  <div>
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
    >
      <template v-slot:search v-if="customDialog.conditionfield.length>0 && isShowSearch">
        <ht-table-search-panel :divide="3">
          <ht-table-search-field
            v-for="(item,$index) in customDialog.conditionfield"
            :type="item.type"
            :key="$index"
            :label="item.comment"
            :value-format="item.type == 'date'? 'yyyy-MM-dd HH:mm:ss':''"
            :prop="item.field"
          />
        </ht-table-search-panel>
      </template>
      <template>
        <ht-table-column align="center" :hidden="customDialog.selectNum!=1" width="33">
          <template v-slot="{row,index}">
            <el-radio v-model="textRadio" :label="row[customDialog.displayfield[0].field]+index" />
          </template>
        </ht-table-column>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column
          v-for="(item,$index) in customDialog.displayfield"
          :key="$index"
          :prop="item.field.toLowerCase()"
          :label="item.comment"
          :sortable="true"
          :show-overflow-tooltip="true"
        ></ht-table-column>
      </template>
    </ht-table>
  </div>
</template>

<script>
import req from "@/request.js";
import hotentUiUtils from '@/hotent-ui-util.js'

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
      }
    };
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
      //为REST接口且请求类型是POST，条件字段是固定值的参数
      if (
        this.customDialog.dsType != "dataSource" &&
        this.customDialog.requestType == "POST" &&
        this.customDialogPostParam.length > 0
      ) {
        for (let i = 0; i < this.customDialogPostParam.length; i++) {
          //构建查询条件
          let operation=this.getOperation(this.customDialogPostParam[i].condition);
          let obj = {
            group: "main",
            operation: operation,
            property: this.customDialogPostParam[i].comment,
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
        .finally(() => cb&&cb());
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
        this.tableData = response.data[this.customDialog.listKey];
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
        } else{
          this.tableData=[];
          this.nopagination = true; //隐藏分页组件
        }

      }
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
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      //是否单选  1：单选；-1：多选
      if (this.customDialog.selectNum === 1) {
        //选中单选按钮
        this.textRadio =
          event.currentTarget.children[0].children[0].children[0].__vue__.$refs.radio.value;
        this.selectionRadio = [row];
        this.$emit("orgRowClick",row)
      } else {
        //点击列表数据选中复选框
        this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
