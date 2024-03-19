<template>
  <div style="display: inline-block;" >
    <el-popover
    placement="bottom-start"
    v-model="visible">
    <ht-tree style="max-height:400px;width:300px;overflow: auto;" v-if="visible" :data="data" :expand-on-click-node="false" :props="defaultProps"  support-filter default-expand-all  @node-click="handleNodeClick"></ht-tree>
    <el-button slot="reference">选择变量</el-button>
  </el-popover>
  </div>
</template>

<script>
export default {
  props: ["boData", 'type','value'],//type 1，流程其它设置，2，流程人员规则设置
  components: { },
  data() {
    return {
        visible:false,
        dialogVisible:false,
        data: [],
        defaultProps: {
          children: 'children',
          label: 'desc'
        },
        thisDefId:''
    };
  },
  methods: {
    handleNodeClick(selection,node,nodeCompent) {
      if (selection && selection.children &&selection.children.length>0) {
        return;
      }
      this.visible = false;
      this.$emit('node-click',selection,node);
    },

  },
  created() {
    /*this.thisDefId = this.defId;
    if (!this.thisDefId && this.defConfigData && this.defConfigData.initData) {
      this.thisDefId = this.defConfigData.initData.bpmDefinition.defId;
    }*/
    this.data=[];
    var boItem=  {desc:"表单变量",children:this.boData};
    var flowItem={desc:"流程变量",children:[{desc: "发起时间",name: "startDate",nodeType: "var"},{desc: "发起人",name: "startUser",nodeType: "var"},{desc: "所在部门",name: "userOrg",nodeType: "var"}]};
    if(this.type=='property-text'){
        this.data.push(flowItem);
    }else{
        this.data.push(boItem);
    }
  }
};
</script>

<style  scoped>
div >>>.el-dialog__body{
  padding:10px ;
}

.table > thead > tr > th,.table > thead > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: middle;
}
.table{
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.table >>>.el-button{
  padding: 6px 8px;
  margin-left:0px;
  margin-right:5px;
}
div >>>.el-tabs__content{
    height: 450px;
    overflow: auto;
}
</style>