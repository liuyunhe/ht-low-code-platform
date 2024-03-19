<template>
  <div class="tab-container">
    <el-tabs
      class="fullheight tab-container-root"
      v-model="currentTabComponent"
      :type="finalTabsStyle.tabType"
      @tab-click="handlePaneClick"
      v-if="tabComponentOptions.length>0"
    >
      <el-tab-pane
        :name="tabComponent.alias"
        v-for="(tabComponent,index) in tabComponentOptions"
        :key="index"
      >
        <span slot="label">
          <el-link :underline="false" :href="genHref(tabComponent.alias)">{{tabComponent.name}}</el-link>
        </span>

        <component
          v-if="currentTabComponent ==  tabComponent.alias"
          v-bind:is="currentTabComponent"
        ></component>
      </el-tab-pane>
    </el-tabs>

    <component v-if="tabComponentOptions.length<=0" v-bind:is="currentTabComponent"></component>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import utils from "@/hotent-ui-util.js";

// 懒加载组件 只加载当前页面用到的组件
/** 表单相关页面 **/
const formManager = () => import("@/views/form/FormManager.vue");
const mobileFormManager = () => import("@/views/form/MobileFormManager.vue");
const customDialogList = () => import("@/views/form/customDialog/CustomDialogList.vue");
const customQueryList = () => import("@/views/form/customquery/CustomQueryList.vue");
const businessObj = () => import("@/views/form/BusinessObj.vue");
const formTemplateList = () => import("@/views/form/FormTemplateList.vue");
const flowChartManager = () => import("@/views/form/FlowChartManager.vue");
const customViewManager = () => import("@/views/form/CustomViewManager.vue");
const customChartManager = () => import("@/views/form/CustomChartManager.vue");
const dataTemplateList = () => import("@/views/form/dataTemplate/DataTemplateManager.vue");
const dataDicManager = () => import("@/views/meta/DataDicManager.vue");
const viewManageList = () => import("@/views/form/ViewManageList.vue");


/** 用户中心相关页面 **/
const tenantManager = () => import("@/views/uc/TenantManager.vue");
const tenantInfoManager = () => import("@/views/system/TenantInfoManager.vue");
const Demension = () => import("@/views/uc/org/Demension.vue");
const roleManager = () => import("@/views/uc/RoleManager.vue");
const reportLine = () => import("@/views/uc/ReportLine.vue");
const userListManager = () => import("@/views/uc/UserListManager.vue");
const onlineUserManager = () => import("@/views/uc/OnlineUserManager.vue");
const tenantTypeManager = () => import("@/views/uc/TenantTypeManager.vue");
const tenantParamsManager = () => import("@/views/uc/TenantParamsManager.vue");
const orgManager = () => import("@/views/uc/org/Organization.vue");
const heiOrganization = () => import("@/views/uc/heiorgmanager/HeiOrganization.vue");
const jobManage = () => import("@/views/uc/org/JobManager.vue");
const postManager = () => import("@/views/uc/org/PostManager.vue");
const prgParamManage = () => import("@/views/uc/org/PrgParamManage.vue");
const userParamManager = () => import("@/views/uc/UserParamManager.vue");
const matrixManager = ()=> import("@/views/uc/MatrixManager.vue");
const loginLogManager = () => import("@/views/uc/LoginLogManager.vue");
const holidayManager = () => import("@/views/uc/HolidayManager.vue");
const shiftRuleManager = () => import("@/views/uc/ShiftRuleManager.vue");

/** 流程相关页面 **/
const printRecordManager = () => import("@/views/flow/PrintRecordManager.vue");
const defManager = () => import("@/views/flow/DefManager.vue");
const instanceManager = () => import("@/views/flow/InstanceManager.vue");
const taskManager = () => import("@/views/flow/TaskManager.vue");
const delegationManager = () => import("@/views/flow/DelegationManager.vue");
const agentManager = () => import("@/views/flow/AgentManager.vue");
const secretaryManager = () => import("@/views/flow/SecretaryManager.vue");
const transferManager = () => import("@/views/flow/TransferManager.vue");
const approvalItemList = () => import("@/views/flow/help/ApprovalItemList.vue");
const msgTemplateList = () => import("@/views/flow/help/MsgTemplateList.vue");
const flowAuthManager = () => import("@/views/flow/FlowAuthManager.vue");
const scriptList = () => import("@/views/flow/help/ScriptList.vue");
const conditionScriptList = () => import("@/views/flow/help/ConditionScriptList.vue");
const bpmCommonDefList = () => import("@/views/flow/BpmCommonDefList.vue");

/** 门户相关页面 **/
const fileList = () => import("@/views/file/FileList.vue");
const identityManager = () => import("@/views/meta/IdentityManager.vue");
const dataSourceManager = () => import("@/views/meta/DataSourceManager.vue");
const i18nMessageManager = () => import("@/views/system/i18n/I18nMessageManager.vue");
const i18nMessageTypeManager = () => import("@/views/system/i18n/I18nMessageTypeManager.vue");
const menuManager = () => import("@/views/system/menu/MenuManager.vue");
const methodListManager = () => import("@/views/system/menu/MethodListManager.vue");
const schedulerManager = () => import("@/views/system/SchedulerManager.vue");
const executeJobList = () => import("@/views/system/ExecuteJobList.vue");
const schedulerTriggerList = () => import("@/views/system/SchedulerTriggerList.vue");
const sysTypeTreeManager = () => import("@/views/system/SysTypeTreeManager.vue");
const sysTypeCatManager = () => import("@/views/system/SysTypeCatManager.vue");
const demo = () => import("@/views/Demo.vue");
const indexLayout = () => import("@/views/portal/IndexLayout.vue");
const indexColumn = () => import("@/views/portal/IndexColumn.vue");
const flowInterfaceCllLog = () => import("@/views/system/log/FlowInterfaceCllLog.vue");
const messageSendLog = () => import("@/views/system/log/MessageSendLog.vue");
const systemLogConfig = () => import("@/views/system/log/SystemLogConfig.vue");
const systemLogList = () => import("@/views/system/log/SystemLogList.vue");
const layoutDistribution = () => import("@/views/portal/LayoutDistribution.vue");
const defaultLayout = () => import("@/views/portal/DefaultLayout.vue");
const sysPropertiesManager = () => import("@/views/system/SysPropertiesManager.vue");
const sysSetting = () => import("@/views/system/SysSetting.vue");
const pwdStrategy = () => import("@/views/uc/PwdStrategy.vue");
const startGenerator = () => import("@/views/system/generator/StartGenerator.vue");
const generatorLog = () => import("@/views/system/generator/GeneratorLog.vue");
const sysExternalUniteList =()=> import("@/views/system/sysExternalUnite/SysExternalUnite.vue");
const appModelManager =()=> import("@/views/portal/AppModelManager.vue");
const portalNewsNoticeManager = () => import("@/views/news/PortalNewsNoticeManager.vue");
const flowUploadProperties = () => import("@/views/file/FlowUploadPropertiesManager.vue");
const portalDataSensitiveManager = () => import(/* webpackChunkName: "group-portal" */ "@/views/portal/PortalDataSensitiveManager.vue");
const sysTagManager = () => import("@/views/portal/SysTagManager.vue");
const appCenter = () => import("@/views/portal/AppCenter.vue");
const watermarkManager = () => import("@/views/flow/WatermarkManager.vue");
const sysModuleList = () => import("@/views/system/generator/sysModuleList.vue")

import menuApi from "@/api/menu.js";

export default {
  name: "ht-tabs-component",
  components: {
    portalNewsNoticeManager,
    formManager,
    mobileFormManager,
    roleManager,
    reportLine,
    menuManager,
    schedulerManager,
    userListManager,
    onlineUserManager,
    tenantTypeManager,
    tenantParamsManager,
    tenantManager,
    tenantInfoManager,
    orgManager,
    instanceManager,
    taskManager,
    printRecordManager,
    identityManager,
    executeJobList,
    schedulerTriggerList,
    dataSourceManager,
    dataDicManager,
    i18nMessageManager,
    i18nMessageTypeManager,
    fileList,
    defManager,
    Demension,
    customDialogList,
    customQueryList,
    businessObj,
    bpmCommonDefList,
    sysTypeTreeManager,
    sysTypeCatManager,
    customChartManager,
    delegationManager,
    agentManager,
    secretaryManager,
    transferManager,
    prgParamManage,
    jobManage,
    postManager,
    formTemplateList,
    dataTemplateList,
    demo,
    indexLayout,
    indexColumn,
    msgTemplateList,
    approvalItemList,
    scriptList,
    userParamManager,
    flowAuthManager,
    conditionScriptList,
    methodListManager,
    flowInterfaceCllLog,
    messageSendLog,
    systemLogConfig,
    systemLogList,
    layoutDistribution,
    defaultLayout,
    flowChartManager,
    customViewManager,
    heiOrganization,
    sysPropertiesManager,
    startGenerator,
    generatorLog,
    pwdStrategy,
    viewManageList,
    matrixManager,
    sysSetting,
    sysExternalUniteList,
    loginLogManager,
    appModelManager,
    flowUploadProperties,
    portalDataSensitiveManager,
    holidayManager,
    shiftRuleManager,
    sysTagManager,
    appCenter,
    watermarkManager,
    sysModuleList,
  },
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
    },
    genHref(anchor) {
      if (this.$router.mode == "history") {
        return "#" + anchor;
      }
      return "/#" + this.$route.path + "#" + anchor;
    },
    activeTab(fullpath) {
      let lastIdx = fullpath.lastIndexOf("#");
      if (lastIdx != -1) {
        let urlAnchor = fullpath.substr(lastIdx + 1);
        this.tabComponentOptions.filter(item => {
          if (item.alias == urlAnchor) {
            this.currentTabComponent = urlAnchor;
          }
        });
      }
    }
  },
  mounted() {},
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
            vm.currentTabComponent =
              m.activeTab || vm.tabComponentOptions[0].alias;
            vm.activeTab(to.fullPath);
          } else {
            vm.tabComponentOptions = [];
            vm.currentTabComponent = m.alias;
          }
          if (m.tabsStyle) {
            vm.menuTabsStyle = utils.parseToJson(m.tabsStyle);
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
    this.activeTab(to.fullPath);
    next();
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
