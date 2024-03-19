<template>
  <div>
    <el-dialog
      width="70%"
      :title="'会签规则设置('+curNode.nodeId+')'"
      :visible.sync="dialogVisible"
      top="8vh"
      v-if="dialogVisible"
      :close-on-click-modal="false"
      append-to-body>
        <el-container >
          <el-tabs v-model="signRuleSetPane" type="card" style="width:100%;">
            <el-tab-pane label="投票规则设置" name="first">
              <table class="table table-bordered" style="border-spacing: 0;width: 100%;padding:8px">
                <tr>
                  <th width="20%"> <span>决策类型</span></th>
                  <td>
                    <ht-radio v-model="data.signRule.decideType" :options='[{ key: "agree", value: "同意票"}, { key: "refuse", value: "否定票" }]'/>
                  </td>
                </tr>
                <tr>
                  <th width="20%"> <span>后续处理模式</span> </th>
                  <td>
                    <ht-radio v-model="data.signRule.followMode" :options='[{ key: "wait", value: "等待所有人投票"}, { key: "complete", value: "直接处理" }]'/>
                  </td>
                </tr>
                <tr>
                  <th width="20%"> <span>投票类型</span></th>
                  <td>
                    <ht-radio v-model="data.signRule.voteType" :options='[{ key: "amount", value: "绝对票数"}, { key: "percent", value: "百分比" }]'/>
                  </td>
                </tr>
                <tr>
                  <th width="20%"><span>票数:</span></th>
                  <td>
                    <el-input-number v-model="data.signRule.voteAmount" v-if="data.signRule.voteType!='percent'" :min="1"></el-input-number>
                    <el-input-number v-model="data.signRule.voteAmount" v-if="data.signRule.voteType=='percent'" :min="1" :max="100"></el-input-number>
                    <span v-if="data.signRule.voteType=='percent'">%</span>
                  </td>
                </tr>
                </table>
            </el-tab-pane>
            <el-tab-pane label="权限功能设置" name="second">

                <table class="table table-bordered">
                  <tr style="text-align: center;">
                    <td style="width:14%">
                      <label>权限类型</label>
                    </td>
                    <td>
                      <label>人员配置</label>
                    </td>
                  </tr>
                 <!-- <tr>
                    <th >
                      <span>所有特权:</span>
                    </th>
                    <td>
                      <div style="min-height: 60px">
                        <table class="table table-bordered">
                          <thead>
                            <tr>
                              <th width="6%">序号</th>
                              <th width="84%">条件</th>
                              <th width="10%">操作</th>
                            </tr>
                          </thead>
                          <tr v-for="(userRule,$index) in data.privilegeList.all" :key="$index">
                            <td>{{$index+1}}</td>
                            <td>{{userRule.description}}</td>
                            <td>
                              <el-button size="mini" icon="el-icon-edit" @click="addUserCondition('all',$index)"></el-button>
                              <el-button size="mini" icon="el-icon-delete" @click="data.privilegeList.all.remove(data.privilegeList.all[$index])"></el-button>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: left;" colspan="3">
                              <el-button   size="mini" @click="addUserCondition('all')">新增人员规则</el-button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>-->
                  
                  <tr>
                    <th>
                      <span>允许加签:</span>
                    </th>
                    <td>
                      <div style="min-height: 60px">
                        <table  class="table table-bordered">
                          <tr>
                            <th width="6%">序号</th>
                            <th width="84%">条件</th>
                            <th width="10%">操作</th>
                          </tr>
                          <tr v-for="(userRule,$index) in data.privilegeList.allowAddSign" :key="$index">
                            <td>{{$index+1}}</td>
                            <td>{{userRule.description}}</td>
                            <td>
                              <el-button size="mini" icon="el-icon-edit" @click="addUserCondition('allowAddSign',$index)"></el-button>
                              <el-button size="mini" icon="el-icon-delete" @click="data.privilegeList.allowAddSign.remove(data.privilegeList.allowAddSign[$index])"></el-button>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: left;" colspan="3">
                              <el-button   size="mini" @click="addUserCondition('allowAddSign')">新增人员规则</el-button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr> 

                  <tr>
                    <th>
                      <span>一票制:</span>
                    </th>
                    <td>
                      <div style="min-height: 60px">
                        <table  class="table table-bordered">
                          <thead>
                            <tr>
                              <th width="6%">序号</th>
                              <th width="84%">条件</th>
                              <th width="10%">操作</th>
                            </tr>
                          </thead>
                          <tr v-for="(userRule,$index) in data.privilegeList.oneticket" :key="$index">
                            <td>{{$index+1}}</td>
                            <td>{{userRule.description}}</td>
                            <td>
                              <el-button size="mini" icon="el-icon-edit" @click="addUserCondition('oneticket',$index)"></el-button>
                              <el-button size="mini" icon="el-icon-delete" @click="data.privilegeList.oneticket.remove(data.privilegeList.oneticket[$index])"></el-button>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: left;" colspan="3">
                              <el-button   size="mini" @click="addUserCondition('oneticket')">新增人员规则</el-button>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
            </el-tab-pane> 
          </el-tabs>
        </el-container>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
          <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
        </span>
    </el-dialog>
    <FlowNodeUserCondition @nodeUserConditionConfirm="nodeUserConditionConfirm" ref="flowNodeUserCondition" />
  </div>
</template>


<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";

const FlowNodeUserCondition = () => import("@/components/flow/FlowNodeUserCondition.vue");

export default {
  components: {FlowNodeUserCondition },
  data() {
    return {
        data:[],
        signRuleSetPane:'first',
        dialogVisible:false,
        curEditSetting:'',
        curEditRuleIndex:''
    };
  },
  watch:{
    'data.signRule.voteType':function (n,o) {
       if (n=='percent' && this.data.signRule.voteAmount>100) {
          this.data.signRule.voteAmount=100;
       } 
    }
  },
  computed: mapState({
    curNode: state => state.flow.defConfigData.curEditNode,
  }),
  methods: {
    showDialog() {
      let this_ = this;
      this.signRuleSetPane = 'first';
      this.$store.dispatch("flow/getSignConfig").then(function(resp){
        let data = JSON.parse(JSON.stringify(resp));
        this_.data = data;
        this_.dialogVisible = true;
      })
    },
    handleClose() {
      let param ={defId : this.curNode.defId, 
                  nodeId :this.curNode.nodeId , 
                  privilegeList : JSON.stringify(this.data.privilegeList),
                  signRule : JSON.stringify(this.data.signRule)};
      let this_ = this;
      req.post(window.context.bpmModel+'/flow/node/v1/signConfigSave',param).then(response => {
          let data = response.data;
          if(data.state){
              this_.$message.success("会签节点配置成功!");
              let obj = {};
              obj['signConfigs.'+this_.curNode.nodeId] = this_.data
              this_.$store.dispatch("flow/updateConfig",obj);
              this_.$emit('onConfirm');
              this_.dialogVisible = false;
          }else{
              this_.$message.fail("会签节点配置失败!"+data.message);
          }
      });
    },
    //用户规则选择
    addUserCondition(setting, index) {
      this.curEditSetting = setting;
      this.curEditRuleIndex = index;
      let conf ={};
      if (index != undefined) {
        let ruleList = this.data.privilegeList[setting];
        let userRule = ruleList[index];
        conf.userRule = JSON.parse(JSON.stringify(userRule));
      }
      conf={...conf,...{nodeType:"signTask",nodeId:this.curNode.nodeId,defId:this.curNode.defId}};
      this.$refs.flowNodeUserCondition.showDialog(conf);
    },

    nodeUserConditionConfirm(res){
      if (!this.data.privilegeList[this.curEditSetting]) {
         this.data.privilegeList[this.curEditSetting] = [];
      }
      if (this.curEditRuleIndex || this.curEditRuleIndex == 0) {
          this.data.privilegeList[this.curEditSetting].splice(this.curEditRuleIndex,1,res);
      } else {
          this.data.privilegeList[this.curEditSetting].push(res);
      }
      this.$forceUpdate();
    },
  }
};
</script>

<style  scoped>
div >>>.el-dialog__body{
  padding:10px ;
}
div >>>.el-tabs__header{
  margin-bottom: 0;
}
div >>>.el-tabs__content{
    height: 500px;
    overflow: auto;
}

.table > thead > tr > th,.table > thead > th, .table > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 4px 8px;
    vertical-align: middle;
}
.table{
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  width:100%;
  border-spacing:0;
}

.inputs >>>.el-form-item__error{
    display: none;
}

 .table>>> .el-button {
  padding: 6px 8px;
  margin-left:0px;
}

</style>