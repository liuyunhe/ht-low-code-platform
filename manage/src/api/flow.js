import req from "@/request.js";
import utils from "@/hotent-ui-util.js"
import { Promise } from "q";
const model = window.context.bpmModel;
const runtime = window.context.bpmRunTime;

export default {
    getInstPage(param) {
        return new Promise((resolve, reject) => {
            req.post(runtime + '/runtime/instance/v1/getInstDetailList', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
        // return roleData.getRolePageJson(param);
    },
    forbiddenOrUnForbiddenInst(param) {
        return new Promise((resolve, reject) => {
            let url = runtime + '/runtime/instance/v1/';
            if(param.isForbidden =='1'){
                url += 'unForbiddenInstance?instId='+param.id;
            }else{
                url += 'forbiddenInstance?instId='+param.id;
            }
            req.get(url).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
    },
    getDefPage(param) {
        return new Promise((resolve, reject) => {
            req.post(model + '/flow/def/v1/listJson', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
        // return roleData.getRolePageJson(param);
    },
    getDefSetting(param,cb) {
        req.get(model +'/flow/node/v1/getDefSetting?defId='+param.defId+"&topDefKey="+param.topDefKey ).then(response=>{
            cb(response);
        });
    },
    //获取流程实例明细
    instanceFlowImage(data, cb) {

        req.get(runtime + '/runtime/instance/v1/instanceFlowImage?proInstId=' + data.instId+"&nodeId="+(data.nodeId||'')+"&type="+(data.type||'')+"&defId="+(data.defId||'')).then(response => {
            cb(response);
        });
    },
    //流程图
    getBpmImage(id, proInstId,defId, cb) {
        req.get(runtime + '/runtime/instance/v1/getBpmImage?taskId=&proInstId=' + proInstId + '&defId='+defId+'&bpmnInstId=' + id, "text").then(response => {
            cb(response);
        });
    },
    //获取审批意见
    getNodeopinions(data, cb) {
        req.get(runtime + '/runtime/task/v1/nodeOpinion?instId=' + data.instId+"&nodeId="+data.nodeIds+"&defId="+data.defId).then(response => {
            cb(response);
        });
    },
    getDelegationList(param){
        return new Promise((resolve, reject) => {
            req.post(model + "/flow/agent/v1/listJson?isMgr=true",param).then(
              response => {
                  resolve(response.data);
              },
              error => {
                  reject(error);
              }
            )
        });
    },
    getDelegationById(id){
        return new Promise((resolve, reject) => {
            req.get(model+"/flow/agent/v1/agentGet?id="+id).then(
              response => {
                resolve(response.data);
              },
              error => {
                  reject(error);
              })
        });
    },
    getAgentList(param){
        return new Promise((resolve,reject)=>{
            req.post(model+"/bpmModel/bpmDeputy/v1/list",param).then(
              response =>{
                  resolve(response.data);
              },
              error => {
                  reject(error);
              }
            );
        });
    },
    getAgentById(id){
      return new Promise((resolve,reject)=>{
          req.get(model+"/bpmModel/bpmDeputy/v1/get/"+id).then(
            response=>{
                resolve(response.data);
            },
            error=>{
                reject(error);
            }
          );
      });
    },
    saveAgent(param){
        return new Promise((resolve,reject)=>{
            req.post(model + "/bpmModel/bpmDeputy/v1/save",param).then(
              response =>{
                  resolve(response.data);
              },
              error => {
                  reject(error);
              }
            );
        });
    },
    getUserById(id){
      return new Promise((resolve,reject)=>{
          req.get(model + "/bpmModel/bpmDeputy/v1/getByUserId?userId="+id).then(
            response =>{
                resolve(response.data);
            },
            error => {
                reject(error);
            }
          );
      })
    },
    getSecretaryList(param){
        return new Promise((resolve,reject)=>{
            req.post(runtime + "/runtime/bpmSecretaryManage/v1/list",param).then(
              response =>{
                  resolve(response.data);
              },
              error => {
                  reject(error);
              }
            );
        });
    },
    getSecretaryById(id){
        return new Promise((resolve,reject)=>{
            req.get(runtime+"/runtime/bpmSecretaryManage/v1/get/"+id).then(
              response=>{
                  resolve(response.data);
              },
              error=>{
                  reject(error);
              }
            )
        })
    },
    saveSecretary(param){
      return new Promise((resolve,reject)=>{
        req.post(runtime+"/runtime/bpmSecretaryManage/v1/save",param).then(
          response=>{
            resolve(response.data);
          },
          error=>{
            reject(error);
          }
        )
      })
    },
    getTransferList(param){
        return new Promise((resolve,reject)=>{
            req.post(runtime + "/runtime/bpmTransRecord/v1/list",param).then(
              response =>{
                  resolve(response.data);
              },
              error => {
                  reject(error);
              }
            );
        });
    },
    getTransferById(id){
      return new Promise((resolve,reject)=>{
        req.get(runtime + "/runtime/bpmTransRecord/v1/get/"+id).then(
          response =>{
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
      });
    },
    getInstList(id,param){
      return new Promise((resolve,reject)=>{
        req.post(runtime + "/runtime/instance/v1/inst/listJson?userId="+id,param).then(
          response =>{
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
      });
    },
    turnOver(param){
      return new Promise((resolve,reject)=>{
        req.post(runtime + "/runtime/bpmTransRecord/v1/turnOver",param).then(
          response =>{
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
      });
    },
    getMessageType(cb) {
        req.get(runtime + '/runtime/task/v1/handlerTypes').then(response => {
            cb(response);
        });
    },
    //获取常用语列表
    getApprovalItemList(param){
        return new Promise((resolve, reject) => {
          req.post(model + `/flow/approvalItem/v1/listJson?isPersonal=false`,param).then(resp =>{
              resolve(resp)
          },error=>{
              reject(error)
          })
        })
    },
    //保存常用语
    saveApprovalItem(param){
        return new Promise((resolve, reject) => {
            req.post(model + `/flow/approvalItem/v1/save`,param).then(resp =>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取消息模板列表
    getMsgData(param){
        return new Promise((resolve, reject) => {
            req.post(window.context.portal+`/flow/MsgTemplate/v1/listJson`,param).then(resp =>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取消息详情
    getMsgDetails(id){
        return new Promise((resolve, reject) => {
            req.get(window.context.portal+`/flow/MsgTemplate/v1/getById?id=${id}`).then(resp =>{
                resolve(resp)
            },error =>{
                reject(error)
            })
        })
    },
    //获取常用脚本列表
    getScriptList(param){
        return new Promise((resolve, reject) => {
            req.post(runtime + `/runtime/script/v1/list`,param).then(resp =>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    getNodeBranches(param,cb){
        req.get(model + `/flow/node/v1/branchConditionEdit?defId=`+param.defId+"&nodeId="+param.nodeId).then(resp =>{
            cb(resp);
        })
    },
    //保存流程其他设置
    flowOtherSettingSave(param){
        return new Promise((resolve, reject) => {
            req.post(model + `/flow/def/v1/saveProp`,param).then(resp =>{
                resolve(resp.data)
            },error=>{
                reject(error.data)
            })
        })
    },
    //获取人员脚本列表
    getConditionScriptList(param){
        return new Promise((resolve, reject) => {
            req.post(runtime + `/runtime/conditionScript/v1/list`,param).then(resp =>{
                resolve(resp)
            },error =>{
                reject(error)
            })
        })
    },
    //获取脚本类
    getConditionScriptClassName(type){
        return new Promise((resolve, reject) => {
            req.get(runtime + `/runtime/conditionScript/v1/getImplClasses?type=${type}`).then(resp =>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取编辑数据
    getConditionScriptEditData(id){
        return new Promise((resolve, reject) => {
            req.get(runtime + `/runtime/conditionScript/v1/edit?id=${id}`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //执行脚本
    executeScript(param){
        return new Promise((resolve, reject) => {
            req.post(runtime + `/runtime/script/v1/executeScript`,param).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取脚本类存在的方法
    getClassMethod(className,id,type){
        return new Promise((resolve, reject) => {
            req.get(runtime + `/runtime/conditionScript/v1/getMethodsByName?className=${className}&id=${id}&type=${type}`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    getSignConfig(param,cb){
        req.get(model + `/flow/node/v1/getSignConfig?defId=`+param.defId+"&nodeId="+param.nodeId).then(resp =>{
            cb(resp);
        })
    },
    //获取岗位
    getPostList(){
        return new Promise((resolve, reject) => {
            req.post(`${uc}/api/org/v1/orgPosts/getOrgPostPage`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取角色
    getRoleList(){
        return new Promise((resolve, reject) => {
            req.post(`${uc}/api/role/v1/roles/getRolePage`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取部门
    getDepartmentList(){
        return new Promise((resolve, reject) => {
            req.post(`${uc}/api/org/v1/orgs/getOrgPage`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取常用语
    getApproval(id){
        return new Promise((resolve, reject) => {
            req.get(model + `/flow/approvalItem/v1/approvalItemGet?id=${id}`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    //获取常用脚本分类
    getScriptType(){
        return new Promise((resolve, reject) => {
            req.get(runtime + `/runtime/script/v1/getCategoryList`).then(resp=>{
                resolve(resp)
            },error=>{
                reject(error)
            })
        })
    },
    formDeflist(boCode,formKey,param){
        return new Promise((resolve, reject) => {
          req.post(model + `/flow/def/v1/formDeflist?boCode=`+boCode + "&formKey=" + formKey,param).then(resp=>{
            resolve(resp.data)
          },error=>{
            reject(error)
          })
        })
      },
    //获取首页图表
    getEchartData(data) {
        return new Promise((resolve, reject) => {
            req.get(runtime +'/runtime/report/v1/getEchartsData?reportId=' + data).then(resp=>{
              resolve(resp.data)
            },error=>{
              reject(error)
            })
          })
    },
    getFlowChartList(param){
      return new Promise((resolve, reject) => {
        req.post(runtime + "/runtime/report/v1/listJson",param).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getPermissionList(){
      return new Promise((resolve, reject) => {
        req.get(model + "/flow/defAuthorize/v1/getPermissionList").then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getReportList(id){
      return new Promise((resolve, reject) => {
        req.get(runtime + "/runtime/report/v1/getList?id="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getEchartsData(id){
      return new Promise((resolve, reject) => {
        req.get(runtime + "/runtime/report/v1/getEchartsData?reportId="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getSingleEchartsData(id){
      return new Promise((resolve, reject) => {
        req.get(runtime + "/runtime/report/v1/getSingleEchartsData?id="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getAct(id){
      return new Promise((resolve, reject) => {
        req.get(runtime + "/runtime/report/v1/getAct?id="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    saveAct(param){
      return new Promise((resolve, reject) => {
        req.post(runtime + "/runtime/report/v1/saveAct",param).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    removeAct(id){
      return new Promise((resolve, reject) => {
        req.remove(runtime + "/runtime/report/v1/removeAct?ids="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    saveReport(param){
      return new Promise((resolve, reject) => {
        req.post(runtime + "/runtime/report/v1/saveList",param).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    publishReport(id){
      return new Promise((resolve, reject) => {
        req.post(runtime + "/runtime/report/v1/publish?id="+id).then(resp =>{
          resolve(resp.data);
        },error=>{
          reject(error);
        })
      })
    },
    getBpmdefByDefId(id,cb){
      req.get("${bpmModel}/flow/def/v1/getBpmdefByDefId?defId="+id).then(resp =>{
        cb(resp.data);
      });
    },
    getBindRelation(defId) {
        return new Promise(((resolve, reject) => {
            req.get(model + `/flow/def/v1/getBindRelation?defId=${defId}`).then(resp =>{
                resolve(resp);
            },error=>{
                reject(error);
            })
        }));
    },
    getVarTree(defId){
        return new Promise((resolve, reject) => {
          req.post(window.context.bpmModel + "/flow/node/v1/varTree", {defId: defId, removeSub: true}).then(resp => {
            resolve(resp.data);
          },error => {
            reject(error);
          })
        })
    },
    getWatermarkList(param){
      return new Promise((resolve, reject) => {
        req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermark/v1/listJson`, param).then(resp => {
          resolve(resp.data);
        },error => {
          reject(error);
        })
      })
    },
    getWatermark(id){
      return new Promise((resolve, reject) => {
        req.get(`${req.getContext().bpmModel}/bpmModel/bpmWatermark/v1/getJson?id=${id}`).then(resp => {
          resolve(resp.data);
        },error => {
          reject(error);
        })
      })
    },
    getWatermarkTypeList(param){
      return new Promise((resolve, reject) => {
        req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkType/v1/listJson`, param).then(resp => {
          resolve(resp.data);
        },error => {
          reject(error);
        })
      })
    },
    saveWatermarkType(param,isAllSave) {
      return new Promise((resolve, reject) => {
        req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkType/v1/batchAdd?isAllSave=${isAllSave}`, param).then(resp => {
          resolve(resp.data);
        },error => {
          reject(error);
        })
      })
    },
    isExistWatermarkType(param){
      return new Promise((resolve, reject) => {
        req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkType/v1/isExist`, param).then(resp => {
          resolve(resp.data);
        },error => {
          reject(error);
        })
      })
    },
    getAllScript(){
        return new Promise((resolve, reject) => {
            req.get(runtime+'/runtime/script/v1/getAllScript').then(resp => {
              resolve(resp.data);
            },error => {
              reject(error);
            })
          })
    },
    copy(param) {
        return req.post(`${model}/flow/def/v1/copy`,param);
    },
    getWatermarkProcessList(param){
        return new Promise((resolve, reject) => {
            req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkProcess/v1/listJson`, param).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    isExistWatermarkProcess(param){
        return new Promise((resolve, reject) => {
            req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkProcess/v1/isExist`, param).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
    saveWatermarkProcess(param,isAllSave) {
        return new Promise((resolve, reject) => {
            req.post(`${req.getContext().bpmModel}/bpmModel/bpmWatermarkProcess/v1/batchAdd?isAllSave=${isAllSave}`, param).then(resp => {
                resolve(resp.data);
            },error => {
                reject(error);
            })
        })
    },
}
