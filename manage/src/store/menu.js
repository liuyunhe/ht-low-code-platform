import menu from "@/api/menu.js";
import portal from "@/api/portal.js";

const state = {
  menus: [],
};

const getters = {
  menus: function(state) {
    return state.menus;
  }
};

const actions = {
  actionMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      if(state.menus && state.menus.length>=1 ){
        resolve();
        return;
      }
      portal.getMenus().then(data => {
        sessionStorage.setItem("currentMenus", JSON.stringify(data));
        commit("mutationMenus", data);
        resolve(data);
      });
    });
  },
  actionMenusEmpty({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit("mutationMenus", []);
    });
  },
  //附件在线预览
  onlinePreview({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      portal.onlinePreview(id, response => {
        resolve(response.data);
      });
    });
  },
  //附件下载
  downloadFile({ commit, state }, id) {
    portal.downloadFile(id);
  },
  //获取用户头像
  downloadImg({ commit, state }, fileId) {
    return new Promise((resolve, reject) => {
      portal.downloadImg(fileId, response => {
        resolve(response);
      });
    });
  },
};

const mutations = {
  mutationMenus(state, menus) {
    state.menus = menus;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
