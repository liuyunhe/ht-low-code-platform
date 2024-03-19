<template>
  <div class="fullheight">
    <el-aside
      class="fullheight"
      :width="width"
      style="border-right: 1px solid #eee"
      v-show="asideShow"
    >
      <ht-sys-type-tree
        class="ht-sys-type-tree"
        :cat-id="catId"
        :type-key="typeKey"
        highlight-current
        ref="htSysTypeTree"
        :support-filter="supportFilter"
        :default-expand-all="isExpand"
        :show-checkbox="showCheckbox"
        :default-expanded-keys="defaultExpandedKeys"
        expand-on-click-node="false"
        @node-click="handleNodeClick"
        @check="check"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="typeKey=='appType' && data.parentId!='1293129463957164032'" icon="el-icon-plus" :command="{node:node,data,action:'add'}">添加</el-dropdown-item>
              <el-dropdown-item v-if="typeKey!='appType'" icon="el-icon-plus" :command="{node:node,data,action:'add'}">添加</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-edit"
                v-if="data.parentId!='0'"
                :command="{node:node,data,action:'edit'}"
              >编辑</el-dropdown-item>
              <el-dropdown-item v-if="typeKey=='appType' && data.parentId!='0'" icon="el-icon-setting" :command="{node: node, data, action: 'auth'}">权限</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                v-if="data.parentId!='0'"
                :command="{node:node,data,action:'delete'}"
                divided
              >删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </ht-sys-type-tree>
      <el-footer height="30px" class="el-aside-footer" v-if="hasFooter">
        <el-switch class="footer" v-model="showCheckbox" active-text="多选" inactive-text="单选"></el-switch>
      </el-footer>
    </el-aside>

    <div
      class="navbar-collapse"
      :class="{'navbar-collapse-right':!asideShow}"
      v-if="hasNavbarCollapse"
      :style="navbarCollapseStyle"
      @click="asideShow=!asideShow"
    >
      <div class="navbar-collapse-bg">
        <i
          class="navbar-collapse-arrow"
          :class="{'el-icon-arrow-left':asideShow,'el-icon-arrow-right':!asideShow}"
        ></i>
      </div>
    </div>
    <!-- 添加分类 -->
    <ht-sidebar-dialog
      width="28%"
      :title="sysType.id? '编辑':'添加'"
      :visible.sync="dialogVisible"
      append-to-body
      :before-close="handleClose"
    >
      <el-form :model="sysType" data-vv-scope="editSysTypeForm">
        <ht-form-item label="父节点" v-if="!sysType.id">
          <ht-input v-model="parentSysType.name" autocomplete="off" validate="required" disabled></ht-input>
        </ht-form-item>
        <ht-form-item label="分类名称">
          <ht-input v-model="sysType.name" autocomplete="off" :validate="{required:true}"
                    :maxlength="30"
                    :showWordLimit="true"></ht-input>
        </ht-form-item>
        <ht-form-item label="分类Key">
          <ht-input
            v-model="sysType.typeKey"
            v-pinyin="sysType.name"
            :disabled="sysType.id? true:false"
            autocomplete="off"
            :validate="{required:true,alpha_dash:true}"
            placeholder="请输入key"
            :maxlength="30"
            :showWordLimit="true"
          />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveSysTypeUrl"
          :model="sysType"
          scope-name="editSysTypeForm"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </ht-sidebar-dialog>
    <eip-auth-dialog ref="appAuth" @onConfirm="authConfirm"></eip-auth-dialog>
  </div>
</template>

<script>
import styles from "@/assets/css/element-variables.scss";
import portalApi from "@/api/portal.js";
import portal from "../../api/portal";
const htSysTypeTree = () => import("@/components/common/HtSysTypeTree.vue");
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
export default {
  name: "ht-aside-tree",
  components: {
    htSysTypeTree,
    eipAuthDialog
  },
  props: {
    width: {
      type: String,
      default: styles.aside_width
    },
    catId: {
      type: String,
      default: ""
    },
    typeKey: {
      type: String,
      default: ""
    },
    supportFilter: {
      type: Boolean,
      default: true
    },
    hasFooter: {
      type: Boolean,
      default: true
    },
    hasNavbarCollapse: {
      type: Boolean,
      default: true
    },
    defaultExpandedKeys: {
      type: Array,
      default() {
        return [];
      }
    },
    isDefaultAuth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    navbarCollapseStyle: function() {
      if (this.asideShow) {
        return { left: parseInt(this.width) + "px" };
      }
      return { left: "0px" };
    },
    saveSysTypeUrl: function() {
      return `${window.context.portal}/sys/sysType/v1/save?parentId=${
        this.parentSysType.id
      }&isRoot=${this.parentSysType.parentId == 0 ? 1 : 0}&isPriNode=0&isDefaultAuth=${this.isDefaultAuth?1:0}`;
    }
  },
  data() {
    return {
      asideShow: true,
      isExpand: false,
      showCheckbox: false,
      dialogVisible: false,
      sysType: {
        children: [],
        isLeaf: "N",
        struType: 1,
        typeKey: "",
        name: ""
      },
      parentSysType: {
        name: ""
      },
      selectedId: ""
    };
  },
  watch: {
    catId: function(newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        setTimeout(() => {
          this.$refs.htSysTypeTree.loadData();
        });
      }
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    check(data, checkedObj) {
      this.$emit("check", data, checkedObj);
    },
    handleCommand(command) {
      let node = command.node;
      let data = command.data;
      let action = command.action;
      switch (action) {
        case "add":
          this.showDialog(data, action);
          break;
        case "edit":
          this.showDialog(data, action);
          break;
        case "delete":
          this.delSysType(data);
          break;
        case "moveto":
          this.$message("暂未提供该功能");
          break;
        case "auth":
          this.auth(data);
          break;
        default:
          break;
      }
    },
    auth(data) {
      let _this = this;
      let id = "";
      this.selectedId = "";
      if (data){
        id = data.id;
        this.selectedId = id;
        portal.getRights(id,"app").then(resp => {
          if (resp.data) {
            let conf = {
              right: resp.data.right,
              permissionList: resp.data.type,
              autoClose: false
            };
            _this.$refs.appAuth.showDialog(conf);
          }
        });
      }
    },
    authConfirm(data) {
      let param = {
        id: this.selectedId,
        objType: "app",
        ownerNameJson: JSON.stringify(data)
      };
      let _this = this;
      this.$http.post("${portal}/sys/authUser/v1/saveRights", param)
              .then(resp => {
                if (resp.data) {
                  if (resp.data.state) {
                    _this.$message.success("授权成功");
                    _this.$refs.appAuth.closeDialog();
                  } else {
                    _this.$message.error(resp.data.message);
                  }
                }
              });
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
        portalApi
          .delSysType(data.id)
          .then(
            data => {
              if (data.state) {
                this.$message({
                  type: "success",
                  message: data.message || "删除成功"
                });
                this.$refs.htSysTypeTree.loadData();
                this.$emit('delete',data);
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
      }).catch(()=>{});
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
.ht-sys-type-tree {
  width: 100%;
}

>>> .el-dropdown {
  display: none;
}
>>> .el-header {
  border-bottom: 1px solid #ccc;
  button {
    float: right;
    margin-left: 5px;
  }
}

>>> .el-tree-node__content:hover .el-dropdown {
  display: inline-block;
}

>>> .navbar-collapse {
  position: relative;
  top: -60%;
  cursor: pointer;
  width:20px;
}

>>> .navbar-collapse.navbar-collapse-right {
  top: 40%;
}

>>> .navbar-collapse:hover {
  transform: scale(1) translateY(2px);
}

>>> .navbar-collapse:hover .navbar-collapse-arrow {
  color: #333333;
}

>>> .navbar-collapse-arrow {
  position: relative;
  top: 38%;
  right: 15px;
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
  bottom: 7px;
}

.custom-tree-node {
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
