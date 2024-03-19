<template>
  <div>
      <label class="el-form-item__label" style="float:none">
        <el-button style="padding:6px 8px;float: right!important;" @click="setConditon" icon="el-icon-setting">设置会签规则</el-button>
      </label>

      <div  class="alert">
        <div style="font-size: 13px;" v-if="data.signRule">
            <label class="control-label">{{data.signRule.decideType=='agree'?'同意':'反对'}}票
            达到 {{data.signRule.voteAmount}}{{data.signRule.voteType=='amount'?'张':'%'}}
            则{{data.signRule.decideType=='agree'?'同意':'反对'}}
            ({{data.signRule.followMode=='wait'?'等待所有人完成投票':'达到设定直接处理'}})</label><br><br>
            <div v-for="p in data.converPrivilegeList" :key="p.key">
			      		<label class="control-label left-label" v-if="p.key=='all'">所有特权:</label>
					    	<label class="control-label left-label" v-if="p.key=='direct'">直接处理:</label>
						    <label class="control-label left-label" v-if="p.key=='oneticket'">一票特权:</label>
						    <label class="control-label left-label" v-if="p.key=='allowAddSign'">允许增加会签:</label>
		  			  	<span style="color: #31708f;" v-for="(nodeCondition,$index) in p.value" :key="$index">{{$index+1}}、{{nodeCondition.description}};</span><br><br>
					</div>
        </div>
        <div class="alert-danger" v-if="!data.signRule">【尚未配置会签规则】</div>
      </div>
    <FlowSignRuleSet ref="flowSignRuleSet" @onConfirm="initSignRule" />
   </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import FlowSignRuleSet from "@/components/flow/FlowSignRuleSet.vue";
import utils from "@/hotent-ui-util.js"
export default {
  components: { FlowSignRuleSet},
  data() {
    return {
        data:[]
    };
  },
  computed: mapState({
    curNode: state => state.flow.defConfigData.curEditNode,
  }),
  methods: {
    setConditon() {
      this.$refs.flowSignRuleSet.showDialog();
    },
    setConditonConfirm(selection,node,nodeCompent) {
      if (selection && selection.children &&selection.children.length>0) {
        return;
      }
      this.visible = false;
      this.handleValue(node,selection);
      this.$emit('node-click',selection,node);
    },
   initSignRule() {
      let this_ = this;
      this.$store.dispatch("flow/getSignConfig").then(function(resp){
        let data = JSON.parse(JSON.stringify(resp));
        if (data.privilegeList) {
          let list = [];
          for (const key in data.privilegeList) {
            if (data.privilegeList[key] && data.privilegeList[key].length >0){
              list.push({'key':key,'value':data.privilegeList[key]});
            }
          }
          data.converPrivilegeList = list;
        }
        this_.data = data;
      })
    },
  },
  created() {
    this.initSignRule();
 }
};
</script>

<style  scoped>
.alert {
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
}

.alert >>> .el-button {
  padding: 6px 8px;
  margin-left:0px;
  margin-right:5px;
}

.control-label{
  padding-left: 10px;
}
</style>