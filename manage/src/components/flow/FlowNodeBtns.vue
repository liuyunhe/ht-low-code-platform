<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})</label><br />
    <span v-for="btn in nodeBtns" :key="btn.alias">
        <el-button style="margin: 3px;" type="primary" size="mini">{{btn.name}}</el-button>
    </span>
    <el-button style="margin: 3px;" type="danger" size="mini" @click="editBtns">编辑</el-button><br /><br />
    <el-dialog
        width="70%"
        :title="titleSetting"
        :visible="dialogVisibleSetting"
        :before-close="close"
        :close-on-click-modal="false"
        append-to-body
        top="8vh"
      >
        
        <div style="width:100%;height: 600px;">
          <div style="float: left;width:35%;height:100%;overflow: auto;">
            <div class="div_list">按钮列表</div>
            <div style="margin-bottom: 10px;">
              <el-button type="primary" size="mini"  @click="addButton" icon="el-icon-plus">新 增</el-button>
              <el-button type="warning" size="mini"  @click="getButtons(0)"  icon="el-icon-refresh">初始化按钮</el-button>
              <el-button type="success" size="mini"  @click="saveButton"  icon="el-icon-check">保 存</el-button>
              <el-button type="danger" size="mini"  @click="close"  icon="el-icon-close">关 闭</el-button>
            </div>
            <el-table
              :data="buttonList"
              border
              ref="htTableSetting"
              @row-click="orgRowClick"
            >
              <el-table-column type="index" width="40"></el-table-column>
              <el-table-column prop="alias"  label="按钮别名" width="130" />
              <el-table-column prop="name"  label="按钮名称"/>
              <el-table-column label="操作" width="90" >
                <template v-slot="{row,$index}">
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSetting(buttonList,$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="width:63%;float: left;margin-left: 10px;height:100%;overflow: auto;">
            <div class="div_list">按钮编辑</div>
             <el-form :model="btn" data-vv-scope="settingSave" v-if="JSON.stringify(btn) !='{}'">
                <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <th width="130px" class="is-required">按钮名称:</th>
                          <td>
                            <ht-input v-model="btn.name" placeholder="请输入按钮名称" autocomplete="off" validate="required"></ht-input>
                          </td>
                        </tr>
                        <tr>
                          <th width="130px" class="is-required">按钮动作:</th>
                          <td>
                            <span v-if="btn.status!=2">{{btn.alias}}</span>
                            <ht-input v-if="btn.status==2" v-model="btn.alias" style="width:170px" placeholder="请输入按钮动作" autocomplete="off" validate="required"></ht-input>&nbsp;
                            <ht-select
                              clearable
                              v-if="btn.status==2"
                              v-model="btn.alias"
                              :options="buttonNoInitList"
                              :props="{key:'alias',value:'name'}"
                              @change="changeButtonType(btn)"
                            />
                          </td>
                        </tr>
                        <tr v-if="btn.alias=='lockUnlock'">
                          <th width="130px">强制签收:</th>
                          <td>
                            <el-checkbox style="margin-top: -10px;" v-model="btn.isLock">强制签收</el-checkbox>
                          </td>
                        </tr>
                        <tr v-if="btn.supportScript">
                          <th width="130px"><el-tooltip class="item" effect="dark" content="javascript脚本,在提交前做些处理，参数：_req,boData,_this，返回:true/false。返回false时不做提交动作。" placement="left-start">
                              <i class="el-icon-warning">前置脚本:</i></el-tooltip></th>
                          <td>
                            <codemirror
                              v-if="showCodeEdie"
                              ref="mycode"
                              v-model="btn.beforeScript"
                              :options="cmOptions1"
                              class="code"
                              :style="codemirrorStyle"
                            ></codemirror>
                          </td>
                        </tr>
                        <tr v-if="btn.supportScript">
                          <th width="130px"><el-tooltip class="item" effect="dark" content="java脚本，控制按钮是否显示，返回 false不显示，返回 true显示。上下文变量：1.流程变量。2.BO数据返回:true/false。" placement="left-start">
                              <i class="el-icon-warning">groovy脚本:</i></el-tooltip></th>
                          <td>
                            <codemirror
                              v-if="showCodeEdie"
                              ref="mycode"
                              v-model="btn.groovyScript"
                              :options="cmOptions2"
                              class="code"
                              :style="codemirrorStyle"
                            ></codemirror>
                          </td>
                        </tr>
                        <tr v-if="btn.supportScript && btn.alias == 'endProcess' ">
                          <th width="130px"><el-tooltip class="item" effect="dark" content="java脚本，任务处理后执行的java脚本。上下文变量：1.com.fasterxml.jackson.databind.node.ObjectNode busDataObjectNode  2.data(表单数据 类型为ObjectNode) 3. instance(流程实例对象 类型为DefaultBpmProcessInstance)" placement="left-start">
                              <i class="el-icon-warning">提交后执行:</i></el-tooltip></th>
                          <td>
                            <codemirror
                              v-if="showCodeEdie"
                              ref="mycode"
                              v-model="btn.completeEventGroovyScript"
                              :options="cmOptions2"
                              class="code"
                              :style="codemirrorStyle"
                            ></codemirror>
                          </td>
                        </tr>
                        <tr v-if="btn.alias == 'reject'" >
                          <th width="130px"><el-tooltip class="item" effect="dark" content="驳回方式至少选择一种" placement="left-start">
                              <i class="el-icon-warning">驳回方式:</i></el-tooltip></th>
                          <td>
                            <ht-checkbox style="margin-top: -10px;"  :options='[{key: "backToStart", value: "驳回发起人" },{key: "rejectPre", value: "驳回上一步" },{key: "reject", value: "驳回指定节点" }]' v-model="btn.rejectMode" />
                          </td>
                        </tr>
                      </tbody>
                </table>
              </el-form>
          </div>
        </div>
      </el-dialog>
  </div>

</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';
export default {
  name:"FlowNodeBtns",
  components: {},
  props: {
    //任务节点信息
    node:{
      type: Object,
      required: true
    },
    //流程配置信息
    defConfigData:{
      type: Object,
      required: true
    },
  },
  data() {
    return {
      titleSetting:"设置按钮",//某个节点按钮的标题
      nodeBtns:[],//单个节点按钮的配置信息
      dialogVisibleSetting:false,//是否显示设置节点按钮侧边栏
      buttonList:[],//节点按钮已有的按钮
      buttonNoInitList:[],//节点按钮可新增的按钮
      btn:{},//单个节点按钮的配置信息
      cmOptions1: {
          value: "",
          mode: "vue",
          readOnly: false,
          smartIndent:true,
          tabSize: 1,
          theme: 'base16-light',
          lineNumbers: true,
          line: true,
        },
      cmOptions2: {
          value: "",
          mode: "groovy",
          readOnly: false,
          smartIndent:true,
          tabSize: 1,
          theme: 'base16-light',
          lineNumbers: true,
          line: true,
        },
      showCodeEdie:true,
      codemirrorStyle:'width:'+((document.body.clientWidth*0.7-40)*0.63-180)+'px',
    };
  },
  methods: {
    //判断按钮是否已经存在。
    isAliasExist(nBtn){
        for(let i=0,btn;btn=this.buttonList[i++];){
            if(btn.alias==nBtn.alias && this.btn !== btn){
                return true;
            }
        }
        return false;
    },
    //选择节点按钮可新增的按钮时
    changeButtonType(obj){
        if(obj.alias){
            let rtn=this.isAliasExist(obj);
            if(rtn){
                obj.alias="";
                Message.warning("新增的按钮已存在");
                return;
            }
            obj.status=1;
            obj.name=this.getName(obj.alias);
        }
        else{
            obj.status=2;
        }
    },
    //根据按钮别名获取按钮名称
    getName(alias){
        for(let i=0;i<this.buttonNoInitList.length;i++){
            let obj=this.buttonNoInitList[i];
            if(alias==obj.alias){
                return obj.name;
            }
        }
        return "";
    },
    //点击列表某一条数据时触发  groovyScript beforeScript
    orgRowClick(row, column, event) {
      if(column.label !="操作"){
        row.groovyScript =  row.groovyScript || '';
        row.beforeScript =  row.beforeScript || '';
        let this_ =this;
        this.showCodeEdie = false;
        setTimeout(function(){
           this_.$set(this_,'btn',row);
           this_.showCodeEdie = true;
        },50)
      }
    },
    //保存按钮
    saveButton(){
      const this_ = this;
      this_.$validator.validateAll("settingSave").then(result => {
        if (result) {
          let param = {
            nodeId:this_.node.nodeId,
            defId:this_.defConfigData.initData.bpmDefLayout.defId//流程定义ID
          };
          param.btns = this_.buttonList;//任务的节点按钮
          let btnArr=[]
          for(let i=0,b;b=param.btns[i++];){
              if(b.alias && b.name){
                if(b.alias == 'reject' && !b.rejectMode ){
                  Message.warning("驳回按钮中的驳回模式至少选择一种");
                  return ;
                }
                  delete b.status;
                  btnArr.push(b);
              }
          }
          param.btns=btnArr;
          //保存节点按钮
          req.post("${bpmModel}/flow/def/v1/saveNodeBtns",param).then(res=>{
            if(res.data.state){
              Message.success(res.data.message);
              this_.dialogVisibleSetting = false;//关闭侧边栏
              this_.nodeBtns = [...btnArr];
            }
          });
        } else {
          let arr = this_.$validator.errors.items.filter(item=>item.scope=="settingSave");
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning"
          });
        }
       });
    },
    //新增按钮
    addButton(){
      let btn = {name:"",alias:"",status:2,supportScript:true};
      this.buttonList.push(btn);
      this.btn =btn;
    },
    //编辑任务节点按钮
    editBtns(nodeId){
      this.dialogVisibleSetting = true;//显示设置节点按钮侧边栏
      this.titleSetting = "设置按钮-"+this.node.name+"("+this.node.nodeId+")";//设置某个节点按钮的标题
      this.getButtons(1);//获取已有的按钮
      this.getButtons(2);//获取节点按钮可新增的按钮
    },
    //获取节点按钮  type：0-初始化的按钮，1-已有的按钮，2-可新增的按钮
    getButtons(action){
      const this_ = this;
      let defId = this_.defConfigData.initData.bpmDefLayout.defId;//流程定义ID
      req.post("${bpmModel}/flow/def/v1/getNodeSet?defId="+defId+"&nodeId="+this_.node.nodeId+"&action="+action).then(function(data){
        data = data.data
        //屏蔽一些多余的按钮配置
        for(let i=data.length-1;i>=0;i--){
            if(data[i].alias=="commu" || data[i].alias=="startCommu"
                || data[i].alias=="instanceTrans" || data[i].alias=="backToStart"){
                data.splice(i,1);
            }
        }
        if(action==2){
            this_.setStatus(data,2);
            this_.buttonNoInitList=data;
        }else if(action==1){
            this_.setStatus(data,1);
            this_.buttonList=data;
        }else if(action==0){
            this_.setStatus(data,0);
            this_.buttonList=data;
            this_.btn={};//清空单个节点按钮的配置信息
            Message.success("初始化成功");
        }
      });
    },
    //按钮状态 0-初始化的按钮，1-已有的按钮，2-可新增的按钮
    setStatus(data,status){
        for(let i=0;i<data.length;i++){
            data[i].status=status;
        }
    },
    //关闭设置节点按钮列弹框
    close(){
       this.dialogVisibleSetting=false;
    },
    //删除按钮
    deleteSetting(list,index){
      list.splice(index,1);
      this.btn={};//清空单个节点按钮的配置信息
    },
  },
  mounted() {
    this.$validator = this.$root.$validator;
    this.nodeBtns = this.defConfigData.nodeSetData.nodeBtnMap[this.node.nodeId];//获取单个节点按钮的配置信息
  }
};
</script>

<style lang="scss" scoped>
div>>>.el-dialog__body {
    padding: 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}
.ht_tr{
  width: 100%;
}
.div_list{
    height: 30px;
    background: #e2e2e2;
    line-height: 30px;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 10px;
}
>>>label.el-checkbox {
    margin: 5px 10px 0 0;
}
.ht{
  width: 300px;
}
.form-inline{
  float: left;
  width: 100%;
}
.left-label {
    width: 18%;
    float: left;
}
.control-label {
    word-break: break-all;
    text-align: right;
    color: #545252;
    font-size: 12px;
    padding: 0px 10px !important;
    font-weight: bold;
    line-height: 35px;
}
div>>>.box-card{
  margin-bottom: 20px;
}

div>>>.box-card .clearfix{
  padding-top: 20px;
}

div>>>.el-collapse-item__header{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bold;
}

div>>>.el-button{
   padding: 7px;
   margin-right: 10px;
   margin-left: 0px !important;
}
</style>