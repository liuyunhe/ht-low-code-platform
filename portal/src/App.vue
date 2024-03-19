<template>
  <div id="app">
    <!-- <loading></loading> -->
    <el-container class="is-vertical fullheight">
      <template v-if="!$route.meta.single">
        <el-header
          class="theme_color no-print"
          v-if="
            $route.name &&
            $route.name != 'templateFormSingle' &&
            $route.name != 'onlineForm' &&
            $route.name != 'doneReadOnly'
          "
          height="75px"
          style="padding: 0 10px"
        >
          <navigator />
        </el-header>
        <el-main
          class="base-main hidden_scroll fullheight"
          name="app-base-main"
        >
          <router-view
            v-if="isRouterAlive"
            style="margin: 0 auto; height: 100%"
          />
          <!-- <keep-alive> -->
            <!-- <router-view v-if="isRouterAlive&&$route.meta.keepAlive" style="margin: 0 auto; height: 100%"> -->
              <!-- 这里是会被缓存的视图组件，比如 Home！ -->
            <!-- </router-view> -->
          <!-- </keep-alive> -->
          <!-- <router-view v-if="isRouterAlive&&!$route.meta.keepAlive" style="margin: 0 auto; height: 100%"> -->
            <!-- 这里是不被缓存的视图组件，比如 Edit！ -->
          <!-- </router-view> -->
        </el-main>
      </template>
      <router-view v-if="$route.meta.single" />
    </el-container>
  </div>
</template>

<script>
import Navigator from '@/views/Navigator.vue'
export default {
  name: 'app',
  components: {
    Navigator,
  },
  // 2022-06-24 yigz: 通过provide / inject方式实现页面刷新
  provide() {
    return {
      reload: this.reload,
    }
  },
  data() {
    return {
      isRouterAlive: true,
    }
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      setTimeout(() => {
        this.isRouterAlive = true
      }, 10)
    },
  },
  mounted() {
    // 因为resize事件在整个项目中只能监听一次，所以这里通过全局广播发送这个事件
    window.onresize = () => {
      this.$root.$emit('resize')
    }
  },
  created() {
    const that = this
    that.$store._vm.$root.$on('login-completed', function () {
      //获取静态资源目录
      that.$store.dispatch('menu/getStaticMenus')
      // 获取用户接口权限
      that.$store.dispatch('menu/getCurrentUserMethodAuth')
      // 获取动态资源目录
      that.$store.dispatch('menu/getSyncMenus')
    })
    //ccwgq 2022-06-20 移除初始中加入的loading动画
    // if (document.getElementById('ou-loading')) {
    //   document.getElementById('ou-loading').remove()
    // }
    //ccwgq 2022-09-23 拦截浏览器的回退和前进按钮
    window.addEventListener('popstate', function () {
      if ((that.$route.query?.from ?? '') === 'home') {
        that.$store.dispatch('menu/setColumnInfo', {
          restore: true,
        })
      }
    })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.theme_color {
  background-color: $--theme-color;
}
#app {
  background: #f5f5f5;
}
@media print {
  #app {
    height: auto !important;
  }
  .no-print {
    display: none;
  }
  .base-main {
    background: #ffffff !important;
    padding: 0px !important;
  }
}
.base-main {
  background-color: $--bg-color-page;
  padding-top: 8px;
}
.hidden_scroll {
  &::-webkit-scrollbar {
    width: 0;
    background-color: transparent;
  }
}
.base-footer {
  border-top: 1.5px solid #ededed;
}

.el-dialog__header {
  padding: 10px !important;
  background: #f8f8f8;
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
</style>

<style>
/* ccwgq 2022-09-26 修复tooltip显示过长的问题 */
.el-tooltip__popper {
  width: fit-content !important;
}
</style>
