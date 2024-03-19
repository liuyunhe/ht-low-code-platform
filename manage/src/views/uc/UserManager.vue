<template>
  <div>
    <el-tabs type="card" @tab-click="tabClick" v-model="currentTabName">
      <el-tab-pane label="基本信息" name="basic">
        <form data-vv-scope="editUserForm">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="is-required">姓名:</td>
                <td>
                  <ht-input
                    v-model="user.fullname"
                    autocomplete="off"
                    :validate="{
                      required: true,
                      regex: {
                        exp: '^[\\s\\S]{1,20}$',
                        message: '内容超出输入限制',
                      },
                    }"
                  ></ht-input>
                </td>
                <td class="is-required">账号:</td>
                <td>
                  <ht-input
                    v-model="user.account"
                    autocomplete="off"
                    :disabled="account != ''"
                    v-pinyin:1="user.fullname"
                    :validate="{
                      regex: {
                        exp: '^[a-zA-Z0-9_-]{2,20}$',
                        message: '账号输入有误，请重新输入',
                      },
                    }"
                  ></ht-input>
                </td>
                <td rowspan="4" align="center" valign="middle">
                  <el-avatar :size="120" :src="photoUrl">
                    <img :src="photoUrl" />
                  </el-avatar>
                  <el-upload
                    action="string"
                    :http-request="updateUserImage"
                    :show-file-list="false"
                  >
                    <el-button size="small" type="primary">点击上传</el-button>
                  </el-upload>
                </td>
              </tr>
              <tr>
                <td v-if="account != ''">手机:</td>
                <td v-if="account != ''">
                  <ht-input
                    v-model="user.mobile"
                    autocomplete="off"
                    validate="mobile"
                  ></ht-input>
                </td>
                <td v-if="account == ''" class="is-required">密码:</td>
                <td v-if="account == ''">
                  <ht-input
                    v-model="user.password"
                    show-password
                    :validate="pwdValidate"
                  />
                </td>
                <td>邮箱:</td>
                <td>
                  <ht-input v-model="user.email" autocomplete="off"></ht-input>
                </td>
              </tr>
              <tr>
                <td>性别:</td>
                <td>
                  <ht-select
                    v-model="user.sex"
                    :options="[
                      {key: '男', value: '男'},
                      {key: '女', value: '女'},
                    ]"
                  />
                </td>
                <td>地址:</td>
                <td>
                  <ht-input
                    v-model="user.address"
                    autocomplete="off"
                    :validate="{
                      regex: {
                        exp: '^[\\s\\S]{0,100}$',
                        message: '内容超出输入限制',
                      },
                    }"
                  ></ht-input>
                </td>
              </tr>
              <tr>
                <td>状态:</td>
                <td>
                  <ht-select
                    v-model="user.status"
                    :validate="{required: true}"
                    :options="[
                      {key: 0, value: '禁用'},
                      {key: 1, value: '正常'},
                      {key: -2, value: '离职'},
                    ]"
                  />
                </td>
                <td v-if="account == ''">手机:</td>
                <td v-if="account == ''">
                  <ht-input
                    v-model="user.mobile"
                    autocomplete="off"
                    validate="mobile"
                  ></ht-input>
                </td>
                <td v-if="account != ''" colspan="2"></td>
              </tr>
              <tr>
                <td colspan="5" align="center">
                  <ht-submit-button
                    :url="saveUserUrl"
                    :model="user"
                    :is-submit="isSubmit"
                    scope-name="editUserForm"
                    @before-save-data="beforeSaveData"
                    @after-save-data="afterSaveData"
                    >{{ $t('eip.common.save') }}</ht-submit-button
                  >
                  <el-button @click="closeUserManager">{{
                    $t('eip.common.cancel')
                  }}</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </el-tab-pane>
      <el-tab-pane
        label="所属组织岗位"
        name="orgPost"
        :disabled="account == ''"
      >
        <ht-table
          @load="orgPostData"
          v-if="userOrgPostLoaded"
          :data="orgPostList"
          :pageResult="orgPostPageResult"
          :selection="true"
          :show-export="false"
          :show-custom-column="false"
          :default-querys="[{property: 'account', value: account}]"
          ref="orgPostTables"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button
                size="small"
                @click="showEipOrgDialog"
                icon="el-icon-plus"
                >添加组织</el-button
              >
              <el-button
                size="small"
                @click="showEipPostDialog"
                icon="el-icon-plus"
                >添加岗位</el-button
              >
              <ht-delete-button
                :url="delOrgUser"
                :htTable="$refs.orgPostTables"
                @after-delete="afterDelOrgUser"
                pk="orgUserId"
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
            <ht-table-column prop="demName" label="组织维度" width="160" />
            <ht-table-column prop="orgName" label="组织名称" />
            <ht-table-column prop="posName" label="岗位名称" />
            <ht-table-column prop="isMaster" label="主组织/主岗位" width="100">
              <template v-slot="{row}">
                <el-tag type="danger" v-if="row.isMaster == '0'">否</el-tag>
                <el-tag v-if="row.isMaster == '1'">是</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column label="操作" width="300">
              <template v-slot="{row}">
                <el-button
                  type="primary"
                  icon="el-icon-edit-outline"
                  v-if="row.isMaster == 0 && row.posName"
                  @click="setMaster(row)"
                  >设置主岗位</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-edit-outline"
                  v-if="row.isMaster == 1 && row.posName"
                  @click="setMaster(row)"
                  >取消主岗位</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-edit-outline"
                  v-if="row.isMaster == 0 && !row.posName"
                  @click="setMaster(row)"
                  >设置主组织</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-edit-outline"
                  v-if="row.isMaster == 1 && !row.posName"
                  @click="setMaster(row)"
                  >取消主组织</el-button
                >
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-tab-pane>
      <el-tab-pane label="所属角色" name="role" :disabled="account == ''">
        <ht-table
          @load="userRoleLoad"
          :data="userRoleList"
          v-if="userRoleLoaded"
          :pageResult="rolePageResult"
          :selection="true"
          :show-export="false"
          :show-custom-column="false"
          :default-querys="[{property: 'u.account_', value: account}]"
          ref="userRoleTable"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button
                size="small"
                @click="showEipRoleDialog"
                icon="el-icon-plus"
                >添加角色</el-button
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
            <ht-table-column prop="roleName" label="名称" />
            <ht-table-column prop="alias" label="编码" width="300" />
            <ht-table-column width="154" label="操作">
              <template v-slot="{row}">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteUserRole(row.alias)"
                  >删除</el-button
                >
              </template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-tab-pane>
      <el-tab-pane label="用户参数" name="param" :disabled="account == ''">
        <el-form v-model="userParam" class="user-param-form">
          <template v-for="param in userParams">
            <ht-form-item
              :label="param.name"
              prop="name"
              label-width="200px"
              :key="param.name"
            >
              <el-date-picker
                v-model="userParam[param.code]"
                type="datetime"
                placeholder="选择日期时间"
                v-if="param.ctlType === 'date'"
              ></el-date-picker>
              <ht-input
                v-model="userParam[param.code]"
                v-if="param.ctlType === 'input'"
              />
              <ht-input
                type="number"
                v-model="userParam[param.code]"
                v-if="param.ctlType === 'number'"
              />
              <ht-select
                v-model="userParam[param.code]"
                v-if="param.ctlType === 'select'"
                :options="JSON.parse(param.json)"
              />
              <ht-radio
                v-model="userParam[param.code]"
                v-if="param.ctlType === 'radio'"
                :options="JSON.parse(param.json)"
              />
              <ht-checkbox
                v-model="userParam[param.code]"
                v-if="param.ctlType === 'checkbox'"
                :options="JSON.parse(param.json)"
              />
            </ht-form-item>
          </template>
        </el-form>
        <el-row>
          <el-col :offset="6">
            <el-button type="primary" @click="userParamSubmit">保存</el-button>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        label="签章管理"
        name="electronicSeal"
        :disabled="account == ''"
        lazy
      >
        <el-form data-vv-scope="electronicSealForm">
          <ht-form-item label="签章">
            <el-image v-bind:src="electronicSealPic" v-if="sealPicShow" />
            <br />
            <el-upload
              style="display: inline-block"
              action="string"
              accept=".png,.PNG"
              :http-request="updateElectronicSeal"
              :before-upload="beforeAvatarUpload"
              :show-file-list="false"
            >
              <el-tooltip
                class="item"
                effect="light"
                content="图片格式：png 图片尺寸：250*70px"
                placement="right"
              >
                <el-button size="small" icon="el-icon-plus" round
                  >上传</el-button
                >
              </el-tooltip>
            </el-upload>
            <el-button
              v-if="sealPicShow"
              @click="removeElectronicSealPic"
              style="margin-left: 10px"
              size="small"
              icon="el-icon-delete"
              round
              >删除</el-button
            >
          </ht-form-item>
          <ht-form-item label="请输入密码">
            <ht-input
              v-model="electronicSeal.password"
              type="password"
              placeholder="请输入密码"
            />
          </ht-form-item>
          <ht-form-item label="确认密码">
            <ht-input
              v-model="electronicSeal.confirmPwd"
              :validate="'confirmed:' + electronicSeal.password"
              type="password"
              placeholder="确认"
            />
          </ht-form-item>
        </el-form>
        <div class="dialog-footer electronic-style">
          <ht-submit-button
            :url="ElectronicSealSubmitUrl"
            :model="electronicSeal"
            :isSubmit="electronicSealFormSubmit"
            requestMethod="POST"
            scopeName="editForm"
            @before-save-data="electronicSaveData"
            @after-save-data="afterSaveData"
            >{{ $t('eip.common.save') }}</ht-submit-button
          >
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 组织选择对话框  -->
    <eip-org-dialog ref="eipOrgDialog" @onConfirm="addUserOrg" append-to-body />
    <!-- 岗位选择对话框  -->
    <eip-post-dialog
      ref="eipPostDialog"
      @onConfirm="addUserPost"
      append-to-body
    />
    <!-- 角色选择对话框  -->
    <eip-role-dialog
      ref="eipRoleDialog"
      @onConfirm="addUserRole"
      append-to-body
    />
  </div>
</template>

<script>
import utils from '@/hotent-ui-util.js'
import uc from '@/api/uc.js'
import org from '@/api/org.js'
import sys from '@/api/portal.js'
import eipOrgDialog from '@/components/dialog/EipOrgDialog.vue'
import eipPostDialog from '@/components/dialog/EipPostDialog.vue'
const eipRoleDialog = () => import('@/components/dialog/EipRoleDialog.vue')

export default {
  name: 'UserManager',
  components: {
    eipOrgDialog,
    eipPostDialog,
    eipRoleDialog,
  },
  computed: {
    saveUserUrl: function () {
      let preUrl = window.context.uc + '/api/user/v1/user'
      if (this.account) {
        preUrl += '/updateUser'
      } else {
        preUrl += '/addUser'
      }
      return preUrl
    },
    delOrgUser: function () {
      return window.context.uc + '/api/org/v1/orgUser/delOrgUser'
    },
    ElectronicSealSubmitUrl: function () {
      return window.context.uc + '/uc/electronicSeal/v1/save'
    },
    electronicSealPicUrl: function () {
      return (
        window.context.uc +
        '/system/file/v1/preview?fileId=' +
        this.electronicSeal.fileId
      )
    },
  },
  data() {
    return {
      user: {
        id: '',
        account: '',
        address: '',
        email: '',
        fullname: '',
        mobile: '',
        password: '',
        photo: '',
        sex: '',
        status: 1,
      },
      photoUrl: '/img/defaultPhoto.jpg',
      orgPostPageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      rolePageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      orgPostList: [], //组织岗位
      userRoleList: [], //用户角色,
      userParam: {}, //当前用户的用户参数值
      userParams: [], //系统的所有用户参数
      account: '',
      isSubmit: false,
      currentTabName: 'basic',
      userParamLoaded: false,
      userOrgPostLoaded: false,
      userRoleLoaded: false,
      pwdValidate: {
        required: true,
        min: 6,
        max: 30,
      },
      electronicSeal: {
        fileId: '',
        password: '',
        picUrl: '',
      }, // 签章
      electronicSealPic: '',
      sealPicShow: false,
      electronicSealFormSubmit: false,
    }
  },
  props: ['userAccount', 'orgCode'],
  mounted() {
    this.account = this.userAccount
    // 用户参数是否已加载
    this.userParamLoaded = false
    // 是否显示用户所属组织岗位
    this.userOrgPostLoaded = false
    // 是否显示用户拥有的角色
    this.userRoleLoaded = false
    if (this.account) {
      uc.getUser(this.account).then((resp) => {
        this.user = resp.user
        if (this.user.photo) {
          this.$store
            .dispatch('menu/downloadImg', this.user.photo)
            .then((res) => {
              if (res != '') {
                this.photoUrl = res
              }
            })
        }
      })
    }
    //默认密码策略
    uc.getDefaultPwdStrategy().then((data) => {
      if (data) {
        let form = data
        //默认初始化密码
        if (form.initPwd) {
          this.user.password = form.initPwd
        }
        if (form.enable == 1) {
          let pwdRule = form.pwdRule
          let pwdLength = form.pwdLength
          if (pwdRule == 1) {
            this.pwdValidate = {
              required: true,
              min: pwdLength,
            }
          } else {
            let regex = {}
            if (pwdRule == 2) {
              regex = {
                exp: '^(?=.*[0-9])(?=.*[a-zA-Z]).{' + pwdLength + ',30}$',
                message: '密码必须包含字母、数字,至少' + pwdLength + '位',
              }
            } else if (pwdRule == 3) {
              regex = {
                exp:
                  '^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{' +
                  pwdLength +
                  ',30}$',
                message:
                  '密码必须包含数字、字母、特殊字符,至少' + pwdLength + '位',
              }
            } else if (pwdRule == 4) {
              regex = {
                exp:
                  '^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{' +
                  pwdLength +
                  ',30}$',
                message:
                  '密码必须包含数字、大小写字母、特殊字符,至少' +
                  pwdLength +
                  '位',
              }
            }
            this.pwdValidate = {
              required: true,
              regex: regex,
            }
          }
        }
      }
    })
  },
  methods: {
    phonoError(e) {
      // this.user.photo = "/img/defaultPhoto.jpg";
    },
    addOrg() {
      if (!this.orgCode || !this.user.account) {
        return false
      }
      //是否是编辑用户,是编辑用户就不要添加到组织下
      if (this.user.id) {
        return false
      }
      let param = [
        {
          code: this.orgCode,
        },
      ]
      this.account = this.user.account
      this.addUserOrg(param)
    },
    async beforeSaveData() {
      if (this.photo) {
        this.user.photo = this.photo
      }
      this.isSubmit = true
    },
    afterSaveData() {
      this.addOrg()
      this.$confirm('操作成功，是否退出?', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '不退出',
        type: 'warning',
      })
        .then(() => {
          //点击取消按钮
          this.$emit('handleCloseUserManager')
        })
        .catch(() => {
          this.account = this.user.account
          this.electronicSealFormSubmit = false
        })
    },
    updateUserImage(param) {
      const formData = new FormData()
      formData.append('files', param.file)
      uc.fileUpload(formData)
        .then((response) => {
          this.photo = response.fileId
          this.user.photo = response.fileId
          this.$store
            .dispatch('menu/downloadImg', response.fileId)
            .then((res) => {
              if (res != '') {
                this.photoUrl = res
              }
            })
          param.onSuccess() // 上传成功的图片会显示绿色的对勾
        })
        .catch((response) => {
          param.onError()
        })
    },
    updateElectronicSeal(param) {
      const formData = new FormData()
      formData.append('files', param.file)
      uc.fileUpload(formData).then((response) => {
        this.electronicSeal.fileId = response.fileId
        this.$store
          .dispatch('menu/downloadImg', response.fileId)
          .then((res) => {
            if (res != '') {
              this.electronicSealPic = res
              this.sealPicShow = true
            }
          })
        this.$message.success('上传成功')
      })
    },
    electronicSaveData() {
      this.electronicSealFormSubmit = true
      if (!this.electronicSeal.fileId) {
        this.$message.error('请上传签章！')
        this.electronicSealFormSubmit = false
        return false
      }
      if (!this.electronicSeal.password) {
        this.$message.error('请输入密码！')
        this.electronicSealFormSubmit = false
        return false
      } else if (
        this.electronicSeal.password != this.electronicSeal.confirmPwd
      ) {
        this.$message.error('两次输入的密码不一致，请重新输入')
        this.electronicSealFormSubmit = false
        return false
      }
      this.electronicSeal.userId = this.user.id
    },
    orgPostData(param, cb) {
      uc.getUserOrgPage(param)
        .then((response) => {
          this.orgPostList = response.rows
          this.orgPostPageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          }
        })
        .finally(() => cb())
    },
    setMaster(row) {
      let flag = false
      let orgName = ''
      this.orgPostList.forEach((item) => {
        if (item.isMaster === 1 && row.orgId !== item.orgId) {
          orgName = item.orgName
          flag = true
        }
      })
      if (flag) {
        this.$confirm(
          '该用户已设置主组织' + orgName + '，是否重新设置？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'success',
          }
        )
          .then(() => {
            uc.setMasterById(row.orgUserId).then((resp) => {
              this.$refs.orgPostTables.load()
            })
          })
          .catch(() => {})
      } else {
        uc.setMasterById(row.orgUserId).then((resp) => {
          this.$refs.orgPostTables.load()
        })
      }
    },
    showEipOrgDialog() {
      this.$refs.eipOrgDialog.showDialog()
    },
    showEipPostDialog() {
      this.$refs.eipPostDialog.showDialog()
    },
    checkBeyondOrg(orgCodes, callback) {
      org.getOrgLimitByCodes(orgCodes.join(',')).then((resp) => {
        let normalOrgCodes = []
        let beyondOrgs = []
        if (resp && resp.rows) {
          resp.rows.forEach((org) => {
            if (org.exceedLimitNum === 1 && org.limitNum != 0) {
              if (org.limitNum > org.nowNum + 1) {
                normalOrgCodes.push(org.code)
              } else {
                beyondOrgs.push(org)
              }
            } else {
              normalOrgCodes.push(org.code)
            }
          })
        }
        callback({normal: normalOrgCodes, beyond: beyondOrgs})
      })
    },
    addUserOrg(param) {
      param = param.map((param) => {
        return param.code
      })
      let _this = this
      this.checkBeyondOrg(param, function (resp) {
        if (resp.beyond.length > 0) {
          let beyondOrgNames = resp.beyond.map((org) => {
            return org.name
          })
          _this.$message.error(
            '添加失败：组织【' + beyondOrgNames.join(',') + '】超出限编'
          )
          return
        }
        var params = {
          account: _this.account,
          orgCode: resp.normal,
        }
        uc.saveUserOrgs(params).then((resp) => {
          _this.$refs.orgPostTables.load()
        })
      })
    },
    addUserPost(param) {
      param = param.map((param) => {
        return param.code
      })
      var params = {
        account: this.account,
        Code: param,
      }
      uc.saveUserPosts(params).then((resp) => {
        this.$refs.orgPostTables.load()
      })
    },
    getOrg(_param) {
      org.getOrg(_param.orgCode).then((resp) => {
        if (resp.exceedLimitNum === 1 && resp.limitNum != 0) {
          if (resp.limitNum > resp.nowNum + 1) {
            return _param.code
          } else {
            isBeyond = true
          }
        } else {
          return _param.code
        }
      })
    },
    showEipRoleDialog() {
      this.$refs.eipRoleDialog.showDialog()
    },
    deleteOrgPost(id) {
      uc.delOrgUser(id).then(() => {
        this.$refs.orgPostTables.load()
      })
    },
    userRoleLoad(param, cb) {
      uc.userRolePage(param)
        .then((response) => {
          if (response) {
            this.userRoleList = response.rows
            this.rolePageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total,
            }
          }
        })
        .finally(() => cb())
    },
    deleteUserRole(code) {
      var params = {
        account: this.account,
        codes: code,
      }
      uc.delUserRole(params).then(() => {
        this.$refs.userRoleTable.load()
      })
    },
    addUserRole(param) {
      param = param.map((param) => {
        return param.code
      })
      var params = {
        account: this.account,
        codes: param,
      }
      uc.saveUserRoles(params).then(() => {
        this.$refs.userRoleTable.load()
      })
    },
    userParamSubmit() {
      var param = {
        account: this.user.account,
      }
      var data = []
      let _this = this
      for (var _param in this.userParam) {
        for (let i = 0; i < _this.userParams.length; i++) {
          if (
            _this.userParams[i].ctlType === 'input' &&
            _this.userParam[_param].length > 30
          ) {
            this.$message({type: 'warning', message: '内容超出输入限制'})
            return false
          }
        }
        data.push({alias: _param, value: this.userParam[_param]})
      }
      uc.saveUserParams(data, param).then((resp) => {
        this.$message({
          message: resp.message,
          type: 'success',
          showClose: true,
        })
      })
    },
    closeUserManager() {
      // 调用父级方法关闭面板
      this.$emit('closeUserManeger')
    },
    // 点击某个tab页签时再加载该页签的数据
    tabClick() {
      switch (this.currentTabName) {
        case 'orgPost':
          this.userOrgPostLoaded = true
          break
        case 'role':
          this.userRoleLoaded = true
          break
        case 'param':
          // 获取用户参数
          if (!this.userParamLoaded && this.account) {
            uc.getUserParams()
              .then((resp) => {
                this.userParamLoaded = true
                this.userParams = resp
                return resp
              })
              .then((params) => {
                if (
                  !params ||
                  params.constructor != Array ||
                  params.length < 1
                ) {
                  return
                }
                uc.getUserParamsValue(this.account).then((response) => {
                  if (response && response.constructor == Array) {
                    response.forEach((r) => {
                      this.$set(this.userParam, r['alias'], r['value'])
                    })
                  }
                })
              })
          }
          break
        case 'electronicSeal':
          uc.getSealByUserId(this.user.id).then((resp) => {
            if (resp) {
              this.electronicSeal = resp
              this.$store
                .dispatch('menu/downloadImg', this.electronicSeal.fileId)
                .then((res) => {
                  if (res != '') {
                    this.electronicSealPic = res
                    this.sealPicShow = true
                  }
                })
            }
          })
          break
      }
    },
    afterDelOrgUser() {
      this.$refs.orgPostTables.load()
    },
    beforeAvatarUpload(file) {
      var FileExt = file.name.replace(/.+\./, '')
      if (['png'].indexOf(FileExt.toLowerCase()) === -1) {
        this.$message({
          type: 'warning',
          message: '请上传后缀名为png类型的图片',
        })
        return false
      }
    },
    removeElectronicSealPic() {
      request
        .remove(
          '${uc}/uc/electronicSeal/v1/remove/?ids=' + this.electronicSeal.id
        )
        .then((rep) => {
          if (rep.data.state) {
            this.electronicSealPic = ''
            this.sealPicShow = false
            Message.success('删除成功')
          }
        })
    },
  },
}
</script>
<style scoped>
.user-param-form {
  min-height: 400px;
}

.electronic-style {
  margin-left: 100px;
}
</style>
