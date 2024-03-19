import * as apiUtils from './apiUtils'
import * as timeUtils from './time'
import utils from "@/utils.js";
import req from '@/request.js'

export function baseHandlerJs(rep, this_) {
    console.log("=======自定义js脚本执行=======")
    var $ = require("jquery");
    let _me = this_;
    let _this = _me;

    /**封装的接口工具 */
    const _apiUtils = apiUtils
    /**时间工具 */
    const _timeUtils = timeUtils
    /**网络请求 */
    const _req = req
    /**内置工具 */
    const _utils = utils

    /**用户信息 */
    const currentUser = _me.$store.state.login.currentUser;

    /**表单数据 */
    let data = _me.data;
    /**表单权限 */
    let permission = _me.permission;
    /**模型别名 */
    const boAlias = _me.boAlias;
    /**表单别名 */
    const formKey = _me.formKey;
    /**表单列表别名 */
    const tempAlias = _me.tempAlias;
    const templateKey = _me.templateKey;
    /**当前动作标识 */
    const action = _me.action;
    /**是否为详情页 */
    let isView = _me.isView;
    /**是否显示关闭按钮 */
    let showCloseBtn = _me.showCloseBtn;
    /**关闭按钮名称 */
    let closeBtnText = _me.closeBtnText;
    /**流程标识 */
    let startFlow = _me.startFlow;

    if (rep.formTaskAuth) {
        _me.formTaskAuth = rep.formTaskAuth;
    }
    
    let js = `try { 
        ${rep.diyJs} 
    } catch (error) {
        console.error("表单(${this_.formKey})自定义js脚本错误====>",error)
    }`

    eval(js);
}