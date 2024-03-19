<template>
  <div class="container">
    <el-row :gutter="25">
      <el-col :span="6">
        <!-- TODO w 回首页 -->
        <a @click="goHome()">
          <img class="container__left-logo" :src="logo" />
        </a>
      </el-col>
      <el-col :span="12">
        <myMenu
          v-if="$route.path != '/'"
          @currentMenuIndex="currentMenuIndex"
        />
      </el-col>
      <el-col :span="6">
        <div class="flex container__right">
          <!-- 内部消息 -->
          <div>
            <el-badge
              v-show="msgbadge"
              :value="msgbadge"
              :max="100"
              title="内部消息"
            >
              <i
                class="msg-link-icon icon-message"
                @click="linkToMessage()"
              ></i>
            </el-badge>
          </div>
          <!-- 头像菜单 -->
          <el-dropdown @command="handleCommand" trigger="click">
            <p class="container__photo-span" style="width: 55px;">
              <span style="display: inline-block"
                ><img :src="userPhoto" class="container__photo-img"
              /></span>
              <i
                class="el-icon-arrow-down el-icon--right"
                style="float: right; margin-top: 12px;"
              ></i>
            </p>
            <!-- ccwgq 2022-06-14 隐藏 秘书管理、切换语言和切换岗位 -->
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="info">{{
                $t('navigator.userInfo')
              }}</el-dropdown-item>
              <el-dropdown-item command="appDownload">{{
                $t('navigator.appDownload')
              }}</el-dropdown-item>
              <el-dropdown-item command="commonWords">{{
                $t('navigator.commonWords')
              }}</el-dropdown-item>
              <el-dropdown-item command="flowAgent">{{
                $t('navigator.flowAgent')
              }}</el-dropdown-item>
              <!-- 秘书管理 -->
              <!-- <el-dropdown-item command="secretary">{{$t('navigator.secretary')}}</el-dropdown-item> -->
              <el-dropdown-item command="innerMessages">{{
                $t('navigator.innerMessages')
              }}</el-dropdown-item>

              <!-- <el-dropdown-item command="langSelect">
                <lang-select class="right-menu-item hover-effect" />
              </el-dropdown-item> -->
              <!-- 切换当前岗位 -->
              <!-- <el-dropdown-item command="switchingPost">
                <el-dropdown @command="switchPost" placement="left-start">
                  <span class="theme-color">{{$t('navigator.switchPost')}}</span>
                  <el-dropdown-menu slot="dropdown" style="margin-right: 30px;">
                    <el-dropdown-item :command="post" :disabled="post.disabled" :key="post.postId"
                      v-for="post in postMap">{{post.postName}}({{post.orgName}})</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-dropdown-item> -->
              <el-dropdown-item command="modifyPwd">{{
                $t('navigator.changePwd')
              }}</el-dropdown-item>
              <el-dropdown-item command="electronicSealManage">{{
                $t('navigator.signSetting')
              }}</el-dropdown-item>
              <el-dropdown-item command="logout">{{
                $t('navigator.logout')
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- 用户信息 -->
          <div class="container__right-profile">
            <el-row style="margin: 0 10px 0 0">
              <el-row style="margin: 0">
                <el-col :span="24">
                  <h3 :title="currentUser.username" @click="linkToMessage()">
                    {{ currentUser.username }}
                  </h3>
                </el-col>
                <!-- <el-col :span="24">
                  <el-badge
                    v-if="msgbadge > 0"
                    :value="msgbadge"
                    :max="100"
                    title="内部消息"
                    style="margin-top: 5px"
                  >
                    <i
                      class="msg-link-icon icon-message"
                      @click="linkToMessage()"
                    ></i>
                  </el-badge>
                </el-col> -->
                <el-col :span="24">
                  <span v-if="curOrg.name" :title="curOrg.name">
                    <!-- 所在部门： -->
                    {{ curOrg.name }}
                  </span>
                </el-col>
                <!-- 角色 -->
                <!-- <el-col :span="24">
                  <span
                    style="display: inline"
                    v-for="name in getRole()"
                    :key="name"
                  >
                    {{ name ? name : '' }}
                  </span>
                </el-col> -->
              </el-row>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-dialog
        title="查看个人信息"
        :visible.sync="infoDialogVisible"
        :close-on-click-modal="false"
        top="12vh"
        width="860px"
      >
        <el-form
          v-if="curUser.user"
          :inline="true"
          ref="form"
          label-width="80px"
          size="mini"
        >
          <el-form-item label="用户名称">
            <span class="content_span">{{ curUser.user.fullname }}</span>
          </el-form-item>
          <el-form-item label="用户账号">
            <span class="content_span">{{ curUser.user.account }}</span>
          </el-form-item>
          <el-form-item label="手机号码">
            <span class="content_span">{{ curUser.user.mobile }}</span>
          </el-form-item>
          <el-form-item label="邮箱地址">
            <span class="content_span">{{ curUser.user.email }}</span>
          </el-form-item>
          <el-form-item label="用户性别">
            <span class="content_span">{{ curUser.user.sex }}</span>
          </el-form-item>
          <el-form-item label="用户状态">
            <span class="content_span">{{
              curUser.user.status == '1'
                ? '正常'
                : curUser.user.status == '0'
                ? '禁用'
                : curUser.user.status == '-1'
                ? '未激活'
                : '离职'
            }}</span>
          </el-form-item>

          <el-form-item label="家庭地址" style="width: 100%">
            <span class="content_span" style="width: 650px">{{
              curUser.user.address
            }}</span>
          </el-form-item>
          <el-form-item style="width: 100%" label="所属角色">
            <template v-for="name in curUser.role">
              <el-tag type="warning" size="small" :key="name" v-if="name">{{
                name
              }}</el-tag>
            </template>
          </el-form-item>
          <el-form-item style="width: 100%" label="所属岗位">
            <el-tooltip
              :content="post.pathName"
              placement="top"
              :key="post.postId"
              v-for="post in curUser.post"
            >
              <el-tag type="success" size="small">{{ post.postName }}</el-tag>
            </el-tooltip>
          </el-form-item>
          <el-form-item style="width: 100%" label="所属组织">
            <el-tooltip
              :content="org.pathName"
              placement="top"
              :key="org.orgId"
              v-for="org in curUser.org"
            >
              <el-tag size="small">{{ org.orgName }}</el-tag>
            </el-tooltip>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog
        title="签章管理"
        :visible.sync="electronicSealVisible"
        width="40%"
        :close-on-click-modal="false"
      >
        <el-form data-vv-scope="electronicSealForm">
          <ht-form-item label="签章">
            <ht-viewer v-model="electronicSeal.fileId" v-if="htViewerDialog" />
          </ht-form-item>
          <ht-form-item label="登录密码">
            <ht-input
              v-model="electronicSeal.oldPassWord"
              validate="required"
              type="password"
              placeholder="请输入登录密码"
            />
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
              placeholder="确认密码"
            />
          </ht-form-item>
        </el-form>
        <div class="dialog-footer electronic-style">
          <ht-submit-button
            :url="ElectronicSealSubmitUrl"
            :model="electronicSeal"
            :isSubmit="isSubmit"
            requestMethod="POST"
            scopeName="editForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
            >{{ $t('eip.common.save') }}</ht-submit-button
          >
        </div>
      </el-dialog>
      <el-dialog
        title="修改密码"
        :visible.sync="modifyPwdDialogVisible"
        :close-on-click-modal="false"
        top="20vh"
        width="500px"
        id="modlfy-dialog"
        @open="open"
      >
        <el-form
          :model="pwdForm"
          :rules="pwdRules"
          ref="pwdForm"
          label-width="120px"
          size="mini"
        >
          <el-form-item label="旧密码" prop="old">
            <el-input
              type="password"
              v-model="pwdForm.old"
              placeholder="请输入旧密码"
            ></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new">
            <el-input
              type="password"
              placeholder="请输入新密码"
              v-model="pwdForm.new"
            ></el-input>
          </el-form-item>
          <el-form-item label="重复新密码" prop="newRepeat">
            <el-input
              type="password"
              placeholder="请再次输入新密码"
              v-model="pwdForm.newRepeat"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer" style="text-align: center">
          <el-button size="small" type="primary" @click="submitForm"
            >确认</el-button
          >
          <el-button size="small" @click="modifyPwdDialogVisible = false"
            >取 消</el-button
          >
        </span>
      </el-dialog>

      <!--lyzcw:2022-06-01 9:42 添加手机app下载弹出窗-->
      <el-dialog
        title="手机APP下载"
        :visible.sync="appDownloadDialogVisible"
        :close-on-click-modal="false"
        top="10vh"
        width="80%"
        id="appDonwnload-dialog"
      >
        <iframe
          id="appDownloadIframe"
          name="appDownloadIframe"
          :src="appDownloadUrl"
          frameborder="0"
          width="100%"
          height="400px"
        ></iframe>
        <span slot="footer" class="dialog-footer" style="text-align: center">
          <el-button size="small" @click="appDownloadDialogVisible = false"
            >关闭</el-button
          >
        </span>
      </el-dialog>
    </el-row>

    <div
      class="button-box"
      v-drag
      draggable="false"
      id="dragg_div"
      :style="{visibility: notifyListCount > 0 ? 'visible' : 'hidden'}"
    >
      <el-badge
        :value="notifyListCount"
        :max="100"
        title="点击显示提醒，双击关闭所有"
        v-if="notifyListCount > 0"
      >
        <el-button
          class="btn-bg-img"
          @dblclick.native="close_all_notice"
          @click="show_notice_list"
        >
        </el-button>
      </el-badge>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import myMenu from '@/components/menu.vue'
import langSelect from '@/components/langSelect'
import req from '@/request.js'
import HtViewer from '@/components/common/HtViewer'
import messageReceiver from '@/store/messageReceiverList'
import {Notification} from 'element-ui'
import sysUtils from '@/api/sys.js'
import utils from '@/utils.js'
export default {
  name: 'navigator',
  inject: ['reload'],
  data() {
    var validateNew = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      }
      let config = this.pwdStrategy
      if (config.enable == 1) {
        let pwdRule = config.pwdRule
        let pwdLength = config.pwdLength
        if (pwdRule) {
          if (value.length < pwdLength) {
            callback(new Error('新密码长度至少为' + pwdLength))
          } else if (pwdRule == 2) {
            var re = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])')
            if (!re.test(value)) {
              callback(new Error('新密码必须包含数字、字母'))
            } else {
              callback()
            }
          } else if (pwdRule == 3) {
            var re = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])')
            if (!re.test(value)) {
              callback(new Error('新密码必须包含数字、字母、特殊字符'))
            } else {
              callback()
            }
          } else if (pwdRule == 4) {
            var re = new RegExp(
              '(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9])'
            )
            if (!re.test(value)) {
              callback(new Error('新密码必须包含数字、大小字母、特殊字符'))
            } else {
              callback()
            }
          } else {
            callback()
          }
        }
      } else {
        if (value.length < 6) {
          callback(new Error('新密码长度至少为6'))
        } else {
          callback()
        }
      }
    }
    var validateold = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入旧密码'))
      } else {
        callback()
      }
    }
    var validateNewReapeat = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.pwdForm.new) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      //ccwgq 2022-06-02  增加app下载地址
      appDownloadUrl: window.context.appDownloadUrl,
      logo: '',
      showLogo: true,
      infoDialogVisible: false,
      modifyPwdDialogVisible: false,
      appDownloadDialogVisible: false,
      electronicSealVisible: false,
      userPhoto: require('@/assets/img/defaultPhoto.jpg'),
      pwdForm: {
        old: '',
        new: '',
        newRepeat: ''
      },
      pwdRules: {
        old: [{validator: validateold, trigger: 'blur'}],
        new: [{validator: validateNew, trigger: 'blur'}],
        newRepeat: [{validator: validateNewReapeat, trigger: 'blur'}]
      },
      count: 0,
      homePage: window.context.front + '/home',
      electronicSeal: {
        fileId: '',
        password: '',
        oldPassWord: '',
        picUrl: ''
      },
      electronicSealFileUrl: '',
      htViewerDialog: false,
      isSubmit: false,

      isOpen: false,
      isMove: false,
      draggVisible: true,
      //提醒信息列表
      notifyList: [],
      last_menu_name: '',
      notifyListCount: 0,
      time: null,
      //是否通过“不再提醒删除”
      isDeleteByNoMore: false,
      currentSysTime: '',
      timer: null
    }
  },
  computed: mapState({
    postMap: state => state.user.postMap || {},
    currentUser: state => {
      return state.login.currentUser ? state.login.currentUser : {}
    },
    curUser: state => state.user.currentUserDetail || {},
    curOrg: state => state.user.currentOrgDetail || {},
    pwdStrategy: state => state.user.pwdStrategy || {},
    ElectronicSealSubmitUrl: function() {
      return window.context.uc + '/uc/electronicSeal/v1/userSave'
    },
    msgbadge: state => state.messageReceiver.msgbadge || 0
  }),
  mounted() {
    window.handleRowClick = this.handleRowClick
    window.handleOpenUrl = this.handleOpenUrl

    window.notice_no_longer = this.notice_no_longer
    window.remind_detail = this.remind_detail
    // window.notifyList = this.notifyList

    const _this = this
    const currentUser = this.$store.state.login.currentUser
    if (currentUser) {
      let userAttrs = this.$store.state.login.currentUser.userAttrs
      if (userAttrs) {
        let tenantId = userAttrs.tenantId
        //租户
        if (tenantId && tenantId != 'null') {
          let url =
            window.context.uc + '/uc/tenantManage/v1/getJson?id=' + tenantId
          this.$http.get(url).then(
            resp => {
              if (resp.data) {
                let tenantManage = resp.data
                if (tenantManage.frontLogo) {
                  let frontLogo = JSON.parse(tenantManage.frontLogo)
                  if (frontLogo && frontLogo.length > 0) {
                    _this.showLogo = true
                    req
                      .get(
                        window.context.portal +
                          '/file/onlinePreviewController/v1/getFileById_' +
                          frontLogo[0].id,
                        'arraybuffer'
                      )
                      .then(response => {
                        let type = response.headers['content-type']
                        if (type) {
                          _this.logo = window.URL.createObjectURL(
                            new Blob([response.data], {type: type})
                          )
                        } else {
                          _this.logo = window.URL.createObjectURL(
                            new Blob([response.data])
                          )
                        }
                      })
                    // _this.logo = window.context.portal + "/system/file/v1/downloadFile?fileId=" + frontLogo[0].id;
                  }
                } else {
                  _this.showLogo = false
                  this.logo = require('@/assets/img/logo.svg')
                }
              }
            },
            error => {
              _this.showLogo = false
              this.logo = require('@/assets/img/logo.svg')
              reject(error)
            }
          )
        } else {
          //不是租户
          this.logo = require('@/assets/img/logo.svg')
          _this.sysSetting()
        }
      } else {
        //不是租户
        this.logo = require('@/assets/img/logo.svg')
        _this.sysSetting()
      }
    } else {
      //不是租户
      this.logo = require('@/assets/img/logo.svg')
      _this.sysSetting()
    }
    setTimeout(() => {
      this.$route.path !== '/' &&
        this.$store.dispatch('user/loadCurrentUserDetail').then(data => {
          if (data) {
            var promise = this.$store.dispatch('user/getCurrent')
            promise.then(data => {
              if (data.photo && data.photo.indexOf('img/defaultPhoto') < 0) {
                this.$store
                  .dispatch('menu/downloadImg', data.photo)
                  .then(res => {
                    if (res != '') {
                      this.userPhoto = res
                    }
                  })
              }
            })
          }
        })
    }, 1200)

    this.$store.dispatch('messageReceiver/setMsgbadge')
    //初始化悬浮按钮位置
    let clientW = document.documentElement.clientWidth
    let clientH = document.documentElement.clientHeight
    let dragg_div = document.getElementById('dragg_div')
    dragg_div.style.top = clientH / 8 + 'px'
    dragg_div.style.left = clientW - 94 + 'px'
  },
  created() {
    //lyzcw:2022-06-21，添加登录和退出时通知非正常待办，暂时关闭
    // this.getTaskList()
    this.get_notice_list_count()
    this.getCurrentDateTime()
    let current_menu_name = this.$route.path
    //yigz:2022-07-01 首页默认显示提醒信息

    if (current_menu_name == '/home') {
      this.notifyList = []
      this.$store.dispatch('form/getFormRemindDataByUser').then(data => {
        const me_ = this
        let i = 0
        data.forEach(item => {
          setTimeout(() => {
            me_.dialogMessage(item)
          }, i)
          i = i + 500
        })
      })
    }
    // yigz:2022-08-09 定时获取当前系统时间
    let _this = this
    if (!_this.timer) {
      let timer = setInterval(() => {
        _this.getCurrentDateTime()
      }, 1000 * 60)
      _this.timer = timer
    }
  },
  watch: {
    //第一次加载著部门，当前切换岗位部门时当前部门发生改变
    '$store.state.user.postCharge': function() {
      const postCharge = this.$store.state.user.postCharge
      this.count += 1
      if (postCharge.org && this.count > 1) {
        this.$store.dispatch('user/setcurrentOrg', postCharge.org)
      }
    }
  },
  methods: {
    // wude 2022-11-30 回首页,检验是否有未提交的表单进行提示
    goHome() {
      utils.checkFormUpdata(this,'/')
    },
    // lyzcw:2022-06-21 登录和退出时，显示紧急的待办
    getTaskList() {
      let querys = []
      querys.push({
        property: 'inst.URGENT_STATE_',
        value: '1,2', // 紧急,和重要
        group: 'main',
        operation: 'IN',
        relation: 'AND'
      })

      let pageBean = {
        pageBean: {page: '1', pageSize: '20', showTotal: 'true'},
        querys: querys
      }
      this.$store
        .dispatch('storeProcess/getTodoByPagination', pageBean)
        .then(resp => {
          if (resp) {
            //组装html
            let noticeHtml = ''
            if (resp.length > 0) {
              window.rowData = new Array()
              for (let i = 0; i < resp.length; i++) {
                let rowData = resp[i]
                window.rowData[i] = rowData
                noticeHtml +=
                  '<a href="#" onClick="handleRowClick( rowData[' +
                  i +
                  '], false )">' +
                  resp[i].subject +
                  '</a></br>'
              }
              this.toNotify(noticeHtml)
            }
          }
        })
    },
    toNotify(contents) {
      this.$notify.closeAll()
      this.$notify({
        title: '我的紧急和重要待办',
        dangerouslyUseHTMLString: true,
        message: contents,
        duration: 0,
        position: 'bottom-right'
      })
    },
    handleRowClick(row, newWin) {
      // console.log('row：', row)
      if (row.status == 'SHARE' || row.status == 'BACKSHARE') {
        if (row.identityList && row.identityList.length == 1) {
          let url = '/task/' + row.id + '/' + row.identityList[0].id
          // console.log('url：', url)
          this.handleOpenUrl(url, newWin)
        } else {
          let html =
            '<select ref=' +
            Math.random() +
            ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
          row.identityList.forEach(identity => {
            html +=
              '<option value="' +
              identity.id +
              '">' +
              identity.name +
              '</option>'
          })
          html += '</select>'
          let this_ = this
          this.$alert(html, '请选择一个领导代为审批', {
            dangerouslyUseHTMLString: true,
            beforeClose: function(action, instance, done) {
              if (action == 'confirm') {
                let se = document.getElementById('approvalLeaderSelect')
                if (se.selectedIndex == 0) {
                  this.$message.warning('请选择代为审批的领导')
                } else {
                  instance.close()
                  this_.handleOpenUrl(
                    '/task/' + row.id + '/' + se[se.selectedIndex].value,
                    newWin
                  )
                }
              } else {
                instance.close()
              }
            }
          })
        }
      } else if (
        row.status == 'AGENT' &&
        row.ownerId != row.assigneeId &&
        row.ownerId == this.$store.state.login.currentUser.userId
      ) {
        //委托任务
        this.handleOpenUrl('/instRead/' + row.procInstId + '/agent', newWin)
      } else if (row.status == 'FOLLOW') {
        //跟踪任务
        this.handleOpenUrl('/taskRead/' + row.id + '/FOLLOW', newWin)
      } else {
        let url = '/task/' + row.id + '/0'
        if (this.defKey) {
          url = '/sysModuleInst/' + row.id + '/0' + '/' + this.defKey + '/true'
        }
        this.handleOpenUrl(url, newWin)
      }
    },
    handleOpenUrl(url, newWin) {
      if (!newWin) {
        this.$router.push(url)
        return
      }
      if (!url) {
        return
      }
      let token = this.$store.state.login.currentUser.token
      if (!url.toLowerCase().startsWith('http')) {
        url = window.context.front + url
      }
      if (url.indexOf('?') == -1) {
        url = url + '?token=' + token
      } else {
        url = url + '&token=' + token
      }
      window.open(url, '_self')
    },
    //获取系统默认配置 系统Logo、名称
    sysSetting() {
      const _this = this
      let url =
        window.context.portal + '/sys/sysProperties/v1/getDecryptBySysSetting'
      _this.$http.get(url).then(response => {
        if (response && response.data && response.data.value) {
          let sysSettingData = JSON.parse(response.data.value)
          if (sysSettingData.frontLogo.length > 0) {
            let frontLogo = sysSettingData.frontLogo
            _this.showLogo = true
            req
              .get(
                window.context.portal +
                  '/file/onlinePreviewController/v1/getFileById_' +
                  frontLogo[0].id,
                'arraybuffer'
              )
              .then(response => {
                let type = response.headers['content-type']
                if (type) {
                  _this.logo = window.URL.createObjectURL(
                    new Blob([response.data], {type: type})
                  )
                } else {
                  _this.logo = window.URL.createObjectURL(
                    new Blob([response.data])
                  )
                }
              })
          } else {
            this.logo = require('@/assets/img/logo.svg')
          }
        } else {
          this.logo = require('@/assets/img/logo.svg')
        }
      })
    },
    open() {
      this.$store.dispatch('user/getDefPwdStrategy')
    },
    handleCommand(command) {
      switch (command) {
        case 'logout':
          //退出登陆时把vuex 里面的一些值清空
          this.$store.dispatch('menu/setCopyMenus', []) //菜单
          let loginRouthPath =
            localStorage.getItem(
              this.$store.state.login.currentUser.account + 'loginRoutePath'
            ) || '/login'
          this.$store.dispatch('login/logoutAndCleanUp').then(() => {
            switch (window.ssoConfig.mode) {
              case 'cas':
              case 'oauth':
                window.sessionStorage.removeItem('currentUser')
                window.location.href =
                  window.ssoConfig.logout +
                  '?service=' +
                  window.location.href.split('?')[0]
                break
              case 'token':
                window.location.replace(
                  `${process.env.VUE_APP_SSO_LOGOUT_URL}?service=${window.context.front}`,
                  '_self'
                )
                break
              default:
                this.$router.push({
                  // path: loginRouthPath
                  path: '/login'
                })
                break
            }
          })
          //退出登陆时，清除提醒弹框
          if (this.notifyList) {
            this.notifyList.forEach(item => {
              item.close()
            })
          }
          break
        case 'info':
          this.infoDialogVisible = true
          break
        case 'appDownload':
          // $("#appDownloadIframe").scrollTo( 0, $("#appDownloadIframe").document.body.scrollHeight );
          this.appDownloadDialogVisible = true
          break
        case 'commonWords':
          this.$router.push({path: '/v-personal/v-approvalItem'})
          break
        case 'flowAgent':
          this.$router.push({path: '/v-personal/v-agent'})
          break
        case 'secretary':
          this.$router.push({path: '/v-personal/v-secretary'})
          break
        case 'innerMessages':
          this.$router.push({path: '/v-personal/v-messageReceiver'})
          break
        case 'electronicSealManage':
          // 签章管理
          // 获取当前登录用户的签章图片
          req
            .get(
              window.context.uc + '/uc/electronicSeal/v1/getSealByCurrentUserId'
            )
            .then(response => {
              if (response.data) {
                this.electronicSeal = response.data
                this.$store
                  .dispatch('menu/downloadImg', this.electronicSeal.fileId)
                  .then(res => {
                    if (res != '') {
                      this.electronicSealFileUrl = res
                    }
                  })
              }
            })
            .then(() => {
              this.htViewerDialog = false
              this.$nextTick(() => {
                this.htViewerDialog = true
                this.electronicSealVisible = true
              })
            })
          break
        case 'modifyPwd':
          this.modifyPwdDialogVisible = true
          if (this.$refs['pwdForm']) {
            this.$refs['pwdForm'].resetFields()
          }
          break
      }
    },
    submitForm() {
      let this_ = this
      this.$refs['pwdForm'].validate(valid => {
        if (valid) {
          this.$store
            .dispatch('user/modifyPwd', {
              oldPwd: this.pwdForm.old,
              newPwd: this.pwdForm.new
            })
            .then(data => {
              if (data.state) {
                this.modifyPwdDialogVisible = false
                this.$alert('修改密码成功, 请使用新密码重新登录。', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {
                    //退出登录
                    this_.handleCommand('logout')
                  }
                })
              } else {
                this.$message.error(data.message || '保存失败')
              }
            })
        }
      })
    },
    switchPost(item) {
      for (let obj in this.postMap) {
        this.postMap[obj].disabled = false
      }
      item.disabled = true
      //设置表单中当前岗位
      this.$store.dispatch('user/setpostMap', {
        postMap: this.postMap,
        postCharge: item
      })
      this.$message.success('切换当前岗位成功')
      this.infoDialogVisible = true
      this.infoDialogVisible = false
    },
    beforeSaveData() {
      this.isSubmit = true
      if (!this.electronicSeal.oldPassWord) {
        this.$message.warning('请输入登录密码！')
        this.isSubmit = false
        return
      }
      if (!this.electronicSeal.password) {
        this.$message.warning('请输入密码！')
        this.isSubmit = false
        return
      }
      if (!this.electronicSeal.confirmPwd) {
        this.$message.warning('请输入确认密码！')
        this.isSubmit = false
        return
      }
      if (this.electronicSeal.password != this.electronicSeal.confirmPwd) {
        this.$message.warning('密码与确认密码不一致！')
        this.isSubmit = false
        return
      }
    },
    afterSaveData() {
      // 签章添加完成后的操作
      this.electronicSealVisible = false
    },
    linkToMessage() {
      // 2022-11-30 wude 检验是否有未提交的表单进行提示
      utils.checkFormUpdata(this,'/v-personal/v-messageReceiver')
      //this.$router.push({path: '/v-personal/v-messageReceiver'})
    },
    //yigz 2022-06-30:显示提醒列表
    show_notice_list() {
      if (!this.isOpen) {
        return
      }
      //首先清除计时器
      clearTimeout(this.time)
      //通过定时器方式，处理双击事件与点击事件冲突问题
      this.time = setTimeout(() => {
        //先关闭之前的提醒弹框
        if (this.notifyList) {
          this.notifyList.forEach(item => {
            item.close()
          })
        }

        this.notifyList = []
        this.$store.dispatch('form/getFormRemindDataByUser').then(data => {
          const me_ = this
          let i = 0
          data.forEach(item => {
            setTimeout(() => {
              me_.dialogMessage(item)
            }, i)
            i = i + 500
          })
        })
      }, 300)
    },
    //yigz:2022-07-01:双击关闭所有提醒信息
    close_all_notice() {
      clearTimeout(this.time) //清除
      if (this.notifyList) {
        this.notifyList.forEach(item => {
          item.close()
        })
      }
    },
    // yigz:2022-06-30:获取提醒消息数
    get_notice_list_count() {
      this.$store.dispatch('form/getFormRemindDataByUser').then(data => {
        if (data) {
          this.notifyListCount = data.length
        }
      })
    },
    // yigz 2022-06-30:添加非首页的提醒悬浮按钮功能
    mousedowm(e) {
      // 鼠标按下时的鼠标所在的X，Y坐标
      this.mouseDownX = e.pageX
      this.mouseDownY = e.pageY
      // 初始位置的X，Y 坐标
      // this.initX = obj.offsetLeft;
      // this.initY = obj.offsetTop;
      // 表示鼠标已按下
      this.flag = true
    },
    mousemove(e) {
      if (this.flag) {
        // console.log('e :', e)
      }
    },

    dialogMessage(item) {
      const me_ = this
      var notice_content = item.content
      var itemCount = item.count
      let content_url =
        '/statement/template/form/' +
        item.opemType +
        '/get/true?id=' +
        item.opemId +
        '&startFlow=false'
      //不再提醒
      var notice_no_longer = '不再提醒'
      var content =
        '<a onClick = "remind_detail(\'' +
        content_url +
        '\')" href= "#" style= " color: #2761ff;text-decoration-line: none ;font-size: 16px;width:14vw;margin-right:10px;">' +
        notice_content +
        '</a>' +
        '<a onClick = "notice_no_longer(\'' +
        item.id +
        "'" +
        ',' +
        itemCount +
        ')" href = "#" style = " color: #999;text-decoration-line: none ;font-size:12px;float:right;width:16vw;text-align: right;margin-right:8px;">' +
        notice_no_longer +
        '</a>'
      let notify = this.$notify.info({
        title: item.subject,
        duration: 0,
        dangerouslyUseHTMLString: true,
        position: 'bottom-right',
        message: content,
        onClose: function() {
          // console.log('onClose count ===>', item.count)
          if (item.count == 1) {
            me_.$store.dispatch('form/deleteFormRemindDataById', item.id)
            me_.get_notice_list_count()
          }
        }
        // onClick: function () {
        //   notify.close()
        //   let path =
        //     '/statement/template/form/' +
        //     item.opemType +
        //     '/get/true?id=' +
        //     item.opemId +
        //     '&startFlow=false'
        //   me_.$router.push(path)
        // },
      })
      this.notifyList.push(notify)
    },
    //2022-06-30 yigz:添加提醒详情
    remind_detail: function(content_url) {
      //先关闭之前提醒信息
      if (this.notifyList) {
        this.notifyList.forEach(item => {
          item.close()
        })
      }
      this.$router.push(content_url + '&openType=preview')
    },
    //yigz 2022-06-30:不再提醒
    notice_no_longer(itemId, itemCount) {
      // console.log('itemId ===>', itemId)
      // console.log('itemCount ===>', itemCount)
      //如果提醒信息设置了“提醒一次”，则不再这里删除，反之，删除
      if (itemCount == 0) {
        this.$store.dispatch('form/deleteFormRemindDataById', itemId)
      }

      //yigz 2022-06-30: 重新加载提醒数据
      // this.reload()
      //先关闭之前的提醒弹框
      if (this.notifyList) {
        this.notifyList.forEach(item => {
          // console.log(item)
          var message = item.message
          var start_index = message.lastIndexOf('notice_no_longer') + 18
          var end_index = message.lastIndexOf(')') - 3
          var msgId = message.substring(start_index, end_index)

          if (msgId == itemId) {
            item.close()
          }
        })
      }

      // this.notifyList = []
      // this.$store.dispatch('form/getFormRemindDataByUser').then((data) => {
      //   const me_ = this
      //   let i = 0
      //   data.forEach((item) => {
      //     setTimeout(() => {
      //       me_.dialogMessage(item)
      //     }, i)
      //     i = i + 500
      //   })
      // })
      this.get_notice_list_count()
      // }
    },
    //获取当前选中的菜单
    currentMenuIndex(current_menu_name) {
      if (current_menu_name == 'home') {
        //关闭其他页面的弹窗
        if (this.notifyList) {
          this.notifyList.forEach(item => {
            item.close()
          })
        }
        this.notifyList = []
        this.$store.dispatch('form/getFormRemindDataByUser').then(data => {
          const me_ = this
          let i = 0
          data.forEach(item => {
            setTimeout(() => {
              me_.dialogMessage(item)
            }, i)
            i = i + 500
          })
        })
      } else {
        if (this.last_menu_name != current_menu_name) {
          //关闭其他页面的弹窗
          if (this.notifyList) {
            this.notifyList.forEach(item => {
              item.close()
            })
          }
        }
      }

      this.last_menu_name = current_menu_name
      this.get_notice_list_count()
    },
    //yigz:2022-08-09 获取当前系统时间
    getCurrentDateTime() {
      let _this = this
      sysUtils.getCurrentDateTime().then(data => {
        if (data.value) {
          // let lastIndex = data.value.lastIndexOf(':')
          // var currentSysTime = data.value.substring(0, lastIndex)
          let currentSysTime = utils.formatDateByString(data.value)
          let myDate = new Date(data.value)
          let wk = myDate.getDay()
          let weeks = [
            '星期日',
            '星期一',
            '星期二',
            '星期三',
            '星期四',
            '星期五',
            '星期六'
          ]
          let week = weeks[wk]
          _this.currentSysTime = ' ' + '今天是 ' + currentSysTime + ' ' + week
        }
      })
    }
  },
  destroyed() {
    this.notifyList.forEach(item => {
      item.close()
    })
    if (this.timer) {
      //清除定时器
      clearInterval(this.timer)
    }
  },

  directives: {
    //2022-06-30 yigz:添加提醒悬浮按钮
    drag(el, binding, vnode) {
      let oDiv = el // 当前元素
      let _this = vnode.context // 上下文
      // 禁止选择网页上的文字
      oDiv.onselectstart = function() {
        return false
      }
      oDiv.onmousedown = function(e) {
        // 鼠标按下，计算当前元素距离可视区的距离
        let disX = e.clientX - oDiv.offsetLeft
        let disY = e.clientY - oDiv.offsetTop
        // 记录初始位置
        let l = oDiv.offsetLeft
        let t = oDiv.offsetTop
        let disanceX = 0
        let disanceY = 0
        let downX = e.clientX
        let downY = e.clientY
        document.onmousemove = function(e) {
          // 通过事件委托，计算移动的距离
          let l = e.clientX - disX
          let t = e.clientY - disY
          // 移动当前元素
          oDiv.style.left = l + 'px'
          oDiv.style.top = t + 'px'
          disanceX = l
          disanceY = t
        }
        document.onmouseup = function(e) {
          // 点击事件
          if (
            Math.abs(downX - e.clientX) < 3 ||
            Math.abs(downY - e.clientX) < 3
          ) {
            // binding.value.set(true)

            let clientH = document.documentElement.clientHeight
            if (e.y < 90) {
              disanceY = 60
              oDiv.style.top = disanceY + 'px'
              oDiv.style.left = l + 'px'
            } else if (e.y > clientH) {
              disanceY = clientH - 100
              oDiv.style.top = disanceY + 'px'
              oDiv.style.left = l + 'px'
            }
            _this.isOpen = true
          } else {
            // 拖拽事件
            _this.isOpen = false
            let clientW = document.documentElement.clientWidth
            let clientH = document.documentElement.clientHeight
            // 判断偏移量,并吸壁
            //控制x轴方向，不允许悬浮按钮滑出屏幕之外
            if (e.x > clientW / 2) {
              l = clientW - 94
            } else {
              l = -10
            }

            if (disanceX < 0) {
              l = -14
            }
            //控制y轴方向，不允许悬浮按钮滑出屏幕之外
            if (e.y < 90) {
              disanceY = 60
            } else if (e.y > clientH) {
              disanceY = clientH - 100
            }

            oDiv.style.top = disanceY + 'px'
            oDiv.style.left = l + 'px'
          }
          document.onmousemove = null
          document.onmouseup = null
        }
        // return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
        return false
      }
    }
  },
  components: {
    HtViewer,
    myMenu
    // langSelect,
  },
  props: ['caseID']
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.container {
  margin: 0 auto;
  height: 100%;
  overflow: hidden;

  .el-row {
    height: 100%;
    .el-col {
      height: 100%;
    }
  }

  .container__left-logo {
    height: calc(100% - 5px);
    margin-left: 30px;
  }

  .container__right {
    justify-content: space-around;
    align-items: center;
    float: right;
    height: 100%;
    width: auto;

    .el-badge {
      margin-right: 30px;
    }

    .el-dropdown {
      height: 100%;
    }

    .container__photo-span {
      padding-right: 20px;
      margin-top: 15.5px;
      display: inline-block;
    }

    .container__photo-img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
    }

    .container__photo-img + i {
      position: absolute;
      top: 34px;
      right: 0px;
    }
  }

  .msg-link-icon {
    font-size: 20px;
    cursor: pointer;
    color: white;
  }

  .container__right-profile {
    min-width: 90px;
    width: auto;
    padding-right: 60px;

    h3 {
      margin: 5px 0;
      color: $--color-white;
      white-space: nowrap;
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    span {
      color: $--color-white;
      // white-space: nowrap;
      // display: inline-block;
      // width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.theme-color {
  color: $--color-text-regular;
}

.el-row {
  margin: 0 -20px;
}

img {
  margin-top: 5px;
}

div.el-dropdown,
div.el-dropdown + span {
  color: #fff;
  line-height: 48px;
  font-size: 13px;
}

.logo-link {
  color: #fff;
  text-decoration: none;
  font-size: 24px;
  font-weight: 400;
  line-height: 48px;
  display: inline-block;
}

.el-form /deep/ .el-form-item__content > .el-tag {
  margin-right: 10px;
}

.content_span {
  color: #212121;
  border-bottom: 1px solid #ededed;
  width: 260px;
  display: inline-block;
  margin: 0 30px 0 10px;
}

#modlfy-dialog /deep/ .el-input__inner {
  width: 200px;
}
.electronic-style {
  margin-left: 100px;
}
.msg-link-icon {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: white;
}
.msg-link-badge {
  margin: 15px 25px;
}
.msg-link-badge /deep/ .el-badge__content {
  height: 14px;
  line-height: 14px;
}
/**ccwgq 右上角下拉字体保持统一  start */
/deep/ .el-dropdown-menu__item {
  * {
    font-size: 13px;
  }
}
/deep/ .el-dropdown {
  line-height: 0px !important;
}

.button-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: fixed;
  bottom: 80px;
  right: 50px;
  padding-left: 15px;
  padding-top: 10px;
  cursor: pointer;
  opacity: 0.7;
  z-index: 9999;
}
.btn-bg-img {
  width: 60px;
  height: 60px;

  background-size: cover;
  background-color: transparent;
  border-radius: 50%;
  // border: 2px solid #2761ff;
  background: url('../assets/img/remind.png') no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  border: none;
}
.button-box:hover {
  color: white;
  opacity: 1;
}

.font-box {
  width: 80px;
  color: #3193ef;
  text-align: center;
}
</style>