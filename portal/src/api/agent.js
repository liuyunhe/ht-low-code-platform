import req from "@/request.js";


const bpmModel = window.context.bpmModel;
const bpmRunTime = window.context.bpmRunTime;
const portal = window.context.portal;
export default {
    getlistJson(data,cb) {
        req.post(bpmModel+`/flow/agent/v1/listJson?isMgr=false`,data).then(response=>{
            cb(response);
        });
    },
    //编辑委托
    approvalItemSave(data,cb) {
        req.post(bpmModel + `/flow/agent/v1/save`,data).then(rep => {
            cb(rep.data)
        });
    },
    //查看委托详情
    detail(id,cb) {
        req.get(bpmModel + `/flow/agent/v1/agentGet?id=`+id).then(rep => {
            cb(rep.data)
        });
    }
    ,
    //删除委托
    remove(ids,cb) {
        req.remove(bpmModel + `/flow/agent/v1/remove?ids=`+ids).then(rep => {
            cb(rep.data)
        });
    },
    //流程选择器列表
    getDeflistJson(data,cb) {
        req.post(bpmModel+`/flow/def/v1/listJson`,data).then(response=>{
            cb(response);
        });
    },
    getSecretarylist(data,cb) {
        req.post(bpmRunTime+`/runtime/bpmSecretaryManage/v1/list?personal=true`,data).then(response=>{
            cb(response);
        });
    },
    secretaryDetail(data,cb) {
        req.get(bpmRunTime+`/runtime/bpmSecretaryManage/v1/get/`+data).then(response=>{
            cb(response);
        });
    },
    secretarySave(data,cb) {
        req.post(bpmRunTime+`/runtime/bpmSecretaryManage/v1/save`,data).then(response=>{
            cb(response);
        });
    },
    secretaryRemove(ids,cb) {
        req.remove(bpmRunTime+`/runtime/bpmSecretaryManage/v1/removes?ids=`+ids).then(rep => {
            cb(rep.data)
        });
    },
    getTypeByGroupKey(typeKey,cb) {
        req.get(portal+`/sys/sysType/v1/getTypesByKey?typeKey=`+typeKey).then(rep => {
            cb(rep)
        });
    },
}
