import req from "@/request.js";


const bpmModel = window.context.bpmModel;
export default {
	getByUserId(data,cb) {
        req.get(bpmModel+`/bpmModel/bpmDeputy/v1/getByUserId`).then(response=>{
            cb(response.data);
        });
    },
    //保存代理设置
    bpmDeputySave(data,cb) {
        req.post(bpmModel + `/bpmModel/bpmDeputy/v1/save`,data).then(rep => {
            cb(rep.data)
        });
    },
    getBpmDeputyList(data,cb){
      req.post(bpmModel+`/bpmModel/bpmDeputy/v1/list?personal=true`,data).then(response=>{
        cb(response);
      });
    },
    remove(ids,cb) {
      req.remove(bpmModel + `/bpmModel/bpmDeputy/v1/removes?ids=`+ids).then(rep => {
        cb(rep.data)
      });
    },
    addApprovalItem(param){
	    return new Promise((resolve, reject) => {
	      req.post(bpmModel + "/flow/approvalItem/v1/save",param).then(resp => {
	        resolve(resp.data);
        },error => {
	        reject(error)
        })
      })
    }
}
