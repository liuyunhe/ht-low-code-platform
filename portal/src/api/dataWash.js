import req from "@/request.js";
const dataSer = window.context.data

/**
 * 原始数据批次详情
 * @param {*} data 
 * @returns
 */
export function rawDataDetail(data) {
    return req.get(dataSer + '/v1/raw-data-batch/'+data.id)
}

/**
 * 批次详情新接口
 * @param {*} data 
 * @returns
 */
export function newDetail(data) {
    return req.post(dataSer + '/v1/raw-data-batch/getCountBatchData',data)
}

/**
 * 数据替换接口
 * @param {batchId: string,source: string,target: string} data 
 * @returns
 */
export function replaceDetail(data) {
    return req.post(dataSer + '/v1/raw-data-batch/replaceBatchData',data)
}

/**
 * 错误集详情
 * @param {*} data 
 * @returns
 */
export function searchError(data) {
    return req.post(dataSer + '/v1/data-error/searchError',data)
}

/**
 * 错误集修改
 * @param {*} data 
 * @returns
 */
export function errorHandle(data) {
    return req.post(dataSer + '/v1/data-error/errorHandle',data)
}


/**
 * 规则合集列表
 * @param {*} data 
 * @returns
 */
export function dataRuleList() {
    return req.get(dataSer + '/v1/data-rule/list')
}

/**
 * 原始数据批次详情
 * @param {*} data 
 * @returns
 */
export function dataFlowDetail(data) {
    return req.get(dataSer + '/v1/data-flow/'+data)
}


/**
 * 保存编辑按钮
 * @param {*} data 
 * @returns
 */
export function saveOrUp(data) {
    return req.post(dataSer + '/v1/data-flow/SaveOrUp',data)
}