const state = {
    validate:[],
}
const getters = {}

const actions ={
    linkageValidate({commit, state}, data){
        setTimeout(() => {
            commit("linkageValidate",data);
        }, 100)
   
    },
    delValidate({commit, state},data){
        commit("delValidate",data);
        },
}

const mutations = {
    linkageValidate(state,data) {
        if(!data.validate && data.required){
            data.validate={"required":data.required};
        }
      state.validate.push(data);
    },
    delValidate(state,data){
        if(data){
            state.validate.remove(data);
        }else{
            state.validate.length = 0;
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
