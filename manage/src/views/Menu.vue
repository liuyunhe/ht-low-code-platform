<template>
  <div class="aside-container">
    <el-collapse-transition>
      <el-aside width="210px" v-if="menuShow">
        <div class="menu-header">
          <span>
            <span class="pre-span" />
            <span class="tail-span" />
            智慧公用服务一张网
          </span>
        </div>
        <div>
          <el-collapse v-model="collapseItemActive" accordion ref="elCollapse">
            <el-collapse-item
              :title="menu.name"
              v-for="(menu, index) in menus"
              :class="{'last-collapse-item': index + 1==menus.length}"
              :key="menu.id"
              :name="menu.alias"
            >
              <el-menu
                ref="elMenu"
                :default-active="menuItemActive"
                class="menu-vertical"
                :collapse="false"
                :router="true"
                @select="handleSelect"
              >
                <el-menu-item
                  v-for="item in menu.children"
                  :class="{'is-active':item.alias==menuItemActive}"
                  :key="item.alias"
                  :index="'/'+item.alias"
                >
                  <span slot="title">{{item.name}}</span>
                </el-menu-item>
              </el-menu>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-aside>
    </el-collapse-transition>
  </div>
</template>

<script>
import menu from "@/api/menu.js";
import utils from "@/hotent-ui-util.js"
import { mapState } from "vuex";

export default {
  props: {
    menuShow: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      menus: state => {
       return state.menu.menus
      }
    })
  },
  data() {
    return {
      collapseItemActive: "",
      menuItemActive: ""
    };
  },
  created() {
    this.$router.afterEach(_ => {
      this.syncUrlToMenu();
    });
  },
  mounted() {
    const this_ = this;
    setTimeout(function () {
        !this_.currentUser && this_.$store.dispatch("user/loadCurrentUserDetail");
    },2000)
    const currentUser = this.$store.state.login.currentUser;
    if ((!this.menus || this.menus.length == 0) && currentUser) {
      let this_ = this;
      this.$store.dispatch("menu/actionMenus").then(data => {
        if(this.isHasCurrentUrlRight()){
          this.syncUrlToMenu();
        }else{
          this_.$router.push('home');
        }
      });
    } else {
      this.syncUrlToMenu();
    }
  },
  methods: {
    // 同步当前url地址到目录菜单中，选中对应的目录菜单
    syncUrlToMenu: function() {
      let routePath = this.$route.path;
      if (routePath) {
        routePath = routePath.replace("/", "");
        this.handleSelect(routePath);
      }
    },
    // 判断是否拥有当前url地址的权限
    isHasCurrentUrlRight: function() {
      let routePath = this.$route.path;
      if (routePath) {
        let hasRight = false;
        if (!this.menus || this.menus.length <1) {
          return hasRight;
        }
        let tempMenu = JSON.parse(JSON.stringify(this.menus));
        let listMenu = utils.nest2tile(tempMenu,'',true);
        let ruterArr = routePath.split('/');
        let lastRuter = ruterArr[ruterArr.length-1];
        listMenu.forEach(menu => {
          if(lastRuter.indexOf(menu.alias)>-1){
             hasRight = true;
             return;
          }
        });
        return hasRight;
      }
    },
    handleSelect: function(alias) {
      //判断字符串开头是否包含“/”
      if(alias.substr(0, 1) == "/"){
        alias = alias.replace("/", "");
      }
      if(alias!='tenant'){
        this.$store.dispatch("tenant/actionTenantId", null);
      }
      let _this = this;
      menu.getMenuByAlias(alias, m => {
        m && _this.$emit("menuChange", m);
        if (m && m.parent) {
          _this.collapseItemActive = m.parent.alias;
          _this.menuItemActive = m.alias;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.aside-container {
  position: relative;
}

.el-aside {
  margin-top: 3px;
  position: relative;
  overflow: auto;
  height: 100%;
}

.menu-header {
  height: 35px;
  padding-left: 20px;
  border-bottom: 1px solid #dedede;
}

.menu-header span {
  font-size: 14px;
  font-weight: bold;
  line-height: 38px;
  color: #373d41;
}

.menu-vertical:not(.el-menu--collapse) {
  background: transparent;
  border-right-width: 0;
}

.el-collapse {
  border-top-width: 0;
  border-bottom-width: 0;
}

.el-menu-item {
  height: 45px;
  line-height: 45px;
}

li.el-menu-item.is-active {
  background: $--color-primary;
  color: #fff;
  font-weight: bold;
  margin-right: -1px;
}

.is-active + .el-collapse-item >>> .el-collapse-item__header {
  border-top: 1px solid #dedede;
}

.el-menu-item:hover,
.el-menu-item:focus {
  background-color: $--color-secondary;
}

.last-collapse-item >>> .el-collapse-item__header {
  border-bottom-width: 0;
}

>>> .el-collapse-item__header {
  background-color: transparent;
  margin: 0 20px;
  color: #a8a8a8;
  border-bottom-color: #dedede;
}

>>> .el-collapse-item__wrap {
  background-color: transparent;
  border-bottom-width: 0;
}

>>> .el-collapse-item__content {
  padding-bottom: 10px;
}

>>> .el-collapse-item__arrow {
  margin-right: 0;
  font-size: 16px;
  font-weight: bold;
}

.pre-span,
.tail-span {
  height: 12px;
  width: 12px;
  display: inline-block;
  border-radius: 2px;
  transform: rotate(45deg);
}

.pre-span {
  background: $--color-primary;
  margin-right: -5px;
}

.tail-span {
  background: #eb9a8d;
  margin-right: 10px;
}
</style>
