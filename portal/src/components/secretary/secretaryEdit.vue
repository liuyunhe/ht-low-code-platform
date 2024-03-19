<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="22">
          <h5 class="title">编辑秘书</h5>
        </el-col>
        <el-col :span="2">
          <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-form
        ref="form"
        :model="secretary"
        status-icon
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item  label="秘书姓名:"  >
          <ht-user-selector v-model="selectUsers"  permission="w"/>
        </el-form-item>
        <el-form-item label="是否启用:" >
          <label class="radio-inline" ><input type="radio" v-model="secretary.enabled" value=1 />启用</label>
					<label class="radio-inline" ><input type="radio" v-model="secretary.enabled" value=0 />禁用</label>
        </el-form-item>

        <el-form-item label="共享权限">
          <ht-checkbox v-model="secretary.shareRight"
                      :options='[{"key":"1","value":"流程发起"},{"key":"2","value":"任务审批"}]' />
        </el-form-item>

        <el-form-item label="共享类型:" >
          <label class="radio-inline" @click="entityList = [];"><input type="radio" v-model="secretary.shareType" value=1 />流程定义</label>
					<label class="radio-inline" @click="entityList = [];"><input type="radio" v-model="secretary.shareType" value=2 />流程分类</label>
        </el-form-item>

        <el-form-item  :label="'共享'+(secretary.shareType==1?'流程':'分类')+':'">
          <el-button
            size="mini"
            @click="showDialog()"
            icon="el-icon-plus"
            round
            style="margin-left:0"
          >新增</el-button>
          <el-table
          v-if="entityList.length >0"
          :data="entityList"
            stripe
            border
            style="width: 100%"
            header-cell-class-name="todo-header-row"
            row-class-name="todo-row"
            size="medium"
          >
            <el-table-column prop="name" :label="(secretary.shareType==1?'流程':'分类')+'名称'"></el-table-column>
            <el-table-column label="管理">
               <template slot-scope="scope">
                <el-button @click="remove(scope.row)" type="danger" size="small" icon="el-icon-delete" plain></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="submitForm('form')">保存</el-button>
          <el-button @click="back" size="small" plain>取消</el-button>
        </el-form-item>
      </el-form>
    </el-main>
    <el-dialog
      :visible.sync="flowSelectedDialogVisible"
      title="流程选择器"
      width="60%"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-container>
        <el-container>
          <el-header class="middle-header">
            <div>
              <el-input
                size="small"
                style="width:380px"
                clearable
                placeholder="通过表单key，名称查询"
                prefix-icon="el-icon-search"
                v-model="tableData"
                @blur="search"
              ></el-input>
              <el-button
                style="margin-left: 20px"
                size="small"
                type="primary"
                icon="el-icon-search"
                @click="search"
              >查询</el-button>
            </div>
          </el-header>
          <el-main style="padding:0">
            <el-table
              :data="flowRows"
              ref="flowTable"
              stripe
              border
              height="450"
              @row-click="orgRowClick"
              @selection-change="flowTableSelection"
              class="org-table"
              size="medium"
            >
              <el-table-column type="selection" align="center" width="45"></el-table-column>
              <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
              <el-table-column prop="name" label="名称" width="300"></el-table-column>
              <el-table-column prop="defKey" label="流程key"></el-table-column>
            </el-table>
          </el-main>
          <el-footer style="padding: 20px 5px 0px 0px;">
            <el-row type="flex" justify="end">
              <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize"
                :pager-count="5"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
        <el-aside width="90px" class="right-aside">
          <div class="button-group">
            <el-button size="medium">上移</el-button>
            <el-button size="medium">下移</el-button>
            <el-button size="medium" @click="removeselectFlows">删除</el-button>
            <el-button size="medium" @click="clearAllselectFlows">清空</el-button>
          </div>
        </el-aside>
        <el-aside width="170px" class="select-aside">
          <div style="height: 52px;text-align: center;line-height: 52px;border-bottom: 1px solid #eee;">
            <span>已选择流程</span>
          </div>
          <div class="select-tree-div">
            <el-tree
              ref="selectTree"
              :props="selectFlowProps"
              :data="selectFlows"
              show-checkbox
              check-on-click-node
              @check-change="orgTreeClick"
            ></el-tree>
          </div>
        </el-aside>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="dialogConfirm">确认</el-button>
        <el-button size="small" @click="cancel">取 消</el-button>
      </span>
    </el-dialog>

    <eip-flow-dialog
        ref="eipFlowDialog"
        name="eipFlowDialog"
        @onConfirm="dialogOnConfirm"
        append-to-body
        rightType="start"
    />

     <eip-sys-type-dialog
        cat-id="6"
        ref="flowTypeDialog"
        @onConfirm="sysTypeDialogOnConfirm"
        append-to-body
        show-checkbox/>

  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import { Message } from "element-ui";
import HtUserSelector from "@/components/control/HtUserSelector.vue";
import eipFlowDialog from "@/components/dialog/EipFlowDialog.vue";
const eipSysTypeDialog = () => import("@/components/dialog/EipSysTypeDialog.vue");

export default {
  name: "agentEdit",
  props: ["id"],
  data() {
    return {
      rules: {
        authNames: [
          { required: true, message: "请选择秘书", trigger: "blur" }
        ],
        shareRight: [
          { required: true, message: "请选择共享权限", trigger: "change" }
        ],
        isEnabled: [
          { required: true, message: "请选择是否有效", trigger: "blur" }
        ],
        shareFlow: [
          { required: true, message: "请选择共享流程", trigger: "change" }
        ],
      },
      flowSelectedDialogVisible:false,
      flowTypeSelectedDialogVisible:false,
      selectFlowProps: {
        label: "name"
      },
      selectFlows: null,
      selectFlowsList:null,
      tableData:"",
      treeList:[],
      selectUsers:[],
      entityList:[],
      secretary:{shareType:1,enabled:1},
      flowTypeList:[]
    };
  },
  components:{
    HtUserSelector,
    eipFlowDialog,
    eipSysTypeDialog
  },
  computed: mapState({
    form: state => state.agent.form,
    flowRows: state => state.agent.rows,
    pagination: state => state.agent.pagination,
    total: state => state.agent.total,
    currentUserDetail: state => state.user.currentUserDetail
  }),
  methods: {

    back() {
      this.$router.go(-1); //返回上一层
    },

    submitForm(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if(this.selectUsers.length >0){
            this.secretary.secretaryId = '';
            this.secretary.secretaryName = '';
            this.selectUsers.forEach(item => {
              this.secretary.secretaryId=this.secretary.secretaryId+','+item.id;
              this.secretary.secretaryName=this.secretary.secretaryName+','+item.fullname;
            });
            this.secretary.secretaryId=this.secretary.secretaryId+',';
            this.secretary.secretaryName=this.secretary.secretaryName.substring(1);
          }else{
            Message.warning("请选择秘书");
            return;
          }
          for (let i = 0; i < this.selectUsers.length; i++) {
            if(this.selectUsers[i].fullname == this.currentUserDetail.user.fullname){
              this.$message.warning("不能指定自己为秘书");
              return false;
            }
          }

          if(!this.secretary.shareRight){
             Message.warning("请选择要要共享的权限");
             return;
          }

          if(this.entityList.length<1){
             Message.warning("请选择要委托的流程"+(this.secretary.shareType==1?'定义':'分类'));
             return;
          }else{
            this.secretary.shareKey = '';
            this.secretary.shareName = '';
            this.entityList.forEach(item => {
              this.secretary.shareKey=this.secretary.shareKey+','+item.key;
              this.secretary.shareName=this.secretary.shareName+','+item.name;
            });
            this.secretary.shareKey = this.secretary.shareKey.substring(1);
            this.secretary.shareName = this.secretary.shareName.substring(1);
          }
          this.$store.dispatch("agent/secretarySave", this.secretary).then(res => {
              this.$message({type:"success",message: this.id && this.id!=0?"更新秘书信息成功！":"添加秘书成功"});
              this.$router.go(-1);
            });
        } else {
          return false;
        }
      });
    },
    orgRowClick(row, column, event) {
      this.$refs.flowTable.toggleRowSelection(row);
    },
    flowTableSelection(selection) {
        this.selectFlows = selection;
    },
    dialogConfirm() {
      this.flowSelectedDialogVisible = false;
      if(this.selectFlows){
        let selectKeys = [];
        this.entityList.forEach(item => {
           selectKeys.push(item.key);
        });
        this.selectFlows.forEach(item => {
          if (selectKeys.indexOf(item.defKey) <0) {
            this.entityList.push({key:item.defKey,name:item.name});
          }
        });
      }
    },
    typeDialogConfirm() {
      this.flowTypeSelectedDialogVisible = false;
      if(this.$refs.typeSelectTree.getCheckedNodes()){
        let selectKeys = [];
        this.entityList.forEach(item => {
           selectKeys.push(item.key);
        });
        this.$refs.typeSelectTree.getCheckedNodes().forEach(item => {
          if (selectKeys.indexOf(item.id) <0) {
            this.entityList.push({key:item.id,name:item.name});
          }
        });
      }
    },
    remove(row){
      this.entityList.remove(row);
    },
    cancel() {
        this.flowSelectedDialogVisible = false;
        this.flowTypeSelectedDialogVisible= false;
        this.$refs.flowTable.clearSelection();
    },
    orgTreeClick(row, column, event) {
      this.treeList.push(row);
    },
    removeselectFlows(){
      if(this.treeList.length>0){
        this.treeList.forEach(item => {
          this.selectFlows.remove(item);
          this.$refs.flowTable.toggleRowSelection(item, false);
        });
      }
    },
    clearAllselectFlows(){
      this.$refs.flowTable.clearSelection();
      this.selectFlows =null;
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("agent/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch("agent/setPaginationPageNum", currentPage);
      this.search();
    },
    // 查询
    search(str) {
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      if (!this.tableData) {
        this.$store.dispatch("agent/getDeflistJson", pageBean);
      } else {
          querys = [
              {
              property: "name",
              value: this.tableData,
              group: "main",
              operation: "LIKE",
              relation: "OR"
            },
            {
              property: "defKey",
              value: this.tableData,
              group: "main",
              operation: "LIKE",
              relation: "OR"
            },
          ];
        }
        queryFilter = { pageBean: this.pagination, querys };
        this.$store.dispatch("agent/getDeflistJson", queryFilter);
    },
    showDialog() {
      let type = 'flowTypeDialog';
      if (this.secretary.shareType  == 1) {
        type = 'eipFlowDialog';
      }
      this.$refs[type].showDialog();
    },
    dialogOnConfirm(data){
      for (let i=0;i<data.length;i++){
        this.entityList.push({key:data[i].defKey,name:data[i].name});
      }
      this.entityList = this.entityList.unique("key");
    },
    sysTypeDialogOnConfirm(data){
      for (let i=0;i<data.length;i++){
        this.entityList.push({key:data[i].id,name:data[i].name});
      }
      this.entityList = this.entityList.unique("key");
    }
  },
  created() {
    let this_ =this;
    if(this.id && this.id!=0){
       this.$store.dispatch("agent/secretaryDetail",this.id).then(function(data){
        var userIds = data.secretaryId.substring(1).split(',');
        var userNames = data.secretaryName.split(',');
        for(var i=0;i<userIds.length;i++){
          if(userIds[i]){
            this_.selectUsers.push({id:userIds[i],fullname:userNames[i]});
          }
        }
        var entids = data.shareKey.split(',');
        var entNames = data.shareName.split(',');
        for(var i=0;i<entids.length;i++){
          if(entids[i]){
            this_.entityList.push({key:entids[i],name:entNames[i]});
          }
        }
        this_.secretary = data;
      });
    };
    this.$store.dispatch("agent/getTypeByGroupKey", 'FLOW_TYPE').then(function(data){
      data[0].disabled = true;
      this_.flowTypeList = data;
    })
  }
};
</script>

<style lang="stylus" scoped>
.el-container {
  background-color: #fff;
}

.el-header {
  padding-top: 10px;
  border-bottom: 1px solid #E7EAEC;
}

.el-select {
  height: 32px;
}

.title {
  font-size: 16px;
  margin: 0;
  margin-top: 10px;
}
.back{
    float :right;
    margin-top:4px;
}
.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 440px;
  margin-top: 10px;
}

.middle-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.org-table {
  width: 100%;
  border-top-width: 0;
  border-left-width: 0;
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}

.select-tree-div {
  height: 500px;
  overflow-y: auto;
}

>>> .el-dialog {
  margin-top: 8vh !important;
}

>>> .el-dialog__body {
  padding: 0;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #F5F7FA;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
</style>

