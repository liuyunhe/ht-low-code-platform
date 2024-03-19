<template>
  <div>
      <label class="el-form-item__label" style="float:none">
        <el-button style="padding:6px 8px;float: right!important;" @click="setConditon" icon="el-icon-setting">设置条件</el-button>
      </label>

      <div v-for="(out,$index) in data.outcomeNodes" :key="$index" class="alert">
        <div style="font-size: 13px;">
          <label class="control-label"> 目标节点:{{out.nodeId}}({{out.name}})</label>
        </div>
        <div class="alert-danger">
        <label class="control-label"> {{data.conditions[out.nodeId] || '【尚未设置分支条件】'}} </label>
        </div>
      </div>
    <FlowBranchConditionSet ref="flowBranchConditionSet" />
   </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import FlowBranchConditionSet from "@/components/flow/FlowBranchConditionSet.vue";
import utils from "@/hotent-ui-util.js"
export default {
  components: { FlowBranchConditionSet},
  data() {
    return {
        data:[]
    };
  },
 
  methods: {
    setConditon() {
      this.$refs.flowBranchConditionSet.showDialog();
    },
    setConditonConfirm(selection,node,nodeCompent) {
      if (selection && selection.children &&selection.children.length>0) {
        return;
      }
      this.visible = false;
      this.handleValue(node,selection);
      this.$emit('node-click',selection,node);
    },
  },
  mounted() {
    this.$root.$on('edit-node-change', function(value) {
      let this_ = this;
      this.$store.dispatch("flow/getCurSelectBranches").then(function(data){
        this_.data = data;
      })
    });
  },
  created() {
    let this_ = this;
    this.$store.dispatch("flow/getCurSelectBranches").then(function(data){
      this_.data = data;
    })
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