<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="22">
          <h5 class="title">添加委托</h5>
        </el-col>
        <el-col :span="2">
          <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-form
        ref="form"
        :model="form"
        status-icon
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="被委托人:" prop="authNames" >
          <ht-user-selector v-model="form.authNames" single permission="w"/>
        </el-form-item>
        <el-form-item label="委托类型:" prop="type">
          <el-radio v-model="form.type" :label="1">全权委托</el-radio>
          <el-radio v-model="form.type" :label="2">部分委托</el-radio>
        </el-form-item>
        <el-form-item label="标题:" prop="subject">
          <el-input v-model="form.subject" show-word-limit maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="开始日期:" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            align="right"
            type="datetime"
            placeholder="选择开始日期"
            format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期:" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            align="right"
            type="datetime"
            placeholder="选择结束日期"
            format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="是否有效:" prop="isEnabled">
          <el-radio v-model="form.isEnabled" label="Y">启用</el-radio>
          <el-radio v-model="form.isEnabled" label="N">禁止</el-radio>
        </el-form-item>
        <el-form-item label="委托流程:" v-if="form.type==2">
          <el-button
            size="mini"
            @click="flowSelected"
            icon="el-icon-plus"
            round
            style="margin-left:0"
          >新增</el-button>
          <el-table
          v-if="form.defList.length >0"
          :data="form.defList"
            stripe
            border
            style="width: 100%"
            header-cell-class-name="todo-header-row"
            row-class-name="todo-row"
            size="medium"
          >
            <el-table-column prop="flowName" label="流程名称"></el-table-column>
            <el-table-column prop="flowKey" label="流程key"></el-table-column>
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
                :pager-count="3"
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
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import { Message } from "element-ui";
import HtUserSelector from "@/components/control/HtUserSelector.vue";
export default {
  name: "agentAdd",
  props: ["id"],
  components: { HtUserSelector},
  data() {
    return {
      form: {
        type:2,
        isEnabled:"Y",
        defList:[]
      },
      itemSavestate: {},
      rules: {
        authNames: [
          { required: true, message: "请选择被委托人", trigger: "blur" }
        ],
        type: [
          { required: true, message: "请选择类型", trigger: "blur" }
        ],
        subject: [
          { required: true, message: "请输入标题", trigger: "blur" }
        ],
        startDate: [
          { required: true, message: "请输入开始时间", trigger: "blur" }
        ],
        endDate: [
          { required: true, message: "请输入结束时间", trigger: "blur" }
        ],
        isEnabled: [
          { required: true, message: "请选择是否有效", trigger: "blur" }
        ]
      },
      flowSelectedDialogVisible:false,
      selectFlowProps: {
        label: "name"
      },
      selectFlows: null,
      selectFlowsList:null,
      tableData:"",
      treeList:[]
    };
  },
  computed: mapState({
    flowRows: state => state.agent.rows,
    pagination: state => state.agent.pagination,
    total: state => state.agent.total,
    currentUserDetail: state => state.user.currentUserDetail
  }),
  methods: {
    flowSelected() {
      this.flowSelectedDialogVisible = true;
      let pageBean = {
      pageBean: { page: "1", pageSize: "10", showTotal: "true" },
      params:{'bpmDefAuthorizeRightType':'start'}
    };
    //初次加载默认pageBean
    this.$store.dispatch("agent/getDeflistJson", pageBean);
    },
    back() {
      this.$router.go(-1); //返回上一层
    },
    submitForm(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if(new Date(this.form.startDate).getTime() > new Date(this.form.endDate).getTime()){
              Message.warning("结束时间要大于开始时间！");
              return;
          }
          if(this.form.type==2 && this.form.defList.length<1){
             Message.warning("请选择要委托的流程！");
              return;
          }
          if(this.form.authNames.length >0){
              this.form.agent =this.form.authNames[0].fullname;
              this.form.agentId =this.form.authNames[0].id;
          }
          if(this.currentUserDetail.user.fullname == this.form.agent){
            this.$message.warning("不能指定自己为委托人");
            return false;
          }
          this.form.startDate = utils.formatDate(this.form.startDate);
          this.form.endDate = utils.formatDate(this.form.endDate);
          this.$store
            .dispatch("agent/approvalItemSave", this.form)
            .then(res => {
              if(res.state){
                    Message.success(res.message);
                    this.back();
                }else{
                    Message.error(res.message);
                }
            });
        } else {
          this.$message.warning("您输入表单信息有误，请重新填写!");
          return false;
        }
      });
    },orgRowClick(row, column, event) {
      this.$refs.flowTable.toggleRowSelection(row);
    },
    flowTableSelection(selection) {
        this.selectFlows = selection;
    },
    dialogConfirm() {
      this.flowSelectedDialogVisible = false;
      if(this.selectFlows){
          this.form.defList=[];
          this.selectFlows.forEach(item => {
            this.form.defList.push({flowKey:item.defKey,flowName:item.name});
          });
      }
    },
    remove(row){
      this.form.defList.remove(row);
      this.$refs.flowTable.clearSelection();
    },
    cancel() {
        this.flowSelectedDialogVisible = false;
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
      let pageBean = { pageBean: this.pagination ,params:{'bpmDefAuthorizeRightType':'start'}};
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
  },
  created() {
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

