<template>
  <el-container>
    <el-aside
      :width="isFlowMenu ? '200px' : 'fit-content'"
      v-if="!$route.meta.single"
      style="border-right: 1px solid #eee"
      v-show="asideShow"
      class="menu_aside_container"
    >
      <el-card shadow="never">
        <div slot="header" class="clearfix">
          <b class="aside_top_title">{{ currentMenu.name }}</b>
        </div>
        <el-menu
          v-if="!isFlowMenu"
          :default-active="activeMenuIndex"
          @select="onSelect"
          unique-opened
        >
          <template v-for="menu in menus">
            <!-- 只有一级菜单 -->
            <el-menu-item
              v-if="!menu.children || menu.children.length == 0"
              :key="menu.id"
              :index="menu.alias"
              class="diy-active"
              :style="{'color': menu.alias == activeMenuIndex ? '#409eff' : '#303133','--width': menu.alias == activeMenuIndex ? '2px' : '0px'}"
              :class="{'is-active': menu.alias == activeMenuIndex}"
              >{{ menu.name }}</el-menu-item
            >
            <!-- 有二级菜单 -->
            <el-submenu v-else :key="(menu.id + 1)" :index="menu.alias">
              <template slot="title">{{ menu.name }}</template>
              <template v-if="menu.children && menu.children.length > 0">
                <template v-for="item in menu.children">
                  <!-- 无三级菜单 -->
                  <el-menu-item
                    v-if="!item.children || item.children.length == 0"
                    :key="item.id"
                    :index="item.alias"
                    class="diy-active"
                    :style="{'color': item.alias == activeMenuIndex ? '#409eff' : '','--width': item.alias == activeMenuIndex ? '2px' : '0px'}"
                    :class="{'is-active': item.alias == activeMenuIndex}"
                    >{{ item.name }}</el-menu-item
                  >
                  <!-- 有三级菜单 -->
                  <el-submenu v-else :key="(item.id + 1)" :index="item.alias">
                    <template slot="title">{{ item.name }}</template>
                    <template  v-for="sunitem in item.children">
                      <el-menu-item
                        v-if="item.children && item.children.length > 0"
                        :key="sunitem.id"
                        :index="sunitem.alias"
                        class="diy-active"
                        :style="{'color': sunitem.alias == activeMenuIndex ? '#409eff' : '','--width': sunitem.alias == activeMenuIndex ? '2px' : '0px'}"
                        :class="{'is-active': sunitem.alias == activeMenuIndex}"
                        >{{ sunitem.name }}</el-menu-item
                      >
                    </template>
                  </el-submenu>
                </template>
              </template>
            </el-submenu>
          </template>
        </el-menu>
        <!-- 流程中心的菜单的实现单独用一个组件 -->
        <flow-menu-tree
          v-else
          :menus="menus"
          :default-active="activeMenuIndex"
        ></flow-menu-tree>
        <!--  -->
      </el-card>
    </el-aside>
    <div
      v-if="!$route.meta.single"
      class="aside-navbar-collapse"
      :class="{'navbar-collapse-right': !asideShow}"
      @click="asideShow = !asideShow"
    >
      <div class="aside-navbar-collapse-bg">
        <i
          class="aside-navbar-collapse-arrow"
          :class="{
            'el-icon-arrow-left': asideShow,
            'el-icon-arrow-right': !asideShow,
          }"
        ></i>
      </div>
    </div>
    <el-main class="content">
      <router-view v-if="!href" />
      <div v-if="href">
        <h3 class="flow_table_title">{{ findCurrentMenuName() }}</h3>
        <templateHref :href="href" class="template__href-content" />
      </div>
    </el-main>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import templateHref from '@/components/dataTemplate/templateHref.vue'
import deepmerge from 'deepmerge'
import FlowMenuTree from '@/components/flow/flowMenuTree.vue'

//ccwgq 2022-07-07 引入流程事件总线
import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
export default {
  name: 'menuContent',
  components: {templateHref, FlowMenuTree},
  computed: mapState({
    menuAll: (state) => state.menu.all,
    menus: function (state) {
      let alias = ''
      if (state.menu.currentMenu.alias) {
        alias = state.menu.currentMenu.alias
      } else if (sessionStorage.menu_alias) {
        alias = sessionStorage.menu_alias
      }
      return state.menu.menuMaps[alias]
    },
    currentMenu: (state) => state.menu.currentMenu,
  }),
  data() {
    return {
      asideShow: true,
      activeMenuIndex: '',
      href: '', //url菜单地址
      isFlowMenu: false, //是否是流程中心的菜单
    }
  },
  methods: {
    findCurrentMenuName() {
      let obj = this.menus.find((it) => it.alias === this.activeMenuIndex)
      let name = ''
      if (obj) {
        name = obj.name
      } else {
        let _menus = deepmerge({}, this.menus, {clone: true})
        let item = this.getChidlren(this.activeMenuIndex, _menus)
        if (item) {
          name = item.name
        }
      }
      return name
    },
    getChidlren(alias, _menus) {
      var hasFound = false, // 表示是否有找到id值
        result = null
      var fn = function (data) {
        if (Array.isArray(data) && !hasFound) {
          // 判断是否是数组并且没有的情况下，
          data.forEach((item) => {
            if (item.alias === alias) {
              // 数据循环每个子项，并且判断子项下边是否有id值
              result = item // 返回的结果等于每一项
              hasFound = true // 并且找到id值
            } else if (item.children && item.children.length > 0) {
              fn(item.children) // 递归调用下边的子项
            }
          })
        }
      }
      fn(_menus) // 调用一下
      return result
    },
    onSelect(key) {
      var formUpdataFlag = sessionStorage.getItem('formUpdataFlag')
      // if (formUpdataFlag == 'true') {
        // this.$confirm(
        //   '表单发生过变更,离开将导致录入数据丢失',
        //   '确定要离开当前页面吗?',
        //   {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning',
        //   }
        // )
        //   .then(() => {
        //     sessionStorage.setItem('formUpdataFlag', 'false')
        //     this.handleSelect(key)
        //   })
        //   .catch(() => {})
      // } else {
        this.handleSelect(key)
      // }
    },
    handleSelect(key) {
      //当前点击菜单的父级菜单路由
      let path = this.currentMenu.alias || sessionStorage.menu_alias
      if (path.indexOf('/') < 0) {
        path = '/' + path
      }
      sessionStorage.menu_path = path + '/' + key
      this.href = ''
      //判断4级URL菜单
      let item = this.getChidlren(key, this.menus)
      if (item.href) {
        this.href = item.href
      }
      this.activeMenuIndex = key
      this.$router.push({path: sessionStorage.menu_path})
    },
    selectCurrentMenu(newVal) {
      //当前点击菜单的父级菜单路由
      let path = ''
      this.currentMenu.alias
        ? (path = this.currentMenu.alias)
        : (path = sessionStorage.menu_alias)
      // if(this.currentMenu.alias){
      //   path = this.currentMenu.alias;
      // }else{
      //   path = sessionStorage.menu_alias;
      // }
      if (path.indexOf('/') < 0) {
        path = '/' + path
      }
      let paths = []
      if (this.$router.history.pending) {
        paths = this.$router.history.pending.fullPath.split(path + '/')
      } else {
        paths = this.$router.history.current.fullPath.split(path + '/')
      }
      if (paths.length > 0) {
        this.activeMenuIndex = paths[1]
      } else {
        this.activeMenuIndex = paths[0]
      }

      let isFlag = true //是否需要默认加载一级菜单的第一个二级菜单
      this.href = ''
      for (let i = 0; i < this.menus.length; i++) {
        //判断是否是URL菜单
        if (this.menus[i].href) {
          if (this.activeMenuIndex == this.menus[i].alias) {
            this.href = this.menus[i].href
            isFlag = false
            break
          }
          let falg = false
          //判断菜单是否有下一级，且只能有一个下一级
          if (this.menus[i].children.length > 0) {
            for (let o = 0; o < this.menus[i].children.length; o++) {
              //判断是否是URL菜单
              if (this.activeMenuIndex == this.menus[i].children[o].alias) {
                this.href = this.menus[i].children[o].href
                falg = true
                break
              }
            }
            if (falg) {
              break
            }
          }
        }
      }
      //默认加载一级菜单的第一个二级菜单
      if (
        isFlag &&
        (!this.activeMenuIndex ||
          (this.activeMenuIndex &&
            this.activeMenuIndex.indexOf('href/template') != -1))
      ) {
        this.activeMenuIndex = this.getLastChildren()

        //判断是否是URL地址菜单
        if (this.menus[0].href) {
          this.href = this.menus[0].href
        }
        //判断菜单是否有下一级，且只能有一个下一级
        if (this.menus[0].children.length > 0) {
          for (let k = 0; k < this.menus[0].children.length; k++) {
            //判断是否是URL菜单
            if (this.menus[0].children[k].href) {
              this.href = this.menus[0].children[k].href
              this.activeMenuIndex = this.menus[0].children[k].alias
              break
            }
          }
        }
        sessionStorage.menu_path = path + '/' + this.activeMenuIndex
        this.$router.push({path: sessionStorage.menu_path})
      }
    },
    getLastChildren() {
      // 获取最后个children的第一个菜单
      let _alias = this.menus[0].alias
      let _menus = this.menus[0]
      while (_menus.children && _menus.children.length > 0) {
        _alias = _menus.children[0].alias
        _menus = _menus.children[0]
      }
      return _alias
    },

    setCurrentMenu(path) {
      let that = this
      for (let i = 0; i < that.menuAll.length; i++) {
        if (that.menuAll[i].alias === path) {
          if (path.indexOf('/') > -1) {
            path = path.replace('/', '')
          }
          this.$store.dispatch('menu/getCurrentMenu', {
            alias: that.menuAll[i].code,
            name: that.menuAll[i].name,
          })
          break
        }
      }
    },
    inCurrentMenu(newVal) {
      if (newVal && newVal.length > 0) {
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i].alias == this.activeMenuIndex) {
            return true
          }
          if (newVal[i].children && newVal[i].children.length > 0) {
            let inCur = this.inCurrentMenu(newVal[i].children)
            if (inCur) {
              return true
            }
          }
        }
      }
    },
  },
  watch: {
    menus: {
      handler(newVal) {
        //判断当前菜单是否还在新菜单列表里
        let menuChange = !this.inCurrentMenu(newVal)
        //window.self === window.top  判断页面是否被嵌入iframe里面
        if (
          newVal &&
          newVal.length > 0 &&
          window.self === window.top &&
          menuChange
        ) {
          this.selectCurrentMenu(newVal)
        }
        //切换一级菜单时情况URL地址
        if (!newVal || newVal.length == 0) {
          if (this.href != '') {
            this.href = ''
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    FlowBus.$on('changeIsFlow', (val) => {
      this.isFlowMenu = val
    })
  },
  beforeRouteEnter(to, from, next) {
    //这里无法拿到组件的this
    next((vm) => {
      vm.isFlowMenu = to.matched.map((item) => item.path).includes('/v-flow')
      vm.$root.$emit('updateTopMenuActive', from.name)
    })
  },
  beforeRouteUpdate(to, from, next) {
    // this.isFlowMenu=(to.matched.map(item=>item.path)).includes('/v-flow')
    next()
  },
  //ccwgq 在router leave 方法里加入对退出登录以及修改密码的识别
  beforeRouteLeave(to, from, next) {
    if (to.path == '/v-personal/v-logout') {
      //退出登录
      app.$store
        .dispatch('login/logoutAndCleanUp')
        .then(() => {
          //退出成功，回到登录页面
          next({path: '/login'})
        })
        .catch(() => {
          throw '退出登录失败'
        })
    } else if (to.path == '/v-personal/v-password') {
      //修改密码
      //如果要修改,请使用vue devtools查看vue组件的嵌套层级 找到menuItem
      const el =
        app?.$children[0]?.$children[0]?.$children[0]?.$children[0]
          ?.$children[0]?.$children[2]?.$children[1]?.$children[0]?.$children[3]
          ?.$el ?? null
      //这里直接模拟一次点击事件，因为dom始终存在
      if (!!el) {
        $(el).trigger('click')
      }
    } else {
      next()
    }
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-main {
  padding: 0;
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

.el-menu,
/deep/ .el-menu {
  background-color: transparent;
  border-right: none;
}
.el-menu-item {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #303133;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 20px;
  list-style: none;
  cursor: pointer;
  position: relative;
  -webkit-transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  white-space: nowrap;
  &:hover,
  &:focus {
    background-color: transparent;
    color: $--color-primary;
  }
}
.el-submenu .el-menu-item {
  height: 36px;
  line-height: 36px;
}
.el-menu-item.is-active {
  position: relative;
  &::before {
    position: absolute;
    content: '';
    // 2022-11-30 wude 根据css中变量使用方法,可以结合vue动态绑定，给元素添加一个局部css变量，对元素样式和伪类元素进行动态样式绑定
    width: var(--width);
    height: 14px;
    background: $--color-primary;
    top: 12px;
    left: 12px;
  }
}
.el-submenu {
  .el-menu-item.is-active {
    &::before {
      left: 30px;
      top: 12px;
    }
  }
}
/deep/ div.el-submenu__title {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #303133;
  padding-top: 0px;
  padding-right: 0px;
  padding-bottom: 0px;
  padding-left: 20px;
  list-style: none;
  cursor: pointer;
  position: relative;
  -webkit-transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  white-space: nowrap;
}
/deep/ i.el-submenu__icon-arrow {
  position: absolute;
  top: 50%;
  right: 0px;
  margin-top: -7px;
  -webkit-transition: -webkit-transform 0.3s;
  transition: -webkit-transform 0.3s;
  transition: transform 0.3s;
  transition: transform 0.3s, -webkit-transform 0.3s;
  font-size: 12px;
}
.menu_aside_container {
  .aside_top_title {
    font-size: 14px;
    // font-weight: normal;
    color: #303133;
  }
}
.aside-navbar-collapse {
  margin-top: 50px;
  .aside-navbar-collapse-bg {
    height: 28px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: none;
    border-right: 10px solid #f5f5f5;
    position: relative;
    &:hover {
      cursor: pointer;
    }
    .aside-navbar-collapse-arrow {
      position: absolute;
      top: 7px;
    }
  }
}
.flow_table_title {
  background: #fff;
  padding-top: 10px;
  margin-top: 8px;
}
.content {
  background: #fff;
}
</style>
