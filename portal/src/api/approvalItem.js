import req from "@/request.js";

const bpmModel = window.context.bpmModel;
export default {
    getlistJson(data,cb) {
        req.post(bpmModel+`/flow/approvalItem/v1/listJson?isPersonal=true`,data).then(response=>{
            cb(response);
        });
    },
    //保存常用语
    approvalItemSave(data,cb) {
        req.post(bpmModel + `/flow/approvalItem/v1/save`,data).then(rep => {
            cb(rep.data);
        });
    },
    //查看常用语详情
    detail(id,cb) {
        req.get(bpmModel + `/flow/approvalItem/v1/approvalItemGet?id=`+id).then(rep => {
            cb(rep.data);
        });
    }
    ,
    //删除常用语
    remove(ids,cb) {
        req.remove(bpmModel + `/flow/approvalItem/v1/remove?ids=`+ids).then(rep => {
            cb(rep.data);
        });
    }
}