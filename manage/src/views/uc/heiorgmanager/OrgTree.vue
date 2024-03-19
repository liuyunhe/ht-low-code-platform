<template>
  <div>
    <el-aside
      class="fullheight"
      :width="width"
      style="border-right: 1px solid #eee"
      v-show="asideShow"
    >
      <ht-org-tree
        :org-id="orgId"
        ref="orgTree"
        :support-filter="supportFilter"
        :default-expand-all="false"
        :show-checkbox="showCheckbox"
        expand-on-click-node="false"
        @node-click="handleNodeClick"
        @check="check"
        :lazy="lazy"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
          <el-dropdown @command="handleCommand">
            <span>
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-plus"
                v-if="orgManagerNow.orgPerms && orgManagerNow.orgPerms.indexOf('add')>=0"
                :command="{node:node,data,action:'add'}"
              >添加子组织</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-edit"
                v-if="orgManagerNow.orgPerms && orgManagerNow.orgPerms.indexOf('edit')>=0"
                :command="{node:node,data,action:'edit'}"
              >编辑当前组织</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                v-if="orgManagerNow.orgPerms && orgManagerNow.orgPerms.indexOf('delete')>=0"
                :command="{node:node,data,action:'delete'}"
              >删除当前组织</el-dropdown-item>
              <el-dropdown-item
                icon="icon-reload"
                :divided="orgManagerNow.orgPerms==={}"
                :command="{node:node,data,action:'syncTree'}"
              >刷新</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </ht-org-tree>
    </el-aside>
  </div>
</template>

<script>
import styles from "@/assets/css/element-variables.scss";
import ucApi from "@/api/uc.js";

const htOrgTree = () => import("@/views/uc/heiorgmanager/HtOrgTree.vue");
export default {
  name: "org-tree",
  components: {
    htOrgTree
  },
  props: {
    width: {
      type: String,
      default: styles.aside_width
    },
    orgId: {
      type: String,
      required: true
    },
    supportFilter: {
      type: Boolean,
      default: true
    },
    orgManagerNow: {
      type: Object
    },
    lazy: {
      type:Boolean,
      default: true
    }
  },
  computed: {
    navbarCollapseStyle: function() {
      if (this.asideShow) {
        return { left: parseInt(this.width) + 16 + "px" };
      }
      return { left: "0px" };
    },
    saveSysTypeUrl: function() {
      return `${window.context.portal}/sys/sysType/v1/save?parentId=${
        this.parentSysType.id
      }&isRoot=${this.parentSysType.parentId == 0 ? 1 : 0}&isPriNode=0`;
    }
  },
  data() {
    return {
      asideShow: true,
      isExpand: true,
      showCheckbox: false,
      dialogVisible: false,
      sysType: {
        children: [],
        icon: "{}",
        isLeaf: "N",
        struType: 1,
        typeKey: "",
        name: ""
      },
      parentSysType: {
        name: ""
      }
    };
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    check(data, checkedObj) {
      this.$emit("check", data, checkedObj);
    },
    syncTree() {
      this.$refs.orgTree.loadData();
    },
    handleExpand() {
      this.isExpand = !this.isExpand;
      let elTree = this.$refs.htSysTypeTree.$refs.htTree.$refs.elTree;
      for (var i = 0; i < elTree.store._getAllNodes().length; i++) {
        elTree.store._getAllNodes()[i].expanded = this.isExpand;
      }
    },
    handleCommand(command) {
      let node = command.node;
      let data = command.data;
      let action = command.action;
      switch (action) {
        case "add":
          // this.showDialog(data, action);
          this.$emit("addOrg", data);
          break;
        case "edit":
          // this.showDialog(data, action);
          this.$emit("editOrg", data);
          break;
        case "delete":
          this.delSysType(data);
          break;
        case "syncTree":
          this.syncTree();
          break;
        default:
          break;
      }
    },
    showDialog(data, action) {
      this.dialogVisible = true;
      if (data && action == "add") {
        this.sysType.id = "";
        this.sysType.name = "";
        this.sysType.typeKey = "";
        this.parentSysType = data;
        this.sysType.parentId = data.id;
        this.sysType.typeGroupKey =
          data.parentId == 0 ? data.typeKey : data.typeGroupKey;
      }
      if (data && action == "edit") {
        this.sysType = { ...this.sysType, ...data };
      }
    },
    delSysType(data) {
      this.$confirm(`是否确定删除 [${data.name}] ?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        ucApi
          .deleteOrg(data.code)
          .then(
            data => {
              if (data.state) {
                this.$message({
                  type: "success",
                  message: data.message || "删除成功"
                });
                this.$refs.orgTree.loadData();
              } else {
                this.$message.error(data.message || "删除成功");
              }
            },
            error => {
              this.$message.error(error || "删除失败");
            }
          )
          .catch(() => {
            this.dialogVisible = false;
          });
      });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    afterSaveData() {
      this.$refs.htSysTypeTree.loadData();
      if (this.sysType.id) {
        this.dialogVisible = false;
        return;
      }
      this.sysType.name = "";
      this.sysType.typeKey = "";
      this.$confirm("是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "success"
      })
        .then(() => {})
        .catch(() => {
          this.dialogVisible = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .navbar-collapse {
  position: absolute;
  top: 41%;
  cursor: pointer;
  width:20px;
}

>>> .el-dropdown {
  display: none;
}

>>> .el-tree-node__content:hover .el-dropdown {
  display: inline-block;
}

>>> .navbar-collapse:hover {
  transform: scale(1.1) translateY(2px);
}

>>> .navbar-collapse:hover .navbar-collapse-arrow {
  color: #333333;
}

>>> .navbar-collapse-arrow {
  position: absolute;
  top: 38%;
  right: -3px;
  font-size: 18px;
  color: #a8a8a8;
}

>>> .navbar-collapse-bg {
  -webkit-transition: all 0.12s ease;
  height: 50px;
  border-bottom: 8px solid transparent;
  border-right: none;
  border-left: 12px solid #ebebeb;
  border-top: 8px solid transparent;
  opacity: 0.9;
}
.el-aside-footer {
  position: absolute;
  bottom: 21px;
}

>>> .custom-tree-node {
  width: calc(100% - 40px);
  // flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.custom-tree-node i {
  visibility: hidden;
  font-weight: bold;
}

.custom-tree-node:hover i {
  visibility: visible;
}
</style>
