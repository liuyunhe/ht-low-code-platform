import uc from "@/api/uc.js";
import { use } from "chai";

const state = {
    currentUser: null,
    loginAccount: null,
    isRefreshToken: false
}

const getters = {}

const actions = {
    actionLoginAccount({ commit, state }, loginAccount) {
        commit("mutationLoginAccount", loginAccount)
    },
    loginByPrincipal({ commit, state }, principal) {
        return new Promise((resolve, reject) => {
            uc.authentication(principal, user => {
                if (user) {
                    sessionStorage.setItem("currentUser", JSON.stringify(user))
                    commit("setCurrentUser", user)
                    resolve(user.loginStatus)
                }
            }, (msg) => {
                commit("clearCurrentUser")
                reject(msg)
            })
        })
    },
    loginByQRCode({ commit, state }, qrCode) {
        return new Promise((resolve, reject) => {
            uc.authenticationByQRCode(
                qrCode,
                user => {
                    if (user.state) {
                        sessionStorage.setItem('currentUser', JSON.stringify(user.value))
                        commit('setCurrentUser', user.value)
                        commit('mutationLoginAccount', user.value.account)    
                    }
                    resolve(user)
                },
                msg => {
                    reject(msg)
                }
            )
        })
    },
    validAndCompletedCurrent({ commit, state }, token) {
        return new Promise((resolve, reject) => {
            if (state.currentUser && !token) {
                resolve();
            }
            else {
                const user = sessionStorage.getItem("currentUser")
                if (user != "null" && user != undefined && user != "" && !token) {
                    commit("setCurrentUser", JSON.parse(user))
                    resolve()
                }
                else if (token) {
                    uc.basicSso(token, user => {
                        sessionStorage.setItem("currentUser", JSON.stringify(user));
                        commit("setCurrentUser", user);
                        resolve();
                    }, () => {
                        reject();
                    });
                }
                else {
                    reject()
                }
            }
        })
    },
    refreshAndGetAuthenticationToken({ commit, state }) {
        if (state.isRefreshToken) {
            return;
        }
        commit("isRefreshToken", true);
        return new Promise((resolve, reject) => {
            uc.refreshAndGetAuthenticationToken().then(user => {
                if (user) {
                    sessionStorage.setItem("currentUser", JSON.stringify(state.currentUser));
                    commit("refreshToken", user.token)
                    setTimeout(() => {
                        commit("isRefreshToken", false);
                    }, 3000)
                    resolve()
                }
            }, (msg) => {
                reject(msg)
            })
        })
    },
    logoutAndCleanUp({ commit, state }) {
        return new Promise((resolve, reject) => {
            uc.logout().finally(() => {
                sessionStorage.removeItem("currentUser")
                commit("clearCurrentUser");
                commit("user/setCurrentUserDetail", null, { root: true });
                commit("user/setCurrentUserOrg", null, { root: true });
                resolve();
            });
        })
    }
}

const mutations = {
    isRefreshToken(state, status) {
        state.isRefreshToken = status;
    },
    refreshToken(state, token) {
        state.currentUser.token = token;
        state.currentUser.loginTime = new Date().getTime();
    },
    setCurrentUser(state, current) {
        state.currentUser = current
    },
    clearCurrentUser(state) {
        state.currentUser = null
    },
    mutationLoginAccount(state, loginAccount) {
        state.loginAccount = loginAccount;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
