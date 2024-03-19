import process from "@/api/process.js";
import { Notify } from 'vant';

const state = {
  pagination: {}, //分页参数
  rows: [], //列表数据
  total: 0, //列表数据总条数
  tree: [], //流程分类数据
  rowsBtn: [], //操作按钮
  approvalItem: [], //审批常用语
  opinions: [], //审批记录
  nodes: [], //任务节点
  checkedNodes: [], //跟踪了的任务节点
  bpmExeStacksUserNode: [], //可驳回的任务节点
  relatedInformation: {}, //相关信息
  dueTime: {},//任务延期消息
  signatureConfig: {status:'disable',field:'',isCover:false,secretFree:false,password:''} //签章配置 status:disable(未启用)，start（开始），ing(进行中)，success(成功)，fail(失败)
};

const getters = {};

const actions = {
  //更新每页下拉显示数据
  setPaginationSize({ commit, state }, size) {
    commit("setPaginationSize", size);
  },
  //更新第几页
  setPaginationPageNum({ commit, state }, currentPage) {
    commit("setPaginationPageNum", currentPage);
  },
  //获取流程分类列表
  getFlowTree({ commit, state }) {
    return new Promise((resolve, reject) => {
      process.getFlowTree(response => {
        resolve(response.data);
        commit("setFlowTrees", response.data);

      });
    });
  },
  //获取待办列表
  getTodoByPagination({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getTodoByPagination(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取我转办的列表
  getDelegate({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getDelegate(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取我抄送的任务列表
  getMyNoticeReadList({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getMyNoticeReadList(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //删除抄送任务
  delBpmTaskNoticeById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.delBpmTaskNoticeById(id, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //获取待阅列表
  getNoticeTodoReadList({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getNoticeTodoReadList(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取已阅列表
  getNoticeDoneReadList({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getNoticeDoneReadList(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取已办列表
  getDoneByPagination({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getDoneByPagination(pagination, response => {
        let revokeData = [];
        for (let i = 0; i < response.data.rows.length; i++) {
          if (!(response.data.rows[i].status != 'running' || response.data.rows[i].opinionStatus != 'agree') || response.data.rows[i].opinionStatus == 'inqu') {
            response.data.rows[i].revoke = true;
            for (let j = 0; j < revokeData.length; j++) {
              if (revokeData[j].id == response.data.rows[i].id && revokeData[j].taskKey == response.data.rows[i].taskKey && response.data.rows[i].revoke == true) {
                response.data.rows[i].revoke = false;
              }
            }
            revokeData.push(response.data.rows[i]);
          } else {
            response.data.rows[i].revoke = false;
          }
        }

        let dataRows = response.data.rows;
        commit("setRows", dataRows);//已办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取我的请求列表
  getMyRequestByPagination({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getMyRequestByPagination(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //获取新建流程列表
  getFlowListByPagination({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getFlowListByPagination(pagination, response => {
        commit("setRows", response.data.rows);//待办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //撤回
  revokeInstance({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.revokeInstance(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //审批查看页面撤回
  revokeInstanceBtn({ commit, state }, data, isHand) {
    return new Promise((resolve, reject) => {
      process.revokeInstance(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve(data.isHandRevoke);
            }
          });
        }
      });
    });
  },
  //获取审批操作按钮
  taskDetail({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskDetail(data, response => {
        if(response.data && response.data.buttons && response.data.buttons.length>0){
          response.data.buttons.push({name: "更多", alias: "more"});
        }
        resolve(response.data.buttons);
        commit("setButtonRows", response.data.buttons);
      });
    });
  },
  //获取审批常用语
  getApprovalByDefKeyAndTypeId({ commit, state }, defKey) {
    process.getApprovalByDefKeyAndTypeId(defKey, response => {
      commit("setApprovalItem", response.data);
    });
  },
  //获取审批记录
  getOpinionsById({ commit, state }, id) {
    process.getOpinionsById(id, response => {
      let datas = {};
      let res = [];
      for (var i = 0; i < response.data.length; i++) {
        datas = response.data[i];
        if (response.data[i].files) {
          datas.files = JSON.parse(response.data[i].files);
        }
        if (response.data[i].zfiles) {
          datas.zfiles = JSON.parse(response.data[i].zfiles);
        }
        res.push(datas);
      }
      commit("setOpinions", res);
    });
  },
  //获取可跟踪的任务节点
  taskNode({ commit, state }, data) {
    process.taskNode(data.defId, response => {
      let nodes = response.data.bpmDefLayout.listLayout;
      let nodesCopy = []
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType != 'START' && nodes[i].nodeType != 'END' && nodes[i].nodeType != 'INCLUSIVEGATEWAY'
          && nodes[i].nodeType != 'EXCLUSIVEGATEWAY' && nodes[i].nodeType != 'PARALLELGATEWAY') {
          nodesCopy.push({ ...nodes[i] })
        }
      }
      commit("setNodes", nodesCopy);
      //根据流程实例id获取已跟踪的节点
      process.getFollowedNode(data.proInst, response => {
        let followedNodeIds = response.data.value || '';
        let checked = [];
        state.nodes.forEach(item => {
          if (followedNodeIds.indexOf(item.nodeId) > -1) {
            checked.push(item.nodeId);
          }
        });
        commit("setCheckedNodes", checked);
      });
    });
  },
  //选择任务节点时选择该复选框
  setCheckedPush({ commit, state }, value) {
    commit("setCheckedPush", value);
  },
  setCheckedSplice({ commit, state }, value) {
    commit("setCheckedSplice", value);
  },
  //根据任务ID获取任务明细
  getTaskById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getTaskById(id, response => {
        resolve(response.data);
      });
    });
  },
  //根据任务ID获取任务明细
  getNotice({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getNotice(id, response => {
        resolve(response.data);
      });
    });
  },
  //根据实例id获取实例对象
  getInstanceByInstId({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getInstanceByInstId(id, response => {
        resolve(response.data);
      });
    });
  },
  //根据实例ID判断流程是否结束
  isEnd({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.isEnd(id, response => {
        if (response.data.state) {
          resolve();
        } else {
          // Message.warning(response.data.message);
          reject();
        }
      });
    });
  },
  //新增,更新任务跟踪表数据
  taskFollowSave({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskFollowSave(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //驳回设置
  taskToReject({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToReject(data, response => {
        commit("setBpmExeStacksUserNode", response.data.bpmExeStacksUserNode);
        resolve(response.data);
       });
    });

  
  },
  //保存驳回设置
  rejectComplete({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.rejectComplete(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //保存转办设置
  delegate({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.delegate(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //流程抄送
  transToMore({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.transToMore(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //征询设置
  taskToInqu({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToInqu(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        }else{
          reject();
        } 
      });
    });
  },
  //流程终止
  doEndProcess({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.doEndProcess(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //流转设置
  taskToTrans({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToTrans(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //流程图
  getBpmImage({ commit, state }, data) {
    return new Promise((resolve, reject) => {    
      process.instanceFlowImage(data, response => {
        let defId = response.data.instanceId ? '':response.data.defId;
        process.getBpmImage('', response.data.instanceId,defId, res => {
          let data = { "rows": response.data, "img": res.data };
          resolve(data);
        });
      });
    });
  },
  //征询设置
  taskToInquReply({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToInquReply(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //普通用户节点加签反馈
    userAddSign({ commit, state }, data) {
      return new Promise((resolve, reject) => {
        process.userAddSign(data, response => {
          if (response.data.state) {
            Notify({ type: 'success',
              duration: 1500, message: response.data.message, onClose: function () {
                resolve();
              }
            });
          }
        });
      });
    },
  //沟通设置
  communicate({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.communicate(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //沟通反馈
  doNextcommu({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.doNextcommu(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //抄送回复
  doNextCopyto({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.doNextCopyto(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //获取任务是否能锁定
  canLock({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.canLock(id, response => {
        resolve(response.data);
      });
    });
  },
  //获取任务锁定状态
  lockUnlock({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.lockUnlock(id, response => {
        if (response.data == 1) {
          Notify({ type: 'success',
            duration: 1500, message: "已签收", onClose: function () {
              resolve();
            }
          });
        } else if (response.data == 3) {
          Notify({ type: 'success',
            duration: 1500, message: "已取消签收", onClose: function () {
              resolve();
            }
          });
        }
      });
    });
  },
  //处理任务 
  complete({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.complete(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //启动流程
  start({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.start(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      }, err => {
        reject(err);
      });
    });
  },
  //保存草稿
  saveDraft({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.saveDraft(data, response => {
        if (response.data.state) {
          Notify({type: 'success',duration: 1500,message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //根据流程实例ID获取相关信息
  getRelatedInformationById({ commit, state }, id) {
    process.getRelatedInformationById(id, response => {
      commit("setRelatedInformation", response.data);
    });
  },
  //添加阅读记录
  addReadRecord({ commit, state }, id) {
    process.addReadRecord(id, response => {
    });
  },
  //根据流程实例ID获取阅读记录
  getByRecordInstId({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getByRecordInstId(pagination, response => {
        if (response.data.rows[0] != null) {
          commit("setRows", response.data.rows);//阅读记数据
          commit("setTotal", response.data.total);//总数据条数
        } else {
          commit("setRows", []);//阅读记数据
          commit("setTotal", 0);//总数据条数
        }
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve();
      });
    });
  },
  //删除草稿
  removeDraftById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.removeDraftById(id, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //逻辑删除流程实例
  doEndProcessById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.doEndProcessById(id, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: "终止成功", onClose: function () {
              resolve();
            }
          });
        }
      });
    });
  },
   //根据流程实例ID终止流程
   restore({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.restore(id, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: "删除成功", onClose: function () {
              resolve();
            }
          });
        }
      });
    });
  },
  //知会任务待办转已办
  noticeTurnDode({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.noticeTurnDode(id, response => {
        resolve();
      });
    });
  },
  //根据任务id获取最新的延期信息
  bpmTaskDueTime({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.bpmTaskDueTime(id, response => {
        commit("setDueTime", response.data);
        resolve(response.data);
      });
    });
  },
  //根据id获取到期时间
  getExpirationDate({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.getExpirationDate(data, response => {
        resolve(response.data);
      });
    });
  },
  //添加任务期限统计信息
  dueTimeSave({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.dueTimeSave(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //获取后续可跳转节点
  getAfterJumpNodes({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.getAfterJumpNodes(data, response => {
        resolve(response.data);
      });
    });
  }
  ,
  //保存表单数据
  saveFormData({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.saveFormData(data, response => {
        resolve(response.data);
      });
    });
  },
  //根据id获取到期时间
  getCurNodeProperties({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.getCurNodeProperties(data, response => {
        resolve(response.data);
      });
    });
  },
  //获取统计图表
  getEchartData({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getEchartData(pagination, response => {
        let data = { options: [] };
        if (response.data.state) {
          data.options = response.data.value;
        }
        resolve(data);
      });
    });
  } ,
  //获取审批意见
  getNodeopinions({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.getNodeopinions(pagination, response => {
        resolve(response.data);
      });
    });
  },
  //通过bo数据发起流程
  startForm({ commit, state }, pagination) {
    return new Promise((resolve, reject) => {
      process.startForm(pagination, response => {
        resolve(response.data);
      });
    });
  },
  //获取审紧急状态配置
  getUrgentStateConf({ commit, state }, param) {
    return new Promise((resolve, reject) => {
      process.getUrgentStateConf(param, response => {
        resolve(response.data);
      });
    });
  },
  //根据流程实例ID、催办人ID获取催办记录
  getUrgrntById({ commit, state }, param) {
    return new Promise((resolve, reject) => {
      process.getUrgrntById(param, response => {
        commit("setRows", response.data.rows);//催办数据
        commit("setTotal", response.data.total);//总数据条数
        let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
        commit("setPagination", pageBean);//显示第几页，每页显示多少条
        resolve(response.data.rows);
      });
    });
  },
  //根据流程实例ID获取当前任务节点审批人
  getExcutorNameByInstId({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getExcutorNameByInstId(id, response => {
        resolve(response.data);
      });
    });
  },
  //根据流程定义id获取流程信息
  defGet({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.defGet(id, response => {
        resolve(response.data);
      });
    });
  },
  //发送人工催办
  sendBpmTaskUrgent({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.sendBpmTaskUrgent(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //取回转办流程
  retrieveBpmTask({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.retrieveBpmTask(id, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //普通任务加签
  userTaskToSign({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.userTaskToSign(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        }
      });
    });
  },
  //会签任务加签
  taskSignUsers({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskSignUsers(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        }
      });
    });
  },
  //获取已办的实例
  getDoneByInstId({ commit, state }, id) {
      return new Promise((resolve, reject) => {
        process.getDoneByInstId(id, response => {
          resolve(response);
        });
      });
    },
  //流转设置
  taskToApproveLine({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToApproveLine(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
	taskToSignSequence({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToSignSequence(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
	// 提交并行签署设置
	taskToSignLine({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.taskToSignLine(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //撤回流转任务
  revokeTrans({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.revokeTrans(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
  //撤回任务 顺序签署
  revokeSignSequence({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.revokeSignSequence(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
	revokeSignLine({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.revokeSignLine(data, response => {
        if (response.data.state) {
          Notify({ type: 'success',
            duration: 1500, message: response.data.message, onClose: function () {
              resolve();
            }
          });
        } 
      });
    });
  },
	getSignLinesInstIdNodeId({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.getSignLinesInstIdNodeId(data, response => {
        if (response.data) {
          resolve(response.data);
        } 
      });
    });
  },
  //根据主键ID待办获取知会任务信息
	getBpmTaskNoticeById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getBpmTaskNoticeById(id, response => {
          resolve(response.data);
      });
    });
  },
  //根据主键ID获取已办知会任务信息
	getBpmTaskNoticeDoneById({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getBpmTaskNoticeDoneById(id, response => {
          resolve(response.data);
      });
    });
  },
  //根据任务Id获取审批历史数据（只有一条）
	getTaskKeyByTaskId({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      process.getTaskKeyByTaskId(id, response => {
          resolve(response.data);
      });
    });
  },
   //根据任务节点ID和流程实例ID获取审批历史数据（只有一条）
   getTaskKeyByNodeId({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      process.getTaskKeyByNodeId(data, response => {
          resolve(response.data);
      });
    });
  },
  initSignature({commit, state}, data){
    return new Promise((resolve, reject) => {
      commit("initSignature", data);//催办数据
      resolve();
    });
  },
  setSignatureStatus({commit, state}, status){
    return new Promise((resolve, reject) => {
      commit("setSignatureStatus", status);//催办数据
      resolve();
    });
  },
  doSignature({commit, state}, data){
    return new Promise((resolve, reject) => {
      commit("setSignature", data);//催办数据
      resolve();
    });
  }
};

const mutations = {
  setPagination(state, pagination) {
    state.pagination = pagination;
  },
  setPaginationSize(state, size) {
    state.pagination.pageSize = size;
  },
  setPaginationPageNum(state, currentPage) {
    state.pagination.page = currentPage;
  },
  setRows(state, rows) {
    state.rows = rows;
  },
  setTotal(state, total) {
    state.total = total;
  },
  setFlowTrees(state, tree) {
    state.tree = tree;
  },
  setButtonRows(state, rowsBtn) {
    state.rowsBtn = rowsBtn;
  },
  setApprovalItem(state, approvalItem) {
    state.approvalItem = approvalItem;
  },
  setOpinions(state, opinions) {
    state.opinions = opinions;
  },
  setNodes(state, nodes) {
    state.nodes = nodes;
  },
  setCheckedNodes(state, checkedNodes) {
    state.checkedNodes = checkedNodes;
  },
  setCheckedPush(state, value) {
    state.checkedNodes.push(value);
  },
  setCheckedSplice(state, value) {
    state.checkedNodes.splice(value, 1);
  },
  setBpmExeStacksUserNode(state, bpmExeStacksUserNode) {
    state.bpmExeStacksUserNode = bpmExeStacksUserNode;
  },
  setRelatedInformation(state, relatedInformation) {
    state.relatedInformation = relatedInformation;
  },
  setDueTime(state, dueTime) {
    state.dueTime = dueTime;
  },
  setSignature(state, signature){
    state.signatureConfig = signature; 
  },
  setSignatureStatus(state, status){
    state.signatureConfig.status = status; 
  },
  initSignature(state, data){
    state.signatureConfig = {status:'disable',field:'',isCover:false,secretFree:false,password:''};
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
