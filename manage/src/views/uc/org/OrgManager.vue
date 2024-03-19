<template>
  <div class="fullheight">
    <el-tabs
      type="card"
      v-model="orgResume"
      @tab-click="tabClick"
      class="fullheight"
    >
      <el-tab-pane label="组织简介" name="orgInfo" class="fullheight">
        <form data-vv-scope="form1" v-form class="fullheight">
          <table class="form-table" cellspacing="5" cellpadding="3" border="0">
            <tr>
              <td>上级组织名称:</td>
              <td width="83%">
                <ht-input
                  v-model="org.parentOrgName"
                  permission="b"
                  placeholder="请输入上级组织名称"
                  style="width: 100%;"
                  disabled
                />
              </td>
            </tr>
            <tr>
              <td>组织名称:</td>
              <td width="83%">
                <ht-input
                  v-model="org.name"
                  permission="b"
                  placeholder="请输入组织名称"
                  style="width: 100%;"
                  :disabled="OrgManagerFormType == 'showInfo'"
                />
              </td>
            </tr>
            <tr>
              <td>组织编码:</td>
              <td width="83%">
                <ht-input
                  v-model="org.code"
                  permission="b"
                  placeholder="请输入组织编码"
                  v-pinyin="org.name"
                  style="width: 100%;"
                  :disabled="OrgManagerFormType != 'addOrg'"
                />
              </td>
            </tr>
            <tr>
              <td>排序号:</td>
              <td width="83%">
                <ht-input
                  v-model="org.orderNo"
                  permission="b"
                  placeholder="请输入排序号"
                  style="width: 100%;"
                  :validate="{regex:{exp:'^[0-9]*$',message:''}}"
                  :disabled="OrgManagerFormType == 'showInfo'"
                />
              </td>
            </tr>
            <tr>
              <td>级别:</td>
              <td width="83%">
                <ht-input
                  v-model="org.grade"
                  permission="w"
                  placeholder="请输入级别"
                  style="width: 100%;"
                  :disabled="OrgManagerFormType == 'showInfo'"
                />
              </td>
            </tr>
            <tr>
              <td>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="0表示不受限制"
                  placement="top"
                >
                  <span class="el-icon-question" style="margin-left: 10px"
                    >组织限编用户数量:</span
                  >
                </el-tooltip>
              </td>
              <td width="83%">
                <ht-input
                  v-model="org.limitNum"
                  permission="w"
                  placeholder="组织限编用户数量"
                  style="width: 100%;"
                  :validate="{regex:{exp:'^[0-9]*$',message:''}}"
                  :disabled="OrgManagerFormType == 'showInfo'"
                />
              </td>
            </tr>
            <tr>
              <td>组织现编用户数量:</td>
              <td width="83%">
                <ht-input
                  v-model="org.nowNum"
                  permission="w"
                  placeholder="组织现编用户数量"
                  style="width: 100%;"
                  disabled
                />
              </td>
            </tr>
            <tr>
              <td>是否允许超过限编:</td>
              <td width="83%">
                <ht-radio
                  v-model="org.exceedLimitNum"
                  :disabled="OrgManagerFormType == 'showInfo'"
                  :options="[
                    { key: 0, value: '允许' },
                    { key: 1, value: '不允许' }
                  ]"
                />
              </td>
            </tr>
            <tr v-if="OrgManagerFormType != 'showInfo'">
              <td>
                <el-button @click="submit" type="primary">{{
                  $t("eip.common.save")
                }}</el-button>
              </td>
            </tr>
          </table>
        </form>
      </el-tab-pane>
      <el-tab-pane
        label="组织人员"
        name="orgUser"
        :disabled="OrgManagerFormType === 'addOrg'"
        class="fullheight"
      >
        <ht-table
          @load="loadData"
          :data="orgUser"
          :pageResult="pageResult"
          :selection="true"
          :quick-search-props="[{ prop: 'u.fullname_', label: '姓名' }]"
          :default-querys="defaultQuerys"
          @select-all="selectUser"
          @select="selectUser"
          ref="htTable"
          v-if="orgUserShow"
          class="fullheight"
          :show-custom-column="false"
          :show-export="false"
          @row-click="rowClick"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button
                size="small"
                @click="showAddOrgUser()"
                icon="el-icon-plus"
                >添加</el-button
              >
              <el-button @click="setUserMaster()">设置主组织</el-button>
              <el-button @click="setUserPost()">设置岗位</el-button>
              <ht-delete-button
                :url="orgUserDeleteUrl"
                :htTable="$refs.htTable"
                pk="orgUserId"
                @after-delete="afterDelete"
                >删除</ht-delete-button
              >
            </el-button-group>
          </template>
          <template>
            <ht-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <ht-table-column
              label="名称"
              width="150"
              :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <el-link type="primary" @click="editUser(scope.row.account)">{{scope.row.fullName}}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="account" label="账号" :show-overflow-tooltip="true" />
            <ht-table-column prop="relName" label="岗位名称" :show-overflow-tooltip="true" />
            <ht-table-column width="120" label="其他组织岗位">
              <template slot-scope="scope">
                <el-tag type="danger" v-if="scope.row.otherPost == 1">无</el-tag>
                <el-link type="primary" @click="getOtherPost(scope.row)"><el-tag v-if="scope.row.otherPost == 2">有</el-tag></el-link>
                <el-link type="primary" @click="getOtherPost(scope.row)"><el-tag v-if="scope.row.otherPost == 3"  type="success">有（主）</el-tag></el-link>
              </template>
            </ht-table-column>
            <ht-table-column
              prop="orguser.IS_MASTER_"
              label="是否主要组织"
              width="120"
              :filters="[
                { text: '否', value: 0 },
                { text: '是', value: 1 }
              ]"
            >
              <template v-slot="{ row }">
                <el-tag type="danger" v-if="row.isMaster == 0">否</el-tag>
                <el-tag type="success" v-if="row.isMaster == 1">是</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column
              prop="orguser.IS_CHARGE_"
              label="负责人"
              width="100"
              :filters="[
                { text: '否', value: 0 },
                { text: '是', value: 1 },
                { text: '主', value: 2 }
              ]"
            >
              <template v-slot="{ row }">
                <el-tag type="danger" v-if="row.isCharge == 0">否</el-tag>
                <el-tag  v-if="row.isCharge == 1">是</el-tag>
                <el-tag type="success" v-if="row.isCharge == 2">主</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column
              prop="u.STATUS_"
              label="状态"
              width="100"
              :filters="[
                { text: '禁用', value: 0 },
                { text: '正常', value: 1 },
                { text: '离职', value: -2 }
              ]"
            >
              <template v-slot="{ row }">
                <el-tag type="danger" v-if="row.status == 0">禁用</el-tag>
                <el-tag type="success" v-if="row.status == 1">正常</el-tag>
                <el-tag type="warning" v-if="row.status == -2">离职</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column width="170">
              <template v-slot:header>
                <span style="color: #2274af">操作</span>
              </template>
              <template v-slot="{ row }">
                <el-dropdown
                  size="mini"
                  split-button
                  @command="orgUserHandleCommand"
                  @click="
                    orgUserHandleCommand({
                      row: row,
                      command: 'setIsMaster'
                    })
                  "
                >
                  <span> <i class="el-icon-user"></i>{{row.isMaster == '0'?'设置主组织':'取消主组织'}} </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      icon="el-icon-s-home"
                      :command="{ row: row, command: 'setIsMainChange' }"
                      v-if="row.isCharge != '2'"
                      >设置主负责人</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-s-home"
                      :command="{ row: row, command: 'setOrgCharge' }"
                      v-if="row.isCharge == '2'"
                      >取消主负责人</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-s-home"
                      :command="{ row: row, command: 'setOrgCharge' }"
                      v-if="row.isCharge == '0'"
                      >设置负责人</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-s-home"
                      :command="{ row: row, command: 'setOrgCharge' }"
                      v-if="row.isCharge == '1'"
                      >取消负责人</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>
        <el-dialog
                title="其他组织岗位信息"
                :visible.sync="dialogVisible"
                @close="otherPostClose"
                width="55%"
                :append-to-body="true"
                >
          <el-table border style="width: 100%" :data="otherPostData"
          >
            <el-table-column prop="userName" label="姓名" width="120" align="center" />
            <el-table-column prop="orgName" label="组织名称" align="center" />
            <el-table-column prop="posName" label="岗位名称" align="center" />
            <el-table-column label="是否主要组织" width="100" align="center">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.isMaster">是</el-tag>
                    <el-tag v-else type="danger">否</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="负责人" width="80" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.isCharge == '0'" type="danger">否</el-tag>
                <el-tag v-if="scope.row.isCharge == '1'" type="primary">是</el-tag>
                <el-tag v-if="scope.row.isCharge == '2'" type="success">主</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.status == '0'" type="danger">禁用</el-tag>
                <el-tag v-if="scope.row.status == '1'" type="primary">正常</el-tag>
                <el-tag v-if="scope.row.status == '-2'" type="success">离职</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="otherPostPageResult.page"
                  :page-sizes="[5, 10, 20, 50]"
                  :page-size="otherPostPageResult.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="otherPostPageResult.total">
          </el-pagination>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">关 闭</el-button>
          </div>
        </el-dialog>
        <eip-user-dialog
          ref="eipUserDialog"
          @onConfirm="userDialogOnConfirm"
          append-to-body
        />
        <post-dialog ref="postDialog"
                     @onConfirm="postDialogOnConfirm"
                     :orgId="org.id"
                     append-to-body/>
      </el-tab-pane>
      <el-tab-pane
        label="组织岗位"
        name="orgPost"
        :disabled="OrgManagerFormType === 'addOrg'"
        class="fullheight"
      >
        <org-post
          :org-id="org.id"
          :org-code="org.groupCode"
          v-if="orgPostShow"
          class="fullheight"
        ></org-post>
      </el-tab-pane>
      <el-tab-pane
        label="组织参数"
        name="orgParam"
        :disabled="OrgManagerFormType === 'addOrg'"
        class="fullheight"
      >
        <el-form v-model="orgParam">
          <template v-for="param in orgParams">
            <ht-form-item
              :label="param.name"
              prop="name"
              label-width="200px"
              :key="param.name"
            >
              <el-date-picker
                v-model="orgParam[param.code]"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 86%"
                v-if="param.ctlType === 'date'"
              ></el-date-picker>
              <ht-input
                v-model="orgParam[param.code]"
                style="width: 86%"
                v-if="param.ctlType === 'input'"
              />
              <ht-input
                type="number"
                v-model="orgParam[param.code]"
                v-if="param.ctlType === 'number'"
              />
              <ht-select
                v-model="orgParam[param.code]"
                v-if="param.ctlType === 'select' && param.json"
                :options="JSON.parse(param.json)"
              />
              <ht-radio
                v-model="orgParam[param.code]"
                v-if="param.ctlType === 'radio' && param.json"
                :options="JSON.parse(param.json)"
              />
              <ht-checkbox
                v-model="orgParam[param.code]"
                v-if="param.ctlType === 'checkbox' && param.json"
                :options="JSON.parse(param.json)"
              />
            </ht-form-item>
          </template>
        </el-form>
        <el-row>
          <el-col :offset="6">
            <el-button
              type="primary"
              @click="orgParamSubmit"
              v-if="orgParams.length > 0"
              >保存</el-button
            >
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        label="分级组织管理设置"
        name="orgManageSetting"
        :disabled="OrgManagerFormType === 'addOrg'"
        class="fullheight"
      >
        <org-auth-page
          :org-code="org.code"
          v-if="orgAuthPageShow"
          :dem-code="org.demCode"
          @orgAuthData="getOrgAuthData"
          class="fullheight"
        ></org-auth-page>
      </el-tab-pane>
      <ht-sidebar-dialog
              width="28%"
              title="查看用户"
              :visible="isUserInfo"
              :before-close="handleCloseUserManager"
              :append-to-body="true"
      >
        <user-detail :user="user" />
      </ht-sidebar-dialog>
      <el-dialog
              width="70%"
              title="编辑用户"
              :visible="isUserManagerShow"
              :before-close="handleCloseUserManager"
              ref="userManagerref"
              :close-on-click-modal="false"
              :append-to-body="true"
      >
        <!--编辑用户面板-->
        <user-manager
                ref="userManager"
                :user-account="clickUserAccount"
                v-if="isUserManagerShow"
                @handleCloseUserManager="handleCloseUserManager"
                @closeUserManeger="handleCloseUserManager"
        ></user-manager>
      </el-dialog>
    </el-tabs>
    <!-- 直接下属管理组件   -->
    <under-user-table
      :org-id="org.id"
      :user-id="selectOrgUserAccount"
      :dim-id="demId"
      ref="underUserTable"
    ></under-user-table>
  </div>
</template>

<script>
import orgrequest from "@/api/org.js";
import uc from "@/api/uc.js";
import UserDetail from "@/views/uc/UserDetail.vue";
import UserManager from "@/views/uc/UserManager";
import EipUserDialog from "@/components/dialog/EipUserDialog.vue";
import PostDialog from "./PostDialog.vue";
import underUserTable from "./UnderUserTable";
import OrgPost from "./OrgPost";
import OrgAuthPage from "./OrgAuthPage";
export default {
  name: "org-manager",
  data() {
    return {
      org: {
        id: "",
        name: "",
        parentOrgName: "",
        groupCode: "",
        orderNo: "",
        grade: "",
        demId: "",
        demCode: "",
        parentId: "",
        code: "",
        exceedLimitNum: 0,
        limitNum: 0,
        nowNum: 0
      },
      orgUser: [], //组织人员
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      otherPostPageResult: {
        page: 1,
        pageSize: 5,
        total: 0
      },
      orgUserShow: false,
      underUserDialogShow: false,
      orgPostShow: false,
      orgAuthPageShow: false,
      selectOrgUserAccount: "",
      orgParams: [], // 组织参数
      orgParam: {},
      orgResume: "orgInfo",
      saveRoleUrl: "/api/org/v1/org/addOrg",
      OrgManagerFormType: "",
      selectUsers: [],
      otherPostData: [],
      dialogVisible: false,
      orgAuthData: [],
      isUserInfo: false,
      user: {},
      isUserManagerShow: false,
      clickUserAccount: ""
    };
  },
  components: {
    EipUserDialog,
    underUserTable,
    OrgPost,
    OrgAuthPage,
    PostDialog,
    UserDetail,
    UserManager
  },
  props: ["type", "orgCode", "parentName", "demId", "parentId"],
  mounted() {
    this.OrgManagerFormType = this.type;
    this.org.parentId = this.parentId;
    this.org.parentOrgName = this.parentName;
    this.org.demId = this.demId;
    if (
      this.OrgManagerFormType === "showInfo" ||
      this.OrgManagerFormType === "editOrg"
    ) {
      orgrequest.getOrg(this.orgCode).then(resp => {
        this.org = resp;
      });
    }
    if (this.OrgManagerFormType === "addOrg") {
      var num = "";
      for (var i = 0; i < 3; i++) {
        num += Math.floor(Math.random() * 10);
      }
      this.org.orderNo = num;
    }
    orgrequest.getOrgParams().then(resp => {
      this.orgParams = resp;
      this.getOrgParamsByCode();
    });
  },
  computed: {
    orgUserDeleteUrl: function() {
      return window.context.uc + "/api/org/v1/orgUser/delOrgUser";
    },
    defaultQuerys:function () {
      return [{ property: 'org.ID_', value: this.org.id }];
    }
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      this.selectUsers = [];
      orgrequest
        .getOrgUserPage(param)
        .then(response => {
          let resp = response.rows;
          let result = [];
          let user = [];
          let filterData = [];
          let othPost = [];
          resp.forEach(item =>{
            if(item.isMaster){
              user.push(item.account);
              result.push(item);
            }else{
              filterData.push(item);
            }
          });
          filterData.forEach(val =>{
            if(user.indexOf(val.account) < 0){
              user.push(val.account);
              result.push(val);
            }else{
              othPost.push(val)
            }
          });
          this.org.nowNum = response.total;
          this.orgUser = result;
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total - othPost.length
          };
        })
        .finally(() => cb());
    },
    tabClick(tab) {
      //点击tab卡片
      this.orgUserShow = false;
      this.orgPostShow = false;
      this.orgAuthPageShow = false;
      this.$nextTick(() => {
        if (tab.index==="1"){
          this.orgUserShow = true;
        }else if (tab.index==="2"){
          this.orgPostShow = true;
        }else if (tab.index==="4"){
          this.orgAuthPageShow = true;
        }
      });
    },
    orgUserHandleCommand(params) {
      this.readOnly = false;
      switch (params.command) {
        case "toUnderUserPage":
          this.selectOrgUserAccount = params.row.account;
          this.$refs.underUserTable.showDialog(params.row.userId);
          break;
        case "setIsMaster":
          //设置主组织
          orgrequest.setMasterById(params.row.orgUserId).then(() => {
            let tab = {index:"1"};
            this.tabClick(tab);
          });
          break;
        case "setOrgCharge":
          //设置是否为主要负责人
          this.setOrgCharge(params.row);
          break;
        case "setIsMainChange":
          //设置是否为主要负责人
          params.row.isMainChange = true;
          this.setOrgCharge(params.row);
          break;
        default:
          break;
      }
    },
    showAddOrgUser() {
      if (
        (1 + this.org.nowNum) > this.org.limitNum &&
        this.org.exceedLimitNum === 1
      ) {
        this.$message.error("现编用户数量已达到组织用户限编数量");
        return;
      }
      this.$refs.eipUserDialog.showDialog();
    },
    userDialogOnConfirm(selection) {
      if (!selection || selection.length == 0) {
        this.$message.error("请至少选择一个用户");
        return;
      }
      // （拿出现有人员+选择人数）和限有人员进行比对
      if (
        selection.length + this.org.nowNum > this.org.limitNum &&
        this.org.exceedLimitNum === 1
      ) {
        this.$message.error("设置用户数超过上限");
        return;
      }
      let accounts = [];
      for (let user of selection) {
        accounts.push(user.account);
      }
      let params = {};
      params.orgCode = this.org.groupCode;
      if (params.orgCode == "") {
        params.orgCode = this.org.code;
      }
      params.accounts = accounts.join(",");
      orgrequest.addUsersForOrg(params).then(data => {
        if (data.state) {
          this.$message({
            message: data.message,
            type: "success",
            showClose: true
          });
          this.org.nowNum += selection.length;
          return;
        }
        this.$message.error(data.message || "操作失败");
      }).then(() => {
        this.$refs.htTable.load();
      });
    },
    underUserDialogClose() {
      this.underUserDialogShow = false;
    },
    afterDelete() {
      this.$refs.htTable.load();
    },
    setOrgCharge(row) {
      var param = {};
      param.account = row.account;
      param.orgCode = this.org.groupCode;
      if (row.isMainChange) {
        param.isCharge = true;
      } else {
        param.isCharge = false;
      }
      orgrequest.setOrgCharge(param).then(() => {
        let tab = {index:"1"};
        this.tabClick(tab);
      });
    },
    orgParamSubmit() {
      var param = {
        orgCode: this.org.groupCode
      };
      var data = [];
      for (var orgparam in this.orgParam) {
        data.push({ alias: orgparam, value: this.orgParam[orgparam] });
      }
      orgrequest.saveOrgParams(data, param).then(resp => {
        if(resp.state){
          this.$message({
            message: resp.message,
            type: "success",
            showClose: true
          });
        }
      });
    },
    submit() {
      let patt = new RegExp("^[0-9]*$");
      if (!patt.test(this.org.limitNum)){
        this.$message.error("组织现编用户数量不是自然数");
        return;
      }
      if (!this.org.orderNo || !patt.test(this.org.orderNo)){
        this.$message.error("排序号不是自然数");
        return;
      }
      if(this.org.name && this.org.name.length > 30
              || this.org.code && this.org.code.length > 30
              || Number(this.org.orderNo) > Number.MAX_VALUE
              || this.org.grade && this.org.grade.length > 30
              || Number(this.org.limitNum) > Number.MAX_VALUE ){
        this.$message({type: "warning", message: "内容超出输入限制"});
        return false;
      }
      if (this.OrgManagerFormType === "addOrg") {
        orgrequest.addOrg(this.org).then(resp => {
          if (!resp.state) {
            return;
          }
          this.$emit("reloadTree");
          this.OrgManagerFormType = "showInfo";
          this.$message.success("创建成功");
          return resp;
        }).then((response) => {
          if (response.state){
            orgrequest.getOrg(this.org.code).then(resp => {
              this.org = resp;
            })
          }
        });
      } else if (this.OrgManagerFormType === "editOrg") {
        orgrequest.updateOrg(this.org).then(resp => {
          this.OrgManagerFormType = "showInfo";
          this.$emit("reloadTree");
          this.$message.success("修改成功");
        });
      }
    },
    getOrgParamsByCode() {
      if (this.orgCode) {
        orgrequest.getOrgParamsByCode(this.orgCode).then(resp => {
          for (var i = 0; i < resp.length; i++) {
            var respKey = resp[i];
            this.$set(this.orgParam,respKey.alias,respKey.value)
            // this.orgParam[respKey.alias] = respKey.value;
          }
        });
      }
    },
    getOtherPost(row){
      this.dialogVisible = true;
      this.loadOtherPost(row);
    },
    loadOtherPost(row,cb){
      let param = {};
      this.clickOtherPost = row;
      let query = {
        group: "defaultQueryGroup",
        operation: "EQUAL",
        relation: "AND",
        property: "account",
        value: row.account
      };
      let query1 = {
        group: "defaultQueryGroup",
        operation: "NOT_EQUAL",
        relation: "AND",
        property: "uopId",
        value: row.relId?row.relId : -1
      };
      param = {
        pageBean: this.otherPostPageResult,
        querys: []
      };
      param.querys.push(query);
      param.querys.push(query1);
      uc.getUserOrgPage(param)
              .then(response => {
                this.otherPostData = response.rows;
                this.otherPostPageResult = {
                  page: response.page,
                  pageSize: response.pageSize,
                  total: response.total
                };
              })
              .finally(() => cb());
    },
    setUserMaster(){
      if(this.selectUsers.length < 1){
        this.$message({message:'请选择人员', type:'warning'});
        return;
      }
      let ids = [];
      this.selectUsers.forEach(item =>{
        ids.push(item.orgUserId);
      });
      orgrequest.setMasterByIds(ids).then(resp =>{
        if(resp.state) {
          this.$message({message:resp.message, type:'success'});
          this.selectUsers = [];
          let tab = {index:"1"};
          this.tabClick(tab);
        }
      })
    },
    setUserPost(){
      if(this.selectUsers.length < 1){
        this.$message({message:'请选择人员', type:'warning'});
        return;
      }
      this.$refs.postDialog.showDialog();
    },
    postDialogOnConfirm(selection){
      if (!selection || selection.length == 0) {
        this.$message.error("请至少选择一个岗位");
        return;
      }
      let postCodeArr = [];
      selection.forEach(item =>{
        postCodeArr.push(item.code);
      });
      let postCode = postCodeArr.join(",");
      postCode = postCode + ",";
      let accountArr = [];
      this.selectUsers.forEach(val =>{
        accountArr.push(val.account);
      });
      let account = accountArr.join(",");
      let param = {};
      param.postCode = postCode;
      param.accounts = account;
      orgrequest.saveUserPost(param).then(data => {
        if (data.state) {
          this.$message({
            message: data.message,
            type: "success",
            showClose: true
          });
          this.$refs.htTable.load();

        }
        // this.$message.error(data.message || "分配用户失败");
      });
    },
    handleSizeChange(val) {
      this.otherPostPageResult.page = 1;
      this.otherPostPageResult.pageSize = val;
      this.loadOtherPost(this.clickOtherPost)
    },
    handleCurrentChange(val) {
      this.otherPostPageResult.page = val;
      this.loadOtherPost(this.clickOtherPost)
    },
    otherPostClose(){
      this.otherPostPageResult = {
        page: 1,
        pageSize: 5,
        total: 0
      }
    },
    selectUser(selection){
      this.selectUsers = selection;
    },
    editUser(userAccount){
      let userAuthData = [];
      userAuthData = this.orgAuthData.filter(filter =>{
        return filter.userAccount == userAccount
      });
      if(userAuthData[0] && userAuthData[0].userPerms && userAuthData[0].userPerms.indexOf('edit')){
        this.clickUserAccount = userAccount;
        this.isUserManagerShow = true;
      }else{
        this.selectUserInfo(userAccount);
      }
    },
    selectUserInfo(account) {
      //查询用户的详细信息
      uc.getUser(account)
              .then(resp => {
                resp.photo = `${window.context.portal}` + resp.photo;
                this.user = { ...resp.user };
              })
              .then(() => {
                // 查询所属组织岗位，所属角色信息
                uc.getUserByUserId(this.user.id).then(resp => {
                  this.$set(
                          this.user,
                          "roleName",
                          resp[resp.length - 1].roleName.roleName
                  );
                  let _orgPostList = [];
                  for (var i = 0; i < resp.length - 1; i++) {
                    _orgPostList.push(resp[i]);
                  }
                  this.$set(this.user, "orgPostList", _orgPostList);
                  this.isUserInfo = true;
                });
              });
    },
    handleCloseUserManager() {
      this.isUserInfo = false;
      this.isUserManagerShow = false;
      this.$refs.htTable.load();
    },
    getOrgAuthData(data){
      this.orgAuthData = data;
    },
  }
};
</script>

<style scoped lang="scss">
.form-table tr td:first-child {
  text-align: right;
}
>>> .el-tabs__content {
  overflow-y: scroll;
  height: calc(100% - 68px);
}
</style>
