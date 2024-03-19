<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      width="80%"
      appendToBody
      :close-on-click-modal="false"
      top="8vh"
    >
      <el-container style="min-height: 550px">

        <el-checkbox-group style="position:absolute;margin-left:500px;margin-top: 5px;z-index:1000" v-if="dialogVisible" v-model="totalAuth">
          <el-checkbox  label="r">查看所有</el-checkbox>
          <el-checkbox  label="w">编辑所有可查看</el-checkbox>
        </el-checkbox-group>

        <el-tabs v-model="userConditionTab" type="card" style="width: 100%" v-if="totalAuth.length <2">
          <el-tab-pane label="查看权限" name="first" v-if="totalAuth.indexOf('r') <0">
            <flowFormSubRowCondition
                v-if="boTree && boTree.length > 0"
                :curTableAuth="curTableAuth"
                :table="table"
                :boTree="boTree"
                type="r"
                ref="readCondition"
                :finishTable="finishTable"
                append-to-body
              />
          </el-tab-pane>
          <el-tab-pane label="编辑权限" name="second" v-if="totalAuth.indexOf('w') <0">
             <flowFormSubRowCondition
              v-if="boTree && boTree.length > 0"
              :curTableAuth="curTableAuth"
              :table="table"
              :boTree="boTree"
              type="w"
              ref="editCondition"
              :finishTable="finishTable"
              append-to-body
            />
          </el-tab-pane>
        </el-tabs>

      </el-container>
      <span slot="footer" class="dialog-footer">
         <div class="reminder-style">
          <el-divider/>
          <span>
            功能说明：
          </span><br/>
           <span>
             目的：用于实现类似"老师核査成绩时，每位老师只能核查自己所属年级的成绩，只能编辑自己班级同学的成绩"的需求;
           </span><br/>
           <span>
             设计：基础授权先进行最大程度的权限开放，该功能用于对基础授权的权限进行缩紧且想要有编辑权限就必须先获得查看权限，否则编辑权限设置无效；
           </span><br/>
           <span>
             使用：
           </span><br/>
          <span>
             查看所有：表示对子表数据全部可查看，只需要设计编辑权限即可；
           </span><br/>
           <span>
             编辑所有可查看：可见即可编辑，只需要设计查看权限即可；
           </span><br/>
           <span>
             如果两个都勾选，相当于没有设置；
           </span><br/>
           <span>
             规则选择器：设置数据过滤规则；
           </span><br/>
        </div>
        <el-button type="primary" @click="handleClose" size="medium" >确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium" >取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import FlowNodeCusersSelector from "@/components/flow/FlowNodeCusersSelector.vue";
import utils from "@/hotent-ui-util.js";

const flowFormSubRowCondition = () =>
  import("@/components/flow/FlowFormSubRowCondition.vue");

export default {
  components: { flowFormSubRowCondition },
  data() {
    return {
      userConditionTab: "first",
      dialogVisible: false,
      title: "子表数据授权",
      subRowAuth: {},
      table: {},
      boTree: [],
      totalAuth:[],
      finishTable:[],
      curTableAuth:{}
    };
  },
  watch:{
    totalAuth:function(n,o) {
      if (!n || n.length ==0) {
        this.userConditionTab = "first";
      }else if (n.length ==1) {
        if (n.indexOf('r') >-1) {
          this.userConditionTab = "second";
        }else{
          this.userConditionTab = "first";
        }
      }
    }
  },
  computed: mapState({
    defConfigData: (state) => state.flow.defConfigData,
  }),
  methods: {
    showDialog: function (subRowAuth, table, boTree) {
      this.subRowAuth = subRowAuth;
      this.table = table;
      this.boTree = boTree;

      this.curTableAuth = JSON.parse(JSON.stringify(this.subRowAuth[this.table.tableName]  || {}));
      this.totalAuth = this.curTableAuth.total || []
      this.userConditionTab = "first";
      this.dialogVisible = true;
    },
    isNotEmpty(val) {
      if (!val || val.length == 0) {
        return false;
      }
      return true;
    },
    handleClose: function() {
      this.curTableAuth.total = this.totalAuth;
      if (this.totalAuth.length ==2) {
            this.subRowAuth[this.table.tableName] = this.curTableAuth;
            this.dialogVisible = false;
      }else{
        this.finishTable = [];
        if (this.$refs.readCondition) {
          this.$refs.readCondition.handleClose();
        }
        if (this.$refs.editCondition) {
          this.$refs.editCondition.handleClose();
        }
      }
    },
  },
  created() {
    let me_ = this;
    this.$root.$on('sub-row-auth-confirm-end',function(){
      if (me_.finishTable.length == (2 - me_.totalAuth.length)) {
        me_.subRowAuth[me_.table.tableName] = me_.curTableAuth;
        me_.dialogVisible = false;
      }
    });
  },
};
</script>

<style  scoped>
.reminder-style{
  text-align: left;
  color: red;
}

.reminder-style .el-divider{
  background-color: red;
  margin-bottom: 6px ;
}
</style>
