import req from "@/request.js";

const bpmModel = window.context.bpmModel;
const bpmRunTime = window.context.bpmRunTime;
const portal = window.context.portal;

export default {
    //获取流程分类列表
    getFlowTree(cb) {
        req.get(portal + '/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE').then(response => {
            cb(response);
        });
    },
    //获取待办列表
    getTodoByPagination(pagination, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getTodoList', pagination).then(response => {
            cb(response);
        });
    },
    //获取我转办的列表
    getDelegate(pagination, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getDelegate', pagination).then(response => {
            cb(response);
        });
    },
    //获取我抄送的任务列表
    getMyNoticeReadList(pagination, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getMyNoticeReadList', pagination).then(response => {
            cb(response);
        });
    },
    //获取待阅列表
    getNoticeTodoReadList(pagination, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getNoticeTodoReadList', pagination).then(response => {
            cb(response);
        });
    },
    //获取已阅列表
    getNoticeDoneReadList(pagination, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getNoticeDoneReadList', pagination).then(response => {
            cb(response);
        });
    },
    //获取已办列表
    getDoneByPagination(pagination, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/getDoneInstList', pagination).then(response => {
            cb(response);
        });
    },
    //获取我的请求列表
    getMyRequestByPagination(pagination, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/myRequest', pagination).then(response => {
            cb(response);
        });
    },
    //获取新建流程列表
    getFlowListByPagination(pagination, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/newProcess', pagination).then(response => {
            cb(response);
        });
    },
    //撤回
    revokeInstance(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/revokeInstance', data).then(response => {
            cb(response);
        });
    },
    //获取审批操作按钮
    taskDetail(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getButtonsBytaskId?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //获取审批常用语
    getApprovalByDefKeyAndTypeId(defKey, cb) {
        req.get(bpmModel + '/flow/approvalItem/v1/getApprovalByDefKeyAndTypeId?defKey=' + defKey).then(response => {
            cb(response);
        });
    },
    //获取审批记录
    getOpinionsById(id, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/instanceFlowOpinions?instId=' + id).then(response => {
            cb(response);
        });
    },
    //获取可跟踪的任务节点
    taskNode(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/taskNode?defId=' + id).then(response => {
            cb(response);
        });
    },
    //根据流程实例id获取已跟踪的节点
    getFollowedNode(id, cb) {
        req.get(bpmRunTime + '/runtime/taskFollow/v1/getFollowedNode?instId=' + id).then(response => {
            cb(response);
        });
    },
    //根据任务ID获取任务明细
    getTaskById(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/get?id=' + id).then(response => {
            cb(response);
        });
    },
    //根据任务ID获取任务明细
    getNotice(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getNotice?id=' + id).then(response => {
            cb(response);
        });
    },
    //根据实例id获取实例对象
    getInstanceByInstId(id, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/getInstanceByInstId?instId=' + id).then(response => {
            cb(response);
        });
    },
    //根据实例ID判断流程是否结束
    isEnd(id, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/isEnd?procInstId=' + id).then(response => {
            cb(response);
        });
    },
    //新增,更新任务跟踪表数据
    taskFollowSave(data, cb) {
        req.post(bpmRunTime + '/runtime/taskFollow/v1/save', data).then(response => {
            cb(response);
        });
    },
    //驳回设置
    taskToReject(data, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/taskToReject?taskId=' + data.taskId + '&backModel=' + data.backModel).then(response => {
            cb(response);
        });
    },
    //保存驳回设置
    rejectComplete(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/complete', data).then(response => {
            cb(response);
        });
    },
    //保存转办设置
    delegate(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/delegate', data).then(response => {
            cb(response);
        });
    },
    //流程抄送
    transToMore(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/transToMore', data).then(response => {
            cb(response);
        });
    },
    //征询设置
    taskToInqu(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToInqu', data).then(response => {
            cb(response);
        });
    },
    //流程终止
    doEndProcess(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/doEndProcess', data).then(response => {
            cb(response);
        });
    },
    //流转设置
    taskToTrans(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToTrans', data).then(response => {
            cb(response);
        });
    },
    //获取流程实例明细
    instanceFlowImage(data, cb) {

        req.get(bpmRunTime + '/runtime/instance/v1/instanceFlowImage?proInstId=' + data.instId + "&nodeId=" + (data.nodeId || '') + "&type=" + (data.type || '') + "&defId=" + (data.defId || '')).then(response => {
            cb(response);
        });
    },
    //流程图
    getBpmImage(id, proInstId, defId, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/getBpmImage?taskId=&proInstId=' + proInstId + '&defId=' + defId + '&bpmnInstId=' + id, "text").then(response => {
            cb(response);
        });
    },
    //征询回复
    taskToInquReply(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToInquReply', data).then(response => {
            cb(response);
        });
    },
    userAddSign(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/userAddSignFeedback', data).then(response => {
            cb(response);
        });
    },
    //沟通设置
    communicate(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/communicate', data).then(response => {
            cb(response);
        });
    },
    //沟通反馈
    doNextcommu(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/doNextcommu', data).then(response => {
            cb(response);
        });
    },
    //抄送回复
    doNextCopyto(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/doNextCopyto', data).then(response => {
            cb(response);
        });
    },
    //获取任务是否能锁定
    canLock(data, cb) {
        if (data.taskId) {
            req.get(bpmRunTime + '/runtime/task/v1/canLock?taskId=' + data.taskId + "&leaderId=" + data.leaderId, "text").then(response => {
                cb(response);
            });
        } else {
            req.get(bpmRunTime + '/runtime/task/v1/canLock?taskId=' + data, "text").then(response => {
                cb(response);
            });
        }
    },
    //获取任务锁定状态
    lockUnlock(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/lockUnlock?taskId=' + id, "text").then(response => {
            cb(response);
        });
    },
    //处理任务
    complete(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/complete', data).then(response => {
            cb(response);
        });
    },
    //启动流程
    start(data, cb, errorCb) {
        req.post(bpmRunTime + '/runtime/instance/v1/start', data).then(response => {
            cb(response);
        }).catch((err) => {
            errorCb(err);
        });
    },
    //保存草稿
    // 原接口地址：/runtime/instance/v1/saveDraft
    // 2022-07-07 yigz:修改保存接口地址，解决保存时出现重复提醒的问题（与PC端保存接口保持一致）
    saveDraft(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/saveDraft', data).then(response => {
            cb(response);
        });
    },
    //根据流程实例ID获取相关信息
    getRelatedInformationById(id, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/getRelatedInformationById?id=' + id).then(response => {
            cb(response);
        });
    },
    //添加阅读记录
    addReadRecord(id, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/addReadRecord?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //根据流程实例ID获取阅读记录
    getByRecordInstId(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/getByRecordInstId', data).then(response => {
            cb(response);
        });
    },
    //删除草稿
    removeDraftById(id, cb) {
        req.remove(bpmRunTime + '/runtime/instance/v1/removeDraftById?ids=' + id).then(response => {
            cb(response);
        });
    },
    //逻辑删除流程实例
    restore(id, cb) {
        req.remove(bpmRunTime + '/runtime/instance/v1/removeDraftById?ids=' + id).then(response => {
            cb(response);
        });
    },
    //根据流程实例ID终止流程
    doEndProcessById(id, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/doEndProcessById?id=' + id).then(response => {
            cb(response);
        });
    },
    //根据ID主键ID删除抄送任务
    delBpmTaskNoticeById(id, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/delBpmTaskNoticeById?id=' + id).then(response => {
            cb(response);
        });
    },
    //知会任务待办转已办
    noticeTurnDode(id, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/noticeTurnDode?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //根据任务id获取最新的延期信息
    bpmTaskDueTime(id, cb) {
        req.get(bpmRunTime + '/runtime/bpmTaskDueTime/v1/getByTaskId?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //根据id获取到期时间
    getExpirationDate(data, cb) {
        req.get(bpmRunTime + '/runtime/bpmTaskDueTime/v1/getExpirationDate?id=' + data.id + "&addDueTime=" + data.time).then(response => {
            cb(response);
        });
    },
    //添加任务期限统计信息
    dueTimeSave(data, cb) {
        req.post(bpmRunTime + '/runtime/bpmTaskDueTime/v1/save', data).then(response => {
            cb(response);
        });
    },
    //根据任务id或者定义id获取后续可跳转节点
    getAfterJumpNodes(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/getAfterJumpNodes', data).then(response => {
            cb(response);
        });
    },
    //保存表单数据
    saveFormData(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/saveFormData', data).then(response => {
            cb(response);
        });
    },
    //保存表单数据
    getCurNodeProperties(data, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getCurNodeProperties?defId=' + data.defId + "&instId=" + data.instId + "&taskId=" + data.taskId).then(response => {
            cb(response);
        });
    },
    //获取首页图表
    getEchartData(data, cb) {
        req.get(bpmRunTime + '/runtime/report/v1/getEchartsData?reportId=' + data).then(response => {
            cb(response);
        });
    },
    //获取审批意见
    getNodeopinions(data, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/nodeOpinion?instId=' + data.instId + "&nodeId=" + data.nodeIds + "&defId=" + data.defId).then(response => {
            cb(response);
        });
    },

    //通过bo数据发起流程
    startForm(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/startForm?defKey=' + data.defKey + '&businessKey=' + data.businessKey + '&boAlias=' + data.boAlias, {}).then(response => {
            cb(response);
        });
    },

    //获取紧急状态配置
    getUrgentStateConf(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/getUrgentStateConf', data).then(response => {
            cb(response);
        });
    },
    //根据流程实例ID、催办人ID获取催办记录
    getUrgrntById(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/getUrgrntById', data).then(response => {
            cb(response);
        });
    },
    //根据流程实例ID获取当前任务节点审批人
    getExcutorNameByInstId(id, cb) {
        req.get(bpmRunTime + '/runtime/instance/v1/getExcutorNameByInstId?instId=' + id).then(response => {
            cb(response);
        });
    },
    //根据流程定义id获取流程信息
    defGet(id, cb) {
        req.get(bpmModel + '/flow/def/v1/defGet?defId=' + id).then(response => {
            cb(response);
        });
    },
    //发送人工催办
    sendBpmTaskUrgent(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/sendBpmTaskUrgent', data).then(response => {
            cb(response);
        });
    },
    //取回转办流程
    retrieveBpmTask(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/retrieveBpmTask?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //会签任务加签
    taskSignUsers(signParamObject, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskSignUsers', signParamObject).then(response => {
            cb(response);
        });
    },
    //普通任务加签
    userTaskToSign(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/userTaskToSign', data).then(response => {
            cb(response);
        });
    },
    //根据实例id获取当前实例的办理环节
    getDoneByInstId(pagination, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/getDoneList?isCheckRevoke=true', pagination).then(response => {
            cb(response);
        });
    },
    //并行审批设置
    taskToApproveLine(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToApproveLine', data).then(response => {
            cb(response);
        });
    },
    // 顺序签署设置
    taskToSignSequence(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToSignSequence', data).then(response => {
            cb(response);
        });
    },
    // 并行签署配置保存
    taskToSignLine(data, cb) {
        req.post(bpmRunTime + '/runtime/task/v1/taskToSignLine', data).then(response => {
            cb(response);
        });
    },
    //撤回流转任务
    revokeTrans(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/revokeTrans', data).then(response => {
            cb(response);
        });
    },
    //撤回顺序签署任务
    revokeSignSequence(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/revokeSignSequence', data).then(response => {
            cb(response);
        });
    },
    revokeSignLine(data, cb) {
        req.post(bpmRunTime + '/runtime/instance/v1/revokeSignLine', data).then(response => {
            cb(response);
        });
    },
    getSignLinesInstIdNodeId(data, cb) {
        req.get(bpmRunTime + '/runtime/signline/v1/getSignLinesInstIdNodeId?instanceId=' + data.instanceId + "&nodeId=" + data.nodeId + "&taskId=" + data.taskId).then(response => {
            cb(response);
        });
    },
    //根据主键ID获取待办知会任务信息
    getBpmTaskNoticeById(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getBpmTaskNoticeById?id=' + id).then(response => {
            cb(response);
        });
    },
    //根据主键ID获取已办知会任务信息
    getBpmTaskNoticeDoneById(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getBpmTaskNoticeDoneById?id=' + id).then(response => {
            cb(response);
        });
    },
    //根据任务Id获取审批历史数据（只有一条）	
    getTaskKeyByTaskId(id, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getTaskKeyByTaskId?taskId=' + id).then(response => {
            cb(response);
        });
    },
    //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）	
    getTaskKeyByNodeId(data, cb) {
        req.get(bpmRunTime + '/runtime/task/v1/getTaskKeyByNodeId?nodeId=' + data.nodeId + "&instId=" + data.instId).then(response => {
            cb(response);
        });
    },
    //检查是否有启动权限
    checkStartRight(userId, defId, leaderId) {
        leaderId = leaderId || '0';
        return req.get(bpmModel + `/flow/defAuthorize/v1/startRight?userId=${userId}&defId=${defId}&leadId=${leaderId}`);
    }
}