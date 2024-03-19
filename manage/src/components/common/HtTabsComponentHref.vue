<template>
  <div class="tab-container">
    <el-tabs
      class="fullheight tab-container-root"
      v-model="currentTabComponent"
      :type="finalTabsStyle.tabType"
      @tab-click="handlePaneClick"
      v-if="tabComponentOptions.length > 0"
    >
      <el-tab-pane
        :label="tabComponent.name"
        :name="tabComponent.alias"
        v-for="(tabComponent, index) in tabComponentOptions"
        :key="index"
      >
        <iframe
          v-if="currentTabComponent == tabComponent.alias"
          :src="tabComponent.href"
          style="height:100%;width:100%;border:0px"
        ></iframe>
      </el-tab-pane>
    </el-tabs>
    <iframe
      v-if="tabComponentOptions.length <= 0"
      :src="href"
      style="height:100%;width:100%;border:0px"
    ></iframe>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import menuApi from "@/api/menu.js";
export default {
  name: "ht-tabs-component-href",
  components: {},
  props: {},
  computed: {
    ...mapGetters({
      tabsStyle: "styleSetting/tabsStyle"
    }),
    finalTabsStyle: function() {
      // 使用菜单的配置
      if (
        (this.tabsStyle.tabType == "menuSetting" ||
          this.tabsStyle.tabType == null) &&
        this.menuTabsStyle
      ) {
        return this.menuTabsStyle;
      }

      // 使用默认的
      if (
        this.tabsStyle.tabType == null ||
        ((this.tabsStyle.tabType == "menuSetting" ||
          this.tabsStyle.tabType == null) &&
          !this.menuTabsStyle)
      ) {
        return { tabType: "" };
      }
      // 使用全局的配置
      return this.tabsStyle;
    }
  },
  data() {
    return {
      href: "", //外部菜单url地址
      tabComponentOptions: [],
      currentTabComponent: "",
      menuTabsStyle: null
    };
  },
  methods: {
    handlePaneClick: function(data) {
      if (data.alias) {
        this.currentTabComponent = data.alias;
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      let routePath = vm.$route.path;
      if (routePath) {
        routePath = routePath.replace("/", "");
      }
      menuApi.getMenuByAlias(routePath, m => {
        if (m) {
          vm.$emit("menuChange", m);
          if (m.children && m.children.length > 0) {
            vm.tabComponentOptions = m.children;
            vm.href = vm.tabComponentOptions[0].href;
            vm.currentTabComponent =
              m.activeTab || vm.tabComponentOptions[0].alias;
          } else {
            vm.tabComponentOptions = [];
            vm.currentTabComponent = m.alias;
            if (m.href.indexOf("?token=") == -1) {
              vm.href =
                m.href + "?token=" + vm.$store.state.login.currentUser.token;
            } else {
              vm.href = m.href;
            }
          }
          if (m.tabsStyle) {
            vm.menuTabsStyle = JSON.parse(m.tabsStyle);
          } else {
            vm.menuTabsStyle = null;
          }
        } else {
          // 没有菜单的路由跳转   需要显示TAb名称需要定义tobName参数传递过来
          vm.tabComponentOptions = [];
          vm.currentTabComponent = to.name;
          vm.$emit("menuChange", { name: to.params.tobName });
        }
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
    // 通过 `vm` 访问组件实例
    next();
    const vm = this;
    let routePath = to.fullPath;
    if (routePath) {
      routePath = routePath.replace("/", "");
    }
    menuApi.getMenuByAlias(routePath, m => {
      if (m) {
        vm.$emit("menuChange", m);
        if (m.children && m.children.length > 0) {
          vm.tabComponentOptions = m.children;
          vm.href = vm.tabComponentOptions[0].href;
          vm.currentTabComponent =
            m.activeTab || vm.tabComponentOptions[0].alias;
        } else {
          vm.tabComponentOptions = [];
          vm.currentTabComponent = m.alias;
          if (m.href.indexOf("?token=") == -1) {
            vm.href =
              m.href + "?token=" + vm.$store.state.login.currentUser.token;
          } else {
            vm.href = m.href;
          }
        }
        if (m.tabsStyle) {
          vm.menuTabsStyle = JSON.parse(m.tabsStyle);
        } else {
          vm.menuTabsStyle = null;
        }
      } else {
        // 没有菜单的路由跳转   需要显示TAb名称需要定义tobName参数传递过来
        vm.tabComponentOptions = [];
        vm.currentTabComponent = to.name;
        vm.$emit("menuChange", { name: to.params.tobName });
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.tab-container >>> .is-active .el-link {
  color: $--color-primary;
  font-weight: bold;
}

.tab-container > div.tab-container-root /deep/ > .el-tabs__content {
  height: calc(100% - 60px);
}

.tab-container .el-tab-pane {
  height: 100%;
}
</style>
