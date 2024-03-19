import uc from "@/api/uc.js";
import store from '@/store/login';

const state = {
    currentUserDetail: null,
    platformVersion: null,
    pwdStrategy:{}, //默认密码策略
}

const getters = {}

const actions = {
    // 加载当前用户详情
    loadCurrentUserDetail({ commit, state }) {
        if (!state.currentUserDetail) {
            const currentUser = store.state.currentUser;
            if (currentUser && currentUser.account) {
                return new Promise((resolve, reject) => {
                    uc.getUserByAccount(currentUser.account, resp => {
                        resolve(resp);
                        commit('setCurrentUserDetail', resp);
                    });
                });
            }
        }
        // lyzcw：2022-07-18 以下请求导致登录页面未登录重定向，暂屏蔽
        // if(!state.platformVersion){
        //     uc.getPlatformVersion().then(rep => {
        //         if(rep && rep.data && rep.data.state){
        //             commit('setPlatformVersion', rep.data.value);
        //         }
        //     });
        // }
    },
    //获取默认密码策略
    getDefPwdStrategy({ commit, state }) {
        return new Promise((resolve, reject) => {
            uc.getDefPwdStrategy(response => {
                commit("setPwdStrategy", response);
                resolve(response);
            });
        });
    },
}

const mutations = {
    setCurrentUserDetail(state, data) {
        if (data && data.role && data.role.roleName) {
            data.role = data.role.roleName.split("|");
        }
        state.currentUserDetail = data;
    },
    setPwdStrategy(state, pwdStrategy) {
        state.pwdStrategy = pwdStrategy;
    },
    setPlatformVersion(state, version){
        state.platformVersion = version;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
