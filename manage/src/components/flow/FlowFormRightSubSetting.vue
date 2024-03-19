<template>
    <el-dialog
      top="8vh"
      width="70%"
      title="设置子表数据授权"
      :visible.sync="dialogVisibleSetting"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div style="width:100%;height: 550px;">
        <div style="float: left;width:25%;height: 100%;">
          <ht-tree
            style="overflow: auto;height: 100%;"
            :data="treeData"
            :props="defaultProps"
            default-expand-all
            @node-click="handleNodeClick"
            :expand-on-click-node="false"
            ref="htTypeTree"
          ></ht-tree>
        </div>
        <div style="width:73%;float: left;margin-left: 10px;height: 100%;">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th width="130px">操作子表:</th>
                <td>{{editingRight.tableName?editingRight.tableName:"请先选择需要编辑的子表"}}</td>
              </tr>
              <tr>
                <th width="130px">操作提示:</th>
                <td  style="color: red; ">保存的结果为SQL语句，如：return "a.F_wb1 in('1','2')";<br/>return "a.F_wb1 in('1','2',\'"+scriptImpl.getCurrentUserName()+"\')";</td>
              </tr>
              <tr>
                  <th width="130px">SQL:</th>
                <td> 
                    <div>
                        <!-- 常用脚本选择对话框  -->
                        <eip-script-dialog
                          ref="whenSaveDialog"
                          v-model="editingRight.script"
                          append-to-body
                        />
                        <el-button @click="showScriptDialog()">常用脚本</el-button>
                    </div>
                    <el-row style="height:100%;padding-top: 10px;">
                        <codemirror
                        v-model="editingRight.script"
                        :options="cmStyle"
                        style="width: 99%;height:100%;"
                        ></codemirror>
                    </el-row>
                </td>
              </tr>
            </tbody>
          </table>
          <div slot="footer" class="dialog-footer" style="float: right;padding-top: 40px;">
            <el-button type="primary" size="small" @click="saveDataDialog">保&nbsp;&nbsp;&nbsp;存</el-button>
            <el-button type="danger" size="small" @click="clean">清除权限</el-button>
			<el-button type="danger" size="small" @click="close">取&nbsp;&nbsp;&nbsp;消</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
</template>

<script>
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "FlowFormRightSubSetting",
  components: { eipScriptDialog},
  props: {
    defId: String,
    nodeId: String,
    defkey: String,
    parentDefKey:String
  },
  data() {
    return {
        treeData: [], //树数据
        defaultProps: {
            children: "children",
            label: "desc"
        },
        sql:"",
        cmStyle: {
            value: "",
            mode: "groovy",
            readOnly: false,
            smartIndent: true,
            tabSize: 2,
            theme: "base16-light",
            lineNumbers: true,
            line: true
        },
        dialogVisibleSetting:false,
        editingRight:{tableName:"",script:"",nodeId:"",parentDefKey:this.parentDefKey},//子表配置
        data:{}
    };
  },
  methods: {
    //显示常用脚本
    showScriptDialog() {
        if(this.editingRight.script == ''){
            this.$message.warning("请先选择需要编辑的子表");
            return;
        }
        this.$refs.whenSaveDialog.showDialog();
    },
    //设置子表数据授权对话框保存事件
    saveDataDialog() {
      const this_  = this;
        if(this_.editingRight.tableName == ''){
            this_.$message.warning("请先选择需要编辑的子表");
            return;
        }
        if(this_.editingRight.script == ''){
            this_.$message.warning("请编写SQL语句");
            return;
        }
        req.post(window.context.bpmModel +"/flow/node/v1/saveSub?defId="+this_.defId+"&nodeId="+this_.nodeId+"&parentDefKey="+this_.parentDefKey,this_.data).then(function(res){
          if(res.data.state){
            this_.$confirm(res.data.message+"，是否继续操作？", "提示", {cancelButtonText: "取消",confirmButtonText: "确定",type: "warning"}) .then(() => {

            }).catch(() => {
              this_.dialogVisibleSetting = false;
            });
          }
        });
    },
    //显示设置子表数据授权对话框
    showDialog(){
        const this_  = this;
        this_.editingRight = {tableName:"",script:"",nodeId:"",parentDefKey:this.parentDefKey};
        this_.data = {};
        
        this_.dialogVisibleSetting = true;
        //获取子表表单字段变量
        req.post(window.context.bpmModel + "/flow/node/v1/varTree", {
            defId: this_.defId,
            nodeId: this_.nodeId,
            includeBpmConstants : false,
            removeMain : true
        })
        .then(function(respose) {
            this_.treeData = respose.data;
            //获取已编辑的子表权限设置
            req.get(window.context.bpmModel +"/flow/node/v1/initSub?defId="+this_.defId+"&nodeId="+this_.nodeId+"&parentDefKey="+this_.parentDefKey).then(function(data){
                if(JSON.stringify(data.data) != "{}"){
                    this_.data = data.data;
                }
            });
        });
    },
    //树鼠标左击事件(treeNode:当前节点对象，node：可以拿到父节点对象)
    handleNodeClick(treeNode, node, nodeCompent) {
        //先处理tableName的赋值
        let preTableName = this.editingRight.tableName;
        if (treeNode.nodeType == "sub") {
            this.editingChange(treeNode.name);
        }
        if (treeNode.nodeType == "field") {
            this.editingChange(node.parent.data.name);
        }
        if (preTableName != this.editingRight.tableName) {
            return;
        }

        let prefix;
        if (treeNode.nodeType == "bfield") {
            prefix = "b";
        } else {
            prefix = "a";
        }
        if(treeNode.fieldName!=undefined){
            let str = prefix + "." + treeNode.fieldName;
            this.editingRight.script = this.editingRight.script+str;
        }
    },
    editingChange(tableName){
        if(this.data[tableName]==undefined){
            let json = {};
            json.nodeId=this.nodeId;
            json.parentDefKey=this.parentDefKey;
            json.tableName=tableName;
            json.script="return sql;";
            this.data[tableName]=json;
        }
        this.editingRight = this.data[tableName];
    },
    //清除权限
    clean(){
        const this_  = this;
        this.$confirm("确定清除所有子表授权？","提示",
        {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          type: "warning",
          closeOnClickModal: false
        }
        ).then(() => {
            req.post(window.context.bpmModel +"/flow/node/v1/saveSub?defId="+this_.defId+"&nodeId="+this_.nodeId+"&parentDefKey="+this_.parentDefKey,{}).then(function(data){
              data = data.data;
              if (data.state) {
                  this_.$message.success({
                    duration: 1000, message: "清除成功", onClose: function () {
                      this_.dialogVisibleSetting = false;
                    }
                  });
              } else {
                  this_.$message.error(data.message);
              }
          });
        });
    },
    //关闭侧边栏
    close() {
      this.dialogVisibleSetting = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.el-main {
  padding-top: 0px;
}
.urgent-text {
  width: 100%;
}
.ht {
  width: 100%;
}

.bo-set__card {
  height: calc(100% - 5px);
}

.bo-set__card /deep/ > div.el-card__header {
  padding: 8px 20px;
}

.bo-set__card /deep/ > div.el-card__body {
  height: calc(100% - 65px);
  padding: 10px 0 10px 10px;
}

.bo-set__table th,
.bo-set__card /deep/ > div.el-card__header,
.bo-set__detail /deep/ > .el-table__header-wrapper > table > thead th {
  background: #f9f9f9;
}
.bo-set__table th,
.bo-set__table td {
  padding: 5px 15px !important;
}
</style>