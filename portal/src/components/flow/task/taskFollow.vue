<template>
<div class="bpm-btn-dialog">
  <el-dialog
    title="跟踪设置"
    :visible.sync="followDialog"
    :close-on-click-modal="false"
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr>
          <th style="width: 100px;">
            <span class="xh-star">*</span>跟踪节点：
          </th>
          <td>
            <el-checkbox-group v-model="checkedNodes">
              <el-checkbox  v-for="node in nodes"  :label="node.nodeId" :key="node.nodeId" @change="selectOne(node.nodeId)">
                {{node.name}}
              </el-checkbox>
            </el-checkbox-group>
          </td>
        </tr>
      </tbody>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" size="small">确 定</el-button>
      <el-button @click="cancel" size="small">取 消</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Message } from "element-ui";
export default {
  name: "taskFollow",
  props: ["instId","defId"],
  components: {},
  data() {
    return {
      followDialog: false,
      proInst: this.instId
    };
  },
  computed:{
    nodes:{
      get: function () {
          return this.$store.state.storeProcess.nodes;
      },
      set: function () {
      }
    },
    checkedNodes: {
      get: function () {
          return this.$store.state.storeProcess.checkedNodes;
      },
      set: function () {
      }
    }
  },
  methods: {
    //选择跟踪的任务节点
    selectOne(value){
      if(this.checkedNodes.indexOf(value)>-1){
           for (var i = 0; i < this.checkedNodes.length; i++) {
                if(this.checkedNodes[i]==value){
                    this.$store.dispatch("storeProcess/setCheckedSplice",i);
                    return;
                }
           }
        }else{
          this.$store.dispatch("storeProcess/setCheckedPush",value);
        }
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
      this.followDialog = true;
    },
    //打开跟踪设置弹出框并查询可跟踪的任务节点
    handleOpen(){
      this.followDialog = true;
      let data = {"defId":this.defId,"proInst":this.instId}
      this.$store.dispatch("storeProcess/taskNode",data);
    },
    //取消
    cancel() {
      this.followDialog = false;
    },
    //确认
    confirm() {
      let data = {"taskId":""};
      if(this.checkedNodes.length==0){
        Message.warning("请选择跟踪节点");
        return;
      }
      for (var i = 0; i < this.checkedNodes.length; i++) {
          data.taskId = data.taskId+ this.checkedNodes[i]+",";
      }
      data.proInst = this.instId;
      //新增,更新任务跟踪表数据
      this.$store.dispatch("storeProcess/taskFollowSave",data).then(()=>{
           this.followDialog = false;//父组件调用子组件方法
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
.el-dialog__footer {
    padding: 10px 20px;
    padding-top: 10px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
label.el-checkbox {
  margin: 10px 30px 0 0;
}

div.el-checkbox-group[aria-invalid='true'] {
  border: 1px solid #f56c6c;
  padding: 0 0 10px 10px;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.xh-star {
  color: red;
}
</style>