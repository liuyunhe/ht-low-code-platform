import req from "@/request.js";
const baseUrl = window.context.baseUrl


/**
 * 查询账套信息
 * @param {*} data
 * @returns
 */
export function listAccountingbook(data) {
    return req.post( baseUrl+'/api/billing/report/listAccountingbook', data)
}

/**
 * 科目账户余额查询
 * @param {*} data
 * @returns
 */
export function queryAccAccountsJsonGridTree(data) {
    return req.post( baseUrl+'/api/billing/report/queryAccAccountsJsonGridTree', data)
}
/**
 * 科目日汇总
 * @param {*} data
 * @returns
 */
export function queryAccountDailySummary(data) {
    return req.post( baseUrl+'/api/billing/report/queryAccountDailySummary', data)
}
/**
 * 支付到账统计
 * @param {*} data
 * @returns
 */
export function queryAccountForOrgName(data) {
    return req.post( baseUrl+'/api/billing/orgInfo/queryAccountForOrgName', data)
}

/**
 * 查询账户
 * @param {*} data
 * @returns
 */
export function queryAccountDetail(data) {
    return req.post( baseUrl+'/api/billing/report/queryAccountDetail', data)
}


/**
 * 明细账查询
 * @param {*} data
 * @returns
 */
export function listAccDetailListPage(data) {
    return req.post( baseUrl+'/api/billing/report/listAccDetailListPage', data)
}

/**
 * 记账凭证查询
 * @param {*} data
 * @returns
 */
export function queryAccVoucherDetailInfos(data) {
    return req.post( baseUrl+'/api/billing/report/queryAccVoucherDetailInfos', data)
}

/**
 * 开销户查询
 * @param {*} data
 * @returns
 */
export function queryOpenAndCancelAccounts(data) {
    return req.post( baseUrl+'/api/billing/report/queryOpenAndCancelAccounts', data)
}

/**
 * 资金余额平衡表
 * @param {*} data
 * @returns
 */
export function queryAccountBalanceList(data) {
    return req.post( baseUrl+'/api/billing/report/queryAccountBalanceList', data)
}

/**
 * 对账列表
 * @param {*} data
 * @returns
 */
export function queryMerchantAccountInfo(data) {
    return req.post( baseUrl+'/api/billing/dailyaccount/queryMerchantAccountInfo', data)
}
/**
 * 总数对账
 * @param {*} data
 * @returns
 */
export function merchantTotalAccount(data) {
    return req.post( baseUrl+'/api/billing/dailyaccount/merchantTotalAccount', data)
}
/**
 * 总数对账
 * @param {*} data
 * @returns
 */
export function merchantDetailAccount(data) {
    return req.post( baseUrl+'/api/billing/dailyaccount/merchantDetailAccount', data)
}
/**
 * 地址列表
 * @param {*} data
 * @returns
 */
export function queryAddressList(data) {
    return req.post(baseUrl + '/api/data/v1/address/list', data)
}



/**
 * 单个文件在线浏览下载
 * @param {*} data fileId 文件ID
 * @returns
 */
export function getThirdFile(data) {
    return req.get(bank + '/thirdFile/v1/100002?fileId='+data.fileId)
}