import req from "@/request.js";


export default {
    getlistJson(data,cb) {
        if(data.requestType == "POST" || data.dsType == "dataSource"){
            req.post(data.queryUrl,data.pageBean).then(response=>{
                cb(response);
            });
        }
    },
    getTreeData(data,cb) {
        if(data.requestType == "GET"){
            req.get(data.url).then(response=>{
                cb(response);
            });
        }
    },
    getPermissionList(cb) {
        req.get("${bpmModel}/flow/defAuthorize/v1/getPermissionList").then(response=>{
            cb(response.data);
        });
    }
}