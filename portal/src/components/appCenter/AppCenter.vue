<template>
    <el-container class="fullheight">
      <el-aside width="130px" v-if="!$route.meta.single">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <b class="aside_top_title">{{ currentMenu.name }}</b>
          </div>
          <el-menu
            :default-active="activeMenuIndex"
            unique-opened
            active-text-color="#409EFF"
          >
            <template v-for="menu in menus">
              <el-menu-item
                v-if="!menu.children || menu.children.length == 0"
                :key="menu.id"
                :index="menu.id"
                @click.native="handleSelect(menu)"
                >{{ menu.name }}</el-menu-item
              >
              <el-submenu v-else :key="menu.id" :index="menu.alias">
                <template slot="title">{{ menu.name }}</template>
                <template v-if="menu.children && menu.children.length > 0">
                  <el-menu-item
                    v-for="item in menu.children"
                    :key="item.id"
                    :index="item.id"
                    @click.native="handleSelect(item)"
                    >{{ item.name }}</el-menu-item
                  >
                </template>
              </el-submenu>
            </template>
          </el-menu>
        </el-card>
      </el-aside>
      <el-container>
        <el-header style="height:auto">
          <!--<div v-for="(item,index) in tagTypes">
            <label class="el-form-item__label">{{item.name}}</label>
          </div>-->
          <!--<el-form :model="selectMap">
              <el-form-item v-for="(item,index) in tagTypes" :label="item.name">
                <el-checkbox-group v-model="selectMap[item.id]" @change="groupSelect">
                  <el-checkbox size="mini" label="全部"></el-checkbox>
                  <el-checkbox size="mini" v-for="tag in tagMap[item.id]" :label="tag.name" @change="tagSelect" name=""></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>-->
          <el-row>
            <el-col :span="18">
              <div
                v-for="(item, index) in tagTypes"
                style="padding-left: 15px; padding-bottom: 10px"
                class="tagList"
                :key="index"
              >
                <div style="padding-right: 10px">
                  <el-tag type="info" size="medium">{{ item.name }}</el-tag>
                </div>
                <el-button
                  :type="selectAllStatus[item.id] ? 'primary' : 'default'"
                  size="medium"
                  round
                  style="padding: 3px 15px"
                  @click="selectAll(item.id)"
                  >全部</el-button
                >
                <div style="padding-left: 10px" v-for="tag in tagMap[item.id]">
                  <el-tag
                    :type="tagStatus[tag.id] ? '' : 'info'"
                    @click="tagClick(tag.id, item.id)"
                    size="medium"
                    style="cursor: pointer"
                    >{{ tag.name }}</el-tag
                  >
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <el-input
                placeholder="请输入关键词"
                v-model="searchWord"
                @change="search"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="search"
                ></el-button>
              </el-input>
            </el-col>
          </el-row>
        </el-header>
        <el-main class="tab-container">
          <el-row>
            <el-tabs
              v-model="activeTab"
              @tab-click="tabClick"
              class="fullheight"
              v-if="tabs.length > 0"
            >
              <el-tab-pane
                v-for="tab in tabs"
                :key="tab.id"
                :label="tab.name"
                :name="tab.id"
              >
                <app-main :apps="apps" :pageResult="pageResult"></app-main>
              </el-tab-pane>
            </el-tabs>
            <app-main :apps="apps" :pageResult="pageResult" v-else></app-main>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
    <!-- <el-dialog
      title="搜索结果"
      :visible.sync="searchDialogVisible"
      :fullscreen="true"
      @closed="searchDialogClose"
    >
      <app-main :apps="searchResultApps" :pageResult="pageResult"></app-main>
    </el-dialog> -->
</template>

<script>
import portal from "@/api/portal.js";
import appMain from "@/components/appCenter/AppMain.vue";
import { mapState } from "vuex";
import req from "@/request.js";
export default {
  name: "app-center",
  components: {
    appMain,
  },
  data() {
    return {
      apps: [],
      pageResult: {
        page: 1,
        pageSize: 24,
        total: 0,
      },
      menus: [],
      activeMenuIndex: "",
      activeTab: "",
      tabs: [],
      tagTypes: [],
      selectAllStatus: {},
      tagMap: {},
      tagStatus: {},
      currentMenuId: "",
      searchWord: "",
      searchDialogVisible: false,
      searchResultApps: [],
    };
  },
  computed: mapState({
    currentMenu: (state) => state.menu.currentMenu,
  }),
  mounted() {
    portal.getSubMenus("app_menu", (resp) => {
      this.menus = resp.data.value;
      this.selectFirstOne();
    });
    this.loadTags();
  },
  methods: {
    //加载应用数据
    loadData(menuId) {
      let param = {
        menuId: menuId,
      };
      portal.getSysAppList(param).then((data) => {
        this.apps = data;
        this.currentMenuId = menuId;
      });
    },
    handleSelect(data) {
      this.$set(this, "tabs", data.children);
      if (this.tabs.length <= 0) {
        this.loadData(data.id);
        return;
      }
      this.loadData(this.tabs[0].id);
      this.activeTab = this.tabs[0].id;
    },
    tabClick(tab) {
      this.loadData(tab.name);
    },
    getFirstMenu(menus, index) {
      if (menus[0].children && menus[0].children.length > 0 && index < 2) {
        index++;
        return this.getFirstMenu(menus[0].children);
      } else {
        return menus[0];
      }
    },
    getFirstValidMenu(menus, menuIds) {
      if (menus) {
        for (let i = 0; i < menus.length; i++) {
          if (menuIds.includes(menus[i].id) && menus[i].path.split(".").length > 4) {
            return menus[i];
          }
        }
        for (let j = 0; j < menus.length; j++) {
          let menu = this.getFirstValidMenu(menus[j].children, menuIds);
          if(menu){
            return menu;
          }
        }
      }
    },
    selectFirstOne() {
      //获取有存在应用的菜单
      req.get("${portal}/portal/sysApp/v1/validMenu").then((resp) => {
        if (resp && resp.data && resp.data.length > 0) {
          let menu = this.getFirstValidMenu(this.menus, resp.data);
          if(!menu){
            menu = this.getFirstMenu(this.menus,1);
          }
          this.activeMenuIndex = menu.id;
          this.handleSelect(menu);
        } else {
          if (this.menus && this.menus.length > 0) {
            let menu = this.getFirstMenu(this.menus, 1);
            this.activeMenuIndex = menu.id;
            this.handleSelect(menu);
          }
        }
      });
    },
    //加载标签
    loadTags() {
      portal.getAppTagTypes().then((resp) => {
        this.tagTypes = resp.data;
        resp.data.forEach((item) => {
          this.selectAllStatus[item.id] = false;
          this.tagMap[item.id] = [];
          let querys = [
            {
              property: "type_id_",
              value: item.id,
              group: "main",
              operation: "EQUAL",
              relation: "AND",
            },
          ];
          let filter = { querys: querys };
          req
            .post(window.context.portal + "/portal/sysTag/v1/query", filter)
            .then((resp) => {
              this.tagMap[item.id] = resp.data.rows;
              resp.data.rows.forEach((tag) => {
                this.tagStatus[tag.id] = false;
              });
              this.$forceUpdate();
            });
        });
      });
    },
    selectAll(typeId) {
      this.selectAllStatus[typeId] = !this.selectAllStatus[typeId];
      let tags = this.tagMap[typeId];
      let allToSelect = false; //全选
      for (let i = 0; i < tags.length; i++) {
        if (this.tagStatus[tags[i].id] != true) {
          allToSelect = true;
        }
      }
      if (allToSelect) {
        //全选
        for (let i = 0; i < tags.length; i++) {
          this.tagStatus[tags[i].id] = true;
        }
      } else {
        //全不选
        for (let i = 0; i < tags.length; i++) {
          this.tagStatus[tags[i].id] = false;
        }
      }
      this.reloadData();
      this.$forceUpdate();
    },
    tagClick(tagId, typeId) {
      this.tagStatus[tagId] = !this.tagStatus[tagId];
      //全部选中时，设置全选按钮
      let tags = this.tagMap[typeId];
      let isSelectAll = true;
      for (let i = 0; i < tags.length; i++) {
        if (!this.tagStatus[tags[i].id]) {
          isSelectAll = false;
          break;
        }
      }
      this.selectAllStatus[typeId] = isSelectAll;
      this.reloadData();
      this.$forceUpdate();
    },
    ////重新加载数据
    reloadData() {
      let param = [];
      this.tagTypes.forEach((type) => {
        let selectTagIds = [];
        let tagList = this.tagMap[type.id];
        for (let i = 0; i < tagList.length; i++) {
          if (this.tagStatus[tagList[i].id]) {
            selectTagIds.push(tagList[i].id);
          }
        }
        //querys.push({properties:"TAG_ID_",value:selectTagIds.join(","),group:group,operation:"IN",relation:"AND"});
        if (selectTagIds.length != 0) {
          param.push({ typeId: type.id, tagIds: selectTagIds.join(",") });
        }
      });
      req
        .post(
          "${portal}/portal/sysApp/v1/queryByTagIds/" + this.currentMenuId,
          param
        )
        .then((resp) => {
          this.apps = resp.data;
          this.searchWord = "";
          this.$forceUpdate();
        });
    },
    search() {
      if(!this.searchWord){
        this.$message({type:"warning",message:"请输入关键词"})
        return ;
      }
      let querys = [
        {
          property: "name",
          value: this.searchWord,
          group: "search",
          operation: "LIKE",
          relation: "AND",
        },
      ];
      let queryFilter = { querys };
      this.$loading();
      req.post("${portal}/portal/sysApp/v1/queryByFilter", queryFilter).then((resp) => {
        this.apps.splice(0);
        Object.keys(this.selectAllStatus).forEach(key=>{
          this.$set(this.selectAllStatus,key,false);
        })
        Object.keys(this.tagStatus).forEach(key=>{
          this.$set(this.tagStatus,key,false);
        })
        if (resp.data && resp.data.length > 0) {
          resp.data.forEach((item) => {
            this.apps.push(item);
          });
          //this.searchDialogVisible = true;
        } else {
          this.$message({ type: "warning", message: "未查询到结果" });
        }
        this.$loading().close();
      });
    },
    searchDialogClose() {
      this.searchResultApps.splice(0);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.aside_top_title{
    font-size: 14px;
    color: #303133;
  }
// .el-main {
//   padding-top: 0px;
// }
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
  &:hover,&:focus{
      background-color: transparent;
      color:$--color-primary;
    }
}
.el-submenu .el-menu-item{
    height: 36px;
    line-height: 36px;
}
  .el-menu-item.is-active{
    position: relative;
    &::before{
      position: absolute;
      content: "";
      width: 2px;
      height: 14px;
      background:$--color-primary;
      top:11px;
      left: 12px;
    }
  }
  .el-submenu{
    .el-menu-item.is-active{
      &::before{
        left:30px;
        top: 12px;
      }
    }
  }
/deep/ div.el-submenu__title {
  height: 56px;
  line-height: 56px;
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
.tagList {
  display: flex;
  flex-direction: row;
}
.tab-container{
  background-color: #fff;
  margin: 10px 20px 0 20px;
}
</style>
