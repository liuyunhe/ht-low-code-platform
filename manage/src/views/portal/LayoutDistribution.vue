<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <el-aside width="230px" style="overflow-x:hidden">
      <ht-select v-model="selectOrgId" class="org-select" :options="orgList" />
      <org-tree
        class="org-tree"
        @node-click="orgTreeClick"
        :orgManagerNow="orgManagerNow"
        :orgId="selectOrgId"
        v-if="reFresh && selectOrgId"
      ></org-tree>
    </el-aside>
    <el-main>
      <LayoutManager ref="layoutManager" v-if="layoutMngShow" :orgId="orgId" :orgManagerNow="orgManagerNow" />
      <div v-if="!layoutMngShow" class="empty">选择一个组织进行具体操作</div>
    </el-main>
  </el-container>
</template>

<script>
import orgrequest from "@/api/org.js";
const orgTree = () => import("@/views/uc/heiorgmanager/OrgTree.vue");
const LayoutManager = () => import("@/views/portal/LayoutManager.vue");
export default {
  name: "layout-distribution",
  data() {
    return {
      selectOrgId: "", //选择的组织ID
      orgList: [], //下拉框待选择的组织
      orgManagerList: [], //获取到有管理员权限的组织
      treeList: [], //树形菜单展示的数组
      defaultProps: {
        children: "children",
        label: "name"
      },
      reFresh: true,
      toManageType: "showInfo", //打开orgManager组件需要传入的参数
      orgId: "",
      layoutMngShow: false,
      orgManagerNow: {} //当前选择的对象
    };
  },
  components: {
    orgTree,
    LayoutManager
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    orgTreeClick(orgbytree) {
      this.orgId = orgbytree.id;
      this.layoutMngShow = false;
      this.$nextTick(() => {
        this.layoutMngShow = true;
      });
    }
  },
  mounted() {
    orgrequest.getCurrentUserAuthOrgLayout().then(rep => {
      for (var i = 0; i < rep.length; i++) {
        this.orgList.push({
          key: rep[i].orgId,
          value: rep[i].orgName + "--[" + rep[i].demName + "]"
        });
      }
      this.orgManagerList = rep; //将所有有权限的组织赋值到orgManagerList对象当中，后面会带到各个组件当中做权限判断
      this.selectOrgId = rep[0].orgId;
    });
  },
  watch: {
    selectOrgId(orgId, oldOrgId) {
      for (var i = 0; i < this.orgManagerList.length; i++) {
        var org = this.orgManagerList[i];
        if (org.orgId === orgId) {
          this.orgManagerNow = org;
        }
      }
      this.orgId = orgId;
      this.layoutMngShow = false;
      this.$nextTick(() => {
        this.layoutMngShow = true;
      });
      this.reFresh = false;
      this.$nextTick(() => {
        this.reFresh = true;
      });
    }
  }
};
</script>

<style  lang="scss" scoped>
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

.empty {
  text-align: center;
  width: 100%;
  margin-top: 150px;
  font-size: 16px;
  color: #ccc;
}
@media (max-width: 1024px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
}
</style>
