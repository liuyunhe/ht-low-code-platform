<template>
  <el-menu
    :default-active="activeMenuIndex"
    class="el-menu-demo"
    :key="updateTopMenuActive"
    ref="menuContainer"
    mode="horizontal"
    @select="onSelect"
  >
    <!-- wude 2022-11-30 解决菜单选中样式问题 -->
    <template v-for="(menu, index) in copy_Menus.filter((m) => !m.hidden)">
      <el-menu-item
        style="font-size: 16px"
        v-if="!menu.children || menu.children.length == 0"
        :key="index"
        :index="menu.alias"
        :style="{'border-bottom-color': menu.alias == activeMenuIndex ? '' : 'transparent'}"
        :class="{'is-active': menu.alias == activeMenuIndex}"
        >{{ menu.name }}</el-menu-item
      >
      <el-submenu
        v-else
        :key="(index + 1)"
        :index="menu.alias"
        popper-class="sub-menu"
      >
        <template slot="title">{{ menu.name }}</template>
        <template v-if="menu.children && menu.children.length > 0">
          <el-menu-item
            v-for="(item, index) in menu.children"
            :key="index"
            :index="item.alias"
            >{{ item.name }}</el-menu-item
          >
        </template>
      </el-submenu>
    </template>
  </el-menu>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import utils from '@/hotent-ui-util.js'
import frontUtils from '@/utils.js'
import routerFinance from '@/routerFinance.js'
export default {
  data() {
    return {
      updateTopMenuActive: 0,
      copy_Menus: [],
      resizeTick: false,
      firstMenuChange: false,
      templateMoreAlias: '_templateMoreMenu', //临时更多目录的别名
      activeMenuIndex: '', //默认选择首页
    }
  },
  computed: mapState({
    menus: (state) => state.menu.all,
    residual: (state) => state.menu.residual,
    menuMaps: (state) => state.menu.menuMaps,
    currentMenu: (state) => state.menu.currentMenu,
  }),
  watch: {
    menus: {
      handler(newVal, oldVal) {
        this.initMenus(newVal, oldVal)
      },
      immediate: true,
    },
    'currentMenu.alias': {
      handler(val) {
        this.activeMenuIndex = val
      },
    },
  },
  methods: {
    //动态新增二级路由
    addList(path, list) {
      const that = this
      let isAddPath = false
      let isChildren = false
      for (let i = 0; i < list.length; i++) {
        //判断当前点击菜单的路由别名是否存在 router.js 里面
        if (path == list[i].path) {
          //存在
          //动态注册路由
          let index = path.replace('/', '')
          routerFinance.index = index
          let templatePreview_new = {
            path: 'template/preview/:templateKey',
            name: 'templatePreview_' + index,
            props: true,
            component: (resolve) =>
              require([
                '@/components/dataTemplate/templatePreview.vue',
              ], resolve),
          } //数据报表
          let templateHref_new = {
            path: 'href/template/:alias',
            name: 'templateHref_' + index,
            props: true,
            component: (resolve) =>
              require(['@/components/dataTemplate/templateHref.vue'], resolve),
          } //URL菜单
          let querySql_new = {
            path: 'querySql/queryView/:sqlAlias/:alias',
            name: 'querySql_' + index,
            props: true,
            component: (resolve) =>
              require(['@/components/querySql/querySqlContent.vue'], resolve),
          } //自定义视图
          let template_new = {
            path: 'template/form/:templateKey/:action',
            name: 'template_' + index,
            props: true,
            component: (resolve) =>
              require(['@/components/dataTemplate/templateForm.vue'], resolve),
          } //数据报表
          let templateSingle_new = {
            path: 'template/form/:templateKey/:action/:single',
            name: 'templateSingle_' + index,
            props: true,
            component: (resolve) =>
              require(['@/components/dataTemplate/templateForm.vue'], resolve),
          } //数据报表
          let templateQuerys_new = {
            path: 'template/preview/:templateKey/:single/:parameterqQuerys',
            name: 'templateQuerys_' + index,
            props: true,
            component: (resolve) =>
              require([
                '@/components/dataTemplate/templatePreview.vue',
              ], resolve),
          } //数据报表
          let draftList_new = {
            path: 'draftList/:tempAlias/:dataViewFlag',
            name: 'template_' + index,
            props: true,
            component: (resolve) =>
              require(['@/components/dataTemplate/TemplateDraft.vue'], resolve),
          } //数据报表
          //ccwgq 2022-03-14 增加智能引擎相关菜单
          let smart_exam_new = {
            path: 'smart_helps_exam',
            name: 'smartExam',
            component: (resolve) =>
              require(['@/components/eipControl/ou/Smart.vue'], resolve),
          }
          let smart_compare_new = {
            path: 'smart_helps_compare',
            name: 'smartCompare',
            component: (resolve) =>
              require(['@/components/eipControl/ou/Smart.vue'], resolve),
          }
          let smart_extract_new = {
            path: 'smart_helps_extract',
            name: 'smartExtract',
            component: (resolve) =>
              require(['@/components/eipControl/ou/Smart.vue'], resolve),
          }

          if (list[i].children) {
            //判断是否重复添加路由
            for (let j = 0; j < list[i].children.length; j++) {
              let children = list[i].children[j]
              if (children.name == templatePreview_new.name) {
                isAddPath = true // true ： 重复路由
                break
              }
            }
            if (!isAddPath) {
              list[i].children.push(templatePreview_new)
              list[i].children.push(templateHref_new)
              list[i].children.push(querySql_new)
              list[i].children.push(template_new)
              list[i].children.push(templateSingle_new)
              list[i].children.push(templateQuerys_new)
              list[i].children.push(draftList_new)
              //*ccwgq  2022-03-15  增加智能引擎功能
              list[i].children.push(smart_exam_new)
              list[i].children.push(smart_compare_new)
              list[i].children.push(smart_extract_new)
              list[i].children.push(...routerFinance.financePages)
              //* ccwgq end
              that.$router.$addRoutes(list)
            }
            isChildren = true
            break
          }
        }
      }
      return isChildren
    },
    //动态添加路由
    routerAdd(path) {
      const that = this
      let isChildren = that.addList(path, that.$router.options.routes) //动态新增二级路由
      //当前点击菜单的路由别名不存在 router.js 里面
      if (!isChildren) {
        let alias_new = {
          path: path,
          name: 'alias_' + path.replace('/', ''),
          component: (resolve) => require(['@/views/menuContent.vue'], resolve),
          children: [],
        }
        that.$router.options.routes.push(alias_new)
        that.addList(path, that.$router.options.routes) //动态新增二级路由
      }
    },
    /**
     * wude 2022-11-30 菜单跳转时,校验是否有未提交的表单进行提示
     * @param {string} alias 
     */
    onSelect(alias) {
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
        //     this.handleSelect(alias)
        //   })
        //   .catch(() => {})
      // } else {
        this.handleSelect(alias)
      // }
    },
    handleSelect(alias) {
      if (!alias) {
        return
      }
      //子组件向父组件发送当前选中tab名称
      this.$emit('currentMenuIndex', alias)
      //把选择的一级菜单别名存入sessionStorage
      sessionStorage.menu_alias = alias
      //选择一级菜单时
      let clickMenu = this.menus.find((m) => m.alias == alias)
      if (!clickMenu) {
        const moreMenu = this.menus.find(
          (m) => m.alias == this.templateMoreAlias
        )
        moreMenu &&
          moreMenu.children &&
          (clickMenu = moreMenu.children.find((m) => m.alias == alias))
      }

      if (clickMenu) {
        let path = ''
        if (clickMenu.path == undefined) {
          path = clickMenu.alias
        } else {
          path = clickMenu.path
        }
        if (path.indexOf('/') < 0) {
          path = '/' + path
        }
        this.setCurrentMenu(alias)
        if (
          sessionStorage.menu_path &&
          sessionStorage.menu_path.indexOf(alias) != -1
        ) {
          path = sessionStorage.menu_path
        } else {
          sessionStorage.menu_path = ''
        }
        //点击首页
        if (alias == 'home') {
          sessionStorage.menu_alias = ''
          this.$router.push({path: path})
        } else {
          //其他一级菜单
          this.routerAdd('/' + alias) //动态添加路由
          this.$router.push({path: path})
        }
      }
    },
    setCurrentMenu(alias) {
      let that = this
      for (let i = 0; i < that.menus.length; i++) {
        if (that.menus[i].alias === alias) {
          this.$store.dispatch('menu/getCurrentMenu', {
            alias: that.menus[i].alias,
            name: that.menus[i].name,
          })
          break
        }
      }
    },
    // 页面缩放计时触发器（避免页面缩放频繁触发，导致菜单会频繁更新）
    resizeTimerTrigger() {
      if (this.resizeTick || this.residual) {
        return
      }
      this.resizeTick = true
      setTimeout(() => {
        this.handleMenuOverMore()
        this.resizeTick = false
      }, 600)
    },
    // 移除Menus中的临时更多菜单
    removeTemplateMoreMenu(menus) {
      let targetIndex = -1
      // 查找菜单中是否有临时更多菜单
      const moreMenu = menus.find((m, index) => {
        if (m.alias == this.templateMoreAlias) {
          targetIndex = index
          return m
        }
      })
      // 如果有，则删掉这个菜单
      if (targetIndex > -1) {
        menus.splice(targetIndex, 1)
      }
      return targetIndex > -1
    },
    // 处理目录显示宽度超限的情况
    handleMenuOverMore() {
      const menuContainer = this.$refs.menuContainer
      if (
        !menuContainer ||
        !menuContainer.$children ||
        menuContainer.$children.length == 0
      ) {
        return
      }

      const containerWidth = menuContainer.$el.clientWidth
      // 目录宽度超限的元素索引
      let boundaryIndex = 0
      var childrenTotalWidth = menuContainer.$children.reduce(
        (cur, child, index) => {
          let t = child.$el.clientWidth + cur
          if (t > containerWidth && boundaryIndex == 0) {
            boundaryIndex = index
          }
          return t
        },
        0
      )
      // 如果宽度超限，把menus分为常规菜单和更多菜单
      if (childrenTotalWidth > containerWidth && this.menus.length>6) {
        let copyMenus = [...this.menus]
        this.removeTemplateMoreMenu(copyMenus)
        // 在超限索引大于2时才把超过的目录显示在更多中
        if (boundaryIndex > 2) {
          let moreMenuChildren = []
          copyMenus
            .filter((m, i) => i > boundaryIndex - 2)
            .forEach((m) => {
              let nm = {...m}
              moreMenuChildren.push(nm)
              // 把超出部分的菜单标记为隐藏
              m.hidden = true
            })

          let moreMenu = {
            id: '-2',
            name: '更多',
            alias: this.templateMoreAlias,
            children: moreMenuChildren,
          }
          copyMenus.push(moreMenu)
          this.$store.dispatch('menu/setTemplateMenus', copyMenus)
        } else {
          throw '屏幕太窄，菜单可能显示不全'
        }
      }
      // 否则把更多菜单合并到menus中
      else {
        let copyMenus = [...this.menus],
          needDispath = this.removeTemplateMoreMenu(copyMenus)
        // 如果有，则重置为原来的菜单
        if (needDispath) {
          copyMenus.forEach((m) => delete m['hidden'])
          this.$store.dispatch('menu/setTemplateMenus', copyMenus)
        }
      }
    },
    init() {
      let isFalg = false
      //模块开发添加为前端菜单点击待办处理任务时判断
      if (
        this.$route.matched.length == 1 &&
        JSON.stringify(this.$route.params) != '{}'
      ) {
        isFalg = false
      }
      if (
        this.$route.matched.length == 1 &&
        JSON.stringify(this.$route.params) == '{}'
      ) {
        isFalg = true
      }
      //管理端发起流程，处理任务，自由跳转会携带showMenu参数。需要展示菜单
      if (
        (this.$route.query && this.$route.query.showMenu) ||
        this.$route.matched.length > 1
      ) {
        isFalg = true
      }

      if (!this.currentMenu.alias && isFalg) {
        const this_ = this
        this_.$store.dispatch('menu/getStaticMenus').then(() => {
          this_.$store.dispatch('menu/getDefaultMenus').then(() => {
            if (sessionStorage.menu_alias) {
              this_.activeMenuIndex = sessionStorage.menu_alias
            }
            this_.handleSelect(this_.activeMenuIndex)
          })
        })
      }
      this.$root.$on('resize', this.resizeTimerTrigger)
    },
    initMenus(newVal, oldVal) {
      if (newVal.length > 0) {
        let newMenus = [...newVal]
        newMenus.sort(function (a, b) {
          return a.sn - b.sn
        })
        this.copy_Menus = newMenus
      } else {
        this.copy_Menus = newVal
      }

      if (newVal && newVal.length > 1 && !this.residual) {
        if (!utils.arrayEquals(newVal, oldVal) || !this.firstMenuChange) {
          this.firstMenuChange = true
          setTimeout(() => this.handleMenuOverMore(), 100)
        }
      }
      if (newVal && newVal.length > 1) {
        let copyMenus = [...this.copy_Menus]
        //判断第一个菜单是否是更多菜单，如果是则把更多菜单放在最后
        if (copyMenus[0].id == '-2') {
          let copyObj = copyMenus[0]
          copyMenus.splice(0, 1)
          copyMenus.push(copyObj)
          this.copy_Menus = [...copyMenus]
        }
      }
      frontUtils.Menu.addSyncMenus(this, newVal)
    },
    //ccwgq 2022-09-05 菜单优化
    betterMenuShowing(){
       //ccwgq 不显示更多时的处理逻辑
    this.$nextTick(() => {
      // debugger
      const vm = this.$refs?.menuContainer ?? null
      if (vm && vm.$el) {
        const containerWidth = vm.$el.clientWidth
        // 目录宽度超限的元素索引
        let boundaryIndex = 0
        var childrenTotalWidth = vm.$children.reduce((cur, child, index) => {
          let t = child.$el.clientWidth + cur
          if (t > containerWidth && boundaryIndex == 0) {
            boundaryIndex = index
          }
          return t
        }, 0)
        if (childrenTotalWidth > containerWidth && this.menus.length > 6) {
          $(vm.$el).css({display: 'block'})
        } else {
          $(vm.$el).css({display: 'flex'})
        }
      }
    })
    }
  },
  created() {
    this.init()
    let _this = this
    this.betterMenuShowing()
    this.$root.$on('updateTopMenuActive', (name) => {
      // 首页跳转更新一级菜单的状态
      if (
        _this.$route.fullPath &&
        _this.$route.fullPath.split('/').length >= 1
      ) {
        let path = _this.$route.fullPath.split('/')[1]
        sessionStorage.menu_alias = path
        _this.setCurrentMenu(path)
        //_this.updateTopMenuActive++;
      }
    })
  },
  updated() {
    this.betterMenuShowing();
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.el-menu,
.el-menu > li,
ul.el-menu > li.el-submenu /deep/ div.el-submenu__title {
  height: 55px;
  // line-height: 64px;
  background-color: $--theme-color !important;
}
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  outline: none;
  outline-color: initial;
  outline-style: none;
  outline-width: initial;
  color: #ffd600;
}
.el-menu--horizontal .el-menu-item:not(.is-disabled):focus {
  color: #fff;
}
.el-menu-demo {
  /deep/ .el-menu-item {
    color: #fff;
    font-size: 18px !important;
    font-weight: bold !important;
    // padding: 0 15px !important;
  }
  /deep/ .el-menu-item.is-active {
    color: #fff;
    border-bottom: 2px solid #fff;
  }
  /deep/ .el-submenu__title {
    // padding: 0 10px !important;

    font-size: 16px !important;
  }
  padding-top: 10px;
  border-bottom: none !important;
  * {
    font-family: SimHei !important;
  }
}
.sub-menu {
  .el-menu-item {
    font-size: 16px;
    font-family: SimHei;
    font-weight: bold;
    color: #fff !important;
    &:hover {
      color: #ffd666 !important;
    }
    &.is-active {
      color: #000 !important;
    }
  }
}
</style>
