<template>
  <div class="fullheight appcontent-div__content">
    <!--    <el-page-header @back="goBack" :content="title" style="margin-bottom: 15px"></el-page-header>-->
    <!-- 图表-->
    <eip-chart :id="id" v-if="type === '4'" />
    <!-- 数据报表-->
    <template-preview v-else-if="type === '2'" :templateKey="id" />
    <!-- 自定义视图-->
    <query-sql-content
      v-else-if="type === '3'"
      :sqlAlias="otherId"
      :alias="id"
      :single="true"
    />
    <!-- 表单预览-->
    <preview-form v-else-if="type === '6'" :formId="id" :single="true" />

    <iframe
      v-else-if="type === '7'"
      style="width:100%"
      frameborder="0"
      class="fullheight"
      allowtransparency="0"
      :src="path"
    ></iframe>

    <start
      v-else-if="type === '8'"
      :defId="id"
      leaderId="0"
      :instId="''"
      :copyInstId="''"
    ></start>

    <el-container
      style="height: 95%;"
      v-else-if="type === '1'"
      class="fullheight"
    >
      <el-aside v-if="asideShow" class="aside-menu__wrap">
        <p class="flow_tree_top_title">{{ appName }}</p>
        <el-menu :default-active="firstMenuId" class="appcontent__menu">
          <template v-for="(menu) in menus">
            <el-submenu
              :key="menu.id"
              v-if="menu.children.length > 0"
              :index="menu.id"
            >
              <template slot="title">
                <span>{{ menu.name }}</span>
              </template>
              <el-menu-item
                :key="child.id"
                v-for="child in menu.children"
                :index="child.id"
                @click="open(child)"
                >{{ child.name }}</el-menu-item
              >
            </el-submenu>
            <el-menu-item
              v-else
              :key="menu.id"
              :index="menu.id"
              @click="open(menu)"
              >{{ menu.name }}</el-menu-item
            >
          </template>
        </el-menu>
      </el-aside>
      <div
        class="navbar-collapse"
        :class="{'navbar-collapse-right': !asideShow}"
        @click="asideShow = !asideShow"
      >
        <div class="navbar-collapse-bg">
          <i
            class="navbar-collapse-arrow"
            :class="{
              'el-icon-arrow-left': asideShow,
              'el-icon-arrow-right': !asideShow
            }"
          ></i>
        </div>
      </div>
      <el-main
        :style="app.type === 1 ? {overflowY: 'hidden'} : {}"
        :class="{'url-iframe__wrap': app.type === 1}"
        class="app__main-content"
      >
        <h3 class="flow_table_title" v-if="app.type === 1">{{currentActiveMenuName}}</h3>
        <!-- 图表-->
        <eip-chart :id="app.id" v-if="app.type === 4" :key="id"/>
        <!-- 数据报表-->
        <template-preview v-else-if="app.type === 2" :templateKey="app.key" />
        <!-- 自定义视图-->
        <query-sql-content
          v-else-if="app.type === 3"
          :sqlAlias="app.sqlAlias"
          :alias="app.alias"
          single="true"
        />
        <!-- 表单预览-->
        <preview-form
          v-else-if="app.type === 6"
          :formId="app.id"
          :single="true"
        />
        <!-- 网页链接-->
        <iframe
          v-else-if="app.type === 1"
          style="width:100%;overflow-y: hidden"
          frameborder="0"
          class="fullheight"
          allowtransparency="0"
          :src="getUrl(app.url)"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
const eipChart = () => import('@/components/form/chart/EipChart.vue')
const templatePreview = () =>
  import('@/components/dataTemplate/templatePreview.vue')
const querySqlContent = () =>
  import('@/components/querySql/querySqlContent.vue')
const previewForm = () => import('@/components/common/previewForm.vue')
const start = () => import('@/components/flow/start.vue')
import portal from '@/api/portal.js'
import {mapState} from 'vuex'
export default {
  name: 'app-content',
  components: {
    eipChart,
    templatePreview,
    querySqlContent,
    previewForm,
    start
  },
  props: {
    id: String,
    otherId: String,
    type: String,
    appName: String
  },
  data() {
    return {
      currentActiveMenuName:'',
      firstMenuId:null,
      asideShow: true,
      title: '',
      iframeSrc: '',
      menus: [],
      app: {
        id: '',
        type: 0,
        key: '',
        sqlAlias: '',
        alias: '',
        url: ''
      },
      path: '',
      fvue: window.context.front
    }
  },
  computed: mapState({
    token: function(mapState) {
      return mapState.login.currentUser.token
    }
  }),
  created() {
    this.init()
  },
  methods: {
    //返回
    goBack() {
      this.$router.go(-1)
    },
    //初始化标题和类型
    init() {
      if (this.type === '4') {
        this.title = '图表'
      } else if (this.type === '2') {
        this.title = '数据报表'
      } else if (this.type === '3') {
        this.title = '自定义视图'
      } else if (this.type === '6') {
        this.title = '表单'
      } else if (this.type === '7') {
        this.title = '模块开发'
        this.path = `${window.context.front}/sysModulePreview/${
          this.id
        }/${this.appName}?token=${this.token}`
      } else if (this.type === '1') {
        this.title = '应用'
        //获取app的菜单树
        portal.getSysAppTree(this.id).then(data => {
          this.menus = data
          if (this.menus && this.menus.length>0) {
            if (this.menus[0].children && this.menus[0].children.length>0) {
              this.open(this.menus[0].children[0])
              this.firstMenuId = this.menus[0].children[0].id
            }else {
              this.open(this.menus[0])
              this.firstMenuId = this.menus[0].id
            }
          }

        })
      } else if (this.type === '8') {
        this.title = '流程启动'
      }
    },
    getUrl(url) {
      if (url.startsWith('http') || url.startsWith('https')) {
        return url
      } else return `${this.fvue}/${url}`
    },
    //点击菜单
    open(menu) {
      this.currentActiveMenuName = menu ? menu.name : ''
      //菜单类型为链接菜单时不用转content内容
      if (menu.type === 1) {
        this.app = {
          url: menu.content + '?token=' + this.token,
          type: menu.type
        }
        return
      }
      //其他类型需要转换content内容
      let content = JSON.parse(menu.content)
      this.app = {
        id: content.id,
        type: menu.type,
        key: content.key,
        sqlAlias: content.sqlAlias,
        alias: content.alias
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.appcontent-div__content {
  .aside-menu__wrap{
    height: 100%;
    border-right: 1px solid #ccc;
    margin-top: 8px;
  }
  .url-iframe__wrap {
    padding-left: 0;
    padding-top: 8px;
  }
  .app__main-content{
    padding:0
  }
  .flow_table_title {
    margin-top: 0;
    background: #fff;
    padding-top: 10px;
    padding-bottom: 11px;
  }
  .flow_tree_top_title {
    margin-top: 8px;
    padding-top: 2px;
    margin-bottom: 0;
  }
   .appcontent__menu{
    background: #f5f5f5;
  }
}
</style>
