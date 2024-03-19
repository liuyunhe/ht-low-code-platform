import req from "@/request.js";
const pay = window.context.pay


/**
 * 商户进件成功接口
 * @param {*} data 
 * @returns
 */
export function intoSuccessful(data) {
    return req.post(pay + '/v1/merchantInfo/intoSuccessful',data)
}

/**
 * 商户进件失败接口
 * @param {*} data 
 * @returns
 */
export function intoFailure(data) {
    return req.post(pay + '/v1/merchantApplyInfo/intoFailure',data)
}