<template>
  <div id="app">
    <el-container class="is-vertical fullheight">
      <template v-if="!$route.meta.single">
        <Navigator :menuShow.sync="menuShow" />
        <el-container style="overflow-x: hidden; overflow-y: hidden">
          <Menu @menuChange="handleMenuChange" :menuShow="menuShow" />
          <el-main style="padding: 10px; margin: -9px -10px -7px -10px">
            <el-card
              class="app-box__card"
              :class="{'box-card-noheader': !showHeader}"
              shadow="never"
            >
              <div
                v-if="showHeader && !$route.meta.isHome"
                slot="header"
                class="clearfix"
              >
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item :to="{path: '/'}"
                    >首页</el-breadcrumb-item
                  >
                  <el-breadcrumb-item>{{
                    currentMenuLabel
                  }}</el-breadcrumb-item>
                </el-breadcrumb>
              </div>
              <keep-alive v-if="$route.meta.keepAlive">
                <router-view
                  class="fullheight"
                  @menuChange="handleMenuChange"
                ></router-view>
              </keep-alive>
              <router-view
                class="fullheight"
                v-else
                @menuChange="handleMenuChange"
              ></router-view>
            </el-card>
          </el-main>
        </el-container>
      </template>
      <router-view v-if="$route.meta.single" />
    </el-container>
  </div>
</template>
<script>
import Navigator from '@/views/Navigator.vue'
import Menu from '@/views/Menu.vue'
import menu from '@/api/menu.js'

export default {
  name: 'app',
  components: {Navigator, Menu},
  data() {
    return {
      showHeader: true,
      currentMenuLabel: '',
      menuShow: true,
    }
  },
  mounted() {
    // 因为resize事件在整个项目中只能监听一次，所以这里通过全局广播发送这个事件
    window.onresize = () => {
      this.$root.$emit('resize')
    }
    menu.getMenuByAlias(this.$route.name, (m) => {
      if (m) {
        this.$emit('menuChange', m)
      }
    })
  },
  methods: {
    handleMenuChange: function (menu) {
      this.currentMenuLabel = menu.name
      this.showHeader = !(menu.children && menu.children.length > 0)
    },
  },
  created() {
    window.onload = function () {
      if (document.getElementById('ou-loading__wrapper')) {
        document.getElementById('ou-loading__wrapper').remove()
      }
    }
  },
}
</script>
<style lang="scss" scoped>
#app {
  background: #f5f5f5;
}

.el-main > .el-card {
  border-radius: 0;
}

.app-box__card {
  height: calc(100% - 3px);
}

.app-box__card /deep/ .el-card__header {
  padding: 12px 20px;
  margin-bottom: 10px;
}

.app-box__card /deep/ .el-card__body {
  height: calc(100% - 55px);
  padding: 0 10px 0 10px;
}

.box-card-noheader /deep/ .el-card__body {
  height: calc(100% - 5px) !important;
}

/deep/
  .el-tree--highlight-current
  .el-tree-node.is-current
  .el-tree-node__content {
  background-color: rgba(155, 194, 230, 0.2) !important;
}
</style>

<style lang="scss">
</style>
