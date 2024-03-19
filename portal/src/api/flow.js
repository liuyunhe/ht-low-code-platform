import req from "@/request.js";
import { Message } from 'element-ui';

const bpmModel = window.context.bpmModel;
const bpmRunTime = window.context.bpmRunTime;
export default {
    getMyOftenFlow(cb) {
        req.get(bpmRunTime + `/runtime/instance/v1/getMyOftenFlow`).then(rep => {
            cb(rep.data);
        }).catch(error => {
            error.message && Message.error({ message: error.message, type: 'error' });
        });
    },
    getHasAuthFlowList(queryFilter, cb) {
        req.post(bpmRunTime + `/runtime/instance/v1/getHasAuthFlowList`, queryFilter).then(rep => {
            cb(rep.data)
        }).catch(error => {
            error.message && Message.error({ message: error.message, type: 'error' });
        });
    }
    ,
    saveOftenFlow(data, cb) {
        req.post(bpmModel + `/bpmModel/BpmOftenFlow/v1/saveMyOftenFlow`, data).then(rep => {
            cb(rep.data)
        }).catch(error => {
            error.message && Message.error({ message: error.message, type: 'error' });
        });
    },
    relatedProcess(data,cb) {
        req.post(bpmRunTime+`/runtime/instance/v1/relatedProcess`,data).then(response=>{
            cb(response);
        });
    },
    flowHasStartRights(defKey,cb){
        req.get(bpmModel + `/flow/def/v1/flowHasStartRights?defKey=${defKey}`).then(response => {
            cb(response);
        }, error => {
            error.message && Message.error({ message: error.message, type: 'error' });
        });
    },
    forbiddenInstance(instId){
        return new Promise((resolve, reject) => {
            req.get(`${bpmRunTime}/runtime/instance/v1/forbiddenInstance?instId=${instId}`).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    unForbiddenInstance(instId){
        return new Promise((resolve, reject) => {
            req.get(`${bpmRunTime}/runtime/instance/v1/unForbiddenInstance?instId=${instId}`).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    //通过流程实例ID获取审批意见
    getBpmSaveOpinionByTeam(params){
        return new Promise((resolve, reject) => {
            req.get(`${bpmRunTime}/runtime/task/v1/getBpmSaveOpinionByTeam?instId=${params.instId}&taskId=${params.taskId}`).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    //新增或修改暂存的审批意见
    createBpmSaveOpinion(bpmSaveOpinion){
        return new Promise((resolve, reject) => {
            req.post(`${bpmRunTime}/runtime/task/v1/createBpmSaveOpinion`,bpmSaveOpinion).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    getWatermarkByInstId(id){
        return new Promise((resolve, reject) => {
            req.get(`${bpmModel}/bpmModel/bpmWatermark/v1/getByInstId?instId=${id}`).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    getMainByDefKey(key) {
        return req.get(`${bpmModel}/flow/def/v1/getJson?defKey=${key}`);
    }
}
