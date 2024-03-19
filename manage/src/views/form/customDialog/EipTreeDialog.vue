<template>
    <ht-tree-dialog
        ref="htTreeDialog"
        :data="treeData"
        append-to-body
        :node-key="nodeKey"
        :show-checkbox="showCheckbox"
        :props="defaultProps"
        :leaf-only="false"
        :include-half-checked="false"
        :support-filter="false"
        :expand-on-click-node="false"
        :check-strictly="false"
        :load="loadTree"
        lazy
        class="tree-dialog"
        @onConfirm="treeDialogOnConfirm"
    ></ht-tree-dialog>
</template>
<script>
import { Message } from 'element-ui';
import req from "@/request.js";
export default {
  name: "eip-tree-dialog",
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
    },
    //动态传入的条件参数
    mapParam:{
      type: Object,
    },
    ispreview: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  data() {
    return {
      nodeKey:"ID_",//树数据Id （每个树节点用来作为唯一标识的属性，整棵树应该是唯一的）
      showCheckbox:true,//对话框单选还是多选 true：多选，false：单选
      treeData: [], //树数据
      defaultProps: {
        children: "children",
        label: "name",
        isLeaf:"isLeaf"
      },
      displayField: {},
      treeList: []
    }
  },
  methods: {
    //显示对话框
    showDialog(){
      this.$refs.htTreeDialog.showDialog();
      //判断树是否支持多选
      if (this.customDialog.selectNum == 1) {// 单选
          this.showCheckbox=false;
      }else{
          this.showCheckbox=true;
      }
      //把对话框配置的显示字段ID赋值给树形的树数据Id
      this.nodeKey = this.customDialog.displayfield.id;
      this.customDialogTreeShow();//加载树
    },
    //加载树
    customDialogTreeShow() {
      //得到对话框的配置
      let customDialog = this.customDialog;
      let mapParam = '';//数据来源是数据源，且有动态参数传入时调用
      let defaultPValue = "";//父ID值
      //判断是否有动态传入的条件参数
      if(this.mapParam && JSON.stringify(this.mapParam)!="{}"){
        for(let m in this.mapParam){
          defaultPValue = this.mapParam[m];
          break;
        }
        mapParam = JSON.stringify(this.mapParam);
        mapParam = mapParam.substring(1, mapParam.length - 1);
      }
      //判断数据来源是否是数据源，如果是数据源请求类型就为GET请求；如果数据来源是REST接口，请求类型就获取对话框配置的请求；
      let requestType = customDialog.dsType == "dataSource" ? "GET":customDialog.requestType ? customDialog.requestType:"POST";
      //数据来源是数据源的URL
      let url = "${form}/form/customDialog/v1/getTreeData?alias=" + this.alias +"&mapParam=" + mapParam;
      let paramsObj = {};
      //数据来源是REST接口
      if (customDialog.dsType != "dataSource") {
        url = customDialog.url;
        //判断是否有条件字段
        if (customDialog.conditionfield.length>0) {
          let conditions = customDialog.conditionfield;//条件字段
          for (let i = 0; i < conditions.length; i++) {
            let con = conditions[i];
            //判断是否是POST请求
            if (requestType == "POST") {
                paramsObj[con.field] = con.defaultValue;
            } else {
              let ljChar = url.indexOf("?") == -1 ? "?" : "&";
              url = url + ljChar + con.field + "=" + con.defaultValue;
            }
          }
        }
      }
      let requestParams = {};
      requestParams.requestType = requestType;
      requestParams.url = url;
      requestParams.paramsObj = paramsObj;
      this.searchTree(requestParams,defaultPValue);
    },
    //树形查询
    searchTree(requestParams,defaultPValue) {
      const this_=this;
      let query = requestParams.requestType == 'POST'?req.post(requestParams.url,requestParams.paramsObj):req.get(requestParams.url);
      query.then(function (response) {
        //显示字段配置
        let displayfield = this_.customDialog.displayfield;
        this_.displayField = displayfield;
        //把对话框配置的显示字段显示名称赋值给树形的显示值
        this_.defaultProps.label=displayfield.displayName;
        this_.treeList = response.data;
        //得到要加载树的信息
        if(defaultPValue){
          displayfield.pvalue = defaultPValue;
        }
        this_.treeData = this_.toTreeData(response.data,displayfield.id,displayfield.pid,displayfield.displayName, displayfield.pvalue ? displayfield.pvalue : 0);
      });
    },
    //加载树的信息
    toTreeData(data, id, pid, name, pvalue) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      return this.translateDataToTree(data,pid,id,name,pvalue);
    },
    translateDataToTree(data,pid,id,name,pvalue) {
        //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
        let parents = data.filter(value => value[id] == value[pid] || value[pid] == null || value[pid] == pvalue);
        if (!parents){
            parents = data.filter(value => value[pid] !== 'undefined' && value[pid] != null && value[id] != value[pid]);
        }
        return parents
    },
    //树节点 点击事件
    loadTree(node, resolve){
        if (node){
            resolve(this.treeList.filter(value => value[this.displayField.pid] === node.data[this.displayField.id]));
        }else {
            resolve([])
        }
    },
    //确认事件
    treeDialogOnConfirm(data){
      //单选
      if(this.customDialog.selectNum === 1 && (data.constructor === Object && JSON.stringify(data)=="{}")){
        Message.error("请至少选择一条数据");
        return;
      }else if(this.customDialog.selectNum === 1 && (data.constructor === Array && data.length>0)){//多选
        Message.error("请至少选择一条数据");
        return;
      }
      //拿到配置的返回字段
      let returnStr = this.customDialog.resultfield;
      //返回字段的字段名有多少个
      let field = new Array([returnStr.length]);
      //返回字段的返回名称有多少个
      let comment = new Array([returnStr.length]);
      let str = [];
      for (let i = 0; i < returnStr.length; i++) {
        //得到返回字段的字段名
        field[i] = this.customDialog.dsType=='dataSource'?returnStr[i].field:returnStr[i].field;
        //得到返回字段的返回名称
        comment[i] = this.customDialog.dsType=='dataSource'?returnStr[i].comment:returnStr[i].comment;
      }
      let s = [];
      //是否单选  1：单选；-1：多选
      if(this.customDialog.selectNum === 1){
        s.push(data);
        this.deleteChildren(s);//循环把树数组里面的子节点数据删除
        let temp = "";
        for (let i = 0; i < comment.length; i++) {
            temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
        }
        //去除字符串最后一个字符逗号
        if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));
      } else {
        s = data;
        this.deleteChildren(s);//循环把树数组里面的子节点数据删除
        for (let i = 0; i < s.length; i++) {
            var temp = "";
            for (let j = 0; j < comment.length; j++) {
                temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
            }
            //去除字符串最后一个字符逗号
            if (temp != "") {
                temp = "{" + temp.substring(0, temp.length - 1) + "}";
            }
            str.push(JSON.parse(temp));
        }
      }
      if (this.ispreview) {
         Message.success("返回数据为："+JSON.stringify(str));
      }
      this.$emit("return-all-data", s);
      this.$emit('onConfirm',str);
      this.$refs.htTreeDialog.handleClose();//关闭对话框
    },
    //循环把树数组里面的子节点数据删除
    deleteChildren(arrayVal){
      for(let i=0;i<arrayVal.length;i++){
        delete arrayVal[i].children;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.tree-dialog{
  /deep/.el-dialog{
    margin-top: 6vh !important;
  }
}
</style>
