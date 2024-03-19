import messageReceiver from "@/api/messageReceiver.js";

import { Message } from "element-ui";
import portal from "@/api/portal";
const state = {
    pagination: {},
    rows: [],
    total: 0,
    form:{},
    itemSavestate:{},
    msgbadge: 0
}
const getters = {}

const actions ={
    getlistJson({commit,state},pagination) {
        messageReceiver.getlistJson(pagination,response=>{
            commit("setTodoRows",response.data.rows);    //列表数据
            commit("setTotal",response.data.total);      //总数据条数
            let pageBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
            commit("setPagination",pageBean);  //显示第几页，每页显示多少条
        });
    },
     //更新每页下拉显示数据
     setPaginationSize({commit, state}, size){
        commit("setPaginationSize",size);
    },
    //更新第几页
    setPaginationPageNum({commit, state}, currentPage){
    commit("setPaginationPageNum",currentPage);
    },
    messageReceiverSave({commit,state},data){
        return new Promise((resolve, reject) => {
            messageReceiver.messageReceiverSave(data, response => {
                /*if(response.state){
                    Message.success(response.message);
                }else{
                    Message.error(response.message);
                }*/
                resolve();
            });
        });
    },
    detail({commit,state},id){
        return new Promise((resolve, reject) => {
        messageReceiver.detail(id,res=>{
            resolve(res);
        })
    });
    },
    remove({commit,state},ids){
        return new Promise((resolve, reject) => {
            messageReceiver.remove(ids, response => {
                if(response.state){
                    Message.success(response.message);
                }else{
                    Message.error(response.message);
                }
                resolve();
            });
        });
    },
    mark({commit,state},ids){
        return new Promise((resolve, reject) => {
            messageReceiver.mark(ids.join(","), response => {
                if(response.state){
                    commit("decrementMsgbadge", ids.length);
                    Message.success(response.message);
                }else{
                    Message.error(response.message);
                }
                resolve();
            });
        });
    },
    setMsgbadge({commit, state}){
        portal.getMsgbadge().then((resp) => {
            if (resp.data.state) {
                commit("setMsgbadge", resp.data.value);
            }
        });
    }
}

const mutations = {
    setPagination(state, pagination) {
        state.pagination = pagination
    },
    setTodoRows(state, rows) {
        state.rows = rows
    },
    setTotal(state, total){
        state.total = total
    },
    setPaginationSize(state, size){
        state.pagination.pageSize = size;
    },
    setPaginationPageNum(state,currentPage){
        state.pagination.page=currentPage;
    },
    getdetail(state, data){
        state.form = data;
    },
    setMsgbadge(state, value){
        state.msgbadge = value;
    },
    decrementMsgbadge(state, value){
        state.msgbadge -= value;
        if (state.msgbadge < 0){
            state.msgbadge = 0;
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
