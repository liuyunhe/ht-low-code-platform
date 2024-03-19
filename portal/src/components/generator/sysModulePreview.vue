<template>
  <div class="fullheight">
    <el-container style="border: 1px solid #eee;height:98%">
      <el-aside width="12%" class="sysmodule__aside-wrap" v-show="asideShow">
        <p class="flow_tree_top_title">{{ appName }}</p>
        <el-menu default-active="0_0" class="el-menu-vertical-demo" @select="handleSelect">
          <el-submenu :index="index + ''" v-for="(item, index) in menuData" :key="index">
            <template slot="title"
              ><i class="el-icon-menu"></i>{{ item.text }}</template
            >
            <el-menu-item-group>
              <el-menu-item :index="index + '_' + index1" v-for="(obj, index1) in item.children" :key="index1"
                >{{ obj.text }}
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <div class="navbar-collapse" :class="{'navbar-collapse-right': !asideShow}" @click="asideShow = !asideShow">
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
      <el-container width="82%" id="iframe-container" v-loading="loading">
        <iframe v-if="isShowIframe" style="width:100%" frameborder="0" allowtransparency="0" :src="iframeSrc" @load="testLoad"></iframe>
        <div v-if="!isShowIframe && chartId" style="width:100%"><eip-chart :id="chartId" /></div>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import {Base64} from 'js-base64'
import req from '@/request.js'
const eipChart = () => import('@/components/form/chart/EipChart.vue')
export default {
  name: 'sysModulePreview',
  components: {eipChart},
  props: ['id', 'dialogVisible','appName'],
  data() {
    return {
      asideShow:true,
      workspaceList: [],
      datalistList: [],
      viewlistList: [],
      isShowIframe: true,
      loading:false,
      chartId: '',
      iframeSrc: '',
      menuData: {},
      chartList: [],
      menuTypeList: [
        {type: 'workspaceList', name: '工作空间'},
        {type: 'datalistList', name: '数据列表'},
        {type: 'viewlistList', name: '视图列表'},
        {type: 'chartList', name: '图表列表'},
        {type: 'otherList', name: '栏目列表'}
      ],
      otherList: []
    }
  },
  watch: {
    id: function(newVal, oldVal) {
      if (!newVal) {
        return
      }
      this.init()
      var url = window.context.portal + '/sys/sysModule/v1/getJson?id=' + this.id
      req.get(url).then(response => {
        this.initDetails(response.data)
        var menuData = []
        this.initMenuData(menuData)
        this.menuData = menuData
      }, true)
    }
  },
  created() {
    var id = this.id
    if (!this.dialogVisible) {
      id = this.$route.params.id
    }
    if (!id) {
      return
    }
    this.init()
    var url = window.context.portal + '/sys/sysModule/v1/getJson?id=' + id
    req.get(url).then(response => {
      this.initDetails(response.data)
      var menuData = []
      this.initMenuData(menuData)
      this.menuData = menuData
    })
  },
  methods: {
    testLoad() {
      this.loading = false;
    },
    init() {
      this.workspaceList = []
      this.datalistList = []
      this.viewlistList = []
      this.iframeSrc = ''
      this.menuData = {}
      this.chartList = []
      this.menuTypeList = [
        {type: 'workspaceList', name: '工作空间'},
        {type: 'datalistList', name: '数据列表'},
        {type: 'viewlistList', name: '视图列表'},
        {type: 'chartList', name: '图表列表'},
        {type: 'otherList', name: '栏目列表'}
      ]
      this.otherList = []
    },
    initDetails(data) {
      if (data.moduleDetail && data.moduleDetail.length > 0) {
        for (var i = 0; i < data.moduleDetail.length; i++) {
          var type = data.moduleDetail[i].type
          switch (type) {
            case 'workspace':
              this.workspaceList.push(data.moduleDetail[i])
              break
            case 'datalist':
              this.datalistList.push(data.moduleDetail[i])
              break
            case 'viewlist':
              this.viewlistList.push(data.moduleDetail[i])
              break
            case 'chart':
              this.chartList.push(data.moduleDetail[i])
              break
            case 'other':
              this.otherList.push(data.moduleDetail[i])
              break
          }
        }
      }
    },
    initMenuData(menuData) {
      for (var k = 0; k < this.menuTypeList.length; k++) {
        var type = this.menuTypeList[k].type
        if (this[type].length > 0) {
          var typeList = this[type]
          if (type == 'otherList') {
            var map = {}
            for (var i = 0; i < typeList.length; i++) {
              if (!map[typeList[i].columnName]) {
                map[typeList[i].columnName] = typeList[i].columnName
                var item = {
                  text: typeList[i].columnName,
                  children: []
                }
                for (var n = 0; n < typeList.length; n++) {
                  if (typeList[i].columnName == typeList[n].columnName) {
                    var sub = {
                      text: typeList[n].name,
                      code: typeList[n].code,
                      type: type,
                      url: typeList[n].url
                    }
                    item.children.push(sub)
                  }
                }
                menuData.push(item)
              }
            }
          } else {
            var item = {
              text: this.menuTypeList[k].name,
              children: []
            }
            for (var i = 0; i < typeList.length; i++) {
              var sub = {
                text: typeList[i].name,
                code: typeList[i].code,
                type: type,
                url: typeList[i].url
              }
              item.children.push(sub)
            }
            menuData.push(item)
          }
        }
      }
      if (menuData.length > 0) {
        let item = menuData[0].children[0]
        this.iframeSrc = this.getUrl(item.url, item.type)
      }
    },
    handleSelect(index) {
      var path = index.split('_')
      if (path.length > 1) {
        let item = this.menuData[path[0]].children[path[1]]
        if (item.type == 'chartList') {
          this.isShowIframe = false
          this.chartId = item.url
        } else {
          this.isShowIframe = false
          setTimeout(() => {
            this.iframeSrc = this.getUrl(item.url, item.type)
          });
        }
      }
    },
    getUrl(url, type) {
      this.loading = true;
      this.isShowIframe = true
      var iframeSrc = url
      switch (type) {
        case 'workspaceList':
          iframeSrc = window.context.front + url + '?token=' + this.$store.state.login.currentUser.token
          break
        case 'datalistList':
          iframeSrc = window.context.front +"/sysModulePreview"+ url+"/true" + '?token=' + this.$store.state.login.currentUser.token
          break
        case 'viewlist':
          break
        case 'chartList':
          this.isShowIframe = false
          this.loading = false;
          this.chartId = url
          break
      }
      return iframeSrc
    }
  },
  destroyed() {}
}
</script>
<style lang="scss" scoped>
.sysmodule__aside-wrap{
  margin-top:8px;
  border-right: 1px solid #ccc;
}
.el-icon-menu {
  display: none;
}
/deep/.el-menu {
  background-color: rgb(245, 245, 245);
  border-right: 0px;
}
.el-menu-item {
  background-color: rgb(245, 245, 245);
}
/deep/ .el-menu-item-group__title {
  border-bottom: 2px solid #ebeef5;
  padding: 0px 0px 0px 0px;
  line-height: 0px;
}
/deep/.el-menu-item {
  padding-left: 20px !important;
  padding-right: 0px;
  height: 40px;
  line-height: 40px;
  color: #303133;
  font-size: 12px;
  /* font-weight: bold;*/
  min-width: 0px;
}

/deep/ .el-submenu__title {
  height: 40px;
  line-height: 40px;
  color: #a8a8a8;
  font-size: 12px;
}
/deep/.navbar-collapse {
  margin-top: 50px;
  width: 0;
  z-index: 9999;
}
/deep/.navbar-collapse-bg {
  margin-left: 1px;
  height: 28px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #f5f5f5;
  border-right: none;
  position: relative;
}
/deep/ .navbar-collapse-bg:hover {
  cursor: pointer;
}
/deep/.navbar-collapse-arrow {
  position: absolute;
  left: -12px;
  top: 7px;
}
/deep/.el-tabs__content{
    padding-left: 20px;
  }
.flow_tree_top_title{
  margin: 0;
  padding-top: 9px;
}
</style>
