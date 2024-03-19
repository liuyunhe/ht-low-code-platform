<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <el-aside width="230px" style="overflow-x:hidden">
      <ht-select
          v-model="selectOrgId"
          class="org-select"
          :options="orgList"
          @change="selectChange"/>
      <org-tree
        class="org-tree"
        @node-click="orgTreeClick"
        @addOrg="addOrg"
        @editOrg="editOrg"
        :orgManagerNow="orgManagerNow"
        :orgId="selectOrgId"
        v-if="reFresh && selectOrgId"
        :lazy="false"
      ></org-tree>
    </el-aside>
    <el-main>
      <org-manager
        :type="toManageType"
        @reloadTree="reloadTree"
        :orgCode="toManageOrgCode"
        :parentName="selectOrgName"
        :demId="selectOrgDemId"
        :orgManagerNow="orgManagerNow"
        :parentId="selectParentId"
        v-if="orgManagerShow"
      ></org-manager>
    </el-main>
    <el-container v-show="!orgManagerShow">
      <div class="form-empty">请选择一个组织进行操作</div>
    </el-container>
  </el-container>
</template>

<script>
import orgrequest from "@/api/org.js";
const orgTree = () => import("@/views/uc/heiorgmanager/OrgTree.vue");
const orgManager = () => import("@/views/uc/heiorgmanager/OrgManager.vue");
export default {
  name: "Organization",
  data() {
    return {
      selectOrgId: "", //选择的组织ID
      selectOrgName: "", //选择的组织Name
      orgList: [], //下拉框待选择的组织
      orgManagerList: [], //获取到有管理员权限的组织
      treeList: [], //树形菜单展示的数组
      defaultProps: {
        children: "children",
        label: "name"
      },
      reFresh: true,
      toManageType: "showInfo", //打开orgManager组件需要传入的参数
      toManageOrgCode: "",
      orgManagerShow: false,
      selectParentId: "",
      orgManagerNow: {}, //当前选择的对象
      selectOrgDemId: ""
    };
  },
  components: {
    orgTree,
    orgManager
  },
  methods: {
    orgTreeClick(orgbytree) {
      if (!orgbytree.code) {
        this.$message({
          type: "warning",
          message: "请选择维度下的组织"
        });
        return;
      }
      this.toManageOrgCode = orgbytree.code;
      this.selectOrgName = orgbytree.name;
      this.toManageType = "showInfo";
      this.orgManagerShow = false;
      // this.getCurOrgAuth(orgbytree.id);
      this.$nextTick(() => {
        this.orgManagerShow = true;
      });
    },
    addOrg(param) {
      // 新建维度下面的组织
      this.selectOrgDemId = param.demId;
      this.selectParentId = param.id;
      this.toManageOrgCode = param.code;
      this.selectOrgName = param.name;
      this.toManageType = "addOrg";
      this.orgManagerShow = false;
      this.$nextTick(() => {
        this.orgManagerShow = true;
      });
    },
    editOrg(param) {
      this.selectParentId = param.id;
      this.toManageOrgCode = param.code;
      this.selectOrgName = param.name;
      this.toManageType = "editOrg";
      this.orgManagerShow = false;
      this.$nextTick(() => {
        this.orgManagerShow = true;
      });
    },
    reloadTree() {
      // 重新加载树
      this.reFresh = false;
      this.$nextTick(() => {
        this.reFresh = true;
      });
    },
    getCurOrgAuth(orgId) {
      this.$set(this,'orgManagerNow',{});
      for (var i = 0; i < this.orgManagerList.length; i++) {
        var org = this.orgManagerList[i];
        if (org.orgId === orgId) {
          this.$set(this,'orgManagerNow',org);
        }
      }
    },
    selectChange(data){
      for (let i=0;i<this.orgList.length;i++){
        if (this.orgList[i].key === data){
          this.selectOrgDemId = this.orgList[i].demId;
        }
      }
    }
  },
  mounted() {
    orgrequest.getAllOrgAuth().then(data => {
      for (var i = 0; i < data.rows.length; i++) {
        this.orgList.push({
          key: data.rows[i].orgId,
          value: data.rows[i].orgName + "--[" + data.rows[i].demName + "]",
          demId: data.rows[i].demId
        });
      }
      this.orgManagerList = data.rows; //将所有有权限的组织赋值到orgManagerList对象当中，后面会带到各个组件当中做权限判断
      this.selectOrgId = data[0].orgId;
    });
  },
  watch: {
    selectOrgId(orgId, oldOrgId) {
      this.reFresh = false;
      this.getCurOrgAuth(orgId);
      this.$nextTick(() => {
        this.reFresh = true;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.el-aside {
  height: 100%;
  border: 1px solid #eee;
}

.org-select {
  width: 100%;
}

.org-select >>> .el-select {
  width: 100%;
}

.org-select >>> .el-input__inner {
  border-radius: 0;
  border-top-width: 0;
  border-left-width: 0;
  border-right-width: 0;
}

.org-tree {
  height: calc(100% - 50px);
  margin-top: 15px;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 50%;
  margin-left: -150px;
  color: #ccc;
}
</style>
