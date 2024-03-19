<template>
  <div class="container">
    <div class="login-box">
      <div class="login-title"><strong>智慧公用服务一张网</strong></div>
      <van-row type="flex" justify="center">
        <van-col span="18" class="login-col">
          <div class="logo"><img src="../assets/login/normal.png" alt /></div>
          <van-form ref="principal">
            <van-field
              size="large"
              v-model="principal.account"
              placeholder="请输入账号"
              name="账号"
              label="账号"
              clearable
            />
            <van-field
              size="large"
              v-model="principal.password"
              :type="passwordType"
              name="密码"
              label="密码"
              clearable
              :right-icon="
                this.passwordType === 'text' ? 'closed-eye' : 'eye-o'
              "
              @click-right-icon="passwordIconClick()"
              placeholder="请输入密码"
            />
            <van-cell center title="记住密码">
              <template #right-icon>
                <van-switch v-model="rememberPassword" size="24" />
              </template>
            </van-cell>

            <div style="margin: 16px;">
              <van-button
                block
                :loading="loading"
                type="info"
                @click="submitForm('principal')"
                >{{ $t('login.login') }}</van-button
              >
            </div>
          </van-form>
        </van-col>
      </van-row>
    </div>
    <div class="copyright">Copyright © 版权所有 开联软件 2021</div>
  </div>
</template>
<script>
import {
  Row,
  Col,
  Form,
  Field,
  Button,
  Notify,
  Switch,
  Cell,
  CellGroup
} from 'vant'
import utils from '@/utils.js'
export default {
  name: 'login',
  props: ['tenant'],
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [Notify.name]: Notify,
    [Switch.name]: Switch,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      passwordType: 'password',
      tenantName: '',
      principal: {
        account: '',
        password: '',
        tenantId: ''
      },
      loading: false,
      isMobile: false,
      rememberPassword: false
    }
  },
  created() {
    this.initLoginInfo()
  },
  methods: {
    passwordIconClick() {
      this.passwordType === 'text'
        ? (this.passwordType = 'password')
        : (this.passwordType = 'text')
    },
    initLoginInfo() {
      let accountBase = localStorage.getItem('login_account')
      if (accountBase && typeof accountBase != 'undefined') {
        this.principal.account = Base64.decode(accountBase)
      }
      let rememberPassword = localStorage.getItem('login_rememberPassword')
      if (rememberPassword == true || rememberPassword === 'true') {
        this.rememberPassword = true
        let pwdBase = localStorage.getItem('login_pwd')
        if (pwdBase && typeof pwdBase != 'undefined') {
          this.principal.password = Base64.decode(pwdBase)
        }
      }
    },
    setRouterPath() {
      this.$store.dispatch('login/actionLoginAccount', this.principal.account)
      localStorage.setItem(
        this.principal.account + 'loginRoutePath',
        this.$route.path
      )
    },
    submitForm(formName) {
      let _this = this
      if (!this.principal.account) {
        Notify({type: 'warning', message: '请输入账号'})
        return
      }
      if (!this.principal.password) {
        Notify({type: 'warning', message: '请输入密码'})
        return
      }
      this.loading = true
      this.setRouterPath()
      this.$store
        .dispatch('login/loginByPrincipal', this.principal)
        .then(() => {
          this.loading = false
          localStorage.setItem(
            'login_account',
            Base64.encode(_this.principal.account)
          )
          localStorage.setItem('login_rememberPassword', _this.rememberPassword)
          if (_this.rememberPassword) {
            localStorage.setItem(
              'login_pwd',
              Base64.encode(_this.principal.password)
            )
          } else {
            localStorage.setItem('login_pwd', '')
          }
          //登陆成功后，判断缓存中是否有openid，有则绑定到user的weixin属性中，
          //绑定成功后务必删除缓存的openid以免多次绑定。另：openid在wcoa_jump.vue跳转时写入缓存的。
          let openid = sessionStorage.getItem('openid')
          if (openid) {
            this.$http
              .get(
                `${
                  window.context.uc
                }/api/user/v1/users/postUserByAccount?account=${
                  this.principal.account
                }&openid=${openid}`
              )
              .then(res => {
                if (res.data.state) {
                  sessionStorage.removeItem('openid')
                }
              })
          }
          //若在手机app环境中
          if (window.plus) {
            //把设备信息绑定到用户中，以便进行app消息推送
            let clientInfo = plus.push.getClientInfo()
            clientInfo &&
              this.$http
                .post(
                  `${window.context.uc}/api/user/v1/user/updateClientInfo`,
                  {
                    account: this.principal.account,
                    clientToken: clientInfo.token,
                    clientId: clientInfo.clientid
                  }
                )
                .then(res => {})
            //把token传给app应用进行保存
            window.uni &&
              uni.postMessage({
                data: {
                  action: 'login',
                  token: _this.$store.state.login.currentUser.token
                }
              })

            setTimeout(() => {
              //检查软件更新
              utils.appUpdate()
            }, 5000)
          }
          // lyzcw:2-22-09-21 解决重复login问题
          this.$route.query.redirect = this.$route.query.redirect=='/login'?'/home':this.$route.query.redirect
          this.$router.push({
            path: this.$route.query.redirect ? this.$route.query.redirect : '/'
          })
        })
        .catch(msg => {
          this.loading = false
          if (msg.startsWith('timeout of')) {
            msg = '登录超时'
            Notify({type: 'danger', message: msg})
          }
        })
    }
  },
  mounted() {
    localStorage.setItem('loginRoutePath', this.$route.path)
    //获取租户信息
    //let tenant = this.tenant?this.tenant:'platform';
    let tenant =
      this.tenant &&
      this.tenant != null &&
      this.tenant != 'null' &&
      this.tenant != undefined && this.tenant != 'login'
        ? this.tenant
        : 'tacj'
    if (tenant && tenant != 'platform') {
      let url = '${uc}/uc/tenantManage/v1/getTenantByCode?code=' + tenant
      let _this = this
      this.$http.get(url).then(resp => {
        if (resp.data) {
          _this.principal.tenantId = resp.data.id
        }
      })
    }
  }
}
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
  background: url('../assets/login/login-back.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-attachment: fixed;
}
.login-box {
  position: relative;
  top: 50%; /*偏移*/
  transform: translateY(-70%);
}
.login-title {
  margin: 0 auto 30px auto; /*水平居中*/
  text-align: center;
  font-size: 2rem;
  color: #fff;
}
.van-row .login-col {
  height: 15rem;
  background-color: #fff;
  border-radius: 5px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: 400px;
}
.logo {
  width: 4rem;
  height: 6rem;
  margin: 0 auto 0 auto; /*水平居中*/
  position: relative;
  top: -15px;
}
img {
  width: 4rem;
}
.copyright {
  color: #afacac;
  font-size: 0.7rem;
  position: fixed;
  bottom: 2rem;
  width: 100%;
  text-align: center;
}
</style>
