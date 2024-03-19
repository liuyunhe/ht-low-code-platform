import uc from "@/api/uc.js";
import store from '@/store/login';
import utils from "@/utils.js";

const state = {
    currentUserDetail: null,
    currentOrgDetail: null,
    dimensions: null,
    currentDimension: null,
    orgs: null,
    users: [],//列表数据
    orgData: null,
    pagination: {}, //分页参数
    total: 0, //列表数据总条数
    postData:null,
    roleData:null,
    jobData:null,
    postCharge:{},
    postMap:{},
    demData:null,
    orgTotal:0,
    postTotal:0,
    roleTotal:0,
    jobTotal:0,
    demTotal:0,
    pwdStrategy: {}, //默认密码策略
}

const getters = {}

const actions = {
    // 加载当前用户详情
    loadCurrentUserDetail({ commit, state }) {
        // if (Object.keys(state.currentUserDetail).length == 0) {
        if (!state.currentUserDetail) {
            const currentUser = store.state.currentUser;
            if(currentUser && currentUser.account){
                return new Promise((resolve, reject) => {
                    uc.getUserByAccount(currentUser.account, resp => {
                        resolve(resp);
                        commit('setCurrentUserDetail', resp);
                        commit('setPostCharge', resp.post);
                        commit("setCurrentUserOrg", resp.org);
                    });
                });
            }
        }
    },
    //修改密码
    modifyPwd({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            uc.modifyPwd(data, resp => {
                resolve(resp);
            })
        })
    },
    // 获取用户信息
    getCurrent({ commit, state }) {
            return new Promise((resolve, reject) => {
                uc.getCurrent(rep => {
                    resolve(rep.data);
                });
            });
    },
    // 加载组织维度
    loadDimension({ commit, state }) {
        uc.getAllDimension(rep => {
            commit("setDimensions", rep)
        });
    },
    // 通过维度获取组织
    loadOrgsByDimension({ commit, state }, dimensionId) {
        commit("setCurrentDimension", dimensionId);
        commit("clearOrgs");
        uc.getOrgsByDemension(dimensionId, rep => {
            let result = utils.tile2nest(rep);
            commit("setOrgs", result);
        });
    },
    // 通过父组织ID查询组织
    loadOrgsByParentId({commit, state}, parentId){
        return new Promise((resolve, reject) => {
            uc.getOrgsByParentIdAndDemension(parentId, state.currentDimension, rep => {
                resolve(rep);
            }, err => {
                reject(err);
            });
        });
    },
    // 更新每页下拉显示数据
    setPaginationSize({ commit, state }, size) {
        commit("setPaginationSize", size);
    },
    // 更新第几页
    setPaginationPageNum({ commit, state }, currentPage) {
        commit("setPaginationPageNum", currentPage);
    },
    // 通过组织ID获取用户
    loadUsersByOrgId({ commit, state }, pagination) {
        uc.getUsersByOrgId(pagination, response => {
            commit("setUsers", response.data.rows);//用户数据
            commit("setTotal", response.data.total);//总数据条数
            let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    // 查询组织
    queryOrg({ commit, state }, pagination) {
        uc.queryOrgByFilter(pagination, rep => {
            commit("setOrgData", rep.data);
            commit("setOrgTotal", rep.data.total);//总数据条数
            let pageBean = { "page": rep.data.page, "pageSize": rep.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    // 查询岗位
    queryPost({ commit, state },pagination) {
        uc.getOrgPostPage(pagination, rep => {
            commit("setPostData", rep.data);
            commit("setPostTotal", rep.data.total);//总数据条数
            let pageBean = { "page": rep.data.page, "pageSize": rep.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    // 查询角色
    queryRole({ commit, state },pagination) {
        uc.getRolePage(pagination, rep => {
            commit("setRoleData", rep.data);
            commit("setRoleTotal", rep.data.total);//总数据条数
            let pageBean = { "page": rep.data.page, "pageSize": rep.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    // 查询职务
    queryJob({ commit, state },pagination) {
        uc.getJobPage(pagination, rep => {
            commit("setJobData", rep.data);
            commit("setJobTotal", rep.data.total);//总数据条数
            let pageBean = { "page": rep.data.page, "pageSize": rep.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    setpostMap({commit, state}, data){
        commit("setpostMap", data);

    },
    // 查询维度列表
    getDemPage({ commit, state },pageBean) {
        uc.getDemPage(pageBean, rep => {
            commit("setDemData", rep.data);
            commit("setDemTotal", rep.data.total);//总数据条数
            let pageBean = { "page": rep.data.page, "pageSize": rep.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
            commit("setPagination", pageBean);//显示第几页，每页显示多少条
        });
    },
    setcurrentOrg({commit, state}, data){
        commit("setcurrentOrg", data);
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
    setcurrentOrg(state, data){
        state.currentOrgDetail =data;
    },
    setpostMap(state, data){
        sessionStorage.setItem(state.currentUserDetail.user.id+"-CurPostId",data.postCharge.postId);
        state.postMap = data.postMap;
        state.postCharge  = {post:{id:data.postCharge.postId,name:data.postCharge.postName},org:{id:data.postCharge.orgId,name:data.postCharge.orgName}};
    },
    setCurrentUserDetail(state, data) {
        if (data && data.role && data.role.roleName) {
            data.role = data.role.roleName.split("|");
        }
        state.currentUserDetail = data;
    },//获取当前主岗位 没有则取第一个岗位
    setPostCharge(state, data) {
        if(data && JSON.stringify(data)!="{}"){
            let setMasterPostId = sessionStorage.getItem(state.currentUserDetail.user.id+"-CurPostId");
            for (let item in data) {
                if (setMasterPostId) {
                    if (item == setMasterPostId) {
                        state.postCharge = {post:{id:data[item].postId,name:data[item].postName,code:data[item].postCode},org:{id:data[item].orgId,name:data[item].orgName,code:data[item].orgCode}};
                        data[item].disabled =true;
                        break;
                    }
                } else {
                    for (let org in state.currentUserDetail.org) {
                        if(data[item].orgName ==state.currentUserDetail.org[org].orgName && data[item].isMaster=="1"){
                            state.postCharge = {post:{id:data[item].postId,name:data[item].postName,code:data[item].postCode},org:{id:data[item].orgId,name:data[item].orgName,code:data[item].orgCode}};
                            data[item].disabled =true;
                        }else{
                            data[item].disabled =false;
                        }
                    }
                }

            }
            //如果没有主岗位取第一个
            if(!state.postCharge.post){
                for (let item in data) {
                    state.postCharge = {post:{id:data[item].postId,name:data[item].postName,code:data[item].postCode},org:{id:data[item].orgId,name:data[item].orgName,code:data[item].orgCode}};
                    data[item].disabled =true;
                    break;
                }
            }

            state.postMap = data;
        }else{
            state.postCharge = {};
        }

    },
    //获取当前主部门 没有则取第一个部门
    setCurrentUserOrg(state, data) {
        if(data){
            for (let item in data) {
                if(data[item].isMaster =="1"){
                    state.currentOrgDetail = {id:data[item].orgId,name:data[item].orgName,code:data[item].orgCode};
                    break;
                }
            }
            //如果没有主岗位取第一个
            if(!state.postCharge.id){
                for (let item in data) {
                    state.currentOrgDetail = {id:data[item].orgId,name:data[item].orgName,code:data[item].orgCode};
                    break;
                }
            }
        }

    },
    setDimensions(state, data) {
        state.dimensions = data;
    },
    setCurrentDimension(state, dimensionId) {
        state.currentDimension = dimensionId;
    },
    setOrgs(state, data) {
        state.orgs = data;
    },
    clearOrgs(state) {
        state.orgs = null;
    },
    setUsers(state, users) {
        state.users = users;
    },
    setOrgData(state, data) {
        state.orgData = data.rows;
    },
    setPostData(state, data) {
        state.postData = data.rows;
    },
    setRoleData(state, data) {
        state.roleData = data.rows;
    },
    setJobData(state, data) {
        state.jobData = data.rows;
    },
    setDemData(state, data) {
        state.demData = data.rows;
    },
    setPagination(state, pagination) {
        state.pagination = pagination;
    },
    setOrgPagination(state, pagination) {
        state.orgpagination = pagination;
    },
    setPaginationSize(state, size) {
        state.pagination.pageSize = size;
    },
    setPaginationPageNum(state, currentPage) {
        state.pagination.page = currentPage;
    },
    setTotal(state, total) {
        state.total = total;
    },
    setOrgTotal(state, total) {
        state.orgTotal = total;
    },
    setPostTotal(state, total) {
        state.postTotal = total;
    },
    setRoleTotal(state, total) {
        state.roleTotal = total;
    },
    setJobTotal(state, total) {
        state.jobTotal = total;
    },
    setDemTotal(state, total) {
        state.demTotal = total;
    },
    setPwdStrategy(state, pwdStrategy) {
        state.pwdStrategy = pwdStrategy;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
