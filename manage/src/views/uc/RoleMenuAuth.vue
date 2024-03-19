<template>
  <ht-sidebar-dialog title="角色菜单授权" :visible="dialogVisible" v-if="dialogVisible" :before-close="handleClose" width="30%"  append-to-body>
     <ht-menu-manager
     v-if="loadEnd"
            ref="htMenuManager"
            show-checkbox
            hide-menu
            :default-checked-keys="defaultCheckedKeys"
            width="100%"
          />
    <div slot="footer" class="dialog-footer">
      <ht-submit-button
        url="${portal}/sys/sysRoleAuth/v1/save"
        :model="saveData"
        scope-name="editRoleMenuForm"
        @before-save-data="beforeSaveData"
        @after-save-data="afterSaveData"
      >{{$t('eip.common.save')}}</ht-submit-button>
      <el-button @click="handleClose()">{{$t('eip.common.cancel')}}</el-button>
    </div>
  </ht-sidebar-dialog>
</template>

<script>
import req from "@/request.js";

const htMenuManager = () => import("@/components/system/HtMenuManager.vue");

export default {
  name: "RoleMenuAuth",
  components: {
    htMenuManager
  },
  props: {},
  data() {
    return {
      loadEnd:false,
      dialogVisible: false,
      roleMenusMethod: null,
      defaultCheckedKeys: [],
      saveData: {},
      roleAlias: null,
	  data:[],
      pageResult: {
        page: 1,
        pageSize: 100,
        total: 0
      }
    };
  },
  methods: {
    showDialog(roleAlias) {
      this.loadEnd=false;
      this.defaultCheckedKeys = [];
      this.dialogVisible = false;
      this.$nextTick(() => {
          this.dialogVisible = true;
      })
      this.roleAlias = roleAlias;
      this.loadData(roleAlias);
    },
    handleClose() {
      this.dialogVisible = false;
    },
    loadData(roleAlias) {
     // this.defaultCheckedKeys = [];
      req
        .get(
          "${portal}" +
            `/sys/sysMenu/v1/getAllMenuRoleAlias?roleAlias=${roleAlias}`
        )
        .then(response => {
          // isParent = 0 checked !=0
          response.data.forEach(element => {
            if (element.isParent == 0 && element.checked != 0) {
              this.defaultCheckedKeys.push(element.alias);
            }
          
          });
             this.loadEnd=true;
        });
    },
    beforeSaveData() {
      // saveData = {roleAlias:"",arrMenuAlias:[],arrMethodAlias:[],dataPermission:{}}
      var elTree = this.$refs.htMenuManager.$refs.htMenuTree.$refs.htMenuTree
        .$refs.elTree;
      this.saveData = {
        roleAlias: this.roleAlias,
        arrMenuAlias: [
          ...elTree.getHalfCheckedKeys(),
          ...elTree.getCheckedKeys()
        ],
        arrMethodAlias: [],
        dataPermission: {}
      };
    },
    afterSaveData() {
      this.handleClose();
    }
  }
};
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 0px;
}
</style>