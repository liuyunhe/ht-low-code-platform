import flow from "@/api/flow.js";

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
        flow.relatedProcess(pagination,response=>{
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
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
