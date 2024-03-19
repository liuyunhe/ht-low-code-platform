import req from "@/request.js";

const bpmModel = window.context.bpmModel;
const bpmRunTime = window.context.bpmRunTime;
export default {
    relatedProcess(data, cb) { //相关流程
        req.post(bpmRunTime + `/runtime/instance/v1/relatedProcess`, data).then(response => {
            cb(response);
        });
    },
    myMobileRequest(queryFilter) { //我发起的
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/instance/v1/myMobileRequest`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    myMobileDraft(queryFilter) { //我的草稿
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/instance/v1/myMobileDraft`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getMobileDelegate(queryFilter) { //转办代理
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/task/v1/getMobileDelegate`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getMobileTodoList(queryFilter) { //我的待办
        return new Promise((resolve, reject) => {
            queryFilter.params = queryFilter.params || {};
            queryFilter.params.isMobile = 'true';
            req.post(bpmRunTime + `/runtime/task/v1/getTodoList`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getMobileDoneList(queryFilter) { //我的已办
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/instance/v1/getMobileDoneList`, queryFilter).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },

    myMobileProcess(queryFilter) { //流程列表
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/instance/v1/myMobileProcess`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getNoticesList(queryFilter, type) { //根据类型获取抄送事项
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/task/v1/` + type, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getNoticeTodoReadList(queryFilter) { //我的待阅
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/task/v1/getNoticeTodoReadList`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getNoticeDoneReadList(queryFilter) { //我的已阅
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/task/v1/getNoticeDoneReadList`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getMyNoticeReadList(queryFilter) { //我的待阅
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + `/runtime/task/v1/getMyNoticeReadList`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getDefById(defId) { //获取流程定义信息
        return new Promise((resolve, reject) => {
            req.get(bpmRunTime + `/flow/def/v1/defGet?defId=` + defId).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getCurNodeProperties(taskId, defId, instId) { //获取当前节点信息
        return new Promise((resolve, reject) => {
            req.get(bpmRunTime + `/runtime/task/v1/getCurNodeProperties?taskId=` + taskId + '&defId=' + defId + '&instId=' + instId).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },

    getByRecordInstId(queryFilter) { //根据流程实例ID获取阅读记录
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + '/runtime/instance/v1/getByRecordInstId', queryFilter).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    //根据流程实例ID、催办人ID获取催办记录
    getUrgrntById(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(bpmRunTime + '/runtime/instance/v1/getUrgrntById', queryFilter).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },

    //根据流程id获取
    getWatermarkByInstId(id) {
        return new Promise((resolve, reject) => {
            req.get(`${bpmModel}/bpmModel/bpmWatermark/v1/getByInstId?instId=${id}`).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
}