<template>
  <el-dialog
      width="70%"
      title="人员规则设置"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      v-if="dialogVisible"
      top="8vh"
      append-to-body>
      <div style="width:100%;height:500px">
        <div style="width:310px;float: left;height:100%">
          <FlowVarSelector style="height:500px"  :defId="curNode.defId" @node-click="nodeClick" type="2" v-model="data.executorVar.name"  />
        </div>
        <div style="width:60%;float: left;">
          <div>
            <table class="table table-bordered" style="width:100%" >
              <tr>
                <th style="width:25%">值类型</th>
                <td style="width:75%">
                  <ht-select
                    clearable
                    v-model="data.executorVar.executorType"
                    style="width:105px"
                    :options='[{ key: "user", value: "用户"}, { key: "fixed", value: "固定值" }]'
                    @change="data.executorVar.value='';data.executorVar.valueText=''"/>

                  <ht-select
                    v-show="data.executorVar.executorType =='user'"
                    clearable
                    style="width:105px"
                    v-model="data.executorVar.userValType"
                    :options='[{key: "userId", value: "userId"}, {key: "account", value: "account" }]'
                    @change="data.executorVar.value='';data.executorVar.valueText=''"/>

                </td>
              </tr>
              <tr>
                <th>匹配值</th>
                <td>
                  <ht-input
                    v-model="data.executorVar.value"
                    :disabled="data.executorVar.executorType!='fixed'"
                    placeholder="请输入匹配值" />
                  <el-button type="primary" v-show="data.executorVar.executorType !='fixed'" @click="selectUser('eipUserDialog')" >选择</el-button>
                </td>
              </tr>
              <tr>
                <th>变量目标</th>
                <td>
                    <ht-input
                    v-model="data.executorVar.name"
                    :disabled="true" />
                </td>
              </tr>
              <tr>
                <th>表达式</th>
                <td>
                  <el-radio v-model="data.expression" label="equals">相等</el-radio>
                  <el-radio v-model="data.expression" label="notEquals">不等</el-radio>
                  <el-radio v-model="data.expression" label="contains">包含</el-radio>
                  <el-radio v-model="data.expression" label="notContains">不包含</el-radio>

                  <el-radio v-model="data.expression" label=">" v-show="data.dataType =='number'|| data.dataType =='date'">大于</el-radio>
                  <el-radio v-model="data.expression" label="<" v-show="data.dataType =='number'|| data.dataType =='date'">小于</el-radio>
                  <el-radio v-model="data.expression" label=">=" v-show="data.dataType =='number'|| data.dataType =='date'">大于等于</el-radio>
                  <el-radio v-model="data.expression" label="<=" v-show="data.dataType =='number'|| data.dataType =='date'">小于等于</el-radio>

                </td>
              </tr>
              <tr>
                <th>条件预览</th>
                <td>
                  <span id="conDesc">[{{data.executorVar.name}}] {{data.expression}} [{{data.executorVar.valueText?data.executorVar.valueText:data.executorVar.value}} ]</span>
                </td>
              </tr>
            </table>
         </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
      <!-- 用户选择对话框  -->
      <eip-user-dialog
        ref="eipUserDialog"
        name="eipUserDialog"
        @onConfirm="dialogOnConfirm"
        :single='true'
        append-to-body
      />
    </el-dialog>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';

const eipUserDialog = () => import("@/components/dialog/EipUserDialog.vue");
import FlowVarSelector from "@/components/flow/FlowVarSelector.vue";

export default {
  name:"hsScript",
  components: {FlowVarSelector,eipUserDialog},
  data() {
    return {
      dialogVisible:false,//是否显示设置节点按钮侧边栏
      curScript:'',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      data:{executorVar:{executorType:'fixed',value:'',userValType:"userId"},expression:'equals'}
    };
  },
  computed: mapState({
    curNode: state => state.flow.defConfigData.curEditNode,
  }),
  methods: {
    dialogOnConfirm(users) {
      if (users) {
          if(this.data.executorVar.userValType=="userId"){
              this.data.executorVar.value=users[0].id;
          }else{
              this.data.executorVar.value=users[0].account;
          }
          this.data.executorVar.valueText=users[0].fullname;
      }
    },
    selectUser(ref) {
       this.$refs[ref].showDialog({});
    },
    nodeClick(node) {
      if (node.nodeType=='var'){//流程变量
        this.data.executorVar.source = "flowVar"
      }else {//表单变量
        this.data.executorVar.source = "BO";//TODO　增加了其他变量就要修改
      }
       this.data.dataType =node.dataType;
    },
    showDialog (param) {
      if (param.conDesc) {
        this.data = param ;
      }else{
        this.data = {executorVar:{executorType:'fixed',value:'',userValType:"userId"},expression:'equals'} ;
      }
      this.dialogVisible = true;
    },
    handleClose(){
       //组装对象
        this.data.conDesc=document.getElementById('conDesc').innerText;

        if(this.data.executorVar.executorType!="user"){
            delete this.data.executorVar.userValType;
        }
      this.$emit('customRuleSelectorConfirm',this.data);
      this.dialogVisible=false;
    }
  },
  mounted() {

  },
  create(){

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

.table > thead > tr > th,.table > thead > th, .table >  tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table >  tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px 4px;
    vertical-align: middle;
}
.table{
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0 !important;
}


</style>
