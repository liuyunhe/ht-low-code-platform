import req from "@/request.js";

const portal = window.context.portal;
export default {
    getlistJson(data,cb) {
        req.post(portal+`/innermsg/messageReceiver/v1/list`,data).then(response=>{
            cb(response);
        });
    },
    //保存常用语
    approvalItemSave(data,cb) {
        req.post(portal + `/flow/approvalItem/v1/save`,data).then(rep => {
            cb(rep.data);
        });
    },
    //查看常用语详情
    detail(id,cb) {
        req.get(portal + `/innermsg/messageReceiver/v1/get?id=`+id).then(rep => {
            cb(rep.data);
        });
    }
    ,
    //删除常用语
    remove(ids,cb) {
        req.remove(portal + `/innermsg/messageReceiver/v1/remove?ids=`+ids).then(rep => {
            cb(rep.data);
        });
    },
    mark(ids,cb) {
        req.get(portal + `/innermsg/messageReceiver/v1/mark?ids=`+ids).then(rep => {
            cb(rep.data);
        });
    }
}