<template>
  <div>
    <div slot="header" class="clearfix">
      <i class="el-icon-setting tools-icon" @click="showOftenFlowManage"></i>
    </div>
    <div class="often-flow-container">
      <el-tag v-for="flow in oftenFlows" :key="flow.id">
        <span @click="checkRightsBefore(flow)">{{flow.name}}</span>
      </el-tag>
    </div>
    <el-dialog
      title="设置常用流程"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="66%"
      id="often-set-dialog"
    >
      <div>
        <h3 class="often-flow-group-title">常用流程</h3>
        <p style="display: inline-block;">点击叉号从常用流程中移除</p>
      </div>
      <div class="often-flow-container" style="background-color: #f5f5f5;">
        <el-tag
          v-for="flow in copyOftenFlows"
          size="medium"
          :key="flow.id"
          closable
          :disable-transitions="false"
          @close="signOftenFlow(flow)"
        >{{flow.name}}</el-tag>
      </div>
      <div>
        <h3 class="often-flow-group-title">更多流程</h3>
        <p style="display: inline-block;">点击加号可以添加至常用流程</p>
        <el-input
          :clearable="true"
          class="often-search-input"
          size="small"
          placeholder="请输入流程名称"
          @keyup.enter.native="searchEnterFun"
          v-model="flowSearchKey"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchFlow"></el-button>
        </el-input>
      </div>
      <div class="flow-list-content" v-if="hasAuthFlowList.length > 0">
        <div v-for="type in hasAuthFlowList" :key="type.name">
          <li v-if="type.icon" :style="type.icon.color" :class="type.icon.icon"></li>
          <h3 style="margin:8px;">{{type.name}}</h3>
          <div class="often-flow-container" style="background-color: #f5f5f5;">
            <el-tooltip
              :content="flow.name"
              :disabled="flow.name.length > 0"
              placement="top"
              :key="flow.id"
              v-for="flow in type.flowList"
            >
              <el-tag v-if="!flow.isAdd" color="#fff" size="medium" @click="signOftenFlow(flow, true)">
                {{flow.name}}
                <i
                  class="el-icon-circle-plus el-icon--right"
                  style="color:#409eff;"
                ></i>
              </el-tag>
              <p v-if="flow.isAdd">
                <span>{{flow.name}}</span>
                <i class="el-icon-check el-icon--right" style="color:#00d35b"></i>
              </p>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="empty-msg-div" v-if="hasAuthFlowList.length == 0 ">
        <p v-if="completeInit">抱歉！没有找到符合条件的流程</p>
        <p v-if="completeInit">您可以尝试更换关键词</p>
      </div>

      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="saveOftenFlow">保存</el-button>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <OftenFlowList ref="oftenFlowList"/>
  </div>
</template>
<script>
import { mapState } from "vuex";
import OftenFlowList from "@/components/home/oftenFlowList.vue";
import utils from "@/utils.js";

export default {
  components: { OftenFlowList },
  data() {
    return {
      dialogVisible: false,
      flowSearchKey: ""
    };
  },
  computed: mapState({
    completeInit: state => state.oftenFlow.completeInit,
    oftenFlows: state => state.oftenFlow.oftenFlowList,
    copyOftenFlows: state => state.oftenFlow.copyOftenFlowList,
    hasAuthFlowList: state => state.oftenFlow.hasAuthFlowList
  }),
  created() {
    this.$store.dispatch("oftenFlow/getMyOftenFlowdw");
  },
  methods: {
    //常用流程列表
    oftenFlowDialog() {
      this.$refs.oftenFlowList.oftenFlowListOpen();
    },
    //启动前先检查是否有启动权限
    checkRightsBefore(row){
      //超级管理员账号不做判断
      if(this.$store.state.login.currentUser && this.$store.state.login.currentUser.account != "admin"){
        this.$store.dispatch("oftenFlow/flowHasStartRights",row.defKey).then(resp=>{
          if(resp.value){
            this.startFlow(row);
          }else{
            this.$message({type:"warning",message:"无启动权限，请联系管理员"});
          }
        });
      }else{
        this.startFlow(row);
      }
    },
    //启动流程
    startFlow(row) {
       if (!row.leaders || row.leaders.length==0) {
            this.$router.push("/agentStart/" + row.id+"/0");
             this.dialogVisible = false;
          }else{
            let html='<select ref='+Math.random()+' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>';
              row.leaders.forEach(identity => {
                html+='<option value="'+identity.id+'">'+identity.name+'</option>';
              });
              html+='</select>';
              let this_ =this;
              this.$alert(html, '选择发起人', {
                dangerouslyUseHTMLString: true,
                beforeClose:function(action, instance, done){
                  if(action=='confirm'){
                    let se = document.getElementById('approvalLeaderSelect');
                    if(se.selectedIndex==0){
                      this.$message.warning("请选择一个发起人");
                    }else{
                      instance.close();
                      this_.$router.push("/agentStart/" + row.id+"/"+se[se.selectedIndex].value);
                       this.dialogVisible = false;
                    }
                  }else{
                    instance.close();
                  }
                }
            });
          }
        
    },
    handleConfirm() {
      this.$confirm("确认关闭？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    showOftenFlowManage() {
      this.dialogVisible = true;
      this.flowSearchKey = "";
      this.$store.dispatch("oftenFlow/initOftenFlowManageData", { init: true });
    },
    signOftenFlow(tag, isAdd) {
      if (tag.typeId && this.copyOftenFlows.length > 19 && isAdd) {
        this.$message.warning("最多可添加20个常用流程");
        return;
      }
      this.$store.dispatch("oftenFlow/signOftenFlow", tag);
    },
    saveOftenFlow() {
      if (!this.copyOftenFlows || this.copyOftenFlows.length == 0) {
        this.$confirm(
          "未添加常用流程，保存后将重置为系统默认常用流程，是否确认保存？"
        ).then(_ => {
          this.doSave(1);
        });
      } else {
        this.doSave();
      }
    },
    doSave(flag) {
      this.$store
        .dispatch("oftenFlow/saveOftenFlow", this.copyOftenFlows)
        .then(data => {
          if (data.state) {
            this.dialogVisible = false;
            utils.reload();
          } else {
            this.$message.error(data.message || "保存失败");
          }
        });
    },
    //查询流程
    searchFlow() {
      let queryFilter = {};
      if (this.flowSearchKey) {
        queryFilter = {
          querys: [
            {
              property: "DEF_KEY_",
              value: this.flowSearchKey,
              group: "main",
              operation: "LIKE",
              relation: "OR"
            },
            {
              property: "name_",
              value: this.flowSearchKey,
              group: "main",
              operation: "LIKE",
              relation: "OR"
            }
          ]
        };
      }
      this.$store.dispatch("oftenFlow/initOftenFlowManageData", {
        init: false,
        filter: queryFilter
      });
    },
    //回车查询
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which;
      if (keyCode == 13) {
        this.searchFlow();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.often-flow-container {
  padding: 10px 10px 0px 10px;
}

/deep/.el-card__body {
  height: 100%;
  padding: 0;
}

.often-flow-container /deep/ .el-tag {
  margin: 0 10px 10px 0;
  color: #666;
  cursor: pointer;
  font-weight: bold;
}

.often-flow-container /deep/ .el-tag:hover {
  color: $--theme-color;
}

.type-span {
  color: $--theme-color;
}

#often-set-dialog /deep/ {
  .el-dialog__body {
    padding: 0px 20px 5px 20px;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .el-dialog__header {
    padding: 8px 20px;
  }

  .el-dialog__footer {
    padding: 8px 20px;
    text-align: center;
  }
}

.often-flow-group-title {
  margin: 8px 8px 8px 0px;
  color: #333;
  display: inline-block;
}

.flow-list-content {
  max-height: 350px;
  overflow-y: auto;

  li {
    font-size: 16px;
    list-style-type:none;
  }

  h3 {
    display: inline-block;
  }

  p {
    margin: 0 10px 10px 0;
    line-height: 28px;
    display: inline-block;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
  }

  img {
    width: 20px;
    height: 20px;
    border-radius: 10%;
    float: left;
    margin: 2px 5px 0 0;
  }
}

.often-search-input {
  width: 250px;
  float: right;
  top: 10px;
}

.empty-msg-div {
  height: 220px;
  padding-top: 100px;
  text-align: center;

  p {
    margin: 8px;
  }

  p:last-child {
    color: #999;
  }
}
/deep/ .tools-icon {
  float: right;
  padding: 3px 10px;
  color: #999;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}
</style>
