<template>
  <el-container class="is-vertical">
    <template v-if="!$route.meta.single">
      <!-- <el-header height="48px" style="padding: 0 10px; background-color: #2761ff;"> -->
      <!-- <navigator/> -->
      <!-- </el-header> -->
      <el-main class="base-main" name="app-base-main">
        <router-view v-if="isRouterAlive" style="margin: 0 auto;" />
      </el-main>
    </template>
    <router-view v-if="$route.meta.single" />
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";

export default {
  name: "app",
  components: {},
  data() {
    return {
      isRouterAlive: true
    };
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      setTimeout(() => {
        this.isRouterAlive = true;
      }, 10);
    }
  },
  mounted() {
    // 因为resize事件在整个项目中只能监听一次，所以这里通过全局广播发送这个事件
    window.onresize = () => {
      this.$root.$emit("resize");
    };
    //处理打包成app后对返回键的响应
    document.addEventListener('plusready', function() {
        var webview = plus.webview.currentWebview();
        plus.key.addEventListener('backbutton', function() {
            webview.canBack(function(e) {
                if (e.canBack) {
                  webview.back();
                } else {
                  var r=confirm("确定要退出当前应用？");
                  if(r==true){
                    plus.runtime.quit();
                    return ;
                  }else{
                    this.$router.push({ path: "/home" });
                    return;
                  }
                    //webview.close(); //hide,quit
                    //plus.runtime.quit();
                    //首页返回键处理
                    //处理逻辑：1秒内，连续两次按返回键，则退出应用；
                    var first = null;
                    plus.key.addEventListener('backbutton', function() {
                        //首次按键，提示‘再按一次退出应用’
                        if (!first) {
                            first = new Date().getTime();
                            // console.log('再按一次退出应用');
                            setTimeout(function() {
                                first = null;
                            }, 1000);
                        } else {
                            if (new Date().getTime() - first < 1500) {
                                plus.runtime.quit();
                            }
                        }
                    }, false);
                }
            })
        });
    });
    utils.wakeLock();
  }
};
</script>

<style lang="stylus" scoped>
#app{
  height:100%;
}
.base-footer {
  border-top: 1.5px solid #ededed;
}

.el-dialog__header {
  padding: 10px !important;
  background: #F8F8F8;
  border-bottom: 1px solid #eee;
}

.el-dialog__header > .el-dialog__title {
  font-size: 15px;
}

.el-dialog__header > .el-dialog__headerbtn {
  top: 13px;
}

.el-dialog__header .el-dialog__close {
  font-weight: bold;
}

.el-dialog__footer {
  border-top: 1px solid #eee;
}

.rotating {
  animation: rotating 1.7s linear infinite;
}
.el-container {
  background-color: #F7F8FA;
}
</style>

<style lang="scss">
//增加 element 部分组件的移动端适配功能
@media screen and (max-width: 550px) {
  .el-message-box{
    width: 300px !important;
  }
}
@media screen and (max-width: 550px) {
    .el-message {
      min-width: 300px !important;
    }
}
</style>
