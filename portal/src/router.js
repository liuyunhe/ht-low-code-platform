import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import Login from '@/views/Login.vue'
import NotFound from '@/views/NotFound.vue'
import Home from '@/views/Home.vue'
import menuContent from '@/views/menuContent.vue'
import Statement from '@/views/Statement.vue'
import req from '@/request.js'
import routerFinance from '@/routerFinance.js'

//ccwgq 2022-07-07 引入流程的事件总线
import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
  ; ``
let router_counter = 0

Vue.use(Router)

var router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: {
        name: 'home',
      },
    },
    //wugq:修复 /login/null
    {
      path: '/login/null',
      redirect: '/login',
    },
    //yigz:2022-08-16 修复 /login/null
    // {
    //   path: '/login/login',
    //   redirect: '/login',
    // },
    {
      path: '/login/:tenant',
      name: 'loginTenant',
      props: true,
      component: Login,
      meta: {
        single: true,
        anonymous: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        single: true,
        anonymous: true,
      },
    },
    {
      path: '/resetPwdView',
      name: 'resetPwdView',
      props: true,
      component: () => import('@/views/ResetPwdView.vue'),
      meta: {
        single: true,
        anonymous: true,
      },
    },
    {
      path: '/formManage/:instId/:type',
      name: 'formManage',
      component: () => import('@/components/flow/formManage.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: {
        isHome: true,
      },
    },
    {
      path: '/v-flow',
      component: menuContent,
      children: [
        {
          path: '/',
          name: 'todo-default',
          redirect: 'v-todo',
        },
        /**  ========  todo  start ============ */
        {
          path: 'v-todo',
          name: 'todo',
          component: () => import('@/components/flow/todo.vue'),
          meta: {
            request: 'getCountByUserId',
          },
        },
        {
          path: 'v-todo/:orgName/:orgId',
          name: 'todoByOrgId',
          component: () => import('@/components/flow/todo.vue'),
          props: true,
        },
        {
          path: 'v-leader',
          name: 'leader',
          component: () => import('@/components/flow/leaderTodo.vue'),
        },

        {
          path: 'v-todo/:defKey',
          name: 'todo-defKey',
          component: () => import('@/components/flow/todo.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        /**  ========  done start  ================== */
        {
          path: 'v-done',
          name: 'done',
          component: () => import('@/components/flow/done.vue'),
        },
        {
          path: 'v-done/:defKey',
          name: 'done-defKey',
          component: () => import('@/components/flow/done.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'v-request',
          name: 'request',
          component: () => import('@/components/flow/myRequest.vue'),
          meta: {
            request: 'myRequestCount',
          },
        },
        {
          path: 'v-request/:defKey',
          name: 'request-defKey',
          component: () => import('@/components/flow/myRequest.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'v-flowList',
          name: 'flowList',
          component: () => import('@/components/flow/flowList.vue'),
        },
        {
          path: 'v-todoRead',
          name: 'todoRead',
          component: () => import('@/components/flow/todoRead.vue'),
        },
        {
          path: 'v-todoRead/:defKey',
          name: 'todoRead-defKey',
          component: () => import('@/components/flow/todoRead.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'v-doneRead',
          name: 'doneRead',
          component: () => import('@/components/flow/doneRead.vue'),
        },
        {
          path: 'v-doneRead/:defKey',
          name: 'doneRead-defKey',
          component: () => import('@/components/flow/doneRead.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'v-myRead',
          name: 'myRead',
          component: () => import('@/components/flow/myRead.vue'),
        },
        {
          path: 'v-myRead/:defKey',
          name: 'myRead-defKey',
          component: () => import('@/components/flow/myRead.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'v-myDelegate',
          name: 'myDelegate',
          component: () => import('@/components/flow/myDelegate.vue'),
        },
        {
          path: 'v-myDelegate/:defKey',
          name: 'myDelegate-defKey',
          component: () => import('@/components/flow/myDelegate.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        //公文查询
        {
          path: 'v-searchFlow',
          name: 'searchFlow',
          component: () => import('@/components/flow/ou/searchFlow.vue'),
        },
      ],
    },
    /* 跳转启动流程 */
    {
      path: '/agentStart/:defId/:leaderId',
      name: 'defStart',
      component: () => import('@/components/flow/start.vue'),
      props: true,
    },
    /*复制流程启动 */
    {
      path: '/agentStart/:defId/:leaderId/:copyInstId',
      name: 'defCopyStart',
      component: () => import('@/components/flow/start.vue'),
      props: true,
    },
    //根据流程定义key启动流程
    {
      path: '/agentStartByKey/:defKey',
      name: 'defKeyStart',
      component: () => import('@/components/flow/startByKey.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/sysModulePreview/:id/:appName',
      name: 'sysModulePreview',
      component: () => import('@/components/generator/sysModulePreview.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/start/:defId/:instId',
      name: 'instStart',
      component: () => import('@/components/flow/start.vue'),
      props: true,
    },
    /* 跳转任务详情 */
    {
      path: '/inst/:instId/:type',
      name: 'inst',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },

    /* 待阅列表跳转 */
    {
      path: '/inst/:instId/:type/:readId',
      name: 'instRead-read',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    /* 模块开发代办跳转 */
    {
      path: '/sysModuleInst/:taskId/:leaderId/:defKey/:noSingle',
      name: 'sysModuleInst',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 数据报表模块开发代办跳转 */
    {
      path: '/reportModuleInst/:taskId/:leaderId/:defKey/:noSingle/:templateKey',
      name: 'reportModuleInst',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 模块开发已办列表跳转 */
    {
      path: '/sysModuleInst/:instId/:type/:defKey',
      name: 'sysModuleInstJump',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },

    /* 数据报表模块开发已办列表跳转 */
    {
      path: '/reportModuleInstDone/:instId/:type/:defKey/:templateKey',
      name: 'reportModuleInstDone',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 状态为FOLLOW时候模块开发待阅跳转 */
    {
      path: '/sysModuleInstTaskRead/:taskId/:task_state/:defKey',
      name: 'sysModuleInstTaskRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 模块开发待阅跳转 */
    {
      path: '/sysModuleInstRead/:instId/:type/:readId/:defKey',
      name: 'sysModuleInstReadJump',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 状态为FOLLOW时候数据报表模块开发待阅跳转 */
    {
      path: '/reportModuleInstTaskRead/:taskId/:task_state/:defKey/:templateKey',
      name: 'reportModuleInstTaskRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 数据报表模块开发待阅跳转 */
    {
      path: '/reportModuleInstRead/:instId/:type/:readId/:defKey/:templateKey',
      name: 'reportModuleInstRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 模块开发已阅列表跳转 */
    {
      path: '/sysModuleInstDone/:instId/:type/:readType/:readDoneId/:defKey',
      name: 'sysModuleInstDone',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 数据报表模块开发已阅列表跳转 */
    {
      path: '/reportModuleInstDone/:instId/:type/:readType/:readDoneId/:defKey/:templateKey',
      name: 'reportModuleInstDoneRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 模块开发我抄送列表跳转 */
    {
      path: '/sysModuleInstMyRead/:instId/:readId/:myReadType/:defKey',
      name: 'sysModuleInstMyRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    /* 数据报表模块开发我抄送列表跳转 */
    {
      path: '/reportModuleInstMyRead/:instId/:readId/:myReadType/:defKey/:templateKey',
      name: 'reportModuleInstMyRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    //模块开发我抄送的列表跳转
    {
      path: '/sysModuleInstRead/:instId/:myReadType/:defKey',
      name: 'sysModuleInstRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    //数据报表模块开发我抄送的列表跳转
    {
      path: '/reportModuleInstRead/:instId/:myReadType/:defKey/:templateKey',
      name: 'reportModuleInstReadJump',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },

    /* 已阅列表跳转 */
    {
      path: '/inst/:instId/:type/:readType/:readDoneId',
      name: 'instRead-done',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },

    /* 我抄送的列表跳转 */
    {
      path: '/myRead/:instId/:readId/:myReadType',
      name: 'myRead-type',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    {
      path: '/instRead/:instId/:myReadType',
      name: 'instRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },

    {
      path: '/taskRead/:taskId/:task_state',
      name: 'taskRead',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    {
      path: '/inst/:instId',
      name: 'defaultInst',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    {
      path: '/task/:taskId/:leaderId',
      name: 'task',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    {
      path: '/taskFromOtherPage/:taskId/:leaderId/:from',
      name: 'taskFromOtherPage',
      component: () => import('@/components/flow/task.vue'),
      props: true,
    },
    {
      path: '/task/:taskId/:leaderId/:noSingle',
      name: 'taskNosingle',
      component: () => import('@/components/flow/task.vue'),
      props: true,
      meta: {
        single: true,
      },
    },

    /* 邮箱页面开始 */
    {
      path: '/v-mail',
      component: menuContent,
      children: [
        {
          path: '/',
          name: 'mailList-default',
          redirect: 'v-mailList',
        },
        {
          path: 'v-mailList',
          name: 'mailList',
          component: () => import('@/components/mail/mailList.vue'),
        },
        {
          path: 'v-linkmanList',
          name: 'linkmanList',
          component: () => import('@/components/mail/mailLinkmanList.vue'),
        },
        {
          path: 'v-settingList',
          name: 'settingList',
          component: () => import('@/components/mail/mailSettingList.vue'),
        },
      ],
    },
    {
      path: '/mail/mailGet/:id',
      name: 'mailGet',
      component: () => import('@/components/mail/mailGet.vue'),
      props: true,
    },
    {
      path: '/mail/mailAdd',
      name: 'mailAdd',
      component: () => import('@/components/mail/mailAdd.vue'),
    },
    {
      path: '/mail/mailEdit/:id',
      name: 'mailEdit',
      component: () => import('@/components/mail/mailEdit.vue'),
      props: true,
    },
    {
      path: '/mail/linkmanEdit/:id',
      name: 'mailLinkmanEdit',
      component: () => import('@/components/mail/mailLinkmanEdit.vue'),
      props: true,
    },
    {
      path: '/mail/linkmanGet/:id',
      name: 'mailLinkmanGet',
      component: () => import('@/components/mail/mailLinkmanGet.vue'),
      props: true,
    },
    {
      path: '/mail/settingAdd',
      name: 'mailSettingAdd',
      component: () => import('@/components/mail/mailSettingAdd.vue'),
    },
    {
      path: '/mail/settingEdit/:id',
      name: 'mailSettingEdit',
      component: () => import('@/components/mail/mailSettingEdit.vue'),
      props: true,
    },
    {
      path: '/mail/settingGet/:id',
      name: 'mailSettingGet',
      component: () => import('@/components/mail/mailSettingGet.vue'),
      props: true,
    },
    /* 邮箱页面结束*/

    {
      path: '/v-personal',
      component: menuContent,
      children: [
        {
          path: '/',
          name: 'approvalItem-default',
          redirect: 'v-approvalItem',
        },
        {
          path: 'v-approvalItem',
          name: 'approvalItemList',
          component: () =>
            import('@/components/approvalItem/approvalItemList.vue'),
        },
        {
          path: 'v-agent',
          name: 'agentList',
          component: () => import('@/components/agent/agentList.vue'),
        },
        {
          path: 'v-secretary',
          name: 'secretary',
          component: () => import('@/components/secretary/secretaryList.vue'),
        },
        {
          path: 'v-bpmDeputy',
          name: 'bpmDeputy',
          component: () => import('@/components/bpmDeputy/bpmDeputyList.vue'),
        },
        {
          path: 'v-myLayout',
          name: 'myLayout',
          component: () => import('@/components/myLayout/myLayoutList.vue'),
        },
        {
          path: 'v-messageReceiver',
          name: 'messageReceiverList',
          component: () =>
            import('@/components/message/messageReceiverList.vue'),
        },
      ],
    },
    {
      path: '/v-approvalItem',
      name: 'approvalItem',
      component: () => import('@/components/approvalItem/approvalItemList.vue'),
      props: true,
    },
    {
      path: '/approvalItem/approvalItemEdit/:id',
      name: 'approvalItemEdit',
      component: () => import('@/components/approvalItem/approvalItemEdit.vue'),
      props: true,
    },
    {
      path: '/approvalItem/approvalItemAdd',
      name: 'approvalItemAdd',
      component: () => import('@/components/approvalItem/approvalItemEdit.vue'),
      props: true,
    },
    {
      path: '/approvalItem/approvalItemGet/:id',
      name: 'approvalItemGet',
      component: () => import('@/components/approvalItem/approvalItemGet.vue'),
      props: true,
    },
    {
      path: '/v-agent',
      name: 'agent',
      component: () => import('@/components/agent/agentList.vue'),
      props: true,
    },
    {
      path: '/agent/agentAdd',
      name: 'agentAdd',
      component: () => import('@/components/agent/agentAdd.vue'),
      props: true,
    },
    {
      path: '/agent/agentEdit/:id',
      name: 'agentEdit',
      component: () => import('@/components/agent/agentEdit.vue'),
      props: true,
    },
    {
      path: '/agent/agentGet/:id',
      name: 'agentGet',
      component: () => import('@/components/agent/agentGet.vue'),
      props: true,
    },
    {
      path: '/secretary/secretaryEdit/:id',
      name: 'secretaryEdit',
      component: () => import('@/components/secretary/secretaryEdit.vue'),
      props: true,
    },
    {
      path: 'v-bpmDeputy',
      name: 'bpmDeputyList',
      component: () => import('@/components/bpmDeputy/bpmDeputyList.vue'),
      props: true,
    },
    {
      path: '/bpmDeputy/bpmDeputySetting/',
      name: 'bpmDeputySetting',
      component: () => import('@/components/bpmDeputy/bpmDeputySetting.vue'),
      props: true,
    },
    {
      path: '/bpmDeputy/bpmDeputySetting/:id',
      name: 'bpmDeputySetting-id',
      component: () => import('@/components/bpmDeputy/bpmDeputySetting.vue'),
      props: true,
    },
    /* 跳转新闻动态列表 */
    {
      path: '/newsList/:type',
      name: 'newsList',
      component: () => import('@/components/news/newsList.vue'),
      props: true,
    },
    {
      path: '/news/:newsId',
      name: 'newsGet',
      component: () => import('@/components/news/newsGet.vue'),
      props: true,
    },
    // 预览文件
    {
      path: '/pdf/:src/:fileId',
      name: 'pdf',
      component: () => import('@/components/common/pdf.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/iframeSrc/:iframeSrc/:fileId',
      name: 'iframeSrc',
      component: () => import('@/components/common/iframeSrc.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/previewForm/:formId',
      name: 'previewForm',
      component: () => import('@/components/common/previewForm.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/previewForm/:formId/:single',
      name: 'previewForm-single',
      component: () => import('@/components/common/previewForm.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/previewInstForm/:defId/:instId',
      name: 'previewInstForm',
      component: () => import('@/components/common/previewInstForm.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/QRCodeForm/:templateKey/:action',
      name: 'QRCodeForm',
      component: () => import('@/components/dataTemplate/QRCodeForm.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/statement',
      name: 'statement',
      component: Statement,
      children: [
        {
          path: '/',
          name: 'template-default',
          redirect: '/statement/draftList',
        },
        {
          path: 'draftList/:tempAlias/:dataViewFlag',
          name: 'templateDraftList',
          component: () =>
            import('@/components/dataTemplate/TemplateDraft.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: '/href/template/:alias',
          name: 'templateHref',
          component: () => import('@/components/dataTemplate/templateHref.vue'),
          props: true,
        },
        {
          path: 'template/preview/:templateKey',
          name: 'templatePreview',
          component: () =>
            import('@/components/dataTemplate/templatePreview.vue'),
          props: true,
        },
        {
          path: 'template/preview/:templateKey/:single',
          name: 'templatePreview-single',
          component: () =>
            import('@/components/dataTemplate/templatePreview.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'template/preview/:templateKey/:single/:parameterqQuerys',
          name: 'templatePreview-singleQuerys',
          component: () =>
            import('@/components/dataTemplate/templatePreview.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'template/preview/:templateKey/:taskType/:defKey/:isJoinFlow',
          component: () =>
            import('@/components/dataTemplate/templatePreview.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'template/form/:templateKey/:action',
          name: 'templateForm',
          component: () => import('@/components/dataTemplate/templateForm.vue'),
          props: true,
        },
        {
          path: 'template/form/:templateKey/:action/:single',
          name: 'templateFormSingle',
          component: () => import('@/components/dataTemplate/templateForm.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'template/form/:templateKey/:action/:single/:openType',
          name: 'templateFormSingleOpenType',
          component: () => import('@/components/dataTemplate/templateForm.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'template/form/:templateKey/:action/:single/:isShare',
          name: 'templateShare',
          component: () => import('@/components/dataTemplate/templateForm.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
        {
          path: 'querySql/queryView/:sqlAlias/:alias',
          name: 'querySqlContent',
          component: () => import('@/components/querySql/querySqlContent.vue'),
          props: true,
        },
        {
          path: 'querySql/queryView/:sqlAlias/:alias/:single',
          name: 'querySql-single',
          component: () => import('@/components/querySql/querySqlContent.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
      ],
    },
    {
      path: '/sysModulePreview/statement', //用来区分是否是模块开发里面的表单列表
      name: 'sysModulePreviewStatement',
      component: Statement,
      children: [
        {
          path: 'template/preview/:templateKey/:single/:isJoinFlow',
          name: 'sysModulePreviewStatement-single',
          component: () =>
            import('@/components/dataTemplate/templatePreview.vue'),
          props: true,
          meta: {
            single: true,
          },
        },
      ],
    },
    {
      path: '/column/preview/:previewAlias',
      name: 'columnpreview',
      component: () => import('@/views/ColumnPreview.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/onlineForm',
      name: 'onlineForm',
      component: () => import('@/components/flow/OnlineForm.vue'),
      props: true,
    },
    /* 已办结流程 */
    {
      path: '/completeView/:procDefKey',
      name: 'completeView',
      component: () => import('@/components/flow/completeView.vue'),
      props: true,
    },
    /* 办结流程，只读表单 */
    {
      path: '/doneReadOnly/:instId',
      name: 'doneReadOnly',
      component: () => import('@/components/flow/task/doneReadOnly.vue'),
      props: true,
    },
    {
      path: '/appCenterFront',
      name: 'appCenter',
      component: () => import('@/components/appCenter/AppCenter.vue'),
    },
    {
      path: '/appContent/:type/:id/:otherId/:appName',
      name: 'appContent',
      component: () => import('@/components/appCenter/AppContent.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/webOffice/:fileId/:isRevision/:inputWriteable',
      name: 'webOffice',
      component: () => import('@/views/WebOffice.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/navigationMsg/:type/:id',
      name: 'navigationMsg',
      component: () => import('@/components/home/navigationMsg.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/file/preview/:fileId',
      name: 'attanchmentPreview',
      component: () => import('@/views/AttanchmentPreview.vue'),
      props: true,
      meta: {
        single: true,
      },
    },
    {
      path: '/messageFillPage/:tipId',
      name: 'messageFillPage',
      component: () => import('@/views/MessageFillPage.vue'),
      props: true,
      meta: {
        single: true,
        anonymous: true,
      },
    },
    {
      path: '*',
      component: NotFound,
      meta: {
        single: true,
      },
    },
  ],
})

const createRouter = () =>
  new Router({
    mode: 'history',
    routes: [],
  })

//重写动态添加路由方法
router.$addRoutes = (params) => {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher //重置路由规则
  router.addRoutes(params) // 添加路由
}

//动态新增二级路由
router.addList = (path, list) => {
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
          require(['@/components/dataTemplate/templatePreview.vue'], resolve),
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
      let draftList_new = {
        path: 'draftList/:tempAlias/:dataViewFlag',
        name: 'template_' + index,
        props: true,
        component: (resolve) =>
          require(['@/components/dataTemplate/TemplateDraft.vue'], resolve),
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
          require(['@/components/dataTemplate/templatePreview.vue'], resolve),
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
          list[i].children.push(...routerFinance.financePages) // TODO w
          //* ccwgq end
          router.$addRoutes(list)
        }
        isChildren = true
        break
      } else isChildren = true
    }
  }
  return isChildren
}

let registerRouteFresh = true

const ssoRedirect = () => {
  if (window.ssoConfig.mode == 'cas') {
    let service = window.location.href
    localStorage.setItem('service', service)
    window.location.href = window.ssoConfig.url + '?service=' + service
  } else if (window.ssoConfig.mode == 'oauth') {
    if (!window.ssoConfig.clientId) {
      throw 'oauth模式下必须提供clientId'
    }
    const service = window.location.href
    localStorage.setItem('service', service)
    window.location.href = `${window.ssoConfig.url}?response_type=code&client_id=${window.ssoConfig.clientId}&redirect_uri=${service}`
  }
}

const handelShortUrl = (to, from, next) => {
  req
    .get(
      '${portal}/portal/shorturlManage/v1/getLongUrlByShortUrl?shortUrl=' +
      to.fullPath.substr(1),
      '',
      false
    )
    .then((resp) => {
      if (resp && resp.data && resp.data.state) {
        store
          .dispatch(
            'login/validAndCompletedCurrent',
            resp.data.value.guestToken
          )
          .then(() => {
            next({ path: resp.data.value.url })
          })
          .catch((err) => {
            logoutAndCleanUp(to, from, next)
          })
      } else {
        next({ path: '/messageFillPage/' + resp.data.message })
      }
    })
    .catch((err) => {
      logoutAndCleanUp(to, from, next)
    })
}

const logoutAndCleanUp = (to, from, next) => {
  store.dispatch('login/logoutAndCleanUp').then(() => {
    if (window.ssoConfig.mode && window.ssoConfig.mode != 'jwt' && !ticket) {
      ssoRedirect()
    } else if (!window.ssoConfig.mode || window.ssoConfig.mode == 'jwt') {
      next({ path: '/login'/* , query: { redirect: to.fullPath } */ })
    } else {
      throw '登录失败'
    }
  })
}

// 移除url后面的指定参数
const removeUrlParams = (param) => {
  const query = window.location.search.substring(1)
  if (!query) {
    return
  }
  const vars = query.split('&')
  const newVars = []
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] != param) {
      newVars.push(vars[i])
    }
  }
  setTimeout(() => {
    const path = `${window.location.pathname}${newVars.length > 0 ? '?' : ''
      }${newVars.join('&')}`
    window.history.replaceState(null, null, path)
  }, 1000)
}

router.beforeEach((to, from, next) => {
  //修复路由中出现 /login/login
  // if (/^\/login\/(\/)*login(\/)*/.test(to.path)) {
  //   let fullPath = to.fullPath;
  //   if (/^\/login\/login/.test(fullPath)) {
  //     fullPath = fullPath.replace(/^\/login\/(\/)*login(\/)*/, "/login")
  //   }
  //   next(fullPath);
  // }

  //ccwgq 2022-05-11 修复退出登录后回到个人设置的BUG
  if (to.path == '/v-personal/v-logout') {
    next({ path: '/v-personal/v-approvalItem' })
  }

  //ccwgq 2022-07-07 是流程中的路由就要设置changeIsFlow事件

  FlowBus.$emit(
    'changeIsFlow',
    to.matched.map((item) => item.path).includes('/v-flow')
  )

  store.dispatch('menu/getAllmenus', {}).then((menus) => {
    //href菜单不进这段代码
    if (to.fullPath.indexOf('href') == -1) {
      let alias = to.fullPath.split('/')[1]
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].alias === alias) {
          store.dispatch('menu/getCurrentMenu', {
            alias: menus[i].alias,
            name: menus[i].name,
          })
          break
        }
      }
    }
  })
  if (to.fullPath.startsWith('/surl/')) {
    handelShortUrl(to, from, next)
    return
  }
  // 1.当前为单点登录模式，且要路由到login页面，则做单点登录重定向；
  if (
    to.name == 'login' &&
    window.ssoConfig.mode &&
    window.ssoConfig.mode != 'jwt'
  ) {
    // 单点登录时如果已经携带了code或者ticket时，如果是/login路径需要跳转到默认页面（解决反复跳转的问题）
    if (
      (window.ssoConfig.mode == 'cas' || window.ssoConfig.mode == 'oauth') &&
      (to.query.code || to.query.ticket)
    ) {
      window.location.href = window.location.href.replace('/login', '')
      return
    } else {
      ssoRedirect()
    }
  }

  if (from.name != 'defStart' || to.name != 'instStart') {
    sessionStorage.removeItem('formImportTempRefId')
    sessionStorage.removeItem('formImportTempJson')
  }

  if (
    sessionStorage.menu_alias &&
    to.fullPath &&
    to.fullPath.split('/')[1] == 'home'
  ) {
    sessionStorage.menu_alias = ''
  }
  if (to.matched.some((record) => !record.meta.anonymous)) {
    let ticket = to.query.token
    //lyzcw:2022-04-12，第三方单点登录需要用租户ID，从客户端配置中获取，以id_{state}_{ticket}传递
    let state = window.ssoConfig.tenantId
    let target_url = to.query.target_url
    //lyzcw:2022-03-31 统一认证idaas的单点登录凭证是id_token，加前缀id_
    if (!!to.query.id_token) {
      // console.log("输入有id_token===>", to.query.id_token); //token打印输出打开
      ticket = 'id_' + state + '_' + to.query.id_token
    }
    // 2.当前已经从单点页面重定向回来了，且在url地址中携带了ticket或code；
    if (window.ssoConfig.mode == 'cas') {
      ticket = to.query.ticket
    } else if (window.ssoConfig.mode == 'oauth') {
      // ticket = to.query.code
      ticket = to.query.ticket
    }
    console.log(ticket)
    store
      // 3.携带ticket做用户鉴权；
      .dispatch('login/validAndCompletedCurrent', ticket)
      .then(() => {
        // console.log("单点登录验证成功====>")
        // console.log('[ target_url ] >', target_url)
        //ccwgq 2022-04-08  如果有target_url就跳转到它
        if (!!target_url) {
          window.location = target_url
        }
        store._vm.$root.$emit('login-completed')
        if (registerRouteFresh) {
          if (sessionStorage.menu_alias) {
            let path = '/' + sessionStorage.menu_alias
            let isChildren = router.addList(path, router.options.routes) //动态新增二级路由
            //当前点击菜单的路由别名不存在 router.js 里面
            if (!isChildren) {
              let alias_new = {
                path: path,
                name: 'alias_new',
                component: (resolve) =>
                  require(['@/views/menuContent.vue'], resolve),
                children: [],
              }
              router.options.routes.push(alias_new)
              router.addList(path, router.options.routes) //动态新增二级路由
            }
            router.replace({ path: to.path, query: to.query })
          }
          registerRouteFresh = false
        }
        next()
        // url地址带token的方式认证成功后删除url中的token, lyzcw:2022-04-07，支持idaas的id_token
        if (!!to.query.id_token) {
          removeUrlParams('id_token')
        } else if (!!to.query.token) {
          removeUrlParams('token')
        }
        removeUrlParams('mode')
      })
      .catch(() => {
        // 4.鉴权失败时根据当前模式重定向到对应页面。
        logoutAndCleanUp(to, from, next)
      })
  } else {
    next()
  }
})

router.afterEach((to,from)=>{
  //ccwgq 2022-10-25 如果打开新窗口传入token,最后在浏览器的url不需要该token
  removeUrlParams('token')
})

export default router
