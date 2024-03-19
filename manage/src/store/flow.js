import flow from "@/api/flow.js";
import utils from "@/hotent-ui-util.js"  
const state = {
    defConfigData: {
        initData:{},
        nodeSetData:{},
        curEditNode:{}
    },
    copyDefConfigData:{},
    nodeBranches:{},
    signConfigs:{},
    mesageType:''
}

const getters = {}

const actions = {
    // 根据流出定义id和父流程key获取流程配置信息
    getDefSetting({ commit, state },param) {
    return new Promise((resolve, reject) => {    
        commit('clearCacheData');
        flow.getDefSetting(param, resp => {
            commit('setDefSettingData', resp.data);
            resolve(resp.data);
        });
    });
        
    },

    //更新vuex里面的配置数据{path:value}
    updateConfig({ commit, state },param) {
        commit('updateConfig', param);
    },
    saveDefSetting({ commit, state },data) {
        commit('updateConfig', param);
    },
      //流程图
   getBpmImage({ commit, state }, data) {
    return new Promise((resolve, reject) => {    
        flow.instanceFlowImage(data, response => {
        let defId = response.data.instanceId ? '':response.data.defId;
        flow.getBpmImage('', response.data.instanceId,defId, res => {
          let data = { "rows": response.data, "img": res.data };
          resolve(data);
        });
      });
    });
  },
    //获取审批意见
    getNodeopinions({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            flow.getNodeopinions(pagination, response => {
            resolve(response.data);
            });
        });
    },
  //获取系统配置的通知类型
  getMessageType({ commit, state }) {  
    return new Promise((resolve, reject) => {
        if (state.mesageType) {
            resolve(state.mesageType);
        }else{
            flow.getMessageType(response => {
                commit('setMessageType', response.data);
                resolve(response.data);
              });
        }     
    });
  },
  //获取节点分支规则
  getCurSelectBranches({ commit, state }) {  
    return new Promise((resolve, reject) => {
        let curNode = state.defConfigData.curEditNode;
        if (!curNode.nodeId || (curNode.nodeType !='EXCLUSIVEGATEWAY' && curNode.nodeType !='INCLUSIVEGATEWAY')) {
            reject();
        }else if (curNode && state.nodeBranches[curNode.nodeId]) {
            resolve(state.nodeBranches[curNode.nodeId]);
        }else if(curNode && curNode.nodeId){
            flow.getNodeBranches({nodeId:curNode.nodeId,defId:curNode.defId},response => {
                commit('setNodeBranches', {nodeId:curNode.nodeId,data:response.data});
                resolve(response.data);
            });
        }   
    });
  },
    //获取会签配置
    getSignConfig({ commit, state }) {  
        return new Promise((resolve, reject) => {
            let curNode = state.defConfigData.curEditNode;
            if ( !curNode.nodeId || curNode.nodeType !='SIGNTASK') {
                reject();
            }else   if (curNode && state.signConfigs[curNode.nodeId]) {
                resolve(state.signConfigs[curNode.nodeId]);
            }else{
                flow.getSignConfig({nodeId:curNode.nodeId,defId:curNode.defId},response => {
                    commit('setSignConfigs', {nodeId:curNode.nodeId,data:response.data});
                    resolve(response.data);
                });
            }     
        });
    },
    updateDefRev({ commit, state }) {  
        flow.getBpmdefByDefId(state.defConfigData.initData.bpmDefinition.defId,response => {
            commit('updateBpmdef', response);
        });
    },
}

const mutations = {
    updateBpmdef(state, param){
        state.defConfigData.initData.bpmDefinition =param;     
    },
    setSignConfigs(state, param){
        state.signConfigs[param.nodeId] =param.data;     
    },
    setNodeBranches(state, param){
        state.nodeBranches[param.nodeId] =param.data;     
    },
    clearCacheData(state){
        state.defConfigData = { initData:{},nodeSetData:{}, curEditNode:{} }
        state.nodeBranches ={}; 
        state.signConfigs ={};     
    },
    setDefSettingData(state, data){
        if(!data.initData.bpmDefLayout){
            state.defConfigData = data;
            state.copyDefConfigData = JSON.parse(JSON.stringify(state.defConfigData));
            return;
        }
        for(var i=0,layout;layout=data.initData.bpmDefLayout.listLayout[i++];){
            layout.nodeStyle = {position:'absolute',cursor:'hand','text-align':'center',left:layout.x+"px",top:layout.y+"px",width:layout.width+"px",height:layout.height+"px"};
        }

        if(!data.nodeSetData.bpmDefSetting.globalForm)data.nodeSetData.bpmDefSetting.globalForm ={type:'INNER',formType:'pc',name:'',formValue:'',formExtraConf:'',helpFile:''};
        if(!data.nodeSetData.bpmDefSetting.globalMobileForm)data.nodeSetData.bpmDefSetting.globalMobileForm ={type:'INNER',formType:'mobile',name:'',formValue:'',helpFile:''};
        if(!data.nodeSetData.bpmDefSetting.instForm)data.nodeSetData.bpmDefSetting.instForm ={type:'INNER',formType:'pc',name:'',formValue:''};
        if(!data.nodeSetData.bpmDefSetting.instMobileForm)data.nodeSetData.bpmDefSetting.instMobileForm ={type:'INNER',formType:'mobile',name:'',formValue:''};
        state.defConfigData.initData =data.initData;
        state.defConfigData.nodeSetData =data.nodeSetData;
        //获取通知类型
        data.nodeSetData.notifyType = [];
        for(let key in data.initData.messageTypelist){
            let obj = {key:key,value:data.initData.messageTypelist[key]};
            data.nodeSetData.notifyType.push(obj);
        }
         //屏蔽一些多余的按钮配置
        for(let key in data.nodeSetData.nodeBtnMap){
            let item = data.nodeSetData.nodeBtnMap[key];
            for(let i=item.length-1;i>=0;i--){
                if(item[i].alias=="commu" || item[i].alias=="startCommu" || item[i].alias=="instanceTrans" || item[i].alias=="backToStart"){
                    item.splice(i,1);
                }
            }
        }
        state.copyDefConfigData = JSON.parse(JSON.stringify(state.defConfigData));
    },
    updateConfig(state, param){
        if (param && param.constructor == Object) {
            for(let key in param){
                if (key.indexOf('nodeBranches')>-1 || key.indexOf('signConfigs')>-1) {
                    utils.setValueByPath(state,key,JSON.parse(JSON.stringify(param[key])));
                }else{
                    utils.setValueByPath(state,'defConfigData.'+key,JSON.parse(JSON.stringify(param[key])));
                }
                
            }
        }    
    },
    setMessageType(state, param){
        state.mesageType =param;     
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
