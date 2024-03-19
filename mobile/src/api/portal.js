import req from "@/request.js";
import i18n from '@/lang/index.js';
import utils from "@/hotent-ui-util.js";

const portal = window.context.portal;
const bpmRunTime = window.context.bpmRunTime;
const bpmModel = window.context.bpmModel;
const uc = window.context.uc;
const form = window.context.form;
const _menus = [
    { "id": 0, "name": i18n.t('menus.home'), "alias": "home" },
    /*{ "id": 1, "name": i18n.t('menus.flow'), "alias": "flow" },
    { "id": 2, "name": i18n.t('menus.mail'), "alias": "mail" },
    { "id": 3, "name": i18n.t('menus.personal'), "alias": "personal" }*/
];

export default {
    //获取用户头像
    downloadImg(url, cb) {
        req.get(portal  + "/system/file/v1/preview?fileId="+ url, "blob").then(
        response => {
            if (response.data.size > 0) {
                var blob = response.data;
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function (e) {
                    cb(e.target.result);
                };
            } else {
                cb("");
            }
        },
        function errorCallback() {
            cb("");
        }
        );
    },
    getTagList(param){
        return new Promise((resolve,reject) => {
            req.post(portal + `/portal/sysTag/v1/query`,param).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    saveTag(param){
        return new Promise((resolve, reject) => {
            req.post(portal + `/portal/sysTag/v1/save`,param).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    getMenus(cb) {
        setTimeout(() => cb(_menus), 10);
    },
    //获取指定菜单的下级菜单
    getSubMenus(menuAlias, cb) {
        req.get(`${portal}/sys/sysMenu/v1/getCurrentUserMenu?menuAlias=${menuAlias}`).then(reponse => {
            cb(reponse);
        });
    },
    //获取当前用户所有接口权限
    getCurrentUserMethodAuth(cb) {
        req.get(`${portal}/sys/sysMenu/v1/getCurrentUserMethodAuth`).then(reponse => {
            cb(reponse);
        });
    },
    //获取新闻公告列表
    getNewsPagination(pagination, cb) {
        req.post(portal + '/portal/messageNews/v1/list?isPublic=true', pagination).then(response => {
            cb(response);
        });
    },
    //获取发文公告列表
    getNoticePagination(pagination, cb) {
        req.post(portal + '/portal/messageNews/v1/listNotice?isPublic=true', pagination).then(response => {
            cb(response);
        });
    },
    //根据ID获取新闻公告详情
    getNewsById(id, cb) {
        req.get(portal + '/portal/messageNews/v1/getById?id=' + id).then(response => {
            cb(response);
        });
    },
    //附件在线预览
    onlinePreview(id) {
        return req.get(portal + '/file/onlinePreviewController/v1/onlinePreview?fileId=' + id);
    },
    //附件下载
    downloadFile(id, cb) {
        cb(portal + '/system/file/v1/downloadFile?fileId=' + id);
    },
    //获取要参加的会议列表
    getMeetingPagination(pagination, cb) {
        req.post(bpmRunTime + '/portal/meetingRoomAppointment/v1/pendingJson', pagination).then(response => {
            cb(response);
        });
    },
    getByTypeKeyForComBo(dicKey, cb) {
        req.post(portal + '/sys/dataDict/v1/getByTypeKeyForComBo?typeKey=' + dicKey).then(response => {
            cb(response.data);
        });
    },
    getNextIdByAlias(alias, cb) {
        req.get(portal + '/sys/identity/v1/getNextIdByAlias?alias=' + alias).then(response => {
            cb(response.data);
        });
    },
    myMobileHome(cb) {
        req.get(portal + '/portal/main/v1/myMobileHome').then(response => {
            cb(response.data);
        });
    },
    getMessageList(queryFilter) { //内部消息列表
        return new Promise((resolve, reject) => {
            req.post(portal + `/innermsg/messageReceiver/v1/list`, queryFilter).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    getColumnByAlias(alias,cb) {
        req.get(portal+"/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias="+alias).then(response => {
            cb(response.data);
        })
    },
    getColumnData(column, cb) {
        const reqUrl = column.dataFrom.replace("${bpmModel}", bpmModel).replace("${bpmRunTime}", bpmRunTime).replace("${portal}", portal).replace("${uc}", uc).replace("${form}", form);
        const requestType = column.requestType;
        var reqParam = column.dataParam;
        if (reqParam) {
            reqParam = eval('(' + reqParam + ')');
            var isMany = reqParam.length > 1;
            for (var i = 0; i < reqParam.length; i++) {
                var value = reqParam[i]['value'];
                var name = reqParam[i]['name'];
                if (requestType == 'POST') {
                    try { value = JSON.parse(value); } catch (e) { }
                    if (isMany) {
                        reqParam[name] = value;
                    } else {
                        reqParam = value;
                    }
                } else {
                    reqUrl = i > 0 ? reqUrl + '&' + name + '=' + value : '?' + name + '=' + value;
                }
            }
        }
        if (requestType == 'POST') {
            req.post(reqUrl, reqParam).then(response => {
                cb(response.data);
            });
        } else {
            req.get(reqUrl).then(response => {
                cb(response.data);
            });
        }

    },
    //更新附件的属性(包含扩展属性、流程实例ID、节点名称、流程标题、附件来源、所属分类)
    updateFileExtraProp(data,cb) {
        req.post(portal + '/system/file/v1/updateFileExtraProp',data).then(response => {
            cb(response.data);
        });
    },
    getSysTypeByCatId(catId) {
        // return sysType.getSysTypeByCatId();
        return  new Promise((resolve) => {
            req.request({
                url: `${portal}/sys/sysType/v1/getByParentId?catId=${catId}`
            }).then(response=>{
                resolve(utils.tile2nest(response.data));
            });
        });
    },
}
