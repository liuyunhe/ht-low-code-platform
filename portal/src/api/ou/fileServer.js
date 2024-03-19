/** 自行开发的打印预览的接口在此 */

import req from "@/request.js";
const form = window.context.form;
const portal = window.context.portal;
export default {
    wordPrint(data, cb) {
        let { templateId, defId, instId, nodeId } = data;
        nodeId = !!nodeId ? nodeId : ''
        const url = `${form}/form/printTemplate/v1/wordPrint?id=${templateId}
        &defId=${defId}&nodeId=${nodeId}&procInstId=${instId}`;
        req.get(url).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    },
    getPdfPathById(id, cb) {
        const url = `${portal}/file/onlinePreviewController/v1/onlinePreview?fileId=${id}`;
        req.get(url).then(resp => {
            typeof cb === 'function' && cb(resp.data);
        })
    }
}