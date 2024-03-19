<template>
  <el-header height="48px">
    <div class="header-container">
      <div class="flex">
        <div
          class="navbar-menu-collapse"
          @click.capture="handleMenuCollapse"
          :title="menuShow ? '隐藏目录':'显示目录'"
        >
          <i :class="{'icon-cebianlan-guan':menuShow, 'icon-cebianlan-kai':!menuShow}" />
        </div>
        <router-link to="home" style="text-decoration: none;">
          <div class="logo-container" v-if="!showLogo">
              <!-- <i :class="isIeExplorer?'icon-hotent-H icon-hotent-H-ie':'icon-hotent-H icon-hotent-H-c'" /> -->
              <span class="pre-word">O</span>
              <span class="tail-word">PEN UNION</span>
          </div>
          <div class="logo-container" v-if="showLogo">
              <a class="logo-link">
                <img :src="logo" style="margin-top: 0; height:48px;" />
              </a>
          </div>
        </router-link>
      </div>
      <div class="flex header-right">
        <el-autocomplete
          popper-class="my-autocomplete"
          size="small"
          class="inline-input"
          v-model="searchWork"
          :fetch-suggestions="querySearch"
          placeholder="搜索菜单"
          :trigger-on-focus="false"
          @select="handleSelect"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
          <template slot-scope="{ item }">
            <div class="alias">{{item.name }}({{ item.alias}})</div>
          </template>
        </el-autocomplete>
        <el-link :underline="false" :href="frontUrl" target="_blank">
          <i class="icon-monitor top-link-icon" />
          访问前端
        </el-link>
        <el-link
          :underline="false"
          style="margin-top: 3px"
          @click="handleScreenFull"
          :title="isScreenFull? '退出全屏':'全屏'"
        >
          <i v-if="!isScreenFull" class="icon-fullscreen top-link-icon"></i>
          <i v-if="isScreenFull" class="icon-restore top-link-icon"></i>
        </el-link>

        <el-popover popper-class="header-popper" :visible-arrow="false" trigger="hover">
          <el-link slot="reference" :underline="false"><i class="el-icon-refresh top-link-icon"></i></el-link>
          <template>
            <ul class="user-link-ul clear-cache">
              <li  @click="clearCache('uc','eip:uc')">清除用户模块缓存</li>
              <li  @click="clearCache('bpmModel','eip:bpm')">清除流程模块缓存</li>
              <li  @click="clearCache('form','eip:form')">清除表单模块缓存</li>
              <li  @click="clearCache('portal','eip:i18n')">清除国际化模块缓存</li>
              <li  @click="clearCache('portal','eip:sys')">清除系统设置缓存</li>
              <li  @click="clearCache('','eip')">清除所有缓存</li>
            </ul>
          </template>
        </el-popover>

        <lang-select />
        <el-popover popper-class="header-popper" :visible-arrow="false" width="250" trigger="hover">
          <HtAvatar slot="reference" :user="currentUser" />
          <template>
            <div>
              <div class="flex user-box-header">
                <HtAvatar style="margin-right: 15px;" :user="currentUser" />
                <div>
                  <h3
                    v-if="$store.state.login.currentUser"
                    style="margin: 5px 0;"
                  >{{$store.state.login.currentUser.username}}</h3>
                </div>
              </div>
              <el-divider class="user-box-divider"></el-divider>
              <div>
                <ul class="user-link-ul">
                  <li @click="openInfoDialog">
                    <i class="el-icon-user"></i>
                    个人信息
                  </li>
                  <li @click="openResetPwdDialog">
                    <i class="icon-set"></i>
                    修改密码
                  </li>
                  <li @click="handleStyleSettingDialog">
                    <i class="el-icon-monitor"></i>
                    风格设置
                  </li>
                </ul>
              </div>
              <div class="flex user-box-logout" @click="logout">
                <el-link :underline="false">退出系统</el-link>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>

    <ht-sidebar-dialog
      width="28%"
      title="风格设置"
      :visible="styleSettingDialogVisible"
      :before-close="handleStyleSettingDialogClose"
    >
      <el-form :model="styleSetting" style="margin-left: -30px;">
        <ht-form-item label="标签页风格" label-width="100px">
          <el-radio-group v-model="styleSetting.tabsStyle.tabType">
            <el-radio-button label="card">选项卡样式</el-radio-button>
            <el-radio-button label>默认样式</el-radio-button>
            <el-radio-button label="border-card">卡片化</el-radio-button>
            <el-radio-button label="menuSetting">菜单配置</el-radio-button>
          </el-radio-group>
        </ht-form-item>
      </el-form>
    </ht-sidebar-dialog>

    <ht-sidebar-dialog
      title="查看个人信息"
      :visible="infoDialogVisible"
      width="28%"
      :before-close="handleStyleSettingDialogClose"
    >
      <el-form
        v-if="currentUser && currentUser.user"
        :inline="true"
        ref="form"
        label-width="80px"
        size="mini"
      >
        <el-form-item label="用户名称" style="width: 50%;">
          <span class="content_span">{{currentUser.user.fullname}}</span>
        </el-form-item>
        <el-form-item label="用户账号">
          <span class="content_span">{{currentUser.user.account}}</span>
        </el-form-item>
        <el-form-item label="手机号码" style="width: 50%;">
          <span class="content_span">{{currentUser.user.mobile}}</span>
        </el-form-item>
        <el-form-item label="邮箱地址">
          <span class="content_span">{{currentUser.user.email}}</span>
        </el-form-item>
        <el-form-item label="用户性别" style="width: 50%;">
          <span class="content_span">{{currentUser.user.sex}}</span>
        </el-form-item>
        <el-form-item label="用户状态">
          <span
            class="content_span"
          >{{currentUser.user.status == '1'?'正常':currentUser.user.status == '0'?'禁用':currentUser.user.status == '-1'?'未激活':'离职'}}</span>
        </el-form-item>

        <el-form-item label="家庭地址" style="width: 100%;">
          <span class="content_span">{{currentUser.user.address}}</span>
        </el-form-item>
        <el-form-item style="width: 100%;" label="所属角色">
          <template v-for="name in currentUser.role">
            <el-tag type="warning" size="small" :key="name" v-if="name">{{name}}</el-tag>
          </template>
        </el-form-item>
        <el-form-item style="width: 100%;" label="所属岗位">
          <el-tooltip
            :content="post.pathName"
            placement="top"
            :key="post.postId"
            v-for="post in currentUser.post"
          >
            <el-tag type="success" size="small">{{post.postName}}</el-tag>
          </el-tooltip>
        </el-form-item>
        <el-form-item style="width: 100%;" label="所属组织">
          <el-tooltip
            :content="org.pathName"
            placement="top"
            :key="org.orgId"
            v-for="org in currentUser.org"
          >
            <el-tag size="small">{{org.orgName}}</el-tag>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </ht-sidebar-dialog>

    <ht-sidebar-dialog
      title="修改密码"
      :visible.sync="modifyPwdDialogVisible"
      :close-on-click-modal="false"
      width="28%"
      id="modlfy-dialog"
      :before-close="handleStyleSettingDialogClose"
    >
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdForm" label-width="120px" size="mini">
        <el-form-item label="旧密码" prop="old">
          <el-input type="password" v-model="pwdForm.old" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="new">
          <el-input type="password" placeholder="请输入新密码" v-model="pwdForm.new"></el-input>
        </el-form-item>
        <el-form-item label="重复新密码" prop="newRepeat">
          <el-input type="password" placeholder="请再次输入新密码" v-model="pwdForm.newRepeat"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" style="text-align: center;bottom: auto;">
        <el-button size="small" type="primary" @click="submitForm()">确认</el-button>
        <el-button size="small" @click="modifyPwdDialogVisible = false">取 消</el-button>
      </span>
    </ht-sidebar-dialog>
  </el-header>
</template>

<script>
import HtAvatar from "@/components/common/HtAvatar.vue";
import LangSelect from "@/components/lang/LangSelect.vue";
import screenfull from "screenfull";
import { mapState } from "vuex";
import { Base64 } from "js-base64";
import req from "@/request.js";

export default {
  name: "navigator",
  components: { HtAvatar, LangSelect },
  props: ["menuShow"],
  data() {
    var validateNew = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      }
      let config = this.pwdStrategy;
      if (config.enable == 1) {
        let pwdRule = config.pwdRule;
        let pwdLength = config.pwdLength;
        if (pwdRule) {
          if (value.length < pwdLength) {
            callback(new Error("新密码长度至少为" + pwdLength));
          } else if (pwdRule == 2) {
            var re = new RegExp("(?=.*[0-9])(?=.*[a-zA-Z])");
            if (!re.test(value)) {
              callback(new Error("新密码必须包含数字、字母"));
            } else {
              callback();
            }
          } else if (pwdRule == 3) {
            var re = new RegExp("(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])");
            if (!re.test(value)) {
              callback(new Error("新密码必须包含数字、字母、特殊字符"));
            } else {
              callback();
            }
          } else if (pwdRule == 4) {
            var re = new RegExp(
              "(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9])"
            );
            if (!re.test(value)) {
              callback(new Error("新密码必须包含数字、大小字母、特殊字符"));
            } else {
              callback();
            }
          } else {
            callback();
          }
        }
      } else {
        if (value.length < 6) {
          callback(new Error("新密码长度至少为6"));
        } else {
          callback();
        }
      }
    };
    var validateold = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入旧密码"));
      } else {
        callback();
      }
    };
    var validateNewReapeat = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else {
        callback();
      }
    };
    return {
      logo: "",
      showLogo:true,
      isScreenFull: false,
      styleSettingDialogVisible: false,
      styleSetting: {
        tabsStyle: {
          tabPosition: "top",
          tabType: "border-card"
        },
        elementUI: {
          theme: "day-theme"
        }
      },
      searchWork: "",
      searchMenus: [],
      infoDialogVisible: false,
      modifyPwdDialogVisible: false,
      pwdForm: {
        old: "",
        new: "",
        newRepeat: ""
      },
      pwdRules: {
        old: [{ validator: validateold, trigger: "blur" }],
        new: [{ validator: validateNew, trigger: "blur" }],
        newRepeat: [{ validator: validateNewReapeat, trigger: "blur" }]
      },
      isIeExplorer:false
    };
  },
  computed: {
    ...mapState({
      menus: state => state.menu.menus,
      currentUser: state => state.user.currentUserDetail,
      token: state => state.login.currentUser.token,
      frontUrl: function() {
        if (
          this.currentUser &&
          this.currentUser.user &&
          this.currentUser.user.account &&
          (!window.ssoConfig.mode || window.ssoConfig.mode == "jwt")
        ) {
          return `${window.context.front}?token= ` + this.token;
        } else {
          return `${window.context.front}`;
        }
      },
      pwdStrategy: state => state.user.pwdStrategy
    })
  },
  watch: {
    styleSetting: {
      handler: function(val, oldval) {
        let str = JSON.stringify(val);
        localStorage.setItem("styleSetting", str);
        this.$store.dispatch(
          "styleSetting/actionStyleSetting",
          JSON.parse(str)
        );
      },
      deep: true //对象内部的属性监听，也叫深度监听
    }
  },
  methods: {
    clearCache(model,key) {
      let this_ = this
      this.$confirm('是否确认清除缓存数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //分服务部署模式下，清除所有缓存。调用各个微服务的清除缓存方法
        if (!model && key=='eip') {
          if (window.context.uc != window.context.portal) {
            this_.$http.get('${uc}/base/tools/v1/clearCacheByKey?key='+key);
            this_.$http.get('${portal}/base/tools/v1/clearCacheByKey?key='+key);
            this_.$http.get('${form}/base/tools/v1/clearCacheByKey?key='+key);
            this_.$http.get('${bpmRunTime}/base/tools/v1/clearCacheByKey?key='+key);
            this_.$http.get('${bpmModel}/base/tools/v1/clearCacheByKey?key='+key).then(() => {
              this_.$message.success('操作成功')
            })
          }else {
            this_.$http.get('${portal}/base/tools/v1/clearCacheByKey?key='+key).then(() => {
              this_.$message.success('操作成功')
            })
          }
        }else{
          this_.$http.get('${'+model+'}/base/tools/v1/clearCacheByKey?key='+key).then(() => {
            this_.$message.success('操作成功')
          })
        }
      })
    },
    submitForm() {
      let this_ = this;
      this.$refs["pwdForm"].validate(valid => {
        if (valid) {
          this.$http
            .post("${uc}/api/user/v1/user/changUserPsd", {
              oldPwd: this.pwdForm.old,
              newPwd: this.pwdForm.new
            })
            .then(resp => {
              let data = resp.data;
              if (data && data.state) {
                this.modifyPwdDialogVisible = false;
                this.$alert('修改密码成功, 请使用新密码重新登录。', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {
                    //退出登录
                    this_.logout();
                  }
                });
              }
            });
        }
      });
    },
    openInfoDialog() {
      this.infoDialogVisible = true;
    },
    openResetPwdDialog() {
      this.$store.dispatch("user/getDefPwdStrategy");
      this.modifyPwdDialogVisible = true;
      if (this.$refs["pwdForm"]) {
        this.$refs["pwdForm"].resetFields();
      }
    },

    handleMenuCollapse() {
      this.$emit("update:menuShow", !this.menuShow);
    },
    handleMenuCollapse() {
      this.$emit("update:menuShow", !this.menuShow);
    },
    logout() {
      let loginRouthPath =
        localStorage.getItem(
          this.$store.state.login.currentUser.account + "loginRoutePath"
        ) || "/login";
      this.$store.dispatch("menu/actionMenusEmpty");
      this.$store.dispatch("login/logoutAndCleanUp").then(() => {
        switch (window.ssoConfig.mode) {
          case "cas":
          case "oauth":
            window.sessionStorage.removeItem("currentUser");
            window.location.href =
              window.ssoConfig.logout +
              "?service=" +
              window.location.href.split("?")[0];
            break;
          default:
            this.$router.push({
              path: loginRouthPath
            });
            break;
        }
      });
    },
    handleScreenFull(type) {
      if (!screenfull.isEnabled) {
        this.$message({
          message: "不支持全屏",
          type: "warning"
        });
        return false;
      }
      screenfull.toggle(document.getElementsByTagName("body")[0]);
      this.isScreenFull = !this.isScreenFull;
    },
    handleStyleSettingDialog() {
      let styleSetting = localStorage.getItem("styleSetting");
      if (styleSetting && styleSetting != "null") {
        this.styleSetting = JSON.parse(styleSetting);
      }
      this.styleSettingDialogVisible = true;
    },
    handleStyleSettingDialogClose() {
      this.styleSettingDialogVisible = false;
      this.infoDialogVisible = false;
      this.modifyPwdDialogVisible = false;
    },
    querySearch(queryString, cb) {
      // 查询出二级三级的菜单
      let menus = [];
      menus = [...this.menus];
      if (queryString) {
        this.searchMenus = [];
        this.preFilterMenus(this.menus, queryString);
      } else {
        this.searchMenus = menus;
      }
      // 调用 callback 返回建议列表的数据
      this.searchMenus = this.searchMenus.unique("alias");
      cb(this.searchMenus);
    },
    preFilterMenus(menus, queryString) {
      if (menus instanceof Array) {
        menus.forEach(x => {
          this.filterMenus(x, queryString);
        });
      } else {
        this.filterMenus(menus, queryString, true);
      }
    },
    filterMenus(x, queryString, isComponent) {
      if (x.children) {
        let r = x.children.filter(menu => {
          this.preFilterMenus(menu, queryString);
          return (
            menu.name.toLowerCase().indexOf(queryString.toLowerCase()) != -1 ||
            menu.alias.toLowerCase().indexOf(queryString.toLowerCase()) != -1
          );
        });
        if (r && r.length >= 1) {
          r.forEach(y => {
            if (isComponent) {
              y.parentComponent = x;
            }
            this.searchMenus.push(y);
          });
        }
      }
    },
    handleSelect(item) {
      if (!item.parentComponent) {
        this.$router.push({ path: `/${item.alias}` });
      } else {
        this.$router.push({
          path: `/${item.parentComponent.alias}#${item.alias}`
        });
      }
    },
    //获取系统默认配置 系统Logo、名称
    sysSetting(){
      const _this = this;
      let url = window.context.portal+"/sys/sysProperties/v1/getDecryptBySysSetting";
      _this.$http.get(url).then(response => {
          if(response && response.data && response.data.value){
            let  sysSettingData = JSON.parse(response.data.value);
            if(sysSettingData.manageLogo.length>0){
              let manageLogo = sysSettingData.manageLogo;
              _this.showLogo = true;
              req.get(window.context.portal + "/file/onlinePreviewController/v1/getFileById_" + manageLogo[0].id,'arraybuffer').then(response=>{
                  let type = response.headers['content-type'];
                  if(type){
                    _this.logo = window.URL.createObjectURL(new Blob([response.data], { type: type}));
                  }else{
                    _this.logo = window.URL.createObjectURL(new Blob([response.data]));
                  }
              });
              //_this.logo = window.context.portal + "/system/file/v1/downloadFile?fileId=" + manageLogo[0].id;
            }else{
              this.showLogo = false;
            }
          }else{
             this.showLogo = false;
          }
      });
    },
  },
  mounted() {
    !this.currentUser && this.$store.dispatch("user/loadCurrentUserDetail");
    const currentUser = this.$store.state.login.currentUser;
    if(currentUser){
      let userAttrs = this.$store.state.login.currentUser.userAttrs;
      if(userAttrs){
        //租户
        const tenantId = userAttrs.tenantId;
        if(tenantId){
          let _this = this;
          let url = "${uc}/uc/tenantManage/v1/getJson?id=" + tenantId;
          this.$http.get(url).then(resp => {
            if(resp.data){
              let tenantManage = resp.data;
              if(tenantManage.manageLogo){
                let manageLogo = JSON.parse(tenantManage.manageLogo);
                if(manageLogo && manageLogo.length >0 ){
                  _this.showLogo = true;
                  req.get(window.context.portal + "/file/onlinePreviewController/v1/getFileById_" + manageLogo[0].id,'arraybuffer').then(response=>{
                      let type = response.headers['content-type'];
                      if(type){
                        _this.logo = window.URL.createObjectURL(new Blob([response.data], { type: type}));
                      }else{
                        _this.logo = window.URL.createObjectURL(new Blob([response.data]));
                      }
                  });
                }
              }else{
                _this.showLogo = false;
              }
            }
          }, error => {
              _this.showLogo = false;
              reject(error);
          })
        }else{
          //不是租户
          this.sysSetting();
        }
      }else{
        //不是租户
        this.sysSetting();
      }
    }else{
      //不是租户
      this.sysSetting();
    }
  },  
  created(){
     let USER_AGENT = navigator.userAgent.toLowerCase();
     let isChrome = /.*(chrome)\/([\w.]+).*/;
     if(!isChrome.test(USER_AGENT)){
       this.isIeExplorer = true;
     }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.navbar-menu-collapse {
  cursor: pointer;
  width: 48px;
  height: 48px;
  background: $--color-secondary;
}

.navbar-menu-collapse > i {
  font-size: 21px;
  margin: 13px;
  color: $--color-primary;
}

.logo-container {
  margin-left: 20px;
  cursor: default;
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

.header-container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  -webkit-box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  width: 100%;
  height: 48px;
}

.logo-link {
  margin-left: 30px;
  font-weight: bold;
  font-size: 18px;
  color: #2274af;
  text-decoration: none;
}

.nav-logo {
  width: 25px;
  height: 25px;
  line-height: 25px;
  vertical-align: middle;
  margin-top: -6px;
}

.header-right {
  margin-right: 20px;
  align-items: center;
  justify-content: space-between;
}

.header-right > .el-link,
.header-right > span > .el-link {
  margin-right: 15px;
  font-size: 13px;
}

.header-right > .el-link:hover,
.header-right > span > .el-link:hover {
  color: #ff7717;
}

.top-link-icon {
  font-size: 15px;
  font-weight: bold;
}

.top-message-header {
  background: #f7f7f7;
  justify-content: space-between;
  padding: 5px 10px;
}

.user-box-divider {
  margin: 10px 0;
}

.user-box-header {
  padding: 10px;
}

.inline-input {
  margin-right: 15px;
}

.user-link-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}


.user-link-ul,.clear-cache {
  padding: 5px;
}

.user-link-ul > li {
  padding: 5px 10px;
  cursor: pointer;
}

.user-link-ul > li > i {
  margin-right: 5px;
  font-size: 16px;
  font-weight: bold;
}

.user-link-ul > li:hover {
  background: #ebebeb;
}

.top-message-more {
  border-top: 1px solid #dedede;
  margin-top: 10px;
  padding: 10px;
}

.top-message-body {
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.top-message-more > a:hover,
.top-message-more > a:focus {
  color: #555;
}

.user-box-logout {
  justify-content: center;
  background: #f7f7f7;
  border-top: 1px solid #dedede;
  margin-top: 10px;
}

.top-message-more:hover,
.user-box-logout:hover {
  background: #ebebeb;
}

.user-box-logout > a {
  line-height: 35px;
  width: 100%;
  color: #ff7717;
}

.user-box-logout > a:hover,
.user-box-logout > a:focus {
  color: #ff7717;
}

#screenfull {
  margin-right: 15px;

  svg {
    width: 12px;
    height: 12px;
    margin-bottom: -2px;
  }
}
.content_span {
  color: #212121;
  display: inline-block;
}
</style>
