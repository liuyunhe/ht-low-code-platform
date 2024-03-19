<template>
  <div class="form-inline">
    <label class="control-label">{{node.name}}({{node.nodeId}})：
        <el-button icon="" type="primary" size="mini" @click="setRestFul(node.nodeId,node.name)">设置接口事件</el-button>
    </label><br /><br />
    <!-- 单个节点事件配置 -->
    <FlowNodeEventSetting ref="flowNodeEventSetting" :titleSetting="titleSetting" :passConf="passConf" @handle-save="handleSave"></FlowNodeEventSetting>
  </div>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';
const FlowNodeEventSetting = () => import("@/components/flow/FlowNodeEventSetting.vue");
export default {
  name:"FlowNodeRestfuls",
  components: {FlowNodeEventSetting},
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
  watch: {
    passConf: {
      handler(newValue, oldValue) {
        //单个任务节点的节点事件
        if(newValue.nodeId){
            let path = 'nodeSetData.nodeRestfulMap.'+newValue.nodeId;
            let obj = {};
            obj[path] = newValue.restful;
            //更新vuex里面defConfigData配置数据
            this.$store.dispatch("flow/updateConfig",obj);
        }else{//全局任务节点的节点事件
            let path = 'nodeSetData.bpmDefSetting.globalRestfuls';
            let obj = {};
            obj[path] = newValue.restful;
            //更新vuex里面defConfigData配置数据
            this.$store.dispatch("flow/updateConfig",obj);
        }
　  },
      deep: true 
　}
  },
  data() {
    return {
      titleSetting:"节点事件设置",//某个节点事件的标题
      passConf:{"restful":[],"nodeId":""},//节点事件配置信息
    };
  },
  methods: {
    //监听节点事件的保存方法
    handleSave(data){
        this.passConf.restful = data;
    },
    //设置任务节点的事件
    setRestFul(nodeId,nodeName){
        this.passConf = {"restful":[],"nodeId":""};//清空节点事件配置信息
         this.passConf.nodeId = nodeId;
        try {
            if(!nodeId){
                 this.passConf.restful = this.defConfigData.nodeSetData.bpmDefSetting.globalRestfuls;//全局restful接口事件
                 this.passConf.nodes = this.defConfigData.nodeSetData.nodes;//流程任务节点
            }else{
                 this.passConf.restful = this.defConfigData.nodeSetData.nodeRestfulMap[nodeId];//单个任务restful接口事件
            }
        } catch (e) {}
        this.titleSetting = "全局事件设置";
        if(nodeId){
            this.titleSetting = "节点【"+nodeName+"】事件设置";
        }
        setTimeout(()=>{
            this.$refs.flowNodeEventSetting.showDialog();//显示设置节点事件侧边栏
        });
        
    },
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>
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
   margin-left: 10px;
}
</style>