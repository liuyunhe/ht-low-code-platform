let index  = "";

/**自己的路由配置 */
let financePages = [
  {
    path: 'financeBalance', //科目余额平衡查询
    name: 'financeBalance' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeBalance.vue'], resolve)
  },
  {
    path: 'addrDetail', //地址查询
    name: 'addrDetail' + index,
    props: true,
    component: resolve =>
      require(['@/views/address/address.vue'], resolve)
  },
  {
    path: 'financeSubject', //科目账户查询
    name: 'financeSubject' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeSubject.vue'], resolve)
  },
  {
    path: 'financeDetailed', //科目明细账查询
    name: 'financeDetailed' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeDetailed.vue'], resolve)
  },
  {
    path: 'financeDetailed/:accountingbook/:accountno', //查询明细
    name: 'financeDetailed' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeDetailed.vue'], resolve)
  },
  {
    path: 'accountDetail/:accountingbook/:accountno', //查询账户
    name: 'accountDetail' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/accountDetail.vue'], resolve)
  },
  {
    path: 'financeVoucher', //记账凭证查询
    name: 'financeVoucher' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeVoucher.vue'], resolve)
  },
  {
    path: 'financeAccount', //开销户查询
    name: 'financeAccount' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeAccount.vue'], resolve)
  },
  {
    path: 'financeDaySubject', //科目日汇总
    name: 'financeDaySubject' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeDaySubject.vue'], resolve)
  },
  {
    path: 'financePayBillSubject', //支付到账统计
    name: 'financePayBillSubject' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financePayBillSubject.vue'], resolve)
  },
  {
    path: 'financeBill', //对账
    name: 'financeBill' + index,
    props: true,
    meta: {
      keepAlive: true
    },
    component: resolve => require(['@/views/finance/financeBill.vue'], resolve)
  },
  {
    path: 'financeBilldetailList/:accountingBook/:accountDate/:merchantCode', //对账
    name: 'financeBilldetailList' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeBilldetailList.vue'], resolve)
  },
  {
    path: 'financeUpload', //对账上传
    name: 'financeUpload' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeUpload.vue'], resolve)
  },
  {
    path: 'financeBillDetail', //对账明细
    name: 'financeBillDetail' + index,
    props: true,
    component: resolve =>
      require(['@/views/finance/financeBillDetail.vue'], resolve)
  },

  // 数据清洗
  {
    path: 'dataWashDetail/:id', //原始数据批次详情
    name: 'dataWashDetail' + index,
    props: true,
    component: resolve =>
      require(['@/views/dataWash/dataWashDetail.vue'], resolve)
  },
  {
    path: 'dataWashDetailList/:flowCode/:id', //原始数据批次报错详情
    name: 'dataWashDetailList' + index,
    props: true,
    component: resolve =>
      require(['@/views/dataWash/dataWashDetailList.vue'], resolve)
  },
  {
    path: 'dataFlowEdit', //流程管理新增
    name: 'dataFlowEdit' + index,
    props: true,
    component: resolve =>
      require(['@/views/dataWash/dataFlowEdit.vue'], resolve)
  },
  {
    path: 'dataFlowEdit/:id', //流程管理新增
    name: 'dataFlowEdit' + index,
    props: true,
    component: resolve =>
      require(['@/views/dataWash/dataFlowEdit.vue'], resolve)
  },
  {
    path: 'dataFlowEdit/:id/:type', //流程详情
    name: 'dataFlowEdit' + index,
    props: true,
    component: resolve =>
      require(['@/views/dataWash/dataFlowEdit.vue'], resolve)
  },
  {
    path: 'merchantEdit/:id/:type', //商户进件成功
    name: 'merchantEdit' + index,
    props: true,
    component: resolve =>
      require(['@/views/merchant/merchantEdit.vue'], resolve)
  },
  {
    path: 'merchantEdit/:id', //商户失败成功
    name: 'merchantEdit' + index,
    props: true,
    component: resolve =>
      require(['@/views/merchant/merchantEdit.vue'], resolve)
  },
  {
    path: 'merchandiseIndex', //商品类目维护
    name: 'merchandiseIndex' + index,
    props: true,
    component: resolve => require(['@/views/merchandise/index.vue'], resolve)
  },
  {
    path: 'editIndex', //新增商品类目维护
    name: 'editIndex' + index,
    props: true,
    component: resolve =>
      require(['@/views/merchandise/editIndex.vue'], resolve)
  },
  {
    path: 'editIndex/:id/:type', //商品类目维护详情
    name: 'editIndex' + index,
    props: true,
    component: resolve =>
      require(['@/views/merchandise/editIndex.vue'], resolve)
  }
]


export default {
    financePages,
    index
}