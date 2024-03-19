<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <el-aside>
      <el-container>
        <el-scrollbar style="height:100%">
          <pre>{{data}}</pre>
        </el-scrollbar>
      </el-container>
    </el-aside>
    <el-container class="fullheight" style="border: 1px solid #eee">
      <el-main>
        <form v-form data-vv-scope="editDemoForm">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th width="130px" class="is-required">系统分类对话框:</th>
                <td>
                  <ht-input v-model="data.catId" placeholder="请输入查看的分类id 1~12" validate="required" />
                  <el-button @click="showDialog('flowTypeDialog')">打开分类对话框</el-button>
                  <el-button @click="showDialog('flowTypeDialog2')">打开分类对话框 多选</el-button>
                </td>
                <th width="130px" class="is-required">系统分类选择器:</th>
                <td>
                  <el-form>
                    <ht-form-item>
                      <eip-sys-type-selector
                        placeholder="请选择分类"
                        type-key="FORM_TYPE"
                        v-model="data.sysTypeSelectorCatName"
                        :sys-type-id.sync="data.sysTypeSelectorCatId"
                        :validate="{required:true}"
                      />
                    </ht-form-item>
                  </el-form>
                </td>
              </tr>
              <tr>
                <th width="130px">用户对话框:</th>
                <td>
                  <el-button @click="showDialog('eipUserDialog')">打开用户对话框</el-button>
                </td>
                <th width="130px" class="is-required">用户选择器:</th>
                <td>
                  <el-form>
                    <ht-form-item>
                      <eip-user-selector
                        v-model="data.userFullnames"
                        :config="{id:'data.userIds',account: 'data.userAccounts'}"
                        :validate="{required:true}"
                      />
                    </ht-form-item>
                  </el-form>
                </td>
              </tr>
              <tr>
                <th width="130px">角色对话框:</th>
                <td>
                  <el-button @click="showDialog('eipRoleDialog')">打开角色对话框</el-button>
                </td>
                <th width="130px" class="is-required">角色选择器:</th>
                <td>
                  <eip-role-selector
                    v-model="data.roleNames"
                    :config="{id:'data.roleIds',code: 'data.roleCodes'}"
                    :validate="{required:true}"
                  />
                </td>
              </tr>
              <tr>
                <th width="130px">维度对话框:</th>
                <td>
                  <el-button @click="showDialog('eipDemensionDialog')">维度对话框</el-button>
                </td>
                <th width="130px" class="is-required">维度选择器:</th>
                <td>
                  <eip-demension-selector
                    v-model="data.demensionNames"
                    :config="{id:'data.demensionIds',code: 'data.demensionCodes'}"
                    :validate="{required:true}"
                  />
                </td>
              </tr>
              <tr>
                <th width="130px">职务对话框:</th>
                <td>
                  <el-button @click="showDialog('eipJobDialog')">职务对话框</el-button>
                </td>
                <th width="130px" class="is-required">职务选择器:</th>
                <td>
                  <eip-job-selector
                    v-model="data.jobNames"
                    :config="{id:'data.jobIds',code: 'data.jobCodes'}"
                    :validate="{required:true}"
                  />
                </td>
              </tr>
              <tr>
                <th width="130px">组织对话框:</th>
                <td>
                  <el-button @click="showDialog('eipOrgDialog')">组织对话框</el-button>
                </td>
                <th width="130px" class="is-required">组织选择器:</th>
                <td>
                  <eip-org-selector
                    v-model="data.orgNames"
                    :config="{id:'data.orgIds',code: 'data.orgCodes'}"
                    :validate="{required:true}"
                  />
                </td>
              </tr>

              <tr>
                <th width="130px">岗位对话框:</th>
                <td>
                  <el-button @click="showDialog('eipPostDialog')">岗位对话框</el-button>
                </td>
                <th width="130px" class="is-required">岗位选择器:</th>
                <td>
                  <eip-post-selector
                    v-model="data.postNames"
                    :config="{id:'data.postIds',code: 'data.postCodes'}"
                    :validate="{required:true}"
                  />
                </td>
              </tr>
              <tr>
                <th width="130px">表单选择对话框:</th>
                <td>
                  <ht-select
                    v-model="formType"
                    :options="[{key:'pc',value:'PC表单'},{key:'mobile',value:'手机表单'}]"
                  ></ht-select>
                  <el-button @click="showDialog('eipFormDialog')">表单选择对话框</el-button>
                </td>
                <th width="130px" class="is-required">授权配置对话框:</th>
                <td>
                  <el-button @click="showAuthDialog()">授权配置对话框</el-button>
                </td>
              </tr>
              <tr>
                <th width="130px">常用脚本选择对话框:</th>
                <td>
                  <el-button @click="showDialog('eipScriptDialog')">常用脚本选择对话框</el-button>
                </td>
                <th width="130px" class="is-required">接口资源对话框:</th>
                <td>
                  <el-button @click="showDialog('eipMethodDialog')">接口资源对话框</el-button>
                </td>
              </tr>
              <tr>
                <th width="130px">业务对象选择对话框:</th>
                <td>
                  <el-button @click="showDialog('eipBoDialog')">业务对象选择对话框</el-button>
                </td>
                <th width="130px" class="is-required">流程对话框:</th>
                <td>
                  <el-button @click="showDialog('eipFlowDialog')">流程选择对话框</el-button>
                </td>
              </tr>
            </tbody>
          </table>
          <ht-save-button scope-name="editDemoForm" @before-save-data="beforeSaveData">HtSaveButton</ht-save-button>
          <el-button @click="dialogVisible=true">侧边栏使用</el-button>
        </form>
      </el-main>
    </el-container>
    <ht-sidebar-dialog
      width="1040px"
      title="侧边栏使用"
      :visible="dialogVisible"
      :before-close="handleClose"
    >
      <form data-vv-scope="editDemoForm">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="130px" class="is-required">系统分类对话框:</th>
              <td>
                <ht-input v-model="data.catId" placeholder="请输入查看的分类id 1~12" validate="required" />
                <el-button @click="showDialog('flowTypeDialog')">打开分类对话框</el-button>
              </td>
              <th width="130px" class="is-required">系统分类选择器:</th>
              <td>
                <eip-sys-type-selector
                  placeholder="请选择分类"
                  :cat-id="data.catId||'6'"
                  v-model="data.sysTypeSelectorCatName"
                  :config="{id:'data.sysTypeSelectorCatId'}"
                  :validate="{required:true}"
                />
              </td>
            </tr>
            <tr>
              <th width="130px">用户对话框:</th>
              <td>
                <el-button @click="showDialog('eipUserDialog')">打开用户对话框</el-button>
              </td>
              <th width="130px" class="is-required">用户选择器:</th>
              <td>
                <eip-user-selector
                  v-model="data.userFullnames"
                  :config="{id:'data.userIds',account: 'data.userAccounts'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>
            <tr>
              <th width="130px">角色对话框:</th>
              <td>
                <el-button @click="showDialog('eipRoleDialog')">打开角色对话框</el-button>
              </td>
              <th width="130px" class="is-required">角色选择器:</th>
              <td>
                <eip-role-selector
                  v-model="data.roleNames"
                  :config="{id:'data.roleIds',code: 'data.roleCodes'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>
            <tr>
              <th width="130px">维度对话框:</th>
              <td>
                <el-button @click="showDialog('eipDemensionDialog')">维度对话框</el-button>
              </td>
              <th width="130px" class="is-required">维度选择器:</th>
              <td>
                <eip-demension-selector
                  v-model="data.demensionNames"
                  :config="{id:'data.demensionIds',code: 'data.demensionCodes'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>
            <tr>
              <th width="130px">职务对话框:</th>
              <td>
                <el-button @click="showDialog('eipJobDialog')">职务对话框</el-button>
              </td>
              <th width="130px" class="is-required">职务选择器:</th>
              <td>
                <eip-job-selector
                  v-model="data.jobNames"
                  :config="{id:'data.jobIds',code: 'data.jobCodes'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>
            <tr>
              <th width="130px">组织对话框:</th>
              <td>
                <el-button @click="showDialog('eipOrgDialog')">组织对话框</el-button>
              </td>
              <th width="130px" class="is-required">组织选择器:</th>
              <td>
                <eip-org-selector
                  v-model="data.orgNames"
                  :config="{id:'data.orgIds',code: 'data.orgCodes'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>

            <tr>
              <th width="130px">岗位对话框:</th>
              <td>
                <el-button @click="showDialog('eipPostDialog')">岗位对话框</el-button>
              </td>
              <th width="130px" class="is-required">岗位选择器:</th>
              <td>
                <eip-post-selector
                  v-model="data.postNames"
                  :config="{id:'data.postIds',code: 'data.postCodes'}"
                  :validate="{required:true}"
                  append-to-body
                />
              </td>
            </tr>

            <tr>
              <th width="130px">表单选择对话框:</th>
              <td>
                <el-button @click="showDialog('eipFormDialog')">表单选择对话框</el-button>
              </td>
              <th width="130px" class="is-required">流程对话框:</th>
              <td>
                <el-button @click="showDialog('eipFlowDialog')">流程选择对话框</el-button>
              </td>
            </tr>
            <tr>
              <th width="130px">常用脚本选择对话框:</th>
              <td>
                <el-button @click="showDialog('eipScriptDialog')">常用脚本选择对话框</el-button>
              </td>
              <th width="130px" class="is-required">流程对话框:</th>
              <td>
                <el-button @click="showDialog('eipFlowDialog')">流程选择对话框</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </ht-sidebar-dialog>
    <!-- 分类对话框  -->
    <eip-sys-type-dialog
      ref="flowTypeDialog"
      :cat-id="data.catId"
      @onConfirm="sysTypeDialogOnConfirm"
    ></eip-sys-type-dialog>

    <!-- 分类对话框  -->
    <eip-sys-type-dialog
      ref="flowTypeDialog2"
      name="flowTypeDialog2"
      show-checkbox
      :cat-id="data.catId"
      @onConfirm="sysTypeDialogOnConfirm"
    ></eip-sys-type-dialog>
    <!-- 用户选择对话框  -->
    <eip-user-dialog
      ref="eipUserDialog"
      name="eipUserDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 角色选择对话框  -->
    <eip-role-dialog
      ref="eipRoleDialog"
      name="eipRoleDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 维度选择对话框  -->
    <eip-demension-dialog
      ref="eipDemensionDialog"
      name="eipDemensionDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 职务选择对话框  -->
    <eip-job-dialog
      ref="eipJobDialog"
      name="eipJobDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 组织选择对话框  -->
    <eip-org-dialog
      ref="eipOrgDialog"
      name="eipOrgDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 岗位选择对话框  -->
    <eip-post-dialog
      ref="eipPostDialog"
      name="eipPostDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 表单选择对话框  -->
    <eip-form-dialog
      :form-type="formType"
      ref="eipFormDialog"
      name="eipFormDialog"
      @onConfirm="dialogOnConfirm"
      single
      append-to-body
      destory-on-close
    />
    <!-- 流程选择对话框  -->
    <eip-flow-dialog
      ref="eipFlowDialog"
      name="eipFlowDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 常用脚本选择对话框  -->
    <eip-script-dialog
      ref="eipScriptDialog"
      name="eipScriptDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 后台接口选择对话框  -->
    <eip-method-dialog
      ref="eipMethodDialog"
      name="eipMethodDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 业务对象选择对话框  -->
    <eip-bo-dialog
      ref="eipBoDialog"
      name="eipBoDialog"
      @onConfirm="dialogOnConfirm"
      single
      append-to-body
    />
  </el-container>
</template>
<script>
const eipSysTypeDialog = () =>
  import("@/components/dialog/EipSysTypeDialog.vue");
const eipUserDialog = () => import("@/components/dialog/EipUserDialog.vue");
const eipRoleDialog = () => import("@/components/dialog/EipRoleDialog.vue");
const eipDemensionDialog = () =>
  import("@/components/dialog/EipDemensionDialog.vue");
const eipJobDialog = () => import("@/components/dialog/EipJobDialog.vue");
const eipOrgDialog = () => import("@/components/dialog/EipOrgDialog.vue");
const eipPostDialog = () => import("@/components/dialog/EipPostDialog.vue");
const eipFormDialog = () => import("@/components/dialog/EipFormDialog.vue");
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
const eipScriptDialog = () => import("@/components/dialog/EipScriptDialog.vue");
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const eipMethodDialog = () => import("@/components/dialog/EipMethodDialog.vue");
const eipBoDialog = () => import("@/components/dialog/EipBoDialog.vue");

const eipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
const eipRoleSelector = () =>
  import("@/components/selector/EipRoleSelector.vue");
const eipDemensionSelector = () =>
  import("@/components/selector/EipDemensionSelector.vue");
const eipJobSelector = () => import("@/components/selector/EipJobSelector.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
const eipPostSelector = () =>
  import("@/components/selector/EipPostSelector.vue");

export default {
  components: {
    eipUserDialog,
    eipSysTypeDialog,
    eipSysTypeSelector,
    eipUserSelector,
    eipRoleSelector,
    eipRoleDialog,
    eipDemensionSelector,
    eipDemensionDialog,
    eipJobSelector,
    eipJobDialog,
    eipOrgSelector,
    eipOrgDialog,
    eipPostSelector,
    eipPostDialog,
    eipFormDialog,
    eipFlowDialog,
    eipScriptDialog,
    eipAuthDialog,
    eipMethodDialog,
    eipBoDialog
  },
  computed: {},
  data() {
    return {
      dialogVisible: false,
      data: {
        catId: "6",
        sysTypeSelectorCatId: "",
        sysTypeSelectorCatName: "测试分类"
      },
      formType: "pc"
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    showDialog(ref) {
      this.$refs[ref].showDialog({});
    },
    showAuthDialog() {
      let conf = {
        right: [
          {
            type: "user",
            title: "用户",
            currentProfile: ["1"],
            id: "701033,701026,701022",
            name: "部长,部级财务组3,部级财务组2"
          },
          {
            type: "org",
            title: "组织",
            currentProfile: ["31784", "31792", "2856250", "31776"],
            id: "31796,31788",
            name: "美工,秘书部"
          },
          {
            type: "pos",
            title: "岗位",
            currentProfile: ["4164250", "31849"],
            id: "31849",
            name: "开发员工"
          },
          {
            type: "role",
            title: "角色",
            currentProfile: ["471151"],
            id: "1643341,471151",
            name: "测试角色,普通用户"
          }
        ],
        permissionList: [
          { type: "everyone", title: "所有人" },
          { type: "user", title: "用户" },
          { type: "org", title: "组织" },
          { type: "pos", title: "岗位" },
          { type: "role", title: "角色" }
          // ,{ type: "none", title: "无" }
        ]
      };
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    sysTypeDialogOnConfirm(data) {
      this.$message({
        type: "success",
        message: JSON.stringify(data),
        showClose: true
      });
    },
    dialogOnConfirm(data) {
      this.$message({
        type: "success",
        message: JSON.stringify(data),
        showClose: true
      });
    },
    beforeSaveData() {
      this.$message({
        type: "success",
        message: JSON.stringify(this.data),
        showClose: true
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
