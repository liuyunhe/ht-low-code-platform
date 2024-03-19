const _menus = [{
        id: "0",
        alias: "tenant",
        name: "租户管理",
        children: [{
                id: "0-1",
                alias: "tenantType",
                name: "租户类型管理",
                children: [
                    { id: "0-1-1", alias: "tenantTypeManager", name: "租户类型" },
                    { id: "0-1-2", alias: "tenantParamsManager", name: "租户参数管理" },
                ]
            },
            { id: "0-2", alias: "tenantManager", name: "租户管理" },
        ]
    },
    {
        id: "1",
        alias: "orgStructure",
        name: "组织架构",
        children: [{
                id: "1-1",
                alias: "organization",
                name: "组织管理",
                activeTab: "organization",
                children: [
                    { id: "1-1-1", alias: "demension", name: "维度管理" },
                    { id: "1-1-2", alias: "organization", name: "组织管理" },
                    { id: "1-1-3", alias: "jobManage", name: "职务管理" },
                    { id: "1-1-4", alias: "postManage", name: "岗位管理" },
                    { id: "1-1-5", alias: "prgParamManage", name: "岗位管理" }
                ]
            },
            {
                id: "1-2",
                alias: "user",
                name: "用户管理",
                children: [
                    { id: "1-2-1", alias: "userListManager", name: "用户列表管理" },
                    { id: "1-2-2", alias: "userParamsManager", name: "用户参数管理" }
                ]
            },
            { id: "1-3", alias: "roleManager", name: "角色管理" },
            { id: "1-4", alias: "reportLine", name: "汇报线" }
        ]
    },
    {
        id: "2",
        alias: "designCenter",
        name: "设计中心",
        children: [
            { id: "2-1", alias: "businessObj", name: "数据建模" },
            {
                id: "2-2",
                alias: "form",
                name: "表单设计",
                activeTab: "formManager",
                children: [
                    { id: "2-2-1", alias: "formManager", name: "pc表单" },
                    { id: "2-2-2", alias: "mobileFormManager", name: "手机表单" }
                ]
            },
            {
                id: "2-3",
                alias: "report",
                name: "报表设计",
                tabsStyle: '{"tabPosition":"left","tabType":"border-card"}',
                children: [
                    { id: "2-2-1", alias: "formManager", name: "pc表单" },
                    { id: "2-2-2", alias: "mobileFormManager", name: "手机表单" }
                ]
            },
            { id: "2-4", alias: "portal", name: "门户设计" },
            {
                id: "2-5",
                alias: "meta",
                name: "元数据管理",
                tabsStyle: '{"tabPosition":"top","tabType":"border-card"}',
                children: [
                    { id: "2-2-1", alias: "identityManager", name: "流水号" },
                    { id: "2-2-2", alias: "customDialogList", name: "对话框" },
                    { id: "2-2-3", alias: "customQueryList", name: "关联查询" },
                    { id: "2-2-4", alias: "mobileFormManager", name: "数据字典" },
                    { id: "2-2-5", alias: "mobileFormManager", name: "数据源" }
                ]
            },
            { id: "2-6", alias: "template", name: "模板管理" }
        ]
    },
    {
        id: "3",
        alias: "flow",
        name: "流程管理",
        children: [{
                id: "3-1",
                alias: "flowDesign",
                name: "流程设计",
                children: [
                    { id: "3-1-1", alias: "defManager", name: "流程定义" }
                ]
            },
            {
                id: "3-2",
                alias: "instance",
                name: "实例管理",
                children: [
                    { id: "3-2-1", alias: "instanceManager", name: "实例管理" },
                    { id: "3-2-2", alias: "taskManager", name: "任务管理" }
                ]
            },
            { id: "3-3", alias: "task", name: "任务代理" },
            { id: "3-4", alias: "assign", name: "辅助功能" },
            { id: "3-5", alias: "fileList", name: "附件管理" }
        ]
    },
    {
        id: "4",
        alias: "system",
        name: "系统配置",
        children: [
            { id: "4-1", alias: "menuManager", name: "菜单管理" },
            { id: "4-2", alias: "type", name: "分类管理" },
            { id: "4-3", alias: "subsystem", name: "子系统管理" },
            { id: "4-4", alias: "i18n", name: "国际化" },
            { id: "4-5", alias: "worktime", name: "工作日历" },
            { id: "4-6", alias: "job", name: "定时计划" }
        ]
    },
    {
        id: "5",
        alias: "sysManage",
        name: "系统管理",
        children: [
            { id: "5-1", alias: "status", name: "系统状态" },
            { id: "5-2", alias: "property", name: "系统属性" },
            { id: "5-3", alias: "log", name: "系统日志" },
            { id: "5-4", alias: "recycle", name: "回收站" },
            { id: "5-5", alias: "company", name: "公司信息" },
            { id: "5-6", alias: "production", name: "正式环境配置" }
        ]
    }
];

export default {
    name: "menuData",
    getMenus() {
        return new Promise((resolve, reject) => {
            resolve(_menus);
        });
    },
    getMenuByAlias(alias, cb) {
        let r = null;
        _menus.forEach(function(x) {
            if (x.children) {
                if (!r || r.length == 0) {
                    r = x.children.filter(m => m.alias == alias);
                    if (r && r.length == 1) {
                        r[0].parent = x;
                    }
                }
            }
        });
        cb(r && r[0]);
    }
}