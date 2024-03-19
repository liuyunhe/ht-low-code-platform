<template>
  <el-container>
    <el-aside width="180px" v-if="$route.name&&!$route.meta.single&&$route.name!='templateFormSingle'">
      <el-card shadow="never">
        <div slot="header" class="clearfix">
          <b>自定义菜单</b>
        </div>
        <el-menu :default-active="activeMenuIndex" @select="handleSelect" unique-opened >
          <template v-for="menu in menus">
            <el-menu-item
              v-if="!menu.children || menu.children.length == 0"
              :key="menu.id"
              :index="menu.href?('/statement/' + menu.alias+'?href='+menu.href):('/statement/' + menu.alias)"
               :class="{'is-active': menu.id==activeMenuIndex}"
            >{{ menu.name }}</el-menu-item>
            <el-submenu v-else :key="menu.id" :index="menu.id">
              <template slot="title">{{ menu.name }}</template>
              <template v-if="menu.children && menu.children.length > 0">
                <el-menu-item
                  v-for="item in menu.children"
                  :key="item.id"
                  :index="item.href?('/statement/' + item.alias+'?href='+item.href):('/statement/' + item.alias)"
                  :class="{'is-active': menu.id==activeMenuIndex}"
                >{{ item.name }}</el-menu-item>
              </template>
            </el-submenu>
          </template>
        </el-menu>
      </el-card>
    </el-aside>
    <el-main :class="{'statement-main__content':hasPadding()}" class="ddd">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "statement",
  computed:{
     ...mapState({
      menus: function(state) {
        const this_ = this;
        this_.activeMenuIndex = state.menu.currentMenu.id;
        return state.menu.menuMaps[state.menu.currentMenu.id];
      }
    }),
    
  },
  data() {
    return {
      activeMenuIndex: "",
      href:""
    };
  },
  watch:{
    menus:{
      handler: function(newVal, oldValue) {
        if(newVal && newVal != oldValue ){
          this.init();
        }
      },
      deep: true,
      immediate: true
    },
    '$route'(to,from){
      this.hasPadding()
    }
  },
  mounted () {},
  methods: {
    hasPadding(){
      return location.pathname.split('/').slice(0,5).join('/') === '/fvue/statement/template/preview' || location.pathname.split('/').slice(0,4).join('/') === '/fvue/statement/draftList'
    },
    init(){
      if (this.menus && this.menus.length > 0) {
        let activeMenuIndex =  this.menus[0].alias
          ? this.menus[0].alias
          :  this.menus[0].children[0]? this.menus[0].children[0].alias:null;
        //判断是否是URL地址菜单
        if(this.menus[0].href){
          this.href = this.menus[0].href;
        }else{
          this.href = "";
          activeMenuIndex = '/statement/' + activeMenuIndex;
        }
        this.handleSelect(activeMenuIndex);
      }
    },
    handleSelect(key) {
      const this_ = this;
      setTimeout(function(){
        let Base64 = require("js-base64").Base64;
        if(this_.href){//URL地址菜单
          let href = Base64.encode(this_.href);
          this_.href = "";
          this_.$router.push({ path: key, query:{href:href}});
        }else{
          //URL地址菜单
          if(key.indexOf('?href=')>-1){
            let paths = [];
            key = key.replace('/statement/','');
            paths = key.split('?href=');
            let href = Base64.encode(paths[1]);
            this_.$router.push({ path: "/"+paths[0], query:{href:href} });
          }else{//数据报表菜单
            this_.$router.push({ path: key });
          }
        }
      },200)
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-main {
  padding-top: 0px;
}
.statement-main__content{
  padding-left: 0;
  background: #fff;
  margin: 0 20px 20px 0;
  }
div[name="online-form"]{
  height: 100%;
}
.el-card {
  background-color: transparent;
}

.el-card /deep/ .el-card__header {
  height: 48px;
  border-bottom: 1.5px solid #dedede;
  color: #a2a2a2;
}

.el-card /deep/ .el-card__body {
  padding: 0;
}

.menu-ul {
  list-style: none;
  margin: 0;
  padding-left: 0;
}

.menu-ul > li {
  padding: 10px 0 10px 0;
  height: 30px;
  line-height: 30px;
  list-style: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 1px solid #dfdfdf;
}

.menu-ul > li:last-child {
  border-bottom: 0;
}

.menu-ul > li > a {
  color: $--color-text-regular;
  padding: 2px 5px 2px 17px;
  border-left: 2px solid transparent;
  text-decoration: none;
}

.menu-ul > li > a:hover {
  color: $--theme-color;
}

.menu-ul > li > a.router-link-active {
  border-left: 2px solid $--theme-color;
  color: $--theme-color;
}

.el-menu, /deep/ .el-menu {
  background-color: transparent;
  border-right: none;
}
</style>
