<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :default-querys="[{property:'orgCode',value:this.orgCode}]"
      :quick-search-props="[{prop: 'b.FULLNAME_', label: '管理员'}]"
      ref="htTable"
      :show-custom-column="false"
      :show-export="false"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button
            size="small"
            @click="showDialog()"
            icon="el-icon-plus"
            v-if="orgManagerNow.orgauthPerms && orgManagerNow.orgauthPerms.indexOf('add')>=0"
          >添加</el-button>
          <ht-delete-button
            :url="demDeleteUrl"
            :htTable="$refs.htTable && $refs.htTable.$refs.htTable"
            v-if="orgManagerNow.orgauthPerms && orgManagerNow.orgauthPerms.indexOf('delete')>=0"
            @after-delete="afterDelete"
            parameter="id"
          >删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="userName" label="管理员" :sortable="true" :show-overflow-tooltip="true">
          <template
            v-slot="{row,column,$index}"
            v-if="orgManagerNow.orgauthPerms && orgManagerNow.orgauthPerms.indexOf('edit')>=0"
          >
            <el-link
              type="primary"
              @click="handleCommand({row:row,command:'editOrgAuthPage'})"
              title="点击编辑"
            >{{row.userName}}</el-link>
          </template>
          <template v-slot="{row,column,$index}" v-else>{{row.userName}}</template>
        </ht-table-column>

        <ht-table-column prop="orgName" label="管理的组织" width="100" />
        <ht-table-column prop="demName" label="所属维度" width="100" />
        <ht-table-column prop="orgPerms" label="组织权限" width="100">
          <template v-slot="{row}">
            <el-tag v-if="row.orgPerms && row.orgPerms.indexOf('add')>=0" type="info">增加</el-tag>
            <el-tag v-if="row.orgPerms && row.orgPerms.indexOf('delete')>=0" type="info">删除</el-tag>
            <el-tag v-if="row.orgPerms && row.orgPerms.indexOf('edit')>=0" type="info">修改</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="用户权限" width="100">
          <template v-slot="{row}">
            <el-tag v-if="row.userPerms && row.userPerms.indexOf('add')>=0" type="info">增加</el-tag>
            <el-tag v-if="row.userPerms && row.userPerms.indexOf('delete')>=0" type="info">删除</el-tag>
            <el-tag v-if="row.userPerms && row.userPerms.indexOf('edit')>=0" type="info">修改</el-tag>
            <el-tag
              v-if="row.userPerms && row.userPerms.indexOf('setMaster') >= 0"
              type="info"
            >设置主组织</el-tag>
            <el-tag v-if="row.userPerms && row.userPerms.indexOf('setPos') >= 0" type="info">设置岗位</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="orgPerms" label="岗位权限" width="100">
          <template v-slot="{row}">
            <el-tag v-if="row.posPerms && row.posPerms.indexOf('add')>=0" type="info">增加</el-tag>
            <el-tag v-if="row.posPerms && row.posPerms.indexOf('delete')>=0" type="info">删除</el-tag>
            <el-tag v-if="row.posPerms && row.posPerms.indexOf('edit')>=0" type="info">修改</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="分级权限" width="100">
          <template v-slot="{row}">
            <el-tag v-if="row.orgauthPerms && row.orgauthPerms.indexOf('add')>=0" type="info">增加</el-tag>
            <el-tag v-if="row.orgauthPerms && row.orgauthPerms.indexOf('delete')>=0" type="info">删除</el-tag>
            <el-tag v-if="row.orgauthPerms && row.orgauthPerms.indexOf('edit')>=0" type="info">修改</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column label="布局权限" width="100">
          <template v-slot="{row}">
            <el-tag v-if="row.layoutPerms && row.layoutPerms.indexOf('add')>=0" type="info">增加</el-tag>
            <el-tag v-if="row.layoutPerms && row.layoutPerms.indexOf('delete')>=0" type="info">删除</el-tag>
            <el-tag v-if="row.layoutPerms && row.layoutPerms.indexOf('edit')>=0" type="info">修改</el-tag>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog width="50%" title="添加组织分级管理员" :visible="dialogVisible" :before-close="handleClose">
      <el-form v-model="orgAuth">
        <ht-form-item label="用户账号" prop="name" label-width="100px" v-show="false">
          <ht-input v-model="orgAuth.account" />
        </ht-form-item>
        <ht-form-item label="组织管理员" prop="name" label-width="100px">
          <ht-input
            v-model="orgAuth.userName"
            autocomplete="off"
            :validate="{required:true}"
            :disabled="true"
          ></ht-input>
          <el-button type="primary" icon="el-icon-user" @click="selectUser">选择用户</el-button>
        </ht-form-item>
        <ht-form-item label="是否全选">
          <el-button icon="icon-test" @click="selectAll">{{ isSelectAll }}</el-button>
        </ht-form-item>
        <ht-form-item label="组织权限" prop="code" label-width="100px">
          <ht-checkbox
            v-model="orgAuth.orgPerms"
            :options="checkValue"
            :validate="{'required':false}"
            @input="checkClick"
          />
        </ht-form-item>
        <ht-form-item label="用户权限" prop="code" label-width="100px">
          <ht-checkbox
            v-model="orgAuth.userPerms"
            :options="userCheckValue"
            :validate="{'required':false}"
            @input="checkClick"
          />
        </ht-form-item>
        <ht-form-item label="岗位权限" prop="code" label-width="100px">
          <ht-checkbox
            v-model="orgAuth.posPerms"
            :options="checkValue"
            :validate="{'required':false}"
            @input="checkClick"
          />
        </ht-form-item>
        <ht-form-item label="分组权限" prop="code" label-width="100px">
          <ht-checkbox
            v-model="orgAuth.orgauthPerms"
            :options="checkValue"
            :validate="{'required':false}"
            @input="checkClick"
          />
        </ht-form-item>
        <ht-form-item label="布局权限" prop="code" label-width="100px">
          <ht-checkbox
            v-model="orgAuth.layoutPerms"
            :options="checkValue"
            :validate="{'required':false}"
            @input="checkClick"
          />
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!readOnly">
        <ht-submit-button
          :url="saveRoleUrl"
          :model="orgAuth"
          :isSubmit="isSubmit"
          :requestMethod="requestMethod"
          scopeName="editDemForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{ $t("eip.common.save") }}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </el-dialog>

    <ht-load-data :url="loadDataUrl" context="uc" @after-load-data="afterLoadData"></ht-load-data>
    <eip-user-dialog ref="eipUserDialog" @onConfirm="addUnderUser" single append-to-body />
  </div>
</template>
<script>
//分级组织管理
import org from "@/api/org.js";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";

export default {
  name: "org-auth-page",
  props: {
    orgCode: {
      type: String
    },
    demCode: {
      type: String
    },
    orgManagerNow: {
      type: Object
    }
  },
  components: {
    EipUserDialog
  },
  computed: {
    demDeleteUrl: function() {
      return window.context.uc + "/api/org/v1/orgAuth/deleteOrgAuth";
    },
    saveRoleUrl: function() {
      let preUrl = window.context.uc + "/api/org/v1/orgAuth";
      preUrl += "/saveOrgAuth";
      if (this.orgAuth.id) {
        this.orgAuth.account = this.orgAuth.userAccount;
        this.orgAuth.orgCode = this.orgCode;
        this.orgAuth.demCode = this.demCode;
      }
      return preUrl;
    },
    requestMethod: function() {
      return "POST";
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: "",
      menuPerm: {},
      allowRoles: [],
      readOnly: false,
      orgAuth: {
        account: "", //登录账号
        demCode: "",
        layoutPerms: "show",
        orgCode: "",
        orgPerms: "",
        orgauthPerms: "",
        posPerms: "",
        userId: "",
        userName: "",
        userPerms: ""
      },
      checkValue: [
        { key: "add", value: "增加" },
        { key: "delete", value: "删除" },
        { key: "edit", value: "修改" }
      ],
      userCheckValue: [
        { key: "add", value: "增加" },
        { key: "delete", value: "删除" },
        { key: "edit", value: "修改" },
        { key: "setMaster", value: "设置主组织" },
        { key: "setPos", value: "设置岗位" }
      ],
      isSelectAll: "全选"
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    checkClick() {
      this.isSelectAll = "全选";
    },
    setDemDefault(row) {
      org.setDemDefault(row.code).then(() => {
        this.$refs.htTable.load();
      });
    },
    handleClose() {
      this.dialogVisible = false;
      this.loadDataUrl = "";
    },
    handleCloseMenuPerm() {
      this.dialogVisibleMenuPerm = false;
    },
    showDialog(row) {
      this.isSelectAll="全选";
      this.dialogVisible = true;
      if (row) {
        this.loadDataUrl = `/api/org/v1/orgAuth/getOrgAuth?id=${row.id}`;
      } else {
        this.orgAuth = { name: "", code: "" };
      }
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
      this.orgAuth = {
        account: "",
        demCode: "",
        layoutPerms: "show",
        orgCode: "",
        orgPerms: "",
        orgauthPerms: "",
        posPerms: "",
        userId: "",
        userName: "",
        userPerms: ""
      };
      this.loadDataUrl = "";
    },
    loadData(param, cb) {
      org
        .getOrgAuthPage({ pageBean: param.pageBean }, { orgCode: this.orgCode })
        .then(response => {
          this.data = response.rows;
          this.$emit("orgAuthData", this.data);
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
        case "editOrgAuthPage":
          if (
            !this.orgManagerNow.orgauthPerms ||
            this.orgManagerNow.orgauthPerms.indexOf("edit") < 0
          ) {
            this.$message.error("您无编辑权限，请联系管理员");
            return;
          }
          this.isSelectAll = "全选";
          this.showDialog(params.row);
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
    afterLoadData(data) {
      if (this.dialogVisible) {
        this.orgAuth = data;
        this.isSelectAllFun();
        setTimeout(() => this.$validator.validateAll("editDemForm"));
      }
    },
    isSelectAllFun() {
      if (
        this.orgAuth["orgPerms"] !== "add,edit,delete" ||
        this.orgAuth["userPerms"] !== "add,edit,delete,setMaster,setPos" ||
        this.orgAuth["posPerms"] !== "add,edit,delete" ||
        this.orgAuth["orgauthPerms"] !== "add,edit,delete" ||
        this.orgAuth["layoutPerms"] !== "add,edit,delete"
      ) {
        this.isSelectAll = "全选";
      } else {
        this.isSelectAll = "取消全选";
      }
    },
    selectUser() {
      this.$refs.eipUserDialog.showDialog();
    },
    addUnderUser(selection) {
      if (!selection || selection.length != 1) {
        this.$message.error("有且只能有一个用户");
        return;
      }
      for (let user of selection) {
        this.orgAuth.account = user.account;
        // this.orgAuth.userName = user.fullname
        this.$set(this.orgAuth, "userName", user.fullname);
        this.orgAuth.orgCode = this.orgCode;
        this.orgAuth.demCode = this.demCode;
      }
    },
    selectAll() {
      //全选操作
      if (this.isSelectAll === "全选") {
        this.isSelectAll = "取消全选";
        this.$set(this.orgAuth, "orgPerms", "add,edit,delete");
        this.$set(
          this.orgAuth,
          "userPerms",
          "add,edit,delete,setMaster,setPos"
        );
        this.$set(this.orgAuth, "posPerms", "add,edit,delete");
        this.$set(this.orgAuth, "orgauthPerms", "add,edit,delete");
        this.$set(this.orgAuth, "layoutPerms", "add,edit,delete");
      } else {
        this.isSelectAll = "全选";
        this.$set(this.orgAuth, "orgPerms", "");
        this.$set(this.orgAuth, "userPerms", "");
        this.$set(this.orgAuth, "posPerms", "");
        this.$set(this.orgAuth, "orgauthPerms", "");
        this.$set(this.orgAuth, "layoutPerms", "");
      }
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
<!--

-->
