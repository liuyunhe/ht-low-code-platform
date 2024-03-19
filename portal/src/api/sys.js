import utils from "@/hotent-ui-util.js"
import req from "@/request.js";
const portal = window.context.portal;

export default {
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
    getTypesByKey(typeKey) {
        return new Promise((resolve) => {
            req.request({
                url: `${portal}/sys/sysType/v1/getTypesByKey?typeKey=${typeKey}`
            }).then(response => {
                resolve(utils.tile2nest(response.data));
            });
        });
    },
    getUserRelByTypeId(typeId) {
        return new Promise((resolve) => {
            req.request({
                url: `${portal}/api/userRel/v1/userRels/getUserRelByTypeId?typeId=${typeId}`
            }).then(response => {
                resolve(response.data);
            });
        });
    },
    //yigz:2022-08-09 获取当前系统时间
    getCurrentDateTime() {
        return new Promise((resolve) => {
            req.request({
                url: `${portal}/base/tools/v1/getCurrentDate?valFormat=yyyy-MM-dd HH:mm:ss`
            }).then(response => {
                resolve(utils.tile2nest(response.data));
            });
        });

    },
}
