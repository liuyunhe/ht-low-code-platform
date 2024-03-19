import Vue from "vue";
import Router from "vue-router";
import store from "@/store";
//ccwgq 路由尽量使用动态引入
const Login = () => import("@/views/Login.vue");
const Work = () => import("@/views/Work.vue");
const MailList = () => import("@/views/MailList.vue");
const Personal = () => import("@/views/Personal.vue");
const MessageReceiverList = () => import("@/views/MessageReceiverList.vue");

const MessageRemindList = () => import("@/views/MessageRemindList.vue");
const NotFound = () => import("@/views/NotFound.vue");
// import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
// import Work from "@/views/Work.vue";
// import MailList from "@/views/MailList.vue";
// import Personal from "@/views/Personal.vue";
// import MessageReceiverList from "@/views/MessageReceiverList.vue";
import utils from "@/utils.js";
// import NotFound from "@/views/NotFound.vue";
import req from "@/request.js";

Vue.use(Router);

var router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        // 根路径下跳转到home
        {
            path: "/",
            redirect: {
                name: "home"
            }
        },
        // 租户登录
        {
            path: "/login/:tenant",
            name: "tenantLogin",
            props: true,
            component: Login,
            meta: {
                single: true,
                anonymous: true
            }
        },
        // 登录
        {
            path: "/login",
            name: "login",
            component: Login,
            meta: {
                single: true,
                anonymous: true
            }
        },
        // 主页
        {
            path: "/home",
            name: "home",
            component: Home
        },
        //工作台
        {
            path: "/work",
            name: "work",
            component: Work
            // children: [{
            //         path: "/",
            //         redirect: "myRequest"
            //     },
            //     {
            //         path: "myRequest",
            //         component: () =>
            //             import ("@/components/flow/MyRequest.vue"),
            //         props: true,
            //     },
            //     {
            //         path: "myMatters",
            //         component: () =>
            //             import ("@/components/flow/MyMatters.vue"),
            //         props: true,
            //     }, {
            //         path: "MyTurnOutList",
            //         component: () =>
            //             import ("@/components/flow/MyTurnOutList.vue"),
            //         props: true,
            //     },
            // ]
        },
        // 通讯录页面
        {
            path: "/mailList",
            name: "mailList",
            component: MailList
        },
        //个人中心
        {
            path: "/personal",
            name: "personal",
            component: Personal
        },
        //消息页面，通知信息在此
        {
            path: "/messageReceiverList",
            name: "messageReceiverList",
            component: MessageReceiverList
        },

        //提醒消息页面
        {
            path: "/messageRemindList",
            name: "messageRemindList",
            component: MessageRemindList
        },
        //   {
        //     path: "/myHome",
        //     name: "myHome",
        //     component: () =>
        //         import ("@/components/tabbar/MyHome.vue"),
        //     props: true
        // },
        // {
        //     path: "/work",
        //     name: "work",
        //     component: () =>
        //         import ("@/components/tabbar/Work.vue"),
        //     props: true
        // },
        // {
        //     path: "/mailList",
        //     name: "mailList",
        //     component: () =>
        //         import ("@/components/tabbar/MailList.vue"),
        //     props: true
        // },
        // {
        //     path: "/personal",
        //     name: "personal",
        //     component: () =>
        //         import ("@/components/tabbar/Personal.vue"),
        //     props: true
        // },

        // 我的请求
        {
            path: "/work/myRequest",
            name: "myRequest",
            component: () =>
                import("@/components/flow/MyRequest.vue"),
            props: true,
        },
        {
            path: "/work/myMatters",
            name: "myDefaultMatters",
            redirect: "/work/myMatters/0"
        },
        //待办已办
        {
            path: "/work/myMatters/:activeNumber",
            name: "myMatters",
            component: () =>
                import("@/components/flow/MyMatters.vue"),
            props: true
        },
        // 转办
        {
            path: "/work/myTurnOutList",
            name: "myTurnOutList",
            component: () =>
                import("@/components/flow/MyTurnOutList.vue"),
            props: true
        },
        // 新建流程
        {
            path: "/work/startFlowList",
            name: "startFlowList",
            component: () =>
                import("@/components/flow/StartFlowList.vue"),
            props: true
        },
        // 我的传阅
        {
            path: "/work/myNotice",
            name: "myNotice",
            component: () =>
                import("@/components/flow/MyNotice.vue"),
            props: true
        },
        // 开始流程
        {
            path: "/work/startFlow/:defId/:instId",
            name: "startFlow",
            component: () =>
                import("@/components/flow/StartFlow.vue"),
            props: true
        },
        // 新建某个新的流程页面
        {
            path: "/work/agentStart/:defId/:leaderId",
            name: "startFlow",
            component: () =>
                import("@/components/flow/StartFlow.vue"),
            props: true
        },
        /*审批内容，表单页面*/
        {
            path: "/formContent",
            name: "formContent",
            component: () =>
                import("@/components/flow/FormContent.vue"),
            props: true
        },
        /*  表单预览  */
        {
            path: "/previewForm/:formId",
            name: "previewForm",
            component: () =>
                import("@/components/flow/PreviewForm.vue"),
            props: true,
            meta: {
                single: true
            }
        },
        /* 跳转任务详情 */
        {
            path: "/inst/:instId/:type",
            name: "inst",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        /* 待阅列表跳转 */
        {
            path: "/inst/:instId/:type/:readId",
            name: "instRead",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        /* 已阅列表跳转 */
        {
            path: "/inst/:instId/:type/:readType/:readDoneId",
            name: "instRead",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        {
            path: "/instRead/:instId/:myReadType",
            name: "instRead",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        /* 我抄送的列表跳转 */
        {
            path: "/myRead/:instId/:readId/:myReadType",
            name: "myRead",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        /* 任务实例页面 */
        {
            path: "/inst/:instId",
            name: "defaultInst",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        /**  实例任务分享 */
        {
            path: "/shareInst/:instId/:isShare",
            name: "defaultInst",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        //钉钉
        {
            path: "/dingTalk",
            name: "dingTalk",
            component: () =>
                import("@/components/jump/dt_jump.vue"),
            props: true,
            meta: {
                single: true,
                anonymous: true
            }
        },
        //企业公众号
        {
            path: "/weChatOffAcc",
            name: "weChatOffAcc",
            component: () =>
                import("@/components/jump/wcoa_jump.vue"),
            props: true,
            meta: {
                single: true,
                anonymous: true
            }
        },
        /* 企业微信 */
        {
            path: "/weChat",
            name: "weChat",
            component: () =>
                import("@/components/jump/wcw_jump.vue"),
            props: true,
            meta: {
                single: true,
                anonymous: true
            }
        },
        /* 任务页面 */
        {
            path: "/task/:taskId/:leaderId",
            name: "task",
            component: () =>
                import("@/components/flow/task/Task.vue"),
            props: true
        },
        {
            path: "/template/preview/:templateKey",
            name: "templatePreview",
            component: () =>
                import("@/components/dataTemplate/templatePreview.vue"),
            props: true
        },
        {
            path: "/template/form/:templateKey/:action",
            name: "templateForm",
            component: () =>
                import("@/components/dataTemplate/templateForm.vue"),
            props: true
        },
        {
            path: "/template/form/:templateKey/:action/:single",
            name: "templateFormSingle",
            component: () =>
                import("@/components/dataTemplate/templateForm.vue"),
            props: true,
        },
        {
            path: "/statement/template/form/:templateKey/:action/:single/:isShare",
            name: "templateShare",
            component: () =>
                import("@/components/dataTemplate/templateForm.vue"),
            props: true,
            meta: {
                single: true
            }
        },
        {
            path: "/QRCodeForm/:templateKey/:action",
            name: "QRCodeForm",
            component: () =>
                import("@/components/dataTemplate/QRCodeForm.vue"),
            props: true,
            meta: {
                single: true
            }
        },
        {
            path: "/htColumn/:columnAlias",
            name: "htColumn",
            component: () =>
                import("@/components/eipControl/bus/HtColumn.vue"),
            props: true,
        },
        {
            path: "/canvas",
            name: "canvas",
            component: () =>
                import("@/components/canvas/Canvas.vue"),
            props: true
        },
        {
            path: "/file/preview/:fileId",
            name: "attanchmentPreview",
            component: () =>
                import("@/views/AttanchmentPreview.vue"),
            props: true,
            meta: {
                single: true
            }
        },
        {
            path: "/messageFillPage/:tipId",
            name: "messageFillPage",
            component: () =>
                import("@/views/MessageFillPage.vue"),
            props: true,
            meta: {
                single: true,
                anonymous: true
            }
        },
        {
            path: "*",
            component: NotFound,
            meta: {
                single: true
            }
        }
    ]
});

const handelShortUrl = (to, from, next) => {
    req.get("${portal}/portal/shorturlManage/v1/getLongUrlByShortUrl?shortUrl=" + to.fullPath.substr(1), "", false).then((resp) => {
        if (resp && resp.data && resp.data.state) {
            store.dispatch("login/validAndCompletedCurrent", resp.data.value.guestToken).then(() => {
                next({ path: resp.data.value.url });
            }).catch(() => {
                logoutAndCleanUp(to, from, next);
            });
        } else {
            next({ path: "/messageFillPage/" + resp.data.message });
        }
    }).catch(() => {
        logoutAndCleanUp(to, from, next);
    });
};


const logoutAndCleanUp = (to, from, next) => {
    store.dispatch("login/logoutAndCleanUp").then(() => {
        if (window.ssoConfig.mode == "cas" && !ticket) {
            let service = window.location.href;
            localStorage.setItem("service", service);
            window.location.href = window.ssoConfig.url + "?service=" + service;
        }
        if (!window.ssoConfig.mode || window.ssoConfig.mode == "jwt") {
            //此时token已经无效，去掉url中的token参数
            let query = JSON.parse(JSON.stringify(to.query));
            delete query.token;
            let queryStr = utils.queryParams(query, true);
            //租户模式跳转
            if (query && query.tenantCode) {
                next({
                    path: "/login/" + query.tenantCode,
                    query: {
                        redirect: to.path
                    }
                });
                window.location.reload();
                return;
            }
            next({
                path: "/login",
                query: {
                    redirect: to.path + queryStr
                }
            });
        }
    });
};

router.beforeEach((to, from, next) => {
    //ccwgq 2021-11-03 判断路由，防止重复的单点登录
    //如果重复就回到首页
    if (['weChat', 'weChatOffAcc', 'dingTalk'].includes(to.name) && from.fullPath !== '/') {
        next({ name: 'home' })
    }
    /**   -------   跳转逻辑处理完毕  --- */

    if (to.fullPath.startsWith("/surl/")) {
        handelShortUrl(to, from, next);
        return;
    }

    if (to.matched.some(record => !record.meta.anonymous)) {
        let ticket = to.query.token;
        if (window.ssoConfig.mode == "cas") {
            ticket = to.query.ticket;
        }
        store
            .dispatch("login/validAndCompletedCurrent", ticket)
            .then(() => {
                setTimeout(() => {
                    // 登录成功后清除url参数
                    window.history.replaceState(null, null, window.location.pathname);
                }, 3000);
                next();
            })
            .catch(() => {
                logoutAndCleanUp(to, from, next);
            });
    } else {
        if (to.path === "/login" && store.state.login && store.state.login.currentUser) {
            next({ path: "/home" });
        } else {
            next();
        }
    }
});

export default router;