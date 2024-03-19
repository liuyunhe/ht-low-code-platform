/**
 * 按照宏天的组织结构对我们自己开发的接口进行封装,便于日后的统一修改
 * 智能引擎相关服务
 *  */
import req from "@/request.js";

const bpmRunTime = window.context.bpmRunTime;
const form = window.context.form;
export default {

    /** 智能提取（旧--流程） */
    smartExtract(data, cb) {
        const url = ``;
        req.post(url, data).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    },
    /** 未知相对方智能提取 （新--通用） */
    commonSmartExam(data, cb) {
        const url = `${bpmRunTime}/eipx7/opun/runtime/ai/v1/uncertainOppExam`;
        req.post(url, data).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        }).catch(err => {
            typeof cb === 'function' && cb(err);
        })
    },
    /** 相对方审核 */
    oppExam(data, cb) {
        const url = `${bpmRunTime}/eipx7/opun/runtime/ai/v1/oppExam`;
        req.post(url, data).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    },
    /** 根据任务ID拿到审核结果 */
    getExamResultByTaskId(taskId, cb, fn) {
        const url = `${bpmRunTime}/eipx7/opun/runtime/ai/v1/examResult?taskId=${taskId}`;
        req.get(url).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        }).catch(err => {
            typeof cb === 'function' && cb(err);
        }).finally(() => {
            typeof fn === 'function' && fn();
        })
    },
    /**  获取历史ID */
    getHistoryTaskId(contractId, cb) {
        const url = `${bpmRunTime}/eipx7/opun/runtime/ai/v1/contractId?contractId=${contractId}`;
        req.get(url).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    },
    /** 智能比对 */
    smartCompare(url1, url2, cb) {
        const url = `${bpmRunTime}/eipx7/opun/runtime/ai/v1/docCompare?docUrl1=${url1}&docUrl2=${url2}`
        req.get(url).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    },
    /**智能提取 */
    smartExtract(data, cb) {
        req.post(`${bpmRunTime}/eipx7/opun/runtime/ai/v1/extractItems`, data)
            .then(response => {
                typeof cb === 'function' && cb(response.data);
            })
    },
    /**获取合同风控模型 */
    getRiskModels(cb) {
        const params = [{ key: 'type_id', value: 'ht' }];
        req.post(`${form}/form/customQuery/v1/doQuery?alias=syfkmxlb&page=1`, params)
            .then(resp => {
                typeof cb === 'function' && cb(resp.data);
            })
    },
    /** 获取相对方的风控模型 */
    getOppRiskModels(cb) {
        const params = [{ key: 'type_id', value: 'xdffx' }]
        req.post(`${form}/form/customQuery/v1/doQuery?alias=syfkmxlb&page=1`, params)
            .then(resp => {
                typeof cb === 'function' && cb(resp.data);
            })
    },
    //获取到不同模型下面的风控规则
    getModelRulesById(modelId, cb) {
        const params = [{ key: 'REF_ID_', value: modelId }];
        req.post(`${form}/form/customQuery/v1/doQuery?alias=fkmxgzlb&page=1`, params)
            .then(resp => {
                typeof cb === 'function' && cb(resp.data);
            })
    },

}