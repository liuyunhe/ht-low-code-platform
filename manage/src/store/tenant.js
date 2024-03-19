const state = {
    tenantId: null
};

const getters = {

};

const actions = {
    actionTenantId({ commit, state }, tenantId) {
        commit("mutationTenantId", tenantId);
    },

};

const mutations = {
    mutationTenantId(state, tenantId) {
        state.tenantId = tenantId;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};