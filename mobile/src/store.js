import Vue from "vue";
import Vuex from "vuex";
import login from "@/store/login.js";
import storeProcess from "@/store/storeProcess.js";
import user from '@/store/user.js';
import oftenFlow from '@/store/oftenFlow.js';
import form from '@/store/formStore.js';
import relatedProcess from '@/store/relatedProcess.js';
import dialog from '@/store/dialogStore.js';
import index from '@/store/index.js'
import menu from '@/store/menu.js';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    login,
    storeProcess,
    user,
    oftenFlow,
    form,
    relatedProcess,
    dialog,
    index,
    menu
  },
  strict: debug
});
