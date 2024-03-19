<template>
  <el-container class="fullheight">
    <el-aside width="250px" class="sysmodule__preview-aside" v-show="asideShow">
      <el-page-header
        @back="$emit('close-dialog')"
        style="padding: 10px;background: #eee;"
      >
        <template v-slot:content
          >预览</template
        >
      </el-page-header>
      <el-menu
        default-active="0_0"
        class="el-menu-vertical-demo"
        style="border-right:none"
        @select="handleSelect"
      >
        <el-submenu
          :index="index + ''"
          v-for="(item, index) in menuData"
          :key="index"
        >
          <template slot="title">
            <i class="el-icon-menu"></i>
            {{ item.text }}
          </template>
          <el-menu-item-group>
            <el-menu-item
              :index="index + '_' + index1"
              v-for="(obj, index1) in item.children"
              :key="index1"
              >{{ obj.text }}</el-menu-item
            >
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>
    <div
      class="navbar-collapse"
      :class="{ 'navbar-collapse-right': !asideShow }"
      @click="asideShow = !asideShow"
    >
      <div class="navbar-collapse-bg">
        <i
          class="navbar-collapse-arrow"
          :class="{
            'el-icon-arrow-left': asideShow,
            'el-icon-arrow-right': !asideShow,
          }"
        ></i>
      </div>
    </div>
    <el-container>
      <iframe
        v-if="isShowIframe"
        style="width:100%;"
        frameborder="0"
        id="myIframe"
        allowtransparency="0"
        :src="iframeSrc"
      ></iframe>
      <div v-else style="width:100%">
        <eip-chart :id="chartId" />
      </div>
    </el-container>
  </el-container>
</template>
<script>
import { Base64 } from "js-base64";
const eipChart = () => import("@/components/form/chart/EipChart.vue");
export default {
  name: "sysModulePreview",
  components: { eipChart },
  props: ["data", "dialogVisible"],
  data() {
    return {
      asideShow:true,
      workspaceList: [],
      datalistList: [],
      viewlistList: [],
      isShowIframe: true,
      chartId: "",
      iframeSrc: "",
      menuData: {},
      chartList: [],
      menuTypeList: [
        { type: "workspaceList", name: "工作空间" },
        { type: "datalistList", name: "数据列表" },
        { type: "viewlistList", name: "视图列表" },
        { type: "chartList", name: "图表列表" },
        { type: "otherList", name: "栏目列表" }
      ],
      otherList: []
    };
  },
  watch: {
    "data.id": function() {
      this.init();
      this.initDetails(this.data);
      var menuData = [];
      this.initMenuData(menuData);
      this.menuData = menuData;
    }
  },
  computed: {},

  mounted() {
    this.initDetails(this.data);
    var menuData = [];
    this.initMenuData(menuData);
    this.menuData = menuData;
  },
  methods: {
    init() {
      this.workspaceList = [];
      this.datalistList = [];
      this.viewlistList = [];
      this.iframeSrc = "";
      this.menuData = {};
      this.chartList = [];
      this.menuTypeList = [
        { type: "workspaceList", name: "工作空间" },
        { type: "datalistList", name: "数据列表" },
        { type: "viewlistList", name: "视图列表" },
        { type: "chartList", name: "图表列表" },
        { type: "otherList", name: "栏目列表" }
      ];
      this.otherList = [];
    },
    initDetails(data) {
      if (data.moduleDetail && data.moduleDetail.length > 0) {
        for (var i = 0; i < data.moduleDetail.length; i++) {
          var type = data.moduleDetail[i].type;
          switch (type) {
            case "workspace":
              this.workspaceList.push(data.moduleDetail[i]);
              break;
            case "datalist":
              this.datalistList.push(data.moduleDetail[i]);
              break;
            case "viewlist":
              this.viewlistList.push(data.moduleDetail[i]);
              break;
            case "chart":
              this.chartList.push(data.moduleDetail[i]);
              break;
            case "other":
              this.otherList.push(data.moduleDetail[i]);
              break;
          }
        }
      }
    },
    initMenuData(menuData) {
      for (var k = 0; k < this.menuTypeList.length; k++) {
        var type = this.menuTypeList[k].type;
        if (this[type].length > 0) {
          var typeList = this[type];
          if (type == "otherList") {
            var map = {};
            for (var i = 0; i < typeList.length; i++) {
              if (!map[typeList[i].columnName]) {
                map[typeList[i].columnName] = typeList[i].columnName;
                var item = {
                  text: typeList[i].columnName,
                  children: []
                };
                for (var n = 0; n < typeList.length; n++) {
                  if (typeList[i].columnName == typeList[n].columnName) {
                    var sub = {
                      text: typeList[n].name,
                      code: typeList[n].code,
                      type: type,
                      url: typeList[n].url
                    };
                    item.children.push(sub);
                  }
                }
                menuData.push(item);
              }
            }
          } else {
            var item = {
              text: this.menuTypeList[k].name,
              children: []
            };
            for (var i = 0; i < typeList.length; i++) {
              var sub = {
                text: typeList[i].name,
                code: typeList[i].code,
                type: type,
                url: typeList[i].url
              };
              item.children.push(sub);
            }
            menuData.push(item);
          }
        }
      }
      if (menuData.length > 0) {
        let item = menuData[0].children[0];
        this.iframeSrc = this.getUrl(item.url, item.type);
      }
    },
    handleSelect(index) {
      var path = index.split("_");
      if (path.length > 1) {
        let item = this.menuData[path[0]].children[path[1]];
        this.iframeSrc = this.getUrl(item.url, item.type);
      }
    },
    getUrl(url, type) {
      this.isShowIframe = true;
      var iframeSrc = url;
      switch (type) {
        case "workspaceList":
          iframeSrc =
            window.context.front +
            url +
            "?token=" +
            this.$store.state.login.currentUser.token;
          // Base64.encode(this.$store.state.login.currentUser.account);
          break;
        case "datalistList":
          iframeSrc =
            window.context.front +"/sysModulePreview"+ url+"/true" +"?token=" +this.$store.state.login.currentUser.token;
          // Base64.encode(this.$store.state.login.currentUser.account);
          break;
        case "viewlist":
          break;
        case "chartList":
          this.isShowIframe = false;
          this.chartId = url;
          break;
      }
      return iframeSrc;
    }
  },
  created() {}
};
</script>
<style lang="scss" scoped>
/deep/.navbar-collapse{
    margin-top: 50px;
    width: 0;
    z-index: 9999;
  }
  /deep/.navbar-collapse-bg{
    margin-left: 1px;
    height: 28px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 10px solid #f5f5f5;
    border-right: none;
    position: relative;
  }
 /deep/ .navbar-collapse-bg:hover{
    cursor: pointer;
  }
  /deep/.navbar-collapse-arrow{
    position: absolute;
    left: -12px;
    top: 7px;
  }
  /deep/.el-tabs__content{
    padding-left: 20px;
  }
  .sysmodule__preview-aside{
    border-right: 1px solid #eee;
    background: #f5f5f5;
  }
  .el-menu-vertical-demo,/deep/.el-menu-item-group{
    background: #f5f5f5;

  }
</style>
