import Vue from "vue";
import Vuex from "vuex";
//引入vuex持久化插件
// import createPersistedState from 'vuex-persistedstate';
import login from "@/store/login.js";
import menu from "@/store/menu.js";
import storeProcess from "@/store/storeProcess.js";
import user from '@/store/user.js';
import oftenFlow from '@/store/oftenFlow.js';
import mail from '@/store/mail.js';
import approvalItem from '@/store/approvalItemList.js';
import messageReceiver from '@/store/messageReceiverList.js';
import agent from '@/store/agentList.js';
import deputy from '@/store/bpmDeputy.js';
import form from '@/store/formStore.js';
import relatedProcess from '@/store/relatedProcess.js';
import dialog from '@/store/dialogStore.js';
import index from '@/store/index.js'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    login,
    menu,
    storeProcess,
    user,
    oftenFlow,
    mail,
    approvalItem,
    messageReceiver,
    agent,
    deputy,
    form,
    relatedProcess,
    dialog,
    index
  },
  strict: debug,
  //TODO:未来根据需要可以考虑使用持久化插件  yarn add vuex-persistedstate -S
  // plugins:[createPersistedState({
  //   paths:['menu'],
  //   storage:sessionStorage
  // })]
});
