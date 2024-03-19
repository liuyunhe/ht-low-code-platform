<template>
   <div style="position: relative; height: 450px;overflow: auto;">
      <form :data-vv-scope="'form1'+type" v-form>
        <table
          class="table-list custom_condition_tab table"
          :style="tab.style"
          v-for="tab in tabList"
          :key="tab.indexStr"
        >
          <tbody>
            <tr>
              <td style="width:160px">
                <el-select
                  v-model="tab.property"
                  v-validate="{required:true}"
                  @change="setFieldOtherInfo(this,tab,1)"
                  style="width:140px;"
                  size="mini"
                >
                  <el-option
                      :value="m.pathStr"
                      :label="m.desc"
                      v-for="m in varTree"
                      :key="m.pathStr"
                    ></el-option>
                </el-select>
              </td>
              <td style="width:110px;">
                <el-select v-model="tab.operator" style="width:100px;" size="mini">
                  <el-option label="等于" value="1"></el-option>
                  <el-option label="不等于" value="2"></el-option>
                  <el-option label="大于" v-if="tab.dataType =='date'|| tab.dataType =='number'" value="3"></el-option>
                  <el-option label="大于等于" v-if="tab.dataType =='date'|| tab.dataType =='number'" value="7">大于等于</el-option>
                  <el-option label="小于" v-if="tab.dataType =='date'|| tab.dataType =='number'" value="4"></el-option>
                  <el-option label="小于等于" v-if="tab.dataType =='date'|| tab.dataType =='number'" value="8">小于等于</el-option>
                  <el-option label="包含" v-if="tab.dataType =='varchar' " value="5">包含</el-option>
                  <el-option label="不包含" v-if="tab.dataType =='varchar' " value="6">不包含</el-option>
                  <el-option label="属于" v-if="tab.dataType =='date'|| tab.dataType =='varchar'" value="9">属于</el-option>
                  <el-option label="不属于" v-if="tab.dataType =='varchar'" value="10">不属于</el-option>
                </el-select>
              </td>
              <td style="width:100px;">
                <el-select v-model="tab.compType"  size="mini" style="width:90px;"  @change="tab.value=''">
                  <el-option label="固定值" value="2"></el-option>
                  <el-option label="变量" v-if="tab.dataType =='varchar' || (tab.dataType =='date' && tab.operator !='9')" value="1"></el-option>
                </el-select>
              </td>

              <td v-if="tab.compType=='2' && tab.dataType=='date' && tab.operator != '9'" style="width:220px;">
                <ht-date
                  v-model="tab.value"
                  style="width:210px;"
                  :validate="{'required':true}"
                  :format="tab.format"
                  :showDate="true"
                  :day="-3"
                />
              </td>

              <td v-if="tab.compType=='2' && tab.dataType=='date' && tab.operator == '9'" style="width:320px;">
                <el-date-picker
                  v-if="tab.operator == '9'"
                  v-model="tab.value"
                  :format="tab.format"
                  :value-format="tab.format"
                  :validate="{'required':true}"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
              </td>

              <td v-if="tab.compType==2 && tab.dataType !='date'" style="width:220px;">
                <ht-input style="width:203px;" size="mini" v-model="tab.value" :validate="{'required':true}"  />
              </td>

              <td style="width:220px;" v-if="tab.compType== '1'">
                <el-select v-model="tab.value" style="width:200px;" size="mini">
                  <el-option label="当前日期" v-if="tab.dataType =='date' && tab.compType=='2'" value="curDate"></el-option>
                  <el-option label="当前用户ID" v-if="tab.dataType =='varchar' && tab.operator != '9' && tab.operator != '10'" value="curUserId"></el-option>
                  <el-option label="当前用户账号" v-if="tab.dataType =='varchar' && tab.operator != '9' && tab.operator != '10'"  value="curUserAccount"></el-option>
                  <el-option label="当前用户姓名" v-if="tab.dataType =='varchar' && tab.operator != '9' && tab.operator != '10'" value="curUserName"></el-option>
                  <el-option label="当前用户组织ID" v-if="tab.dataType =='varchar' && (tab.operator == '9' || tab.operator == '10')"  value="curUserOrgIds"></el-option>
                  <el-option label="当前用户组织及下级组织ID" v-if="tab.dataType =='varchar' && (tab.operator == '9' || tab.operator == '10')" value="curUserOrgAndUnderIds"></el-option>
                  <el-option label="当前用户角色别名" v-if="tab.dataType =='varchar' &&  (tab.operator == '9' || tab.operator == '10')" value="curUserRolesAlias"></el-option>
                </el-select>
              </td>

              <td style="width:60px;">
                <el-button
                  @click="removeCondition(tab.indexStr)"
                  size="mini"
                  icon="el-icon-delete"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div class="labelrag" :style="branch.style" v-for="(branch,$index) in branchList" :key="branch.indexStr">
        <el-select v-model="branch.newjunction"  style="height: 24px"  class="selected_search" @change="changecondition($index)">
          <el-option label="并且" value="and"></el-option>
          <el-option label="或者" value="or"></el-option>
          <el-option label="添加条件" value="3"></el-option>
          <el-option label="添加联合条件" value="4" v-if="branch.condition !='noAdd' "></el-option>
          <el-option label="删除" value="5" v-if="branch.condition !='noDel' "></el-option>
        </el-select>
      </div>
    <div v-html="svgHtml" style="position: absolute; z-index: 1; width: 800px; height: 100%;"></div>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import FlowNodeCusersSelector from "@/components/flow/FlowNodeCusersSelector.vue";
import utils from "@/hotent-ui-util.js"

export default {
  components: { },
  props: ["curTableAuth", "table","boTree","type","finishTable"],
  data() {
    return {
        userConditionTab:'first',
        dialogVisible:false,
        title:'子表数据授权',
        conditionObj:{},
        conditionName:'',
        pathList:[],
        data:{},
        branchList:[],
        tabList:[],
        Tree:[],
        svgHeight:'400px',
        Mleft:50, //初始左边距50
        Mtop:20, //初始上边距40
        XIncase:100,//x轴递增数值70   
        YIncase:50,//y轴递增数据50
        svgHtml:'',
        curEditTab:{},
        filedsObj: {},
        varTree: [],
        defaultCondition: {
          property: "",
          operator: "1",
          dataType: "",
          value: "",
          compType: "2"
      }
    };
  },
  computed: mapState({
    defConfigData:state => state.flow.defConfigData
  }),
  created() {
    this.initCondition(this.curTableAuth,this.table,this.boTree);
    let me_ =this;
    this.$root.$on('sub-row-auth-confirm-start',function(){
      me_.handleClose();
    });
  },
  methods: {
    initCondition: function(curTableAuth,table,boTree) {
      let this_ = this;
      this_.conditionObj = {'junction':'and','condition':[]};
      
      this_.buildVarTree(table,boTree);

      if (curTableAuth && curTableAuth[this.type] && curTableAuth[this.type].conditionObj) {
        this_.conditionObj = JSON.parse(curTableAuth[this.type].conditionObj);
      }
      this_.buildConditionTree(this_.conditionObj);
    },
    buildVarTree(table,boTree) {
      var treeArr = [];
      if (!boTree ||  boTree.length < 0) {
        return;
      }
      let fieldPrefix = boTree[0].children[0].fieldPrefix;
      let subEntList = boTree[0].children[0].children;
      if (subEntList && subEntList.length > 0) {
        subEntList.forEach(sub => {
          if (sub.name == table.tableName) {
            sub.attributeList.forEach(cAttr => {
              cAttr.path = cAttr.tableName;
              cAttr.pathStr =fieldPrefix+ cAttr.name;
              this.filedsObj[cAttr.pathStr] = cAttr;
              treeArr.push(cAttr);
            });
          }
        });
      }
      if (treeArr.length > 0) {
        this.varTree = treeArr;
      } 
    },
    
    isNotEmpty(val){
      if (!val || val.length ==0) {
        return false;
      }
      return true;
    },
    //根据条件数组构建条件分支界面
   buildConditionTree(data){
      let pathArr=[];
      let tableArr=[];
      let branchArr=[];
      this.buildData(data,pathArr,tableArr,branchArr);
      this.pathList=pathArr;
      this.branchList=branchArr;
      this.tabList=tableArr;
      //取路径最后一条数据，因为该条数据的高度距离顶部最大
      let lastPath=pathArr[pathArr.length-1];
      let lastIndexArr=[];
      if(lastPath)lastIndexArr=lastPath.split(',');
      //取最后一个坐标点。终点纵坐标为整个svg中最大的纵坐标
      let lastYIndex=lastIndexArr[lastIndexArr.length-1];
      //设置svg的高度为最大纵坐标+100，从而实现svg页面高度自适应
      if(lastYIndex){
          this.svgHeight=(parseInt(lastYIndex)+50)+"px";
      }
      this.createSvgHtml(pathArr);
    },
    ArrayTool(ary,idx,direct){
      direct = direct || "down";
      let part = ary[idx];
      if (!part || (part.constructor !== Object && part.constructor !== Array)) {
          return ary;
      }
      if (part.constructor === Object) {
          part = [part];
      }
      if (direct == "up") {
          part.forEach(m => {
              let index = ary.indexOf(m, 1);
              if (index > 0) {
                  let t=ary[index-1];
                  ary.splice(index - 1,1,ary[index]);
                  ary.splice(index,1,t);
              }
          });
      } else if (direct == "down") {
          for (var i = part.length - 1, m; (m = part[i--]);) {
              let index = ary.indexOf(m, 0);
              if (index > -1 && index < ary.length - 1) {
                  let t=ary[index+1];
                  ary.splice(index + 1,1,ary[index]);
                  ary.splice(index,1,t);
              }
          }
      }
    },
      //构建svg图形页面
     createSvgHtml(pathArr){
        this.svgHtml = '';
        var html='<svg height="'+this.svgHeight+'" version="1.1" width="692" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; position: relative;">';
        for(var i=0;i<pathArr.length;i++){
            html+='<path fill="none" stroke="#787878"'+'d="'+this.pathList[i]+'" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>' ;
        }
        html+='</svg>';
        this.svgHtml = html;
    },
    changecondition (index) {
      var oldVal=this.branchList[index].oldjunction;
      var newVal=this.branchList[index].newjunction;
      if(newVal=='3' || newVal=='4'  || newVal=='5'){
          this.branchList[index].newjunction=this.branchList[index].oldjunction;
          var indexStr=this.branchList[index].indexStr;
          if(newVal=='3'){
              this.addCondition(indexStr);
          }else if(newVal=='4'){
              this.addUnionCondition(indexStr);
          }else{
            this.$confirm("确定要删除此联合条件及其下属的所有子条件吗？", "提示", {
              cancelButtonText: "取消",
              confirmButtonText: "确定",
              type: "warning",
              closeOnClickModal: false
            }).then(() => {
              this.removeCondition(indexStr);
            });
          }
      }else{
          this.branchList[index].oldjunction=this.branchList[index].newjunction;
          var indexStr=this.branchList[index].indexStr;
          var indexArr=indexStr.split(',');
          if(indexStr=='root'){
              this.conditionObj.junction=newVal;
          }else if(indexArr.length==1){
              this.conditionObj.condition[indexStr].junction=newVal;
          }else if(indexArr.length==2){
              this.conditionObj.condition[indexArr[0]].condition[indexArr[1]].junction=newVal;
          }
      }
   },
  //添加一个联合
  addCondition(indexStr){
      var data=this.conditionObj.condition;
      if(indexStr=='root'){
          data.push(JSON.parse(JSON.stringify(this.defaultCondition)));
      }else{
          var indexArr=[];
          if(indexStr) indexArr=indexStr.split(',');
          for(var i=0;i<data.length;i++){
              if(indexArr.length>0 && i==indexArr[0]){
                  if(indexArr.length>1){
                      for(var j=0;j<data[i].condition.length;j++){
                          if(j==indexArr[1]){
                              data[i].condition[j].condition.push(JSON.parse(JSON.stringify(this.defaultCondition)))
                              break;
                          }
                      }
                  }else{
                      data[i].condition.push(JSON.parse(JSON.stringify(this.defaultCondition)));
                  }
                  break;
              }
          }
      }
      this.conditionObj.condition=data;
      this.buildConditionTree(this.conditionObj);
  },
  removeCondition (indexStr) {
    var indexArr=[];
    if(indexStr) indexArr=indexStr.split(',');
    if(indexArr.length>0){
        var data=this.conditionObj.condition;
        for(var i=0;i<data.length;i++){
            if(i==indexArr[0]){
                if(indexArr.length>1){
                    for(var j=0;j<data[i].condition.length;j++){
                        if(j==indexArr[1]){
                            if(indexArr.length>2){
                                for(var z=0;z<data[i].condition[j].condition.length;z++){
                                    if(z==indexArr[2]){
                                        data[i].condition[j].condition.splice(z, 1);
                                        break;
                                    }
                                }
                            }else{
                                data[i].condition.splice(j, 1);
                            }
                            break;
                        }
                    }
                }else{
                    data.splice(i, 1);
                }
                break;
            }

        }
        this.conditionObj.condition=data;
        this.buildConditionTree(this.conditionObj);
    }
  },
  //添加一个联合条件条件
 addUnionCondition(indexStr){
      var data=this.conditionObj.condition;
      if(indexStr=='root'){
          data.push({'junction':'or','condition':[]});
      }else{
          var indexArr=[];
          if(indexStr) indexArr=indexStr.split(',');
          for(var i=0;i<data.length;i++){
              if(indexArr.length>0 && i==indexArr[0]){
                  if(indexArr.length>1){
                      for(var j=0;j<data[i].condition.length;j++){
                          if(j==indexArr[1]){
                              data[i].condition[j].condition.push(
                                  {'junction':'or','condition':[]}
                              )
                              break;
                          }
                      }
                  }else{
                      data[i].condition.push(
                          {'junction':'or','condition':[]}
                      )
                  }
                  break;
              }
          }
      }
      this.conditionObj.condition=data;
      this.buildConditionTree(this.conditionObj);
  },
  buildData(conditionData,pathArr,tableArr,branchArr){
      let curYIndex=0;
      let data=conditionData.condition;
      //算三级节点总共分支个数
      let yIncaseNum=this.getyIncaseNum(conditionData.condition) >1 ? this.getyIncaseNum(conditionData.condition):1;
      //第一个节点 this.Mtop 最后一个节点Mtop+this.YIncase*（yIncaseNum-1）
      let startY1=(this.Mtop*2+this.YIncase*(yIncaseNum-1))/2;

      branchArr.push({
          newjunction:conditionData.junction,
          oldjunction:conditionData.junction,
          style:"left:"+(this.Mleft-35)+"px; top:"+(startY1-15)+"px",
          indexStr:'root',
          condition:'noDel'
      })
      for(var i=0;i<data.length;i++){
          if(data[i].condition){
              var curchildNum=this.getyIncaseNum(data[i].condition);
              //如果该节点，没有分支条件，则保留节点
              var isEmpty0=false;
              if(curchildNum <1){
                  curchildNum=1;
                  isEmpty0=true;
              }
              //计算一级节点和该节点的连线
              var startY2=(this.Mtop*2+this.YIncase*(2*curYIndex+curchildNum-1))/2;
              var path='M'+(this.Mleft)+','+startY1+'C'+(this.Mleft)+','+startY2
                  +','+(this.Mleft)+','+startY2+','+(this.Mleft+this.XIncase)+','+startY2;
              pathArr.push(path);
              branchArr.push({
                  newjunction:data[i].junction,
                  oldjunction:data[i].junction,
                  style:"left:"+(this.Mleft+this.XIncase-35)+"px; top:"+(startY2-15)+"px",
                  indexStr:''+i,
              })
              if(isEmpty0)  curYIndex++;

              for(var j=0;j<data[i].condition.length;j++){
                  //如果第三级节点有分支，则计算分支
                  if(data[i].condition[j].condition){
                      //计算改节点分支个数
                      let curchildNum2=this.getyIncaseNum(data[i].condition[j].condition);
                      //如果该节点，没有分支条件，则保留节点,默认其占一行
                      let isEmpty=false;
                      if(curchildNum2 <1){
                          curchildNum2=1;
                          isEmpty=true;
                      }
                      // 改分支第一个节点纵坐标= this.Mtop+this.YIncase*curYIndex  上一个节点纵坐标加上递增值
                      // 改分支最后节点纵坐标=改分支第一个节点纵坐标 +计算改节点分支个数*y递增值 this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
                      // 计算改节点的纵坐标。（改分支第一个节点纵坐标+该分支的最后一个纵坐标）/2
                      // 该节点起始点纵坐标=  this.Mtop+this.YIncase*curYIndex+ this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
                      let startY3=(this.Mtop*2+this.YIncase*(2*curYIndex+curchildNum2-1))/2;
                      //改分支指引线的终点的纵坐标等于startY2
                      let path='M'+(this.Mleft+this.XIncase)+','+startY2+'C'+(this.Mleft+this.XIncase)+','+startY3
                          +','+(this.Mleft+this.XIncase)+','+startY3+','+(this.Mleft+this.XIncase*2)+','+startY3;
                      pathArr.push(path);
                      branchArr.push({
                          newjunction:data[i].condition[j].junction,
                          oldjunction:data[i].condition[j].junction,
                          style:"left:"+(this.Mleft+this.XIncase*2-35)+"px; top:"+(startY3-15)+"px",
                          indexStr:i+','+j,
                          condition:'noAdd'
                      })
                      if(isEmpty){
                          curYIndex++;
                      }
                      for(let z=0;z<data[i].condition[j].condition.length;z++){
                          let obj=data[i].condition[j].condition[z];
                          obj.style="left:"+(this.Mleft+this.XIncase*3)+"px; top:"+(this.Mtop+this.YIncase*curYIndex-19)+"px";
                          obj.indexStr=i+","+j+","+z;
                          tableArr.push(obj);
                          //改分支下所有节点的起始纵坐标为startY3，终点纵坐标根据该节点位置决定
                          let path='M'+(this.Mleft+this.XIncase*2)+','+startY3+'C'+(this.Mleft+this.XIncase*2)+','+(this.Mtop+this.YIncase*curYIndex)
                              +','+(this.Mleft+this.XIncase*2)+','+(this.Mtop+this.YIncase*curYIndex)+','+(this.Mleft+this.XIncase*3)+','+(this.Mtop+this.YIncase*curYIndex);
                          pathArr.push(path);
                          curYIndex++;
                      }
                  }else {
                      //第二级节点没有分支
                      let obj=data[i].condition[j];
                      obj.style="left:"+(this.Mleft+this.XIncase*2)+"px; top:"+(this.Mtop+this.YIncase*curYIndex-19)+"px";
                      obj.indexStr=i+","+j;
                      tableArr.push(obj);
                      //计算改分支的路径。因为是第二节点。startY2
                      let path='M'+(this.Mleft+this.XIncase)+','+startY2+'C'+(this.Mleft+this.XIncase)+','+(this.Mtop+this.YIncase*curYIndex)
                          +','+(this.Mleft+this.XIncase)+','+(this.Mtop+this.YIncase*curYIndex)+','+(this.Mleft+this.XIncase*2)+','+(this.Mtop+this.YIncase*curYIndex);
                      pathArr.push(path);
                      curYIndex++;
                  }
              }
          }else {
              let obj=data[i];
              obj.style="left:"+(this.Mleft+this.XIncase)+"px; top:"+(this.Mtop+this.YIncase*curYIndex-19)+"px";
              obj.indexStr=''+i;
              tableArr.push(obj);
              let path='M'+this.Mleft+','+startY1+'C'+this.Mleft+','+(this.Mtop+this.YIncase*curYIndex)
                  +','+this.Mleft+','+(this.Mtop+this.YIncase*curYIndex)+','+(this.Mleft+this.XIncase)+','+(this.Mtop+this.YIncase*curYIndex);
              pathArr.push(path);
              curYIndex++;
          }
      }
    },
    //获取条件总数
   getyIncaseNum(data){
      var sum=0;
      for(var i=0;i<data.length;i++){
          if(data[i].condition && data[i].condition.length>0){
              for(var j=0;j<data[i].condition.length;j++){
                  if(data[i].condition[j].condition && data[i].condition[j].condition.length>0){
                      for(var z=0;z<data[i].condition[j].condition.length;z++){
                          sum++;
                      }
                  }else{
                      sum++;
                  }
              }
          }else{
              sum++;
          }
      }
      return sum;
    },
    setFieldOtherInfo(ele, tab, type) {
      let selectFiled = this.filedsObj[tab.property];
      if (type == 1) {
        tab.dataType = selectFiled.dataType;
        tab.format = selectFiled.format;
        tab.chooseDesc = selectFiled.desc;
        tab.value = "";
      } else {
        tab.changeDesc = selectFiled.desc;
      }
      if (selectFiled.dataType !='varchar' && tab.compType !='2') {
        tab.compType ='2';
      }
    },
    handleClose() {
      let me_ = this;
      utils.validateForm(this, "form1"+this.type).then(r => {
         me_.curTableAuth[me_.type] =me_.getConditionData();
         if (me_.finishTable.indexOf(me_.type) <0) {
           me_.finishTable.push(me_.type);
         }
         me_.$root.$emit('sub-row-auth-confirm-end');
      }).catch(items => {
          me_.$message.error(`权限设置页面还有内容未填写。`);
      })
    },
    getConditionData(){
      if (!this.conditionObj) return;
      var data = this.getConditionStr(this.conditionObj);
      data.conditionObj = JSON.stringify(this.conditionObj);
      this.scriptStr = data.conditionString;
      return data;
    },
    getConditionStr(obj) {
      if (!obj || !obj.condition) return;
      var returnData = {};
      var data = obj.condition;
      var res = "";
      var desString = "";
      for (var i = 0; i < data.length; i++) {
        //第一节点的表达式
        var curcondStr1 = "";
        var curcondDes1 = "";
        //如果第一节点有分支则计算
        if (data[i].condition && data[i].condition.length > 0) {
          curcondStr1 += "(";
          curcondDes1 += "(";
          for (var j = 0; j < data[i].condition.length; j++) {
            //第二节点的表达式
            var curcondStr2 = "";
            var curcondDes2 = "";
            //如果第三级节点有分支，则计算分支
            if (
              data[i].condition[j].condition &&
              data[i].condition[j].condition.length > 0
            ) {
              curcondStr2 += "(";
              curcondDes2 += "(";
              var curcondStr3 = "";
              var curcondDes3 = "";
              for (var z = 0; z < data[i].condition[j].condition.length; z++) {
                curcondStr3 = this.getConditionStrByObj(
                  data[i].condition[j].condition[z]
                );
                curcondDes3 = this.getConditionStrByObj(
                  data[i].condition[j].condition[z],
                  "des"
                );
                if (curcondStr3 != "") {
                  //循环拼接第三节点的条件
                  if (z == 0) {
                    //第一个不拼接运算符
                    curcondStr2 += curcondStr3;
                    curcondDes2 += curcondDes3;
                  } else {
                    curcondStr2 +=
                      this.getjunction(data[i].condition[j].junction) +
                      curcondStr3;
                    curcondDes2 +=
                      this.getjunction(data[i].condition[j].junction) +
                      curcondDes3;
                  }
                }
              }
              curcondStr2 += ")";
              curcondDes2 += ")";
            } else if (data[i].condition[j].property) {
              //第二节点没有分只
              curcondStr2 = this.getConditionStrByObj(data[i].condition[j]);
              curcondDes2 = this.getConditionStrByObj(
                data[i].condition[j],
                "des"
              );
            }
            if (curcondStr2 != "") {
              //循环拼接第二节点的条件
              if (j == 0) {
                //第一个不拼接运算符
                curcondStr1 += curcondStr2;
                curcondDes1 += curcondDes2;
              } else {
                curcondStr1 += this.getjunction(data[i].junction) + curcondStr2;
                curcondDes1 += this.getjunction(data[i].junction) + curcondDes2;
              }
            }
          }
          curcondStr1 += ")";
          curcondDes1 += ")";
        } else if (data[i].property) {
          //第一节点没有分只
          curcondStr1 = this.getConditionStrByObj(data[i]);
          curcondDes1 = this.getConditionStrByObj(data[i], "des");
        }
        if (curcondStr1 != "") {
          //循环拼接第一节点的条件
          if (i == 0) {
            //第一个不拼接运算符
            res += curcondStr1;
            desString += curcondDes1;
          } else {
            res += this.getjunction(obj.junction) + curcondStr1;
            desString += this.getjunction(obj.junction) + curcondDes1;
          }
        }
      }
      returnData.conditionString = res;
      returnData.conditionDes = desString;
      return returnData;
    },
    getConditionStrByObj(obj, type) {
      var res = "";
      if (!obj.value) {
        throw '比较的值必填';
      }
      switch (obj.dataType) {
        case "varchar":
          res = this.buildStringCondition(obj, type);
          break;
        case "date":
          res = this.buildDateCondition(obj, type);
          break;
        case "number":
          res = this.buildIntCondition(obj, type);
          break;
      }
      return res;
    },
    buildDateCondition(obj, type) {
      var value = obj.value;
      var valueDes = "";
      var property = obj.property;
      let res = "";

      if (obj.compType == 2) {
        if (obj.operator == '9') {
          value ="'"+value[0] + "' and '"+value[1]+"'";
        } else {
          value = "'" + obj.value + "'";
        }
      } else {
        value =  "'{" + obj.value + "}'";
        valueDes = obj.changeDesc;
      }

      if (type == "des") {
        property = obj.chooseDesc;
        value = valueDes || value;
      } 

      switch (obj.operator) {
          case "1":
            res = property + " = " + value;
            break;
          case "2":
            res = property + " != " + value;
            break;
          case "3":
            res = property + " >  " + value;
            break;
          case "4":
            res = property + " < " + value;
            break;
          case "7":
            res = property + " >= " + value;
            break;
          case "8":
            res = property + " <= " + value;
            break;
          case "9":
            res = property + " BETWEEN " + value;
            break;
      }
      return res;
    },
    buildStringCondition(obj, type) {
      var value = obj.value;
      var valueDes = "";
      var property = obj.property;
      let res = "";
      if (obj.compType == 2) {
        if (obj.operator== 5 || obj.operator== 6 ) {
          value = "'%" + obj.value + "%'";
        }else if(obj.operator== 9 || obj.operator== 10){
          value = "('" + obj.value.split(",").join("','") + "')";
        }else{
          value = "'" + obj.value + "'";
        }
        valueDes = value;
      } else {
        value = "'{" + obj.value + "}'";
        valueDes = obj.changeDesc;
      }
      if (type == "des") {
        property = obj.chooseDesc;
        value = valueDes;
      } 
      switch (obj.operator) {
          case "1":
            res = property + " = " + value;
            break;
          case "2":
            res = property + " != " + value;
            break;
          case "5":
            res = property + " like  " + value;
            break;
          case "6":
            res = property + " not like " + value;
            break;
          case "9":
            res = property + " in " + value;
            break;
          case "10":
            res = property + " not in " + value;
            break;
        }

      return res;
    },
    buildIntCondition(obj, type) {
      var value = obj.value;
      var valueDes = "";
      var property = obj.property;
      if (obj.compType == 2) {
        value = obj.value;
        valueDes = value;
      } else {
        value =  "{" + obj.value + "}";
        valueDes = obj.changeDesc;
      }
      if (type == "des") {
        property = obj.chooseDesc;
        value = valueDes;
      }
      var res = "";
      switch (obj.operator) {
        case "1":
          res = property + " = " + value;
          break;
        case "2":
          res = property + " != " + value;
          break;
        case "3":
          res = property + " > " + value;
          break;
        case "4":
          res = property + " < " + value;
          break;
        case "7":
          res = property + " >= " + value;
          break;
        case "8":
          res = property + " <= " + value;
          break;
      }
      return res;
    },
    getjunction(str) {
      return ' '+str+' ';
    },

  }
};
</script>

<style  scoped>

div >>> .el-dialog__body {
  padding: 10px;
}

.table > thead > tr > th,
.table > thead > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  vertical-align: middle;
  padding: 4px;
}

.table > tbody > tr > td {
  text-align: center;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0;
}
.table >>> .el-button {
  padding: 6px 8px;
}
div >>> .el-tabs__content {
  height: 450px;
  overflow: auto;
}
.labelrag {
  padding: 0.2em 0.2em 0.3em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  background-color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 12px;
  width: 70px;
  line-height: 20px;
  border: solid 1px;
  position: absolute;
  z-index: 3;
}
div >>> .labelrag > .selected_search {
  width: 60px;
  border: none;
  outline: none;
  height: 22px;
}
div >>> .labelrag > .el-select > .el-input > .el-input__inner {
  padding: 0px;
  border: none;
  height: 26px;
}
.custom_condition_tab {
  position: absolute;
  z-index: 1000;
}
.inputs >>> .el-form-item__error {
  display: none;
}

div >>> [aria-invalid="true"] .el-input .el-input__inner {
  border-color: #f56c6c;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  margin-left: 400px;
  color: #ccc;
}

</style>
