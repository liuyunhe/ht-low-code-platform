import flow from "@/api/flow.js";
import { Notify } from 'vant';

const state = {
    oftenFlowList: [],
    copyOftenFlowList:[],
    hasAuthFlowList:[],
    completeInit:false
}

const getters = {}

const actions = {
    //获取我的常用流程
    getMyOftenFlowdw({ commit, state }) {
        flow.getMyOftenFlow(data=>{
            commit('setOftenFlow', data)
        })
    },
    //添加/删除常用流程
    signOftenFlow({ commit, state },tag) {
        commit('signOftenFlow', tag)
    },
    //初始化常用流程设置页面数据
    initOftenFlowManageData({ commit, state },data) {
        flow.getHasAuthFlowList(data.filter,resp=>{
            commit('initOftenFlowManageData',{init:data.init,list:resp});
        })    
    } ,
    //保存常用流程设置
    saveOftenFlow({ commit, state },data) {
        return new Promise((resolve, reject) => {
            flow.saveOftenFlow(data,resp=>{
                Notify({ type: 'success',duration:1500,message: "保存常用流程成功", onClose: function () {
                    if(resp.state){
                        commit('updateOftenFlow');
                    }
                    resolve(resp);
                  }
                });
             }) 
        })   
    }
}

const mutations = {
    setOftenFlow(state, data) {
        state.oftenFlowList = data.rows;
    },
    //添加或删除常用流程。是常用流程则移除。不是常用流程则添加。
    signOftenFlow(state, tag) {
        let  data = JSON.parse(JSON.stringify(state.hasAuthFlowList));
        let  isAdd = false;
        for(var i=0,d;d=data[i++];){
            for(var j=0,f;f=d.flowList[j++];){
                if(f.defKey==tag.defKey){
                    f.isAdd =! f.isAdd;
                    isAdd = f.isAdd;
                    break;
                }
            }
        }
        if(isAdd){
            state.copyOftenFlowList.push({defKey:tag.defKey,name:tag.name});
        }else{
            state.copyOftenFlowList.splice(state.copyOftenFlowList.indexOf(tag),1)
        }
        state.hasAuthFlowList = data;
    },
    //初始化常用流程设置页面数据。1，复制首页我的常用流程数据，用于设置页面显示和管理。2，在流程列表中标记已有的常用流程
    initOftenFlowManageData(state,data){
        let oftenFlowIds = [];
        let setFlowList = state.oftenFlowList;
        if(!data.init){
            setFlowList = state.copyOftenFlowList;
        }
        for(var i=0,f;f=setFlowList[i++];){
            oftenFlowIds.push(f.defKey);
        }
        for(var i=0,d;d=data.list[i++];){
            if(d.icon){
                d.icon = JSON.parse(d.icon);
                d.icon.color='color:'+d.icon.color;
            }
            for(var j=0,f;f=d.flowList[j++];){
                if(oftenFlowIds.indexOf(f.defKey) > -1){
                    f.isAdd = true;
                }
            }
        }
        if(data.init){
            state.copyOftenFlowList = JSON.parse(JSON.stringify(state.oftenFlowList));
        }
        state.hasAuthFlowList = data.list;
        state.completeInit = true;
    } ,
    //常用流程设置保存成功后。将首页的常用流程更新为和设置页面的常用流程一致
    updateOftenFlow(state){
        state.oftenFlowList = state.copyOftenFlowList;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
