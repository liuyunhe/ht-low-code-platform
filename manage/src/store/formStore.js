import Vue from "vue";
import form from "@/api/form.js";

const state = {
    // 自定义对话框数据
    customDialogData: {},
    // 关联查询数据
    customQueryData: {}
}
const getters = {
    hasCustomQueryDataWithAlias: (state) => (alias) => {
        return state.customQueryData.hasOwnProperty(alias);
    },
    hasCustomDialogDataWithAlias: (state) => (alias) => {
        return state.customDialogData.hasOwnProperty(alias);
    }
}

const actions = {
    getCustomQuery({ commit, state, getters }, alias) {
        if (getters.hasCustomQueryDataWithAlias(alias)) {
            return;
        }
        form.getByAliasCq(alias, res => {
            commit("addCustomQueryData", res);
        });
    },

    clearCustomQuery({commit, state, getters}, alias) {
        if (!getters.hasCustomQueryDataWithAlias(alias)) {
            return;
        }
        if (alias){
            commit("clearCustomQueryData", alias)
        }
    },

    
    getCustomDialog({ commit, state, getters }, alias) {
        if (getters.hasCustomDialogDataWithAlias(alias)) {
            return;
        }
        form.getDialogByAlias(alias, res => {
            commit("addCustomDialogData", res);
        });
    },
    

    clearCustomDialog({commit, state, getters}, alias) {
        if (!getters.hasCustomDialogDataWithAlias(alias)) {
            return;
        }
        if (alias){
            commit("clearCustomDialogData", alias)
        }
    }
}

const mutations = { 
    addCustomQueryData(state, data) {
        if (data && data.alias) {
            Vue.set(state.customQueryData, data.alias, data);
        }
    },
    clearCustomQueryData(state, alias){
        Vue.delete(state.customQueryData, alias);
    },
    addCustomDialogData(state, data) {
        if (data && data.alias) {
            Vue.set(state.customDialogData, data.alias, data);
        }
    },
    clearCustomDialogData(state, alias){
        Vue.delete(state.customDialogData, alias);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
