import dialog from "@/api/dialogApi.js";
import { Notify } from 'vant';

const state = {
    pagination: {},
    rows: [],
    total: 0,
    form:{},
    itemSavestate:{}
}
const getters = {}

const actions ={
    //更新对话框数据
    setDialogData({commit, state}, data){
        commit("setDialogData",data);
    },
    getlistJson({commit,state},pagination) {
        dialog.getlistJson(pagination,response=>{
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
    getTreeData({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            dialog.getTreeData(data, response => {
                resolve(response.data);
            });
        });
    }
}

const mutations = {
    setPagination(state, pagination) {
        state.pagination = pagination
    },
    setTodoRows(state, rows) {
        let newRows = [];
        for (let i = 0; i < rows.length; i++) {
            let data = rows[i];
            let keys = Object.keys(data);
            let objRows = {};
            keys.forEach(key => {
                objRows[key.toLowerCase()] = data[key];
            });
            newRows.push(objRows);
        }
        state.rows = newRows
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
    setDialogData(state, data){
        state.rows = data;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
