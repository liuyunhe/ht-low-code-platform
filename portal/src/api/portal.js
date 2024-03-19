import req from "@/request.js";
import i18n from '@/lang/index.js';
import utils from "@/hotent-ui-util.js";

const portal = window.context.portal;
const bpmRunTime = window.context.bpmRunTime;
const bpmModel = window.context.bpmModel;
const uc = window.context.uc;
const form = window.context.form;
const _menus = [
    { "id": "0", "name": i18n.t('menus.home'), "alias": "home" ,"sn":-1},
    /*{ "id": 1, "name": i18n.t('menus.flow'), "alias": "flow" },
    { "id": 2, "name": i18n.t('menus.mail'), "alias": "mail" },
    { "id": 3, "name": i18n.t('menus.personal'), "alias": "personal" }*/
];

export default {
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
    //获取布局管理列表
    getLayoutManageDesignData(id, layoutType) {
        return new Promise((resolve, reject) => {
            req
                .get(
                    portal +
                    `/portal/sysIndexMyLayout/v1/designMyLayout?id=${id}&layoutType=2`
                )
                .then(
                    response => {
                        resolve(response.data);
                    },
                    error => {
                        reject(error);
                    }
                );
        });
    },
    //获取新闻公告列表
    getNewsPagination(pagination, cb) {
        req.post(portal + '/portal/messageNews/v1/list?isPublic=true', pagination).then(response => {
            cb(response);
        });
    },
    //根据分类获取轮播图
    getNewsPaginations(type, cb) {
        req.get(portal + '/portal/pressRelease/v1/getByType?FLbtssfl=' + type).then(response => {
            cb(response);
        });
    },
    //获取新闻公告列表
    getNewsPaginationList(pagination, cb) {
        req.post(portal + '/portalNewsNotice/v1/query', pagination).then(response => {
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
        /*req.get(portal + '/portal/messageNews/v1/getById?id=' + id).then(response => {
            cb(response);
        });*/
        req.get(portal + "/portalNewsNotice/v1/getNewsById?id="+id).then(resp=>{
            cb(resp);
        })
    },
    //附件在线预览
    onlinePreview(id, cb) {
        req.get(portal + '/file/onlinePreviewController/v1/onlinePreview?fileId=' + id).then(response => {
            cb(response);
        });
    },
    //附件下载
    downloadFile(id) {
        req.download(portal + '/system/file/v1/downloadFile?fileId=' + id);
    },

    downloadImg(fileId, cb) {
        req.get(window.context.portal + "/system/file/v1/preview?fileId=" + fileId, "blob")
            .then(
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
                function errorCallback(response) {
                    cb("")
                }
            );
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
    vueFrontHome(cb) {
        req.get(portal + '/portal/main/v1/vueFrontHome').then(response => {
            cb(response.data);
        });
    },
    getColumnByAlias(alias, cb) {
        req.get(portal + "/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias=" + alias).then(response => {
            cb(response.data);
        })
    },
    batchGetColumnByAliases(aliases, cb) {
        req.post(portal + "/portal/sysIndexColumn/sysIndexColumn/v1/getDatasByAlias", aliases).then(response => {
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
    updateFileExtraProp(data, cb) {
        req.post(portal + '/system/file/v1/updateFileExtraProp', data).then(response => {
            cb(response.data);
        });
    },
    getSysTypeByCatId(catId) {
        // return sysType.getSysTypeByCatId();
        return new Promise((resolve) => {
            req.request({
                url: `${portal}/sys/sysType/v1/getByParentId?catId=${catId}`
            }).then(response => {
                resolve(utils.tile2nest(response.data));
            });
        });
    },
    //获取系统属性解密后参数值
    getSysPropertyByAlias(alias) {
        return new Promise((resolve, reject) => {
            req.get(`${portal}/sys/sysProperties/v1/getDecryptByAlias?alias=${alias}`).then(
                resp => {
                resolve(resp.data);
                },
                error => {
                reject(error);
                }
            );
        });
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
    getSysAppList(param){
        return new Promise((resolve, reject) => {
            req.post(`${portal}/portal/sysApp/v1/authList`,param).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    getSysAppTree(id){
        return new Promise((resolve, reject) => {
            req.get(`${portal}/portal/sysAppMenu/v1/getTree?appId=${id}`).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    fileUpload(param,fileId) {
        return req.post(`${portal}/system/file/v1/upload?fileId=${fileId}`,param);
    },
    getFile(id) {
        return req.get(`${portal}/system/file/v1/fileGet?id=${id}`);
    },
    //获取应用标签分类列表
    getAppTagTypes(){
        return req.get(`${portal}/sys/sysType/v1/getTreeDateByTypeKey?typeKey=yybq`);
    },
    getMsgbadge(){
        return req.get(`${portal}/innermsg/messageReceiver/v1/getMsgbadge`);
    },
    //ccwgq 2022-08-09 附件水印
    getFileWatermark(data,cb){
        req.post(`${portal}/eipx7/opun/portal/file/v1/watermark`,data)
        .then(response=>{
            cb(response);
        })
    }
}
