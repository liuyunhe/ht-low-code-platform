import deputy from "@/api/bpmDeputy.js";
const state = {
    myDeputy : {},
    pagination: {},
    rows: [],
    total: 0,
}
const getters = {}

const actions ={
	getByUserId({commit},data){
		return new Promise((resolve) => {
			deputy.getByUserId(data,res=>{
                commit('getMyDeputy',res);
                     if(res.agentId){
                        res.agentNames = [{'id':res.agentId,'fullname':res.agentName}];
                     }
					 resolve(res);
				})
			});
    },
    //编辑
    bpmDeputySave({commit,state},data) {
        return new Promise((resolve) => {
            deputy.bpmDeputySave(data, response => {
                resolve(response);
            });
        });
      },
    getBpmDeputyList({commit,state},pagination){
      deputy.getBpmDeputyList(pagination,response=>{
        commit("setTodoRows",response.data.rows);    //列表数据
        commit("setTotal",response.data.total);      //总数据条数
        let pageBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
        commit("setPagination",pageBean);  //显示第几页，每页显示多少条
      });
    },
    remove({commit,state},ids){
      return new Promise((resolve, reject) => {
        deputy.remove(ids, response => {
          if(response.state){
            Message.success(response.message);
          }else{
            Message.error(response.message);
          }
          resolve(response);
        });
      });
    },
}

const mutations = {
    getMyDeputy(state, data){
        state.myDeputy = data;
    },
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
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
