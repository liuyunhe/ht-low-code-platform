<template>
  <div>企业微信-授权认证中</div>
</template>

<script>
import req from "@/request.js";
import utils from "@/utils.js";
import { Notify } from "vant";
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
    let Base64 = require("js-base64").Base64;
    var params = utils.getParameters("params")
    params = decodeURIComponent(params);
    if(params){
      try {
        params = Base64.decode(params);
      } catch (error) {
        loading.close();
        Notify({ type: "danger", message: "传入的参数params解码错误了："+error });
        return;
      }
    }

    var code = utils.getParameters("code");
    // lyzcw:2021-10-15 添加多租户支持
    var state = utils.getParameters("state");
    var redirect = decodeURIComponent(utils.getParameters("redirect"));
    this.proxyLogin(code, state, redirect, loading, params);
  },
  methods: {
    proxyLogin(code, state, redirect_uri, loading, params) {
      let url = window.context.uc + "/sso/weixin?code=" + code + "&tenantId=" + state;
      req.get(url).then((response)=> {
        loading.close();
        if (response && !response.data.openid) {
          sessionStorage.setItem("currentUser", JSON.stringify(response.data));
          sessionStorage.setItem("token", response.data.token); // 存入一个值
          sessionStorage.setItem("username", response.data.username);
          sessionStorage.setItem("account", response.data.account);
          sessionStorage.setItem("userId", response.data.userId);
        }
        if(redirect_uri){
          location.href = redirect_uri;
        }else{
          if(!params){
            this.$router.push({path:'/home'})
          }else{
            this.parseParams(params);
          }
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
