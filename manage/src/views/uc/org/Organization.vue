<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <el-aside width="230px" style="overflow-x:hidden">
      <ht-select v-model="selectOrgId" class="org-select" :options="orgList" />
      <org-tree
        class="org-tree"
        @node-click="orgTreeClick"
        @addOrg="addOrg"
        @editOrg="editOrg"
        :defId="selectOrgId"
        ref="orgTree"
        v-if="reFresh"
      ></org-tree>
    </el-aside>
    <el-main>
      <org-manager
        @reloadTree="reloadTree"
        :type="toManageType"
        :orgCode="toManageOrgCode"
        :parentName="selectOrgName"
        :demId="selectOrgId"
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
const orgTree = () => import("@/views/uc/org/OrgTree.vue");
const orgManager = () => import("@/views/uc/org/OrgManager.vue");
export default {
  name: "Organization",
  data() {
    return {
      selectOrgId: "", //选择的组织ID
      selectOrgName: "", //选择的组织Name
      orgList: [], //下拉框待选择的组织
      treeList: [], //树形菜单展示的数组
      defaultProps: {
        children: "children",
        label: "name"
      },
      reFresh: true,
      toManageType: "showInfo", //打开orgManager组件需要传入的参数
      toManageOrgCode: "",
      orgManagerShow: false,
      selectParentId: ""
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
      this.$nextTick(() => {
        this.orgManagerShow = true;
      });
    },
    addOrg(param) {
      // 新建维度下面的组织
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
      /*this.reFresh = false;
      this.$nextTick(() => {
        this.reFresh = true;
      });*/
      this.$refs.orgTree.load();
    }
  },
  mounted() {
    orgrequest.getDescAll().then(rep => {
      for (var i = 0; i < rep.length; i++) {
        this.orgList.push({
          key: rep[i].id,
          value: rep[i].demName
        });
        if (rep[i].isDefault === 1) {
          this.selectOrgId = rep[i].id;
        }
      }
    });
  },
  watch: {
    selectOrgId(orgId, oldOrgId) {
      this.reFresh = false;
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
