<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus"
            >添加</el-button
          >
          <ht-delete-button
            :url="demDeleteUrl"
            :htTable="$refs.htTable"
            @after-delete="afterDelete"
            :pure-data="true"
            pk="account"
            >删除</ht-delete-button
          >
        </el-button-group>
      </template>
      <template>
        <ht-table-column
          prop="fullname"
          label="用户名称"
          :show-overflow-tooltip="true"
        />
        <ht-table-column
          prop="account"
          label="账号"
          :show-overflow-tooltip="true"
        />
      </template>
    </ht-table>
    <eip-user-dialog
      ref="eipUserDialog"
      @onConfirm="selectUser"
      append-to-body
    ></eip-user-dialog>
  </div>
</template>
<script>
import uc from "@/api/uc.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

export default {
  components: {
    EipUserDialog
  },
  props: ["relCode"],
  computed: {
    demDeleteUrl: function() {
      return (
        window.context.uc +
        `/api/relAuth/v1/relAuth/delRelAuth?relCode=${this.relCode}`
      );
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/demension/v1/dem";
      if (this.demension.id) {
        preUrl += "/updateDem";
      } else {
        preUrl += "/addDem";
      }
      return preUrl;
    },
    requestMethod: function() {
      return this.demension.id ? "PUT" : "POST";
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      demension: {
        name: "",
        code: ""
      },
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      menuPerm: {},
      allowRoles: [],
      readOnly: false
    };
  },
  mounted() {
    // this.$validator = this.$root.$validator;
    console.log(this.relCode);
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    setDemDefault(row) {
      /*  org.setDemDefault(row.code).then(() => {
          this.$refs.htTable.load();
        })*/
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    showDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.loadDataUrl = `/api/demension/v1/dem/getDem?code=${row.code}`;
      } else {
        this.$refs.eipUserDialog.showDialog();
      }
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
    },
    loadData(param, cb) {
      uc.getRelAuthPage(param, { relCode: this.relCode })
        .then(response => {
          this.data = response.rows;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      this.readOnly = false;
      switch (params.command) {
        case "showInfo":
          this.readOnly = true;
          this.showDialog(params.row);
          break;
        case "assignMenu":
          this.showDialog(params.row);
          break;
        case "setDemDefault":
          this.setDemDefault(params.row);
          break;
        default:
          break;
      }
    },
    async beforeSaveData() {
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.htTable.load();
    },
    afterDelete() {
      this.$refs.htTable.load();
    },
    selectUser(data) {
      var accounts = data.map(obj => {
        return obj.account;
      });
      var param = {
        accounts: accounts,
        code: this.relCode
      };
      uc.addRelAuths(param).then(resp => {
        this.$refs.htTable.load();
      });
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
