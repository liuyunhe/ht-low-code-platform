<template>
  <div>微信公众号-授权认证中</div>
</template>

<script>
import req from "@/request.js";
import utils from "@/utils.js";
export default {
  components: {},
  data() {
    return {
      layout: {},
      gridList: []
    };
  },
  created() {
    if(sessionStorage.getItem("currentUser")){
      var redirect_uri = decodeURIComponent(utils.getParameters("redirect"));
      if(redirect_uri){
        location.href = redirect_uri;
      }else{
        this.$router.push({path:'/home'})
      } 
    }
    const loading = this.$loading({
      lock: true,
      text: "授权中",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });
    var code = utils.getParameters("code");

    let Base64 = require("js-base64").Base64;
    var params = utils.getParameters("params");
    params = decodeURIComponent(params);
    if (params) {
      try {
        params = Base64.decode(params);
      } catch (error) {
        loading.close();
        Notify({
          type: "danger",
          message: "传入的参数params解码错误了：" + error
        });
        return;
      }
    }

    var redirect = decodeURIComponent(utils.getParameters("redirect"));
    this.proxyLogin(code, redirect, loading, params);
  },
  methods: {
    proxyLogin(code, redirect_uri, loading, params) {
      let url = window.context.uc + "/sso/weixinPublic?code=" + code;
      req.get(url).then(response => {
        loading.close();
        if (response && !response.data.openid) {
          sessionStorage.setItem("currentUser", JSON.stringify(response.data));
          sessionStorage.setItem("token", response.data.token); // 存入一个值
          sessionStorage.setItem("username", response.data.username);
          sessionStorage.setItem("account", response.data.account);
          sessionStorage.setItem("userId", response.data.userId);
          if (redirect_uri) {
            location.href = redirect_uri;
          } else {
            if (!params) {
              this.$router.push({ path: "/home" });
            } else {
              this.parseParams(params);
            }
          }
        } else {
          sessionStorage.setItem("openid", response.data.openid);
          this.$router.push({ path: "/login" });
        }
      });
    },
    parseParams(params){
      let paramsJson = JSON.parse(params||"{}");
      //审批的消息
      if(paramsJson.templateType ==='bpmnapproval'){
        let url = `/task/${paramsJson.taskId}/0`;
        this.$router.push({path:url});
      }else{
        this.$router.push({path:'/home'})
      }
    }
  }
};
</script>
