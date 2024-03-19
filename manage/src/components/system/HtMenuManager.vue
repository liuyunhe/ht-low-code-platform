<template>
  <div class="fullheight">
    <el-aside
      class="fullheight"
      :width="width"
      style="border-right: 1px solid #eee"
      v-show="asideShow"
    >
      <ht-menu-tree
        highlight-current
        ref="htMenuTree"
        :node-key="nodeKey"
        :show-checkbox="showCheckbox"
        :support-filter="supportFilter"
        :default-expand-all="isExpand"
        :default-checked-keys="defaultCheckedKeys"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.label">{{ node.label}}</span>
          <el-dropdown @command="handleCommand" v-if="!hideMenu && data.parentId">
            <span v-if="data.parentId">
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown" v-show="!hideMenu && data.parentId">
              <el-dropdown-item icon="el-icon-circle-plus-outline" v-if="data.parentId!='' && data.alias!='front_menu'" :command="{node:node,data,action:'addHref'}">添加Url菜单</el-dropdown-item>
              <el-dropdown-item icon="el-icon-plus" v-if="data.parentId!=''" :command="{node:node,data,action:'add'}">添加下级菜单</el-dropdown-item>
              <el-dropdown-item icon="icon-autocomplete" v-if="data.children.length>0"  :command="{node:node,data,action:'batchSort'}">下级批量排序</el-dropdown-item>
              <el-dropdown-item icon="el-icon-upload2" v-if="data.parentId!='0'" :command="{node:node,data,action:'import'}" >导入</el-dropdown-item>
              <el-dropdown-item icon="el-icon-download" v-if="data.parentId!='0'" :command="{node:node,data,action:'export'}" >导出</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-edit"
                v-if="showEdit"
                :command="{node:node,data,action:'edit'}"
              >编辑</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                v-if="data.parentId!='' &&( $store.state.login.currentUser.userAttrs.tenantId == data.tenantId || data.tenantId==null ) "
                :command="{node:node,data,action:'delete'}"

              >删除</el-dropdown-item>
              <!-- <el-dropdown-item
                icon="el-icon-s-unfold"
                v-if="data.parentId!='0' && data.parentId!=''"
                divided
                :command="{node:node,data,action:'moveto'}"
              >移动至</el-dropdown-item> -->
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </ht-menu-tree>
    </el-aside>

  </div>
</template>

<script>
import styles from "@/assets/css/element-variables.scss";
const htMenuTree = () => import("@/components/system/HtMenuTree.vue");
export default {
  name: "ht-menu-manager",
  components: {
    htMenuTree
  },
  props: {
    width: {
      type: String,
      default: styles.aside_width
    },
    supportFilter: {
      type: Boolean,
      default: true
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    hideMenu: {
      type: Boolean,
      default: false
    },
    defaultCheckedKeys: {
      type: Array
    },
    nodeKey: {
      type: String,
      default: "alias"
    },
    showEdit: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    navbarCollapseStyle: function() {
      if (this.asideShow) {
        return { left: parseInt(this.width) + "px" };
      }
      return { left: "0px" };
    }
  },
  data() {
    return {
      asideShow: true,
      isExpand: false,
      dialogVisible: false,
      parentSysType: {
        name: ""
      }
    };
  },
  methods: {
    handleNodeClick(node) {
      this.$emit("node-click", node);
    },
    syncTree() {
      this.$refs.htMenuTree.loadData();
    },
    handleExpand() {
      this.isExpand = !this.isExpand;
      let elTree = this.$refs.htMenuTree.$refs.htMenuTree.$refs.elTree;
      for (var i = 0; i < elTree.store._getAllNodes().length; i++) {
        elTree.store._getAllNodes()[i].expanded = this.isExpand;
      }
    },
    handleCommand(command) {
      let root=this.getParent(command.node);
      if (root.alias=='manage_menu' && command.node.level==5 && command.action != 'delete'){
        return this.$message.warning("管理端不允许添加4级菜单");
      }
      if (root.alias=='front_menu' && command.node.level==6 && command.action != 'delete'){
        return this.$message.warning("应用端不允许添加5级菜单");
      }
      this.$emit("menu-action", command);
    },
    getParent(data){
      let res=true;
      let _menus = data;
      while(res){
        if ( _menus.parent && _menus.data.alias!="manage_menu" &&  _menus.data.alias!="front_menu"){
          _menus=_menus.parent;
        } else{
          _menus=_menus.data;
          res=false;
        }
      }
      return _menus;
    },
    handleClose() {
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .navbar-collapse {
  position: relative;
  top: -60%;
  cursor: pointer;
  width:20px;
}

>>> .el-dropdown {
  display: none;
}

>>> .el-tree-node__content:hover .el-dropdown {
  display: inline-block;
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
