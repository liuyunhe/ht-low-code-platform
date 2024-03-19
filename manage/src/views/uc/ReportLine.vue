<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree
      cat-id="12"
      :has-navbar-collapse="false"
      @node-click="handleNodeClick"
      :hasFooter="false"
    />
    <el-container>
      <report-line-aside-tree
        style="width:250px"
        :type-id="typeId"
        :has-navbar-collapse="false"
        @showReportLineForm="showReportLineForm"
        @node-click="handleLineAsideNodeClick"
        v-if="isLineTreeShow"
        ref="reportLineAsideTree"
      />
      <el-main>
        <div v-if="!isReportLineFormShow" class="form-empty">
          请选择汇报线进行操作
        </div>
        <div v-if="isReportLineFormShow">
          <!-- 汇报线的表单-->
          <div slot="header">
            <el-button @click="submit" type="primary">保存</el-button>
            <el-button @click="distributionAdmin" v-if="formType!= 'add'">分配管理员</el-button>
          </div>
          <table>
            <tr>
              <td>
                <label>用户组类型:</label>
              </td>
              <td>
                <ht-radio v-model="param.type" :options="userType" />
              </td>
            </tr>
            <tr>
              <td v-if="param.type === 'user'">
                <label>用户:</label>
              </td>
              <td v-if="param.type === 'org'">
                <label>组织:</label>
              </td>
              <td v-if="param.type === 'pos'">
                <label>岗位:</label>
              </td>
              <td v-if="param.type === 'role'">
                <label>角色:</label>
              </td>
              <td>
                {{selectName}}
                <el-button icon="icon-add" size="mini" type="primary" @click="select">选择</el-button>
              </td>
            </tr>
          </table>

        </div>
      </el-main>
    </el-container>
    <eip-user-dialog ref="eipUserDialog" single @onConfirm="selectUser" append-to-body/>
    <eip-org-dialog ref="eipOrgDialog" single @onConfirm="selectOrg"  append-to-body/>
    <eip-post-dialog ref="eipPostDialog" single @onConfirm="selectPost"  append-to-body/>
    <eip-role-dialog ref="eipRoleDialog" single @onConfirm="selectRole"  append-to-body/>
  </el-container>
</template>
<script>
import portalApi from "@/api/portal.js";
import ucApi from "@/api/uc.js";

const reportLineAsideTree = () =>
  import("@/views/uc/reportlinetree/ReportLineAsideTree.vue");
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
const eipUserDialog = () => import("@/components/dialog/EipUserDialog.vue");
const eipOrgDialog = () => import("@/components/dialog/EipOrgDialog.vue");
const eipPostDialog = () => import("@/components/dialog/EipPostDialog.vue");
const eipRoleDialog = () => import("@/components/dialog/EipRoleDialog.vue");
export default {
  components: {
    reportLineAsideTree,
    htAsideTree,
    eipUserDialog,
    eipOrgDialog,
    eipPostDialog,
    eipRoleDialog,
  },
  data() {
    return {
      catId: "",
      options: [],
      typeId: "",
      isLineTreeShow: false,
      isReportLineFormShow: false,
      param: {
        //记录请求参数
        type: "user", // 用户组类型
        value: "",
        parentAlias: "",
        alias: ""
      },
      userType: [
        { key: "user", value: "用户" },
        { key: "org", value: "组织" },
        { key: "pos", value: "岗位" },
        { key: "role", value: "角色" }
      ],
      formType: "add",
      selectName: ""
    };
  },
  computed: {},
  mounted() {
    // this.handleSelectOptions();
  },
  watch: {
    "param.type": function(newVal, oldVal) {
      if (newVal && newVal != oldVal && !this.isEditFirstChange) {
        this.param.value = "";
        this.param.alias = "";
        this.$set(this, "selectName", "");
      } else {
        this.isEditFirstChange = false;
      }
    }
  },
  methods: {
    handleNodeClick(data) {
      if (data.parentId == 0) {
        this.$message.warning("请选择具体的汇报线分类");
        return;
      }
      this.isLineTreeShow = true;
      this.isReportLineFormShow = false;
      this.typeId = data.id;
    },
    handleLineAsideNodeClick(node){
      this.isReportLineFormShow = false;
    },
    select() {
      if (this.param.type === "user") {
        this.$refs.eipUserDialog.showDialog();
      } else if (this.param.type === "pos") {
        this.$refs.eipPostDialog.showDialog();
      } else if (this.param.type === "org") {
        this.$refs.eipOrgDialog.showDialog();
      } else if (this.param.type === "role") {
        this.$refs.eipRoleDialog.showDialog();
      }
    },
    selectUser(data) {
      this.param.value = data[0].id;
      this.param.alias = data[0].account;
      this.selectName = data[0].fullname;
    },
    selectOrg(data) {
      this.param.value = data[0].id;
      this.param.alias = data[0].code;
      this.selectName = data[0].name;
    },
    selectPost(data) {
      this.param.value = data[0].id;
      this.param.alias = data[0].code;
      this.selectName = data[0].name;
    },
    selectRole(data) {
      this.param.value = data[0].id;
      this.param.alias = data[0].code;
      this.selectName = data[0].name;
    },
    showReportLineForm(data, id, type){
      if (type === "edit") {
        this.formType = "edit";
        this.param.alias = data.alias;
        this.param.id = data.id;
        this.param.value = data.id;
        this.selectName = data.name;
        this.param.parentAlias = id;
        if (this.param.type != data.groupType) {
          this.param.type = data.groupType;
          this.isEditFirstChange = true;
        }
      } else {
        this.selectName = "";
        this.param = { parentAlias: data.alias, type: "user" };
        this.formType = "add";
      }
      this.isReportLineFormShow = true;
    },
    submit(){
      // 汇报线表单提交
      if (this.formType === "add") {
        ucApi.addUserRel([this.param]).then(resp => {
          this.$message({
            message: "新增成功",
            type: "success"
          });
          this.$refs.reportLineAsideTree.$refs.htSysTypeTree.loadData();
        });
      } else if (this.formType === "edit") {
        ucApi.updateUserRel(this.param).then(resp => {
          this.$message({
            message: "修改成功",
            type: "success"
          });

          this.$refs.reportLineAsideTree.$refs.htSysTypeTree.loadData();
        });
      }
      this.selectName = ""; //保存成功清楚数据
    },
    distributionAdmin(){
      this.$refs.reportLineAsideTree.distributionAdmin(this.param.alias);
    }
  },
};
</script>

<style lang="scss" scoped>
.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 61%;
  margin-left: -150px;
  color: #ccc;
}
</style>
