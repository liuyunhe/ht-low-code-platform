<template>
   <div style="margin-top: -8px;">
      <label class="el-form-item__label" style="float:none">{{title}}({{nodeId}})
        <el-button style="padding:6px 8px" icon="el-icon-plus" @click="setNodeUser()"></el-button>
      </label>

      <div class="alert-danger alert" v-if="!nodeUsers||nodeUsers.length==0">&nbsp;&nbsp;尚未配置节点抄送人员，请添加人员设置</div>
      <div v-for="(nodeCondition,$index) in nodeUsers" :key="$index" class="alert">
        <div style="float: left; margin-left: 10px;font-size: 13px;">
           {{nodeCondition.description}}
        </div>
        <div style="float: right!important;">
          <el-button  icon="el-icon-edit" @click="setNodeUser($index)"></el-button>
          <el-button  icon="el-icon-arrow-up" @click="ArrayTool(nodeUsers,$index,'up')"></el-button>
          <el-button  icon="el-icon-arrow-down" @click="ArrayTool(nodeUsers,$index)"></el-button>
          <el-button  icon="el-icon-delete" @click="nodeUsers.remove(nodeUsers[$index])"></el-button>
        </div>
      </div>
    <FlowNodeUserCondition @nodeUserConditionConfirm="nodeUserConditionConfirm" ref="flowNodeUserCondition" />
   </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex"; 
const FlowNodeUserCondition = () => import("@/components/flow/FlowNodeUserCondition.vue");
import utils from "@/hotent-ui-util.js"
export default {
  props: ["defId","title",'nodeId','defkey'],
  components: {FlowNodeUserCondition },
  data() {
    return {
        nodeUsers:[],
        curSetIndex:'-1'
    };
  },
  computed: mapState({
    defConfigData:state => state.flow.defConfigData
  }),
  watch: {
    nodeUsers: {
      handler(newValue, oldValue) {
        let path = 'nodeSetData.nodeReadUserMap.'+this.nodeId;
        let obj = {};
        obj[path] = newValue;
　　　　　 this.$store.dispatch("flow/updateConfig",obj);
　　　　},
      deep: true 
　　}
  },
  methods: {
    dialogCancel(){

    },
    nodeUserConditionConfirm(res){
      if(res.calcs){
        if (this.curSetIndex !='-1') {
            this.nodeUsers.splice(this.curSetIndex,1,res);
        } else {
          this.nodeUsers.push(res);
       }
      }
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
    setNodeUser(index){
      let conf ={nodeId:this.nodeId};
      if (index || index ===0 ) {
         this.curSetIndex = index;
          conf.userRule = JSON.parse(JSON.stringify(this.nodeUsers[index]));
      }
      this.$refs.flowNodeUserCondition.showDialog(conf);
    },
  },
  created() {
    this.utils = utils;
    if(this.defConfigData.nodeSetData.nodeReadUserMap && this.defConfigData.nodeSetData.nodeReadUserMap[this.nodeId]){
       this.nodeUsers = JSON.parse(JSON.stringify(this.defConfigData.nodeSetData.nodeReadUserMap[this.nodeId]));
    }
 }
};
</script>

<style  scoped>

.alert {
    color: #a94442;
    background-color: #f5f5f5;
    border-color: #e3e3e3;
    padding: 10px 0px;
    margin-bottom: 5px;
    border: 1px solid transparent;
    border-radius: 4px;
    display: inline-block;
    width: 100%;
}

.alert-danger {
    color: #a94442;
    background-color: #f2dede;
    border-color: #ebccd1;
}

.alert >>> .el-button {
  padding: 6px 8px;
  margin-left:0px;
  margin-right:5px;
}

</style>