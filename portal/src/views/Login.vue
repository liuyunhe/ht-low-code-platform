<template>
  <el-container :style="backStyle">
    <el-header height="30px">
      <div class="logo-container" v-if="!showTenant">
        <!-- <i
          :class="
            isIeExplorer
              ? 'icon-hotent-H icon-hotent-H-ie'
              : 'icon-hotent-H icon-hotent-H-c'
          "
        /> -->
        <span class="pre-word">O</span> <span class="tail-word">PEN UNION</span>
        <el-divider class="logo-divider" direction="vertical"></el-divider>
        <span class="system-name">{{ name }}</span>
      </div>
      <div class="logo-container" v-if="showTenant">
        <a class="logo-link" v-if="showLogo">
          <img :src="logo" style="margin-top: 0; height: 48px" />
        </a>
        <!-- <i
          :class="
            isIeExplorer
              ? 'icon-hotent-H icon-hotent-H-ie'
              : 'icon-hotent-H icon-hotent-H-c'
          "
          v-if="!showLogo"
        /> -->
        <span class="pre-word" v-if="!showLogo">O</span>
        <span class="tail-word" v-if="!showLogo">PEN UNION</span>
        <el-divider class="logo-divider" direction="vertical"></el-divider>
        <span class="system-name">{{ companyName }}</span>
      </div>
      <!-- TODO 武德 官网可配置 -->
      <!-- <div class="site-div">
        <a href="https://www.nesc.cn/">
          <i class="icon-guanwang"></i>东证官网
        </a>
      </div> -->
    </el-header>
    <el-main>
      <div class="login-card__container fullheight">
        <el-card shadow="always" class="login-card">
          <div :style="totemStyle" class="totem-div"></div>
          <div class="login-div">
            <!-- 切换登录方式--二维码--账号 -->
            <div
              v-if="!showQRCode"
              class="btn-qrcode"
              @click="
                showQRCode = true
                generateQRCode()
              "
            ></div>
            <div
              v-else
              class="btn-login"
              @click="
                showQRCode = false
                handleClickBtnLogin()
              "
            >
              使用账号登录
            </div>
            <!-- 账号登录 -->
            <el-form
              v-if="!showQRCode"
              style="margin: 20px"
              :model="principal"
              :rules="rules"
              ref="principal"
            >
              <div class="welcome-title">欢迎登录</div>
              <el-form-item prop="account">
                <el-input
                  size="medium"
                  clearable
                  prefix-icon="icon-account"
                  v-model="principal.account"
                ></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  show-password
                  clearable
                  prefix-icon="icon-password"
                  @keyup.enter.native="submitForm('principal')"
                  @focus="inputGetFocus"
                  size="medium"
                  v-model="principal.password"
                ></el-input>
              </el-form-item>
              <!-- ccwgq 2022-4-2 增加登录类型判断 -->
              <el-form-item prop="login_type" style="text-align: center">
                <el-radio-group v-model="principal.logintype">
                  <el-radio :label="'0'">本系统登录</el-radio>
                  <el-radio :label="'1'">统一认证登录</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-alert v-if="responseError" :title="responseError" type="error" :closable="false"></el-alert>
              <el-form-item style="text-align: center; margin-top: 10px">
                <el-button
                  size="medium"
                  type="primary"
                  @focus="inputGetFocus"
                  @click="submitForm('principal')"
                  :loading="loading"
                  >登录</el-button
                >
                <el-button
                  size="medium"
                  @click="resetForm('principal')"
                  :disabled="loading"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
            <!-- 二维码登录 -->
            <div v-else class="login-type-scan">
              <div class="welcome-title">欢迎登录</div>
              <div class="qr-code">
                <img v-if="qrcodeImg" :src="qrcodeImg" alt="" />
                <div class="scan-mask" v-if="codeStatus === 2">
                  <div class="logo-scan-scuess"></div>
                  <div class="scan-sucees-text">扫码成功</div>
                </div>
              </div>

              <div class="login-qrcode-info">
                <p class="login-qrcode-desc">请使用微信小程序扫一扫登录</p>
                <p
                  v-if="codeStatus === 3"
                  class="login-qrcode-desc"
                  style="color:red"
                >
                  {{ loginErrDesc }}
                </p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-main>
    <!-- //TODO 武德 版权信息年份改为动态获取 -->
    <!-- <el-footer class="copyright">Copyright © 版权所有 开联软件 2021</el-footer> -->
    <el-footer class="copyright">
      <div style="width: 300px; margin: 0 auto; ">
        <a
          target="_blank"
          href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37090202001269"
          style="
            display: inline-block;
            text-decoration: none;
            height: 20px;
            line-height: 20px;
          "
        >
          <img src="@/assets/img/filings.png" style="float:left;" />
          <p
            style="
              float: left;
              height: 20px;
              line-height: 20px;
              margin: 0px 0px 0px 5px;
              color: #939393;
            "
          >
            鲁公网安备 37090202001269号
          </p>
        </a>
        <a
          target="_blank"
          href="https://beian.miit.gov.cn/#/Integrated/index"
          style="
            display: inline-block;
            text-decoration: none;
            height: 20px;
            line-height: 20px;
          "
        >
          <p
            style="
              float: left;
              height: 20px;
              line-height: 20px;
              margin: 0px 0px 0px 5px;
              color: #939393;
            "
          >
            鲁ICP备2023019823号
          </p>
        </a>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
//import langSelect from '@/components/langSelect'
//import VueQr from 'vue-qr'
export default {
  name: 'login',
  props: ['tenant'],
  data() {
    var checkAccount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入账号'))
      }
      if (/^[a-zA-Z0-9_-]{2,20}$/.test(value)) {
        return callback()
      } else {
        return callback(new Error('账号格式不符合规范'))
      }
    }
    return {
      logoSrc: require('../assets/logo.png'),
      codeUrl: `${window.location.origin}/mobilevue`,
      qrcodeImg: '', // 二维码图片base64
      qrCode: '', // 二维码图片名称
      logo: '',
      name: '开联企业信息平台',
      showTenant: false,
      showLogo: false,
      companyName: '',
      tenantName: '',
      principal: {
        account: '',
        password: '',
        //ccwgq 2022-04-02 增加登录类型判断
        // 0--本系统登录  1--统一认证登录
        logintype: '0'
      },
      rules: {
        account: [{validator: checkAccount, trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}]
      },
      responseError: '',
      loading: false,
      backStyle: {
        width: '100%',
        background: `url(${require('@/assets/img/back.jpg')}) center / 100% auto no-repeat`
      },
      totemStyle: {
        width: '300px',
        height: '320px',
        float: 'left',
        background: ` url(${require('@/assets/img/totem.png')}) center / 100% auto no-repeat`
        // zIndex: -1,
      },
      isIeExplorer: false,
      isShowTotem: true,
      showQRCode: false,
      codeStatus: 1, // 1- 未扫码 2-扫码通过 3-过期
      effectiveTime: 180, // 有效时间
      qrCodeTimer: null, // 有效时长计时器
      isCheckingQRcode: false,
      loginErrDesc: ''
    }
  },
  mounted() {
    //获取租户信息
    // let tenant = this.tenant ? this.tenant : "platform";
    /* let tenant =
      this.tenant &&
      this.tenant != null &&
      this.tenant != 'null' &&
      this.tenant != 'login'
        ? this.tenant
        : 'tacj' */
    let tenant
    if (this.tenant) {
      tenant = this.tenant
    } else {
      if (process.env.VUE_APP_TENANT) {
        tenant = process.env.VUE_APP_TENANT
      } else {
        tenant = 'platform'
      }
    }
    // if(tenant){
    let url = '${uc}/uc/tenantManage/v1/getTenantByCode?code=' + tenant
    let _this = this
    this.$http.get(url).then(resp => {
      if (resp.data) {
        let tenantManage = resp.data
        _this.showTenant = true
        _this.companyName = tenantManage.nameFront
        if (tenant != 'platform') {
          _this.principal.tenantId = resp.data.id
        }
        if (tenantManage.ico) {
          let ico = JSON.parse(tenantManage.ico)
          if (ico && ico.length > 0) {
            _this.showLogo = true
            // TODO 武德 配置logo功能的后盾优化后改为正常读取
            // 用户端登录页因为是白底，借用管理端Logo图片，改为logoType=manage
            _this.logo =
              window.context.portal +
              '/system/file/v1/getLogoFile?logoType=manage&tenantId=' +
              tenantManage.id
          }
        }
      }
    })
    // }else{
    //   //不是租户
    //   this.sysSetting();
    // }
  },
  methods: {
    //获取系统默认配置 系统Logo、名称
    sysSetting() {
      const _this = this
      let url =
        window.context.portal + '/sys/sysProperties/v1/getDecryptBySysSetting'
      this.$http.get(url).then(response => {
        if (response && response.data && response.data.value) {
          _this.showTenant = true
          let sysSettingData = JSON.parse(response.data.value)
          if (sysSettingData.frontName == '') {
            _this.companyName = _this.name
          } else {
            _this.companyName = sysSettingData.frontName
          }
          if (sysSettingData.ico.length > 0) {
            let ico = sysSettingData.ico
            _this.showLogo = true
            _this.logo =
              window.context.portal +
              '/system/file/v1/downloadFile?fileId=' +
              ico[0].id
          }
        }
      })
    },
    querySearch(queryString, cb) {
      if (!queryString) {
        cb([])
        return
      }
      let queryFilter = {}
      queryFilter.pageBean = {
        page: 1,
        pageSize: 20,
        total: 0,
        showTotal: true
      }
      let query = {
        property: 'name_',
        value: queryString,
        group: 'main',
        operation: 'LIKE',
        relation: 'AND'
      }
      if (!queryFilter.querys) {
        queryFilter.querys = []
      }
      queryFilter.querys.push(query)

      this.$http
        .post(`${window.context.uc}/uc/tenantManage/v1/listJson`, queryFilter)
        .then(res => {
          // 调用 callback 返回建议列表的数据
          cb(res.data.rows)
        })
    },
    handleSelect(item) {
      this.tenantName = item.name
      this.principal.tenantId = item.id
    },
    setRouterPath() {
      this.$store.dispatch('login/actionLoginAccount', this.principal.account)
      localStorage.setItem(
        this.principal.account + 'loginRoutePath',
        this.$route.path
      )
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.inputGetFocus()
          this.setRouterPath()
          this.loading = true
          this.$store
            .dispatch('login/loginByPrincipal', this.principal)
            .then(loginStatus => {
              this.loading = false
              if (loginStatus && loginStatus == true) {
                //console.log('登陆 ===》', this.$route.query.redirect)
                // lyzcw:2-22-09-21 解决重复login问题
                // this.$route.query.redirect = this.$route.query.redirect=='/login'?'/home':this.$route.query.redirect
                this.$router.push({
                  path:
                    /* this.$route.query.redirect
                    ? this.$route.query.redirect
                    :  */ '/'
                })
              } else if (loginStatus == false) {
                this.$router.push({
                  name: 'resetPwdView',
                  params: {account: this.principal.account}
                })
              }
            })
            .catch(msg => {
              this.loading = false
              if (msg.startsWith('timeout of')) {
                msg = '登录超时'
              }
              this.responseError = msg
            })
        } else {
          return false
        }
      })
    },
    handleClickBtnLogin() {
      clearInterval(this.qrCodeTimer)
      this.qrCodeTimer = null
    },
    // 获取二维码
    generateQRCode() {
      let url = '${uc}/eipx7/opun/uc/qrCode/v1/getQrCode'
      this.$http.get(url).then(resp => {
        if (resp.data && resp.data.state) {
          console.log('getQrCode=====>', resp.data.value)
          this.qrcodeImg = resp.data.value.imageStr
          this.qrCode = resp.data.value.qrCode
          this.getQRCodeStatus()
        } else {
          this.$message.error('获取二维码失败：' + resp.data.message)
        }
      })
    },
    getQRCodeStatus() {
      if (!this.qrCodeTimer) {
        // this.effectiveTime = 180
        this.codeStatus = 1
        this.qrCodeTimer = setInterval(() => {
          // 二维码过期
          // if (this.effectiveTime <= 0) {
          //   this.codeStatus = 3
          //   clearInterval(this.qrCodeTimer)
          //   this.qrCodeTimer = null
          //   return
          // }
          // this.effectiveTime--
          if (!this.isCheckingQRcode) {
            this.checkScanQrCode()
          }
        }, 1000)
      }
    },
    // 刷新二维码
    refreshCode() {
      this.codeStatus = 1
      // this.effectiveTime = 180
      clearInterval(this.qrCodeTimer)
      this.qrCodeTimer = null
      this.generateQRCode()
    },
    // 查询二维码是否被扫
    checkScanQrCode() {
      console.log('checkScanQrCode=====>')
      this.loading = true
      this.isCheckingQRcode = true
      this.$store
        .dispatch('login/loginByQRCode', this.qrCode)
        .then(user => {
          this.loading = false
          this.isCheckingQRcode = false
          if (user.state) {
            if (user.value.loginStatus && user.value.loginStatus == true) {
              localStorage.setItem(
                user.value.account + 'loginRoutePath',
                this.$route.path
              )
              this.$router.push({
                path:
                  /* this.$route.query.redirect
                      ? this.$route.query.redirect
                      :  */ '/'
              })
            } else if (user.value.loginStatus == false) {
              this.$router.push({
                name: 'resetPwdView',
                params: {account: user.value.principal.account}
              })
            }
          } else {
            if (user.message.includes('二维码已过期')) {
              console.log('二维码已过期=>>>>>>')
              this.refreshCode()
            } else if (user.message.includes('二维码被扫未确认')) {
              console.log('二维码被扫未确认=>>>>>>')
              this.codeStatus = 2
            } else {
              if (user.message.includes('二维码还没被扫')) return
              this.loginErrDesc = user.message
              this.codeStatus = 3
            }
          }
        })
        .catch(msg => {
          this.loading = false
          if (msg.startsWith('timeout of')) {
            msg = '登录超时'
          }
          this.responseError = msg
        })
    },
    inputGetFocus() {
      this.responseError = ''
    },
    resetForm(formName) {
      this.responseError = ''
      this.$refs[formName].resetFields()
    },
    onResize() {
      this.isShowTotem = document.body.offsetWidth > 500
      }
  },
  created() {
    let USER_AGENT = navigator.userAgent.toLowerCase()
    let isChrome = /.*(chrome)\/([\w.]+).*/
    if (!isChrome.test(USER_AGENT)) {
      this.isIeExplorer = true
    }
    this.isShowTotem = document.body.offsetWidth > 500
    window.addEventListener('resize', this.onResize)
  },
  destroyed() {
    clearInterval(this.qrCodeTimer)
  },
  components: {
    /* langSelect, VueQr */
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.login-card__container {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -o-box;
  display: -webkit-flex;
  /* Safari */
  display: flex;
  justify-content: center;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  //width:100vh;
}

.logo-container {
  margin-top: 10px;
  display: inline-block;
  margin-left: 30px;
}

.logo-container > i.icon-hotent-H-c {
  font-size: 36px;
  background-image: linear-gradient($--color-secondary, $--color-primary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-right: -5px;
}

.logo-container > i.icon-hotent-H-ie {
  font-size: 36px;
  background-clip: text;
  -webkit-background-clip: text;
  color: $--color-primary;
  margin-right: -5px;
}

.logo-container:hover > i.icon-hotent-H-c {
  background-image: linear-gradient($--color-primary, $--color-secondary);
}

.logo-container > span.pre-word {
  font-size: 26px;
  font-weight: bold;
  color: $--color-primary;
}

.logo-container > span.tail-word {
  font-size: 24px;
  font-weight: bold;
  color: #bdbfc2;
}

.logo-container > .logo-divider {
  margin: 0 25px 11px 25px;
  height: 18px;
}

.logo-container > .system-name {
  color: #666;
  font-weight: bold;
  font-size: 16px;
}

.site-div {
  float: right;

  margin-top: 25px;
  margin-right: 40px;
}

.site-div > a {
  color: #5b9dff;
  font-size: 12px;
  text-decoration: none;
}

.site-div > a > i {
  font-weight: bold;
  margin-right: 5px;
}

.login-card {
  height: 320px !important;
}

.login-card {
  /deep/ .el-card__body {
    display: flex;
  }
}

.totem-div {
  -moz-box-shadow: 2px 2px 5px #999;
  -webkit-box-shadow: 2px 2px 5px #999;
  box-shadow: 2px 2px 5px #999;
}

.login-div {
  width: 300px;
  height: 320px;
  float: right;
  position: relative;
  .btn-qrcode {
    position: absolute;
    top: 0;
    right: 0;
    height: 60px;
    width: 60px;
    overflow: hidden;
    background: url('../assets/img/btn-qrcode.svg') no-repeat 100% 0;
    background-size: 100%;
    cursor: pointer;
  }
  .btn-login {
    width: 100px;
    height: 25px;
    line-height: 25px;
    position: absolute;
    right: 19px;
    top: 21px;
    color: #576b95;
    cursor: pointer;
    text-align: right;
  }

  .login-type-scan {
    margin: 20px;
    .qr-code {
      position: relative;
      margin: 30px auto 20px;
      width: 150px;
      height: 150px;
      img {
        display: block;
        width: 150px;
        height: 150px;
      }
      .scan-mask {
        position: absolute;
        top: 0;
        left: 0;
        text-align: center;
        width: 150px;
        height: 150px;
        background-color: hsla(0, 0%, 100%, 0.96);
        .logo-scan-scuess {
          height: 60px;
          width: 60px;
          overflow: hidden;
          margin: 30px auto 10px;
          background: url('../assets/img/logo-scan-success.svg') no-repeat 100%
            0;
          background-size: 100%;
        }
        .scan-sucees-text {
          text-align: center;
          font-size: 16px;
        }
      }
    }
    .login-qrcode-info {
      text-align: center;
      margin: 9px 0 10px;
      .login-qrcode-desc {
        color: #7e8081;
      }
    }
  }
}

.welcome-title {
  margin-top: 20px;
  font-size: 18px;
  margin-bottom: 20px;
}

.copyright {
  color: #999;
  font-size: 13px;
  text-align: center;
}

.login-card /deep/ div {
  padding: 0;
}

.login-card /deep/ .el-alert__content {
  padding: 5px;
}

.el-main {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile_img_wrap {
  display: none;
  position: absolute;
  top: -170px;
  right: -40px;

  .img_item {
    width: 160px;
  }
}

.btn_wrap {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.mobile_btn {
  position: relative;
  margin-top: -10px;
  margin-right: 20px;

  &:hover {
    cursor: pointer;
    color: #409eff;

    .mobile_img_wrap {
      display: block;
    }
  }
}

.login_btn {
  margin: 0 10px 0 20px;
}

.lang_change {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  margin-right: 27px;
}

.mobile__text {
  color: $--color-text-regular;
}

// .close-icon{
//   padding-right: 10px;
//   font-size: 14px;
//   &:hover{
//     cursor: pointer;
//   }
// }
// .password-icon{
//   font-size: 16px;
//   margin-top:12px;
//   &:hover{
//     cursor: pointer;
//   }
// }
// .icon-icon-eye-close{
//   font-size: 14px;
// }
</style>
