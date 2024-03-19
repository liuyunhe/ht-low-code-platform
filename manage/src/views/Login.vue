<template>
  <el-container :style="backStyle">
    <el-header height="30px">
      <div class="logo-container" v-if="!showTenant">
        <!-- <i :class="isIeExplorer?'icon-hotent-H icon-hotent-H-ie':'icon-hotent-H icon-hotent-H-c'" /> -->
        <span class="pre-word">O</span>
        <span class="tail-word">PEN UNION</span>
        <el-divider class="logo-divider" direction="vertical"></el-divider>
        <span class="system-name">{{ name }}</span>
      </div>
      <div class="logo-container" v-if="showTenant">
        <a class="logo-link" v-if="showLogo">
          <img :src="logo" style="margin-top: 0; height: 48px" />
        </a>
        <!-- <i :class="isIeExplorer?'icon-hotent-H icon-hotent-H-ie':'icon-hotent-H icon-hotent-H-c'" v-if="!showLogo"/> -->
        <span class="pre-word" v-if="!showLogo">O</span>
        <span class="tail-word" v-if="!showLogo">PEN UNION</span>
        <el-divider class="logo-divider" direction="vertical"></el-divider>
        <span class="system-name">{{ companyName }}</span>
      </div>
      <!-- <div class="site-div">
        <a href="https://www.nesc.cn/" tabindex="-1">
          <i class="icon-guanwang"></i>东证官网
        </a>
      </div> -->
    </el-header>
    <el-main>
      <div class="login-card__container fullheight">
        <el-card shadow="always" class="login-card">
          <div :style="totemStyle" class="totem-div"></div>
          <div class="login-div">
            <el-form
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
              <!--              <el-alert v-if="responseError" :title="responseError" type="error" :closable="false"></el-alert>-->
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
          </div>
        </el-card>
      </div>
    </el-main>
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
          <img src="@/assets/img/filings.png" style="float:left;"/>
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
      logo: '',
      name: '开联企业信息平台',
      showTenant: false,
      showLogo: false,
      companyName: '',
      tenantName: '',
      principal: {
        tenantId: '',
        account: '',
        logintype: '0',
        password: '',
      },
      rules: {
        account: [{validator: checkAccount, trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}],
      },
      responseError: '',
      loading: false,
      backStyle: {
        width: '100%',
        background: `url(${require('@/assets/img/back.jpg')}) center / 100% auto no-repeat`,
      },
      totemStyle: {
        width: '300px',
        height: '320px',
        float: 'left',
        background: `#1975FF url(${require('@/assets/img/totem.png')}) center / 100% auto no-repeat`,
      },
      isIeExplorer: false,
    }
  },
  mounted() {
    //获取租户信息
    // let tenant = this.tenant?this.tenant:'platform';
    /* let tenant =
      this.tenant && this.tenant != null && this.tenant != 'null' && this.tenant != 'login'
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
    //if(tenant){
    let url = '${uc}/uc/tenantManage/v1/getTenantByCode?code=' + tenant
    let _this = this
    this.$http.get(url).then((resp) => {
      if (resp.data) {
        let tenantManage = resp.data
        _this.showTenant = true
        _this.companyName = tenantManage.name
        if (tenant != 'platform') {
          _this.principal.tenantId = resp.data.id
        }
        if (tenantManage.ico) {
          let ico = JSON.parse(tenantManage.ico)
          if (ico && ico.length > 0) {
            _this.showLogo = true
            _this.logo =
              window.context.portal +
              '/system/file/v1/getLogoFile?logoType=manage&tenantId=' +
              tenantManage.id
          }
        }
      }
    })
    //}else{
    //不是租户
    //this.sysSetting();
    //}
  },
  methods: {
    //获取系统默认配置 系统Logo、名称
    sysSetting() {
      const _this = this
      let url =
        window.context.portal + '/sys/sysProperties/v1/getDecryptBySysSetting'
      this.$http.get(url).then((response) => {
        if (response && response.data && response.data.value) {
          _this.showTenant = true
          let sysSettingData = JSON.parse(response.data.value)
          if (sysSettingData.manageName == '') {
            _this.companyName = _this.name
          } else {
            _this.companyName = sysSettingData.manageName
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
        return cb([])
      }
      let queryFilter = {}
      queryFilter.pageBean = {
        page: 1,
        pageSize: 20,
        total: 0,
        showTotal: true,
      }
      let query = {
        property: 'name_',
        value: queryString,
        group: 'main',
        operation: 'LIKE',
        relation: 'AND',
      }
      if (!queryFilter.querys) {
        queryFilter.querys = []
      }
      queryFilter.querys.push(query)

      this.$http
        .post(`${window.context.uc}/uc/tenantManage/v1/listJson`, queryFilter)
        .then((res) => {
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
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.inputGetFocus()
          this.loading = true
          this.setRouterPath()
          // lyzcw:2-22-09-21 解决重复login问题
          this.$route.query.redirect = this.$route.query.redirect=='/login'?'/home':this.$route.query.redirect
          this.$store
            .dispatch('login/loginByPrincipal', this.principal)
            .then((loginStatus) => {
              this.loading = false
              if (loginStatus && loginStatus == true) {
                this.$store.dispatch('menu/actionMenus').then((data) => {
                  this.$router.push({
                    path: this.$route.query.redirect
                      ? this.$route.query.redirect
                      : '/',
                  })
                })
              } else if (loginStatus == false) {
                this.$router.push({
                  name: 'resetPwdView',
                  params: {account: this.principal.account},
                })
              }
            })
            .catch((msg) => {
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
    inputGetFocus() {
      this.responseError = ''
    },
    resetForm(formName) {
      this.responseError = ''
      this.$refs[formName].resetFields()
    },
  },
  created() {
    let USER_AGENT = navigator.userAgent.toLowerCase()
    let isChrome = /.*(chrome)\/([\w.]+).*/
    if (!isChrome.test(USER_AGENT)) {
      this.isIeExplorer = true
    }
  },
  components: {},
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.login-card__container {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -o-box;
  display: flexbox;
  display: -webkit-flex; /* Safari */
  display: flex;
  justify-content: center;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}
.login-card{
  height: 320px!important;
}
.login-card{
  /deep/ .el-card__body{
    display: flex;
  }
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
  width: 600px;
  height: 320px;
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
}

.welcome-title {
  margin-top: 40px;
  font-size: 18px;
  margin-bottom: 20px;
}

.copyright {
  color: #999;
  font-size: 13px;
  text-align: center;
}

>>> .el-card__body {
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
</style>
