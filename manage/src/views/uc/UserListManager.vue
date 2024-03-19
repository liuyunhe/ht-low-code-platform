<template>
  <el-container class="fullheight">
    <el-aside width="230px" style="overflow-x:hidden;border: 1px solid #eee">
      <ht-select v-model="selectOrgId" class="org-select" :options="orgList" @change="demChange" />
      <ht-tree :data="treeData" :props="defaultProps" node-key="id" highlight-current :expand-on-click-node="false"
        :support-filter="true" @node-click="orgTreeClick" @refresh="handleRefresh" ref="htTree" class="orgTree"
        @row-click="rowClick">
      </ht-tree>
    </el-aside>
    <el-container>
      <el-main>
        <ht-table @row-click="rowClick" @load="loadData" :data="data" :pageResult="pageResult" :selection="true"
          :default-sorter="[{direction: 'DESC', property: 'updateTime'}]" quick-search-props="account,fullname,mobile"
          :show-custom-column="false" :show-export="false" ref="htTable" @select="selectRow" @select-all="selectRow">
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
              <!-- <el-button size="small" @click="beforeSynchronization()" icon="icon-wechat-fill">同步微信通讯录</el-button> -->
              <el-button @click="setShiftUser()" size="small">设置轮班</el-button>
              <el-button size="small" v-if="showExcel" @click="excelImport()" icon="el-icon-upload">Excel导入</el-button>
              <el-button size="small" v-if="showExcel" @click="excelExport()" icon="el-icon-download">Excel导出</el-button>
              <el-button size="small" @click="signatureImport()" icon="el-icon-upload">签章导入</el-button>
              
              <ht-delete-button style="margin:0;" :url="userDeleteUrl" :htTable="$refs.htTable"
                @after-delete="afterDelete">删除</ht-delete-button>
            </el-button-group>
          </template>
          <template v-slot:search>
            <ht-table-search-panel :divide="3">
              <ht-table-search-field label="姓名" prop="fullname" placeholder="请输入姓名" />
              <ht-table-search-field label="账号" prop="account" placeholder="请输入账号" />
              <ht-table-search-field label="邮箱" prop="email" placeholder="请输入邮箱" />
              <ht-table-search-field label="电话" prop="mobile" placeholder="请输入电话" />
              <ht-table-search-field label="岗位" prop="POST_NAME_" placeholder="请选择岗位名称" />
              <ht-table-search-field label="职务" prop="JOB_NAME_" placeholder="请选择职务名称" />
              <ht-table-search-field label="角色" prop="ROLE_NAME_" placeholder="请选择角色名称" />
              <!--<ht-table-search-field type="select" :options="posts" label="岗位" prop="POST_NAME_" placeholder="请选择岗位名称" />
              <ht-table-search-field type="select" :options="jobs" label="职务" prop="JOB_NAME_" placeholder="请选择职务名称" />
              <ht-table-search-field type="select" :options="roles" label="角色" prop="ROLE_NAME_" placeholder="请选择角色名称" />-->
            </ht-table-search-panel>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="fullname" label="名称" :sortable="true" :show-overflow-tooltip="true">
              <template v-slot="{row}">
                <el-link type="primary" @click="handleCommand({row: row, command: 'showInfo'})" title="查看详情">{{
                  row.fullname
                }}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="account" label="账号" :sortable="true" />
            <ht-table-column prop="email" label="邮箱" />
            <ht-table-column prop="mobile" label="电话" sortable />
            <ht-table-column prop="sex" label="性别" width="80"
              :filters="[{text: '男士', value: '男'}, {text: '女士', value: '女'}]">
              <template v-slot="{row}">
                <el-tag v-if="row.sex == '男'">男士</el-tag>
                <el-tag type="success" v-if="row.sex == '女'">女士</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column prop="status" label="状态" width="110"
              :filters="[{text: '禁用', value: 0}, {text: '正常', value: 1}, {text: '离职', value: -2}]">
              <template v-slot="{row}">
                <el-tag type="warning" v-if="row.status == 0">禁用</el-tag>
                <el-tag v-if="row.status == 1">正常</el-tag>
                <el-tag type="info" v-if="row.status == -2">离职</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column width="150" label="操作">
              <template v-slot="{row}">
                <el-dropdown size="mini" split-button @command="handleCommand" @click="
                    handleCommand({
                      row: row,
                      command: 'edit'
                    })
                  ">
                  <span> 编辑 </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{row: row, command: 'toUnderUserPage'}">下属管理</el-dropdown-item>
                    <el-dropdown-item :command="{row: row, command: 'updatePwd'}">重置密码</el-dropdown-item>
                    <el-dropdown-item :command="{row: row, command: 'toFront'}" v-if="row.status == 1">前端登录
                    </el-dropdown-item>
                    <el-dropdown-item :command="{row: row, command: 'toManager'}" v-if="row.status == 1">管理端登录
                    </el-dropdown-item>
                    <el-dropdown-item :command="{row: row, command: 'bindWxDk'}">企微钉钉绑定</el-dropdown-item>
                    <!--                    <el-dropdown-item-->
                    <!--                            :command="{ row: row, command: 'shiftUser'}">设置轮班</el-dropdown-item>-->
                  </el-dropdown-menu>
                </el-dropdown>
                <!-- <el-button size="mini" @click="handleCommand({row:row,command:'edit'})">编辑</el-button>
                <el-button size="mini" @click="handleCommand({row:row,command:'updatePwd'})">重置密码</el-button>-->
              </template>
            </ht-table-column>
          </template>
        </ht-table>

        <el-dialog width="70%" :title="dialogTitle" :visible="isUserManagerShow" :before-close="handleCloseUserManager"
          ref="userManagerref" :close-on-click-modal="false" append-to-body>
          <!--编辑用户面板-->
          <user-manager ref="userManager" :user-account="clickUserAccount" v-if="isUserManagerShow" :org-code="orgCode"
            @handleCloseUserManager="handleCloseUserManager" @closeUserManeger="closeUserManeger"></user-manager>
        </el-dialog>

        <ht-sidebar-dialog width="28%" title="查看用户" :visible.sync="isUserInfo" append-to-body
          :before-close="handleCloseUserManager">
          <user-detail :user="user" />
        </ht-sidebar-dialog>

        <ht-sidebar-dialog width="28%" title="重置密码" :visible="isUpdatePwd" append-to-body
          :before-close="handleCloseUserManager">
          <el-form v-model="password">
            <ht-form-item label="请输入密码" prop="name" label-width="100px">
              <ht-input v-model="password.pwd" autocomplete="off" :validate="pwdValidate" placeholder="请输入密码"
                show-password></ht-input>
            </ht-form-item>
            <ht-form-item label="确认密码" prop="name" label-width="100px">
              <ht-input v-model="password.newPwd" autocomplete="off" :validate="{
                  required: true,
                  regex: {
                    exp: '^[\\s\\S]{1,20}$',
                    message: '内容超出输入限制'
                  }
                }" placeholder="确认密码" show-password></ht-input>
            </ht-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="updatePwd()" type="primary">修改</el-button>
            <el-button @click="dialogCancle('isUpdatePwd')">{{ $t('eip.common.cancel') }}</el-button>
          </div>
        </ht-sidebar-dialog>
        <ht-load-data :url="loadDataUrl" context="uc" @after-load-data="afterLoadData"></ht-load-data>
        <!-- 角色用户管理 -->
        <user-role-manager ref="userRoleManager"></user-role-manager>
        <!-- 分类对话框  -->
        <eip-sys-type-dialog ref="flowTypeDialog" cat-id="6"></eip-sys-type-dialog>

        <!-- 用户导入  -->
        <el-dialog title="导入Excel" :visible.sync="importDialogVisible" top="15vh" :append-to-body="true"
          :close-on-click-modal="false" v-if="importDialogVisible">
          <div style="padding-left: 20px ;">
            <el-row class="import_row">
              <el-col :span="20">
                <span class="m-r-10">组织维度: </span>
                <ht-select v-model="importDemCode" class="org-select" :options="demList" />
              </el-col>
              <el-col :span="4">
                <el-button size="small" type="primary" icon="el-icon-download" @click="downloadTemplate()">模板下载
                </el-button>
              </el-col>
            </el-row>
            <el-row class="import_row">
              <span class="m-r-10">导入文件: </span>
              <el-upload style="display: inline-block;" :action="importUserUrl" :on-success="hadleUploadResult"
                :on-error="hadleUploadResult" :headers="uploadHeaders" :on-exceed="onExceed" accept=".xlsx,.xls"
                :before-upload="beforeUpload" :limit="1" :data="{isCheck: true}" :auto-upload="false" ref="upload">
                <el-button size="small" icon="el-icon-upload">选择Excel文件</el-button>
              </el-upload>
            </el-row>
            <el-row class="import_row">
              <span class="m-r-10">用户组织、岗位关系数据导入模式: </span>
              <el-radio-group v-model="importRepeatConver">
                <el-radio-button label="false">新增</el-radio-button>
                <el-radio-button label="true">覆盖</el-radio-button>
              </el-radio-group>
            </el-row>
            <el-row class="import_row descript-title">
              <strong>导入须知: </strong>
              <p>
                1、姓名、帐号为必填字段，组织名称列以“/”开头，下级组织同样用“/”分隔；
              </p>
              <p>
                2、岗位和职务导入规则：一一对应导入，多个用;号隔开，如果没有职务，则不导入岗位，如果有职务，则对应顺序以岗位为准（第一个岗位对应第一个职务，以此类推）(如果岗位有多个，职务只有一个时，导入同一个职务中)；
              </p>
              <p>
                3、邮箱格式必须符合标准，将不导入不符合规范的邮箱数据；
              </p>
              <p>
                4、导入过程中如果出现错误则会终止导入，且回滚已导入数据；
              </p>
              <p>
                5、“编码前缀”说明：编码前缀用于生成组织编码的前缀，区分不同组织维度（使得相同的组织架构可以导入到多个不同的组织维度下），不同组织维度导入时需要输入不同的前缀编码，相同的组织维度，输入相同的组织维度编码；
              </p>
              <p>
                6、“用户组织、岗位关系数据导入模式”涉及到已存在用户（导入的用户在系统中已存在）数据导入时组织、岗位关系数据的处理方式（覆盖：先删除旧的组织、岗位关系数据，再按excel中的数据生成新关系数据；新增：不删除旧数据，excel中的数据做新增处理（如果和旧的一样，不会增加多份））。
              </p>
            </el-row>
          </div>
          <span slot="footer" class="dialog-footer confirm-detail">
            <el-button type="primary" @click="submitImport" element-loading-text="拼命导入中"
              v-loading.fullscreen.lock="fullscreenLoading">确 定</el-button>
            <el-button @click="importDialogVisible = false">取 消</el-button>
          </span>
        </el-dialog>

        <!-- 签章导入  -->
        <el-dialog title="签章批量导入" :visible.sync="signatureImportVisible" top="15vh" :append-to-body="true"
          :close-on-click-modal="false" v-if="signatureImportVisible">
          <div style="padding-left: 20px ;">
            <el-row class="import_row">
              <span class="m-r-10">导入文件: </span>
              <el-upload style="display: inline-block;" :action="importSignatureUrl" :on-success="hadleSignatureUploadResult"
                :on-error="hadleSignatureUploadResult" :headers="uploadHeaders" :on-exceed="onExceed" accept=".zip"
                :before-upload="beforeSignatureUpload" :limit="1" :data="{isCheck: true}" :auto-upload="false" ref="signatureFile">
                <el-button size="small" icon="el-icon-upload">选择压缩文件</el-button>
              </el-upload>
            </el-row>
            <el-row class="import_row">
              <span class="m-r-10">存在时是否覆盖: </span>
              <el-radio-group v-model="signatureRepeatConver">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-row>
            <el-row class="import_row descript-title">
              <strong>导入须知: </strong>
              <p>
                1、上传附件为压缩文件，文件格式只支持.zip文件，压缩文件中至少包含一个签章文件且签章文件不存在嵌套层级；
              </p>
              <p>
                2、压缩文件中的签章文件只支持.png图片文件，建议图片尺寸：250*70px；
              </p>
              <p>
                3、签章图片以用户账号命名，如用户张三(账号：zhangsan)，则签章图片名称为zhangsan.png；
              </p>
              <p>
                4、如果用户已存在签章，则根据导入时的选项执行替换或不操作；
              </p>
              <p>
                5、签章默认密码来自密码策略模块的初始密码。
              </p>
            </el-row>
          </div>
          <span slot="footer" class="dialog-footer confirm-detail">
            <el-button type="primary" @click="submitSignature" element-loading-text="拼命导入中"
              v-loading.fullscreen.lock="fullscreenLoading">确 定</el-button>
            <el-button @click="signatureImportVisible = false">取 消</el-button>
          </span>
        </el-dialog>
        <!-- 直接下属管理组件   -->
        <under-user-table :user-id="selectOrgUserAccount" :dem-list="dimenList" ref="underUserTable" />

        <shift-rule-dialog :single="true" ref="shiftRuleDialog" @onConfirm="shiftConfirm" />
      </el-main>
    </el-container>
    <ht-sidebar-dialog width="33%" title="企微钉钉信息绑定" class="sp-manager__dialog" :visible="wxDtVisible"
      :before-close="()=>wxDtVisible =false">
      <el-form v-form data-vv-scope="userUniteForm">
        <ht-form-item label="企业微信userid" label-width="30%">
          <ht-input v-model.trim="userUnite.wxWorkId" style="width:90%;" />
        </ht-form-item>
        <ht-form-item label="阿里钉钉userid" label-width="30%">
          <ht-input v-model.trim="userUnite.dingtalkId" style="width:90%;" />
        </ht-form-item>
        <ht-form-item label="公众号openid" label-width="30%">
          <ht-input v-model.trim="userUnite.openId" style="width:90%;" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <ht-submit-button url="${uc}/uc/userUnite/v1/save" :model="userUnite" scope-name="userUniteForm"
          @after-save-data="()=>wxDtVisible =false">{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="()=>{wxDtVisible =false}">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
  </el-container>
</template>
<script>
import uc from '@/api/uc.js'
import org from '@/api/org.js'
import utils from '@/hotent-ui-util.js'
import UserManager from './UserManager'
import UserDetail from './UserDetail'
import EipUserDialog from '@/components/dialog/EipUserDialog.vue'
const UserRoleManager = () => import('@/views/uc/UserRoleManager.vue')
const EipSysTypeDialog = () => import('@/components/dialog/EipSysTypeDialog.vue')
const UnderUserTable = () => import('@/views/uc/org/UnderUserTable')
const ShiftRuleDialog = () => import('@/components/dialog/ShiftRuleDialog.vue')
import tenant from "@/store/tenant";

export default {
  components: {
    EipUserDialog,
    UserRoleManager,
    EipSysTypeDialog,
    UserManager,
    UserDetail,
    UnderUserTable,
    ShiftRuleDialog
  },
  computed: {
    userDeleteUrl: function () {
      return window.context.uc + '/api/user/v1/user/deleteUserByIds'
    },
    saveUserUrl: function () {
      let preUrl = window.context.uc + '/api/user/v1/user'
      if (this.user.id) {
        preUrl += '/updateUser'
      } else {
        preUrl += '/addUser'
      }
      return preUrl
    },
    requestMethod: function () {
      return this.role.id ? 'PUT' : 'POST'
    },
    roleCodesOptions: function () {
      let result = []
      for (let role of this.allowRoles) {
        let obj = {}
        obj.key = role.code
        obj.value = role.name
        result.push(obj)
      }
      return result
    },
    saveRoleCopy: function () {
      return `${window.context.uc}/sys/sysRoleAuth/v1/saveCopy?oldCode=${this.menuPerm.code}&newCodes=${this.menuPerm.newCodes}`
    },
    importUserUrl: function () {
       let tenantId = "";
      if (tenant.state.tenantId) {
        tenantId = "&tenantId="+tenant.state.tenantId;
      }
      return window.context.uc + "/api/user/v1/users/importExcelUser?demCode="+this.importDemCode+"&repeatConver="+this.importRepeatConver+tenantId;
    },
    importSignatureUrl: function () {
       let tenantId = "";
      if (tenant.state.tenantId) {
        tenantId = "&tenantId="+tenant.state.tenantId;
      }
      return window.context.portal + "/system/file/v1/importSignature?repeatConver="+this.signatureRepeatConver+tenantId;
    },
    uploadHeaders: function (mapState) {
      return { Authorization: 'Bearer ' + this.$store.state.login.currentUser.token }
    }
  },
  data() {
    return {
      selectOrgId: '',
      selectOrgName: '',
      orgList: [], //下拉框待选择的组织
      demList: [], //下拉框待选择的维度
      treeData: [], //树形菜单展示的数组
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      reFresh: true,
      dialogVisible: false,
      isUserManagerShow: false,
      showExcel: false,
      role: {
        name: '',
        code: ''
      },
      user: {
        account: '',
        address: '',
        email: '',
        fullname: '',
        mobile: '',
        password: '',
        photo: '',
        sex: '',
        status: 1,
        roleName: '',
        orgPostList: []
      },
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      loadDataUrl: '',
      menuPerm: {},
      allowRoles: [],
      fileList: [],
      img: '',
      clickUserAccount: '', //当前点击用户的用户账号
      isUserInfo: false,
      isUpdatePwd: false,
      password: {
        pwd: '',
        newPwd: ''
      },
      pwdValidate: {
        required: true,
        min: 6,
        max: 30
      },
      dialogTitle: '',
      roles: [],
      jobs: [],
      posts: [],
      importDialogVisible: false,
      importDemCode: '',
      importRepeatConver: false,
      exportSelection: [],
      orgCode: '',
      selectOrgUserAccount: '',
      orgId: '',
      dimenList: [],
      wxDtVisible: false,
      userUnite: {},
      signatureImportVisible: false,
      signatureRepeatConver: true,
    }
  },
  mounted() {
    this.$validator = this.$root.$validator
    //维度-组织数据
    this.getAllDemList()
    //获取用户导入按钮参数
    this.getUserExcel()
    //默认密码策略
    //this.loadPwdStratege();
    /*//加载全部角色
    this.getAllRoles();
    //加载全部职务
    this.getAllJobs();
    //加载全部岗位
    this.getAllPosts();*/
  },
  methods: {
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row)
    },
    getUserExcel() {
      let this_ = this
      this.$http.get('${portal}/sys/sysProperties/v1/getByAlias?alias=userExcel').then(function (resp) {
        if (resp.data) {
          this_.showExcel = true
        }
      })
    },
    demChange(data) {
      this.selectOrgId = data
      this.orgCode = ''
      this.loadTreeData()
    },
    orgTreeClick(orgbytree) {
      //重置数据
      let ary = this.$refs.htTable.querys
      for (var i = 0; i < ary.length; i++) {
        if (ary[i].group && ary[i].group == 'orgTree') {
          ary.remove(ary[i])
        }
      }
      let quickSearchEl = document.querySelector('.quick-search input')
      if(quickSearchEl && !quickSearchEl.value){
        this.$refs.htTable.querys = []
      }
      if (!orgbytree.code) {
        this.$refs.htTable.querys.push({
          property: 'DEM_ID_',
          value: orgbytree.demId,
          group: 'orgTree',
          relation: 'AND',
          operation: 'EQUAL'
        })
      } else {
        this.orgCode = orgbytree.code
        let ids = []
        let trees = ''
        this.getOrgTrees(orgbytree, ids)
        trees = ids.join(',')
        if (trees != '') {
          this.$refs.htTable.querys.push({
            property: 'ORG_ID_',
            value: trees,
            group: 'orgTree',
            relation: 'AND',
            operation: 'IN'
          })
        }
      }
      this.$refs.htTable.load()
    },
    getOrgTrees(node, ids) {
      ids.push(node.id)
      let arr = node.children
      if (arr) {
        for (var i = 0; i < arr.length; i++) {
          this.getOrgTrees(arr[i], ids)
        }
      }
    },
    handleRefresh(cb) {
      this.loadTreeData(cb)
      //重置数据
      let ary = this.$refs.htTable.querys
      for (var i = 0; i < ary.length; i++) {
        if (ary[i].group && ary[i].group == 'orgTree') {
          ary.remove(ary[i])
        }
      }
      this.$refs.htTable.load()
    },
    getAllDemList() {
      org
        .getDescAll()
        .then(resp => {
          for (let i = 0; i < resp.length; i++) {
            this.orgList.push({
              key: resp[i].id,
              value: resp[i].demName
            })
            this.demList.push({
              key: resp[i].code,
              value: resp[i].demName
            })
            this.dimenList = resp
            if (resp[i].isDefault === 1) {
              this.selectOrgId = resp[i].id
            }
          }
        })
        .then(params => {
          var dem = {
            demId: this.selectOrgId
          }
          org.getByParentAndDemToTree(dem).then(data => {
            this.treeData = utils.tile2nest(data)
          })
        })
    },
    loadTreeData(cb) {
      var param = {
        demId: this.selectOrgId
      }
      org.getByParentAndDemToTree(param).then(data => {
        this.treeData = utils.tile2nest(data)
        cb && cb()
      })
    },
    loadPwdStratege() {
      uc.getDefaultPwdStrategy().then(data => {
        if (data) {
          let form = data
          if (form.enable == 1) {
            let pwdRule = form.pwdRule
            let pwdLength = form.pwdLength
            if (pwdRule == 1) {
              this.pwdValidate = {
                required: true,
                min: pwdLength
              }
            } else {
              let regex = {}
              if (pwdRule == 2) {
                regex = {
                  exp: '^(?=.*[0-9])(?=.*[a-zA-Z]).{' + pwdLength + ',30}$',
                  message: '密码必须包含字母、数字,至少' + pwdLength + '位'
                }
              } else if (pwdRule == 3) {
                regex = {
                  exp: '^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{' + pwdLength + ',30}$',
                  message: '密码必须包含数字、字母、特殊字符,至少' + pwdLength + '位'
                }
              } else if (pwdRule == 4) {
                regex = {
                  exp: '^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{' + pwdLength + ',30}$',
                  message: '密码必须包含数字、大小写字母、特殊字符,至少' + pwdLength + '位'
                }
              }
              this.pwdValidate = {
                required: true,
                regex: regex
              }
            }
          }
        }
      })
    },
    onBeforeUploadImage(file) {
      const isIMAGE = file.type === 'image/jpeg' || 'image/jpg' || 'image/png'
      const isLt1M = file.size / 1024 / 1024 < 1
      if (!isIMAGE) {
        this.$message.error('上传文件只能是图片格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传文件大小不能超过 1MB!')
      }
      return isIMAGE && isLt1M
    },
    UploadImage(param) {
      //执行文件上传
      const formData = new FormData()
      formData.append('files', param.file)
      uc.fileUpload(formData)
        .then(response => {
          this.user.photo = '/system/file/v1/downloadFile?fileId=' + response.fileId
          param.onSuccess() // 上传成功的图片会显示绿色的对勾
        })
        .catch(response => {
          param.onError()
        })
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCloseUserManager() {
      this.isUserManagerShow = false
      this.isUserInfo = false
      this.isUpdatePwd = false
      this.password = {}
      this.clickUserAccount = ''
      this.$refs.htTable.load()
    },
    showDialog(row) {
      this.dialogTitle = '添加用户'
      this.isUserManagerShow = false
      this.$nextTick(() => {
        this.isUserManagerShow = true
      })
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false
    },
    loadData(param, cb) {
      uc.getOrgUserQuery(param)
        .then(response => {
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        })
        .finally(() => cb())
    },
    handleCommand(params) {
      switch (params.command) {
        case 'edit':
          this.dialogTitle = '编辑用户'
          this.clickUserAccount = params.row.account
          this.isUserManagerShow = false
          this.$nextTick(() => {
            this.isUserManagerShow = true
          })
          break
        case 'showInfo':
          this.selectUserInfo(params.row.account)
          break
        case 'updatePwd':
          this.user = params.row
          this.isUpdatePwd = true
          break
        case 'toFront':
          uc.getTokenByUserName(params.row.account).then(resp => {
            let token = resp.value
            // window.location.href = `${window.context.front}?token= ` + token;
            window.open(`${window.context.front}?token=` + token)
          })
          break
        case 'toManager':
          uc.getTokenByUserName(params.row.account).then(resp => {
            let token = resp.value
            // window.location.href = `${window.context.front}?token= ` + token;
            window.open(`${window.context.manage}?token=` + token)
          })
          break
        case 'bindWxDk':
          this.getUserUniteData(params.row.userId);
          break
        case 'toUnderUserPage':
          this.selectOrgUserAccount = params.row.account
          this.$refs.underUserTable.showDialog(params.row.userId)
          break
        case 'shiftUser':
          this.setShiftUser(params.row.userId)
        default:
          break
      }
    },
    async beforeSaveData() {
      this.isSubmit = true
    },
    afterSaveData() {
      this.dialogVisible = false
      this.$refs.htTable.load()
    },
    afterDelete() {
      this.$refs.htTable.load()
    },
    afterLoadData(data) {
      // 菜单权限复制
      if (this.isUserManagerShow) {
        this.allowRoles = data
      }
      // 编辑角色
      if (this.dialogVisible) {
        this.role = data.value
        setTimeout(() => this.$validator.validateAll('editRoleForm'))
      }
    },
    showFlowTypeDialog() {
      this.$refs.flowTypeDialog.showDialog()
    },
    selectUserInfo(account) {
      //查询用户的详细信息
      uc.getUser(account)
        .then(resp => {
          resp.photo = `${window.context.portal}` + resp.photo
          this.user = { ...resp.user }
        })
        .then(() => {
          // 查询所属组织岗位，所属角色信息
          uc.getUserByUserId(this.user.id).then(resp => {
            this.$set(this.user, 'roleName', resp[resp.length - 1].roleName.roleName)
            let _orgPostList = []
            for (var i = 0; i < resp.length - 1; i++) {
              _orgPostList.push(resp[i])
            }
            this.$set(this.user, 'orgPostList', _orgPostList)
            this.isUserInfo = true
          })
        })
    },
    beforeSynchronization() {
      var users = this.$refs.htTable.$refs.htTable.selection
      let userIds = users.map(obj => {
        return obj.userId
      })
      uc.syncUserToWx(userIds).then(() => {
        this.$refs.htTable.load()
      })
    },
    updatePwd() {
      if (this.password.pwd != this.password.newPwd) {
        this.$message.error('两次输入密码不一致')
        return
      } else if (this.password.newPwd == '' || this.password.newPwd == null) {
        this.$message.error('请输入密码')
        return
      } else if (this.password.newPwd.length < 6) {
        this.$message.error('密码长度必须到6位')
        return
      }
      var param = {
        account: this.user.account,
        newPwd: this.password.newPwd
      }
      uc.updateUserPsw(param).then(() => {
        this.$message({
          message: '修改成功！',
          type: 'success'
        })
        this.isUpdatePwd = false
        this.password = {}
      })
    },
    closeUserManeger() {
      this.handleCloseUserManager()
    },
    excelImport() {
      this.fullscreenLoading = false
      this.importDialogVisible = true
    },
    signatureImport(){
      this.fullscreenLoading = false
      this.signatureImportVisible = true
    },
    excelExport() {
      if (this.exportSelection.length < 1) {
        this.$message({ type: 'warning', message: '请选择需要导出的数据！' })
        return false
      }
      let select = []
      for (let i = 0; i < this.exportSelection.length; i++) {
        select.push(JSON.stringify(this.exportSelection[i]))
      }
      let loading= this.$loading();
      uc.userExport(select, resp => {
        loading.close();
        this.$message({ type: 'success', message: '导出成功' })
      })
    },
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row)
    },
    selectRow(selection, row) {
      this.exportSelection = selection
    },
    getAllRoles() {
      uc.getAllRoles().then(data => {
        data.forEach(item => {
          this.roles.push({
            key: item.name,
            value: item.name
          })
        })
      })
    },
    getAllJobs() {
      uc.getAllJobs().then(data => {
        data.forEach(item => {
          this.jobs.push({
            key: item.name,
            value: item.name
          })
        })
      })
    },
    getAllPosts() {
      uc.getAllPosts().then(data => {
        data.rows.forEach(item => {
          this.posts.push({
            key: item.name,
            value: item.name
          })
        })
      })
    },
    getTokenByUserName(username) {
      let token = ''
      uc.getTokenByUserName(username).then(resp => {
        token = resp.value
      })
      return token
    },
    onExceed(file) {
      this.$message.warning('只能选择一个Excel文件!')
    },
    submitImport() {
      if (!this.$refs.upload.uploadFiles || this.$refs.upload.uploadFiles.length == 0) {
        this.$message.warning('请选择要导入的数据文件!')
        return false
      }
      if (!this.importDemCode) {
        this.$message.warning('请选择要导入的维度!')
        return false
      }
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.$message.warning('只能导入Excel文件!')
        return false
      }
      this.fullscreenLoading = true
    },
    hadleUploadResult(response, file, fileList) {
      this.fullscreenLoading = false
      if (response.state) {
        this.$message.success(response.message)
        this.importDialogVisible = false
        this.$refs.htTable.load()
      } else {
        this.$message.error(response.message + '：' + response.value)
      }
    },
    submitSignature(){
      if (!this.$refs.signatureFile.uploadFiles || this.$refs.signatureFile.uploadFiles.length == 0) {
        this.$message.warning('请选择要导入的数据文件!')
        return false
      }
      this.$refs.signatureFile.submit()
    },
    beforeSignatureUpload(file) {
      if (!file.name.endsWith('.zip')) {
        this.$message.warning('只能导入压缩（zip）文件!')
        return false
      }
      this.fullscreenLoading = true
    },
    hadleSignatureUploadResult(response, file, fileList) {
      this.fullscreenLoading = false
      if (response.state) {
        this.$message.success(response.message)
        this.signatureImportVisible = false
        this.$refs.htTable.load()
      } else {
        this.$message.error(response.message + '：' + response.value)
      }
    },
    downloadTemplate() {
      window.location.href = window.context.manage + '/static/excel/导入组织用户模板_标准.xlsx'
    },
    setShiftUser(id) {
      let selection = this.$refs.htTable.$refs.htTable.selection
      if (selection.length <= 0) {
        this.$message.error('请选择用户！')
        return
      }
      this.$refs.shiftRuleDialog.showDialog()
    },
    shiftConfirm(data) {
      let selection = this.$refs.htTable.$refs.htTable.selection
      if (data.length > 0) {
        let shiftUser = selection.map(item => {
          return {
            userId: item.id,
            shiftId: data[0].id
          }
        })
        uc.saveShiftUser(shiftUser).then(response => {
          if (response.state) {
            this.$message.success('设置成功')
          }
        })
      } else {
        let ids = selection.map(item => item.id).join(',')
        uc.removeShiftUser(ids).then(response => {
          if (response.state) {
            this.$message.success('设置成功')
          }
        })
      }
    },
    getUserUniteData(userId) {
      this.userUnite = {};
      this.userUnite.userId = userId;
      uc.getUserUniteByUserId(userId).then(resp => {
        if (resp.data) {
          this.userUnite = resp.data;
        }
        this.wxDtVisible = true;
      })
    }
  }
}
</script>
<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

>>> .el-tree .el-tree-node__label {
  font-size: 12px;
}
>>> .import_row {
  margin-bottom: 15px;
}
@media (max-width: 1440px) {
  /deep/ .search-container__col {
    flex-wrap: wrap;
    .el-button-group {
      margin-top: 10px;
    }
  }
}
@media (max-width: 1024px) {
  /deep/ .el-dialog {
    width: 90% !important;
  }
}
.sp-manager__dialog /deep/ .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}

.descript-title {
  pointer-events: none;

  strong {
    color: red;
  }
  p {
    text-indent: -1.6em;
    padding-left: 1.6em;
    margin: 5px 0;
  }
}
.m-r-10 {
  margin-right: 10px;
}
.confirm-detail {
  pointer-events: auto;
}
</style>
