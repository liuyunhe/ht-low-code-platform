import Vue from "vue";
import Vuex from "vuex";
import styleSetting from "@/store/styleSetting.js";
import login from "@/store/login.js";
import user from "@/store/user.js";
import menu from "@/store/menu.js";
import flow from "@/store/flow.js";
import tenant from "@/store/tenant.js";
import form from '@/store/formStore.js';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    styleSetting,
    login,
    user,
    menu,
    flow,
    tenant,
    form
  },
  strict: debug
});

