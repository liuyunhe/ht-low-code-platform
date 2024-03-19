import agent from "@/api/agent.js";
import { Message } from "element-ui";
const state = {
    pagination: {},
    rows: [],
    total: 0,
    form:{},
    itemSavestate:{}
}
const getters = {}

const actions ={
    getlistJson({commit,state},pagination) {
        agent.getlistJson(pagination,response=>{
            commit("setTodoRows",response.data.rows);    //列表数据
            commit("setTotal",response.data.total);      //总数据条数
            let pageBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
            commit("setPagination",pageBean);  //显示第几页，每页显示多少条
        });
    },
    getSecretarylist({commit,state},pagination) {
        agent.getSecretarylist(pagination,response=>{
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
    //编辑
    approvalItemSave({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            agent.approvalItemSave(data, response => {
                resolve(response);
            });
        });
      },
    detail({commit,state},id){
			return new Promise((resolve, reject) => {
        agent.detail(id,res=>{
           commit('getdetail',res);
					 resolve(res);
        })
				});
    },
    remove({commit,state},ids){
        return new Promise((resolve, reject) => {
            agent.remove(ids, response => {
                if(response.state){
                    Message.success(response.message);
                }else{
                    Message.error(response.message);
                }
                resolve(response);
            });
        });
    },
    getDeflistJson({commit,state},pagination) {
        agent.getDeflistJson(pagination,response=>{
            commit("setTodoRows",response.data.rows);    //列表数据
            commit("setTotal",response.data.total);      //总数据条数
            let pageBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
            commit("setPagination",pageBean);  //显示第几页，每页显示多少条
        });
    }
    ,
    secretaryDetail({commit,state},ids){
        return new Promise((resolve, reject) => {
            agent.secretaryDetail(ids, response => {
                resolve(response.data);
            });
        });
    },
    secretarySave({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            agent.secretarySave(data, response => {
                resolve(response);
            });
        });
    }
    ,
    secretaryRemove({commit,state},ids){
        return new Promise((resolve, reject) => {
            agent.secretaryRemove(ids, response => {
                if(response.state){
                    Message.success(response.message);
                }else{
                    Message.error(response.message);
                }
                resolve(response);
            });
        });
    },
    getTypeByGroupKey({commit,state},ids){
        return new Promise((resolve, reject) => {
            agent.getTypeByGroupKey(ids, response => {
                resolve(response.data);
            });
        });
    },
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
        state.form.authNames =[{"id":data.agentId,"fullname":data.agent}];
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
