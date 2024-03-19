import req from "@/request.js";
const baseUrl = window.context.baseUrl


/**
 * 商品类目
 * @param {*} data
 * @returns
 */
export function serachCategory(data) {
    return req.post( baseUrl+'/api/store/v1/cjStoreCategory/searchCategory', data)
}

