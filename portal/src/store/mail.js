import mail from "@/api/mail.js";
import { Message } from 'element-ui';

let Base64 = require('js-base64').Base64;

const state = {
    mailPagination: {},
    mailRows: [],
    mailTotal: 0,
    tree:[],
    mailData:{},
    mailSettingDefault:{},
    userRows:[],

    mailLinkmanPagination:{},
    mailLinkmanRows: [],
    mailLinkmanTotal: 0,
    mailLinkmanData:{},
    mailLinkman:{},

    mailSettingPagination:{},
    mailSettingRows: [],
    mailSettingTotal: 0,
    mailSettingData:{}
}
const getters = {}

const actions ={
    //邮件页面
    getMailTreeList({commit,state}) {
        return new Promise((resolve, reject) => {
            mail.getMailTreeList(response=>{
                resolve(response.data);
                commit("setMailTrees",response.data);

            });
        });
    },
    getMailByPagination({commit,state},pagination) {
        return new Promise((resolve, reject) => {
            mail.getMialByPagination(pagination, response =>{
                commit("setMailRows",response.data.rows);    //列表数据
                commit("setMailTotal",response.data.total);      //总数据条数
                let pageaBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
                commit("setMailPagination",pageaBean);  //显示第几页，每页显示多少条
                resolve(response.data.rows);
            });
        });
    },
    setMailPaginationSize({commit, state}, size){
        commit("setMailPaginationSize",size);
    },
    setMailPaginationPageNum({commit, state}, currentPage){
        commit("setMailPaginationPageNum",currentPage);
    },
    deleteMaliById({commit, state},data){
        return new Promise((resolve, reject) => {
            mail.deleteMaliById(data, response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    deleteMaliOnes({commit, state},data){
        return new Promise((resolve, reject) => {
            mail.deleteMaliOnes(data, response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    getSysncById({commit, state},id){
        return new Promise((resolve, reject) => {
            mail.getSysncById(id, response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    getMailById({commit,state},id) {
        return new Promise((resolve, reject) => {
            mail.getMailById(id,  response =>{
                commit("setMailForms",response.data);    //列表数据
                resolve(response.data);
            });
        });
    },
    saveMail({commit,state},data) {
        return new Promise((resolve, reject) => {
            mail.saveMail(data,  response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    // Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    getUserlistByPagination({commit,state},query) {
        mail.getUserlistByPagination(query, response =>{
            commit("setUserRows",response.data);    //列表数据
        });
    },
    setMailByisRead({commit,state},id) {
        return new Promise((resolve, reject) => {
            mail.setMailByisRead(id,  response =>{
                resolve();
            });
        });
    },


    //邮箱联系人页面
    getMailLinkmanByPagination({commit,state},pagination) {
        return new Promise((resolve, reject) => {
            mail.getMailLinkmanByPagination(pagination, response =>{
                commit("setMailLinkmanRows",response.data.rows);    //列表数据
                commit("setMailLinkmanTotal",response.data.total);      //总数据条数
                let pageaBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
                commit("setMailLinkmanPagination",pageaBean);  //显示第几页，每页显示多少条
                resolve(response.data.rows);
            });
        });
    },
    setMailLinkmanPaginationSize({commit, state}, size){
        commit("setMailLinkmanPaginationSize",size);
    },
    setMailLinkmanPaginationPageNum({commit, state}, currentPage){
        commit("setMailLinkmanPaginationPageNum",currentPage);
    },
    getMailLinkmanById({commit,state},id) {
        mail.getMailLinkmanById(id,  response =>{
            commit("setMailLinkmanForms",response.data);
        });
    },
    getMailLinkmanByMail({commit, state}, id) {
        mail.getMailLinkmanByMail(id,response =>{
            commit("setMailLinkman",response.data);
        });
    },
    deleteMaliLinkmanById({commit, state},data){
        return new Promise((resolve, reject) => {
            mail.deleteMaliLinkmanById(data, response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    saveMailLinkman({commit,state},data) {
        return new Promise((resolve, reject) => {
            mail.saveMailLinkman(data,  response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    //


    //邮箱配置页面
    getMailSettingByPagination({commit,state},pagination) {
        return new Promise((resolve, reject) => {
            mail.getMailSettingByPagination(pagination, response =>{
                commit("setMailSettingRows",response.data.rows);    //列表数据
                commit("setMailSettingTotal",response.data.total);      //总数据条数
                let pageaBean= {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":true};
                commit("setMailSettingPagination",pageaBean);  //显示第几页，每页显示多少条
                resolve(response.data.rows);
            });
        });
    },
    setMailSettingPaginationSize({commit, state}, size){
        commit("setMailSettingPaginationSize",size);
    },
    setMailSettingPaginationPageNum({commit, state}, currentPage){
        commit("setMailSettingPaginationPageNum",currentPage);
    },
    getMailSettingById({commit,state},id) {
        return new Promise((resolve, reject) => {
            mail.getMailSettingById(id,  response =>{
                commit("setMailSettingForms",response.data);    //列表数据
                resolve(response.data);
            });
        });
    },
    setIsOriginPwd({commit,state},isOriginPwd) {
        commit("setIsOriginPwd",isOriginPwd);
    },
    deleteMaliSettingById({commit, state},data){
        return new Promise((resolve, reject) => {
            mail.deleteMaliSettingById(data, response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });

    },
    saveMailSetting({commit,state},data) {
        return new Promise((resolve, reject) => {
            mail.saveMailSetting(data,  response =>{
                if(response.data.state){
                    Message.success("保存成功");
                    resolve();
                }else{
                    Message.error("保存失败");
                    reject();
                }
            });
        });
    },
    testMailConnect({commit,state},data) {
        return new Promise((resolve, reject) => {
            mail.testMailConnect(data,  response =>{
                if(response.data.state){
                    Message.success("连接成功");
                    resolve();
                }else{
                    reject();
                }
            });
        });
    },
    testMailConnectById({commit,state},id) {
        return new Promise((resolve, reject) => {
            mail.testMailConnectById(id,  response =>{
                if(response.data.state){
                    Message.success("连接成功");
                    resolve();
                }else{
                    reject();
                }
            });
        });
    },
    setMailSettingDefaultById({commit,state},id) {
        return new Promise((resolve, reject) => {
            mail.setMailSettingDefaultById(id,  response =>{
                if(response.data.state){
                    Message.success(response.data.message);
                    resolve();
                }else{
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    }
}



const mutations = {
    //邮件页面
    setMailPagination(state, pagination) {
        state.mailPagination = pagination
    },
    setMailPaginationSize(state, size){
        state.mailPagination.pageSize = size;
    },
    setMailPaginationPageNum(state,currentPage){
        state.mailPagination.page=currentPage;
    },
    setMailRows(state, rows) {
        state.mailRows = rows
    },
    setMailTotal(state, total){
        state.mailTotal = total
    },
    setMailTrees(state,tree){
        state.tree=tree;
        for( let i of tree){
            if(i.isDefault==1){
                state.mailSettingDefault=i;
            }
        }
    },
    setMailForms(state, data) {
        data.content=Base64.decode(data.content);
        state.mailData = data
    },
    setUserRows(state, rows) {
        state.userRows = rows
    },


    //邮箱联系人页面
    setMailLinkmanPagination(state, pagination) {
        state.mailLinkmanPagination = pagination
    },
    setMailLinkmanPaginationSize(state, size){
        state.mailLinkmanPagination.pageSize = size;
    },
    setMailLinkmanPaginationPageNum(state,currentPage){
        state.mailLinkmanPagination.page=currentPage;
    },
    setMailLinkmanRows(state, rows) {
        state.mailLinkmanRows = rows
    },
    setMailLinkmanTotal(state, total){
        state.mailLinkmanTotal = total
    },
    setMailLinkmanForms(state, form) {
        state.mailLinkmanData = form
    },
    setMailLinkman(state,mailLinkman) {
        state.mailLinkman=mailLinkman
    },

    //邮箱配置页面
    setMailSettingPagination(state, pagination) {
        state.mailSettingPagination = pagination
    },
    setMailSettingPaginationSize(state, size){
        state.mailSettingPagination.pageSize = size;
    },
    setMailSettingPaginationPageNum(state,currentPage){
        state.mailSettingPagination.page=currentPage;
    },
    setMailSettingRows(state, rows) {
        state.mailSettingRows = rows
    },
    setMailSettingTotal(state, total){
        state.mailSettingTotal = total
    },
    setMailSettingForms(state, form) {
        state.mailSettingData = form;
        state.mailSettingData.isOriginPwd=false;
    },
    setIsOriginPwd(state,isOriginPwd){
        state.mailSettingData.isOriginPwd=isOriginPwd;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
