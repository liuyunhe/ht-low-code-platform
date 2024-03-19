<template>
  <div class="tab-container">
    <iframe :src="href_token" class="iframe-url"  width="100%"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto" allowtransparency="yes"  runat="server" ></iframe>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "templateHref",
  props:["alias","href"],
  data() {
    return {
      href_token:""//url菜单地址
    };
  },
  watch: {
    href: {
      handler(newVal) {
        if(newVal){
          if (newVal.indexOf("?token=") == -1) {
            this.href_token = newVal+"?token=" + this.$store.state.login.currentUser.token;
          } else {
            this.href_token = newVal;
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // this.open()
  },
  methods:{
    open(){
      window.open(this.href_token,"_self");
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      let Base64 = require("js-base64").Base64;
      if (vm.href && vm.href.indexOf("?token=") == -1) {
        vm.href = Base64.decode(vm.$route.query.href)+"?token=" + vm.$store.state.login.currentUser.token;
      } else {
        vm.href = Base64.decode(vm.$route.query.href);
      }
    })
  },
  beforeRouteUpdate(to, from, next) {
    next();
    const vm =this;
    let Base64 = require("js-base64").Base64;
    if (vm.href && vm.href.indexOf("?token=") == -1) {
      vm.href = Base64.decode(vm.$route.query.href)+"?token=" + vm.$store.state.login.currentUser.token;
    } else {
      vm.href = Base64.decode(vm.$route.query.href);
    }
  }
};
</script>

<style lang="scss" scoped>
  .iframe-url{
    height: 100%;
    background-color:#fff;

  }
.tab-container {
  height: 800px;
  background-color: #fff;
  padding: 10px;
  align-items:center;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
}
.tab-container h3{
  color: #DBD8D4;
  font-size: 18px;
}
</style>
