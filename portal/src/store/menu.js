import portal from "@/api/portal.js";
import process from "@/api/process.js";
const state = {
    all: [],            //菜单数据
    residual: false,    //手动修改了菜单的标记
    statement: [],      //报表中心菜单
    pagination: {},     //分页参数
    rows: [],           //新闻动态列表数据
    notice: [],         //发文公告列表数据
    total: 0,           //列表数据总条数
    filesData: {},      //新闻公告详情
    meeting: [],         //会议列表
    menuMaps: {},		//动态菜单数据
    currentMenu: {},     //当前一级菜单
    columnAliasAry: [],  //当前要请求栏目数据的别名数组
    columnQueryMerging: null, //获取栏目数据的请求合并标记变量
    columnData: {},       //各栏目的数据
    columnDataLoadedAliases: null,//待加载的所有栏目的别名，使用，号分割
    columnInfo:{restore:false}, //columnInfo跳转后的信息
}

const getters = {
    getColumnDataWithAlias: (state) => (alias) => {
        return state.columnData[alias];
    },
    hasColumnDataWithAlias: (state) => (alias) => {
        return state.columnData.hasOwnProperty(alias);
    }
}

const actions = {
    // 查询静态资源目录
    getStaticMenus({ commit }) {
        portal.getMenus(menus => {
            commit('appendMenus', menus)
        })
    },
    // 查询流程中心下的资源目录
    getSyncMenus({ commit }, isLeader) {
        portal.getSubMenus('front_menu', response => {
            process.getSecretaryByUserId(res => {
                let isLeader = false;
                if (res && res.length == 0) {//没有领导
                    isLeader = true;
                }
                response.isLeader = isLeader;
                commit('setSyncMenus', response)
            })
        });
    },
    //获取流程中心下的资源目录
    getDefaultMenus({ commit }) {
        return new Promise((resolve, reject) => {
            portal.getSubMenus('front_menu', response => {
                process.getSecretaryByUserId(res => {
                    let isLeader = false;
                    if (res && res.length == 0) {//没有领导
                        isLeader = true;
                    }
                    response.isLeader = isLeader;
                    commit('setSyncMenus', response)
                    resolve();
                })
            });
        })
    },
    // 当前用户接口权限
    getCurrentUserMethodAuth({ commit }) {
        portal.getCurrentUserMethodAuth(response => {
            window.sessionStorage.allMethod = response.data.allMethod;
            window.sessionStorage.methodAuth = response.data.curUserMethod;
        });
    },
     // 当前菜单
    getAllmenus({ commit }, menu) {
        return new Promise((resolve, reject) => {
            resolve(state.all);
         });
    },
    // 当前菜单
    getCurrentMenu({ commit }, menu) {
        commit('setCurrentMenu', menu);
    },
    // 追加一个目录到目录菜单中
    append2menus({ commit, state }, menu) {
        commit('appendMenus', [menu]);
    },
    // 临时设置一个修改过的目录菜单
    setTemplateMenus({ commit }, menu) {
        commit('setMenus', menu);
        commit('setResidual', true);
        setTimeout(() => {
            // 0.5秒后重置手动修改目录数据的标记
            commit('setResidual', false);
        }, 500);
    },
    // 临时设置一个修改过的目录菜单
    setCopyMenus({ commit }, menu) {
        commit('setMenus', menu);
    },
    //更新每页下拉显示数据
    setPaginationSize({ commit, state }, size) {
        commit("setPaginationSize", size);
    },
    //更新第几页
    setPaginationPageNum({ commit, state }, currentPage) {
        commit("setPaginationPageNum", currentPage);
    },
    //获取新闻动态列表
    getNewsPagination({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            portal.getNewsPagination(pagination, response => {
                commit("setRows", response.data.rows);//新闻动态数据
                commit("setTotal", response.data.total);//总数据条数
                let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
                commit("setPagination", pageBean);//显示第几页，每页显示多少条
                resolve();
            });
        });
    },
    //根据分类获取轮播图
    getNewsPagination({ commit, state }, type) {
        return new Promise((resolve, reject) => {
            portal.getNewsPagination(type, response => {
                resolve(response.data);
            });
        });
    },
    getNewsPaginationList({commit,state},pagination){
        return new Promise((resolve,reject)=>{
            portal.getNewsPaginationList(pagination,response=>{
                commit("setRows",response.data.rows);
                commit("setTotal",response.data.total);
                let pageBean = {"page":response.data.page,"pageSize":response.data.pageSize,"showTotal":"true"};
                commit("setPagination",pageBean);
                resolve();
            })
        })
    },
    //获取发文公告列表
    getNoticePagination({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            portal.getNoticePagination(pagination, response => {
                commit("setNotice", response.data.rows);//发文告数据
                commit("setTotal", response.data.total);//总数据条数
                let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
                commit("setPagination", pageBean);//显示第几页，每页显示多少条
                resolve();
            });
        });
    },
    //根据ID获取新闻公告详情
    getNewsById({ commit, state }, pagination) {
        portal.getNewsById(pagination, response => {
            if (response.data.ffj) {
                let files = JSON.parse(response.data.ffj);
                response.data.ffj = files;
            }
            commit("setFilesData", response.data);//发文告数据
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

    downloadImg({ commit, state }, url) {
        return new Promise((resolve, reject) => {
            portal.downloadImg(url, response => {
                resolve(response);
            });
        });
    },

    //获取要参加的会议列表
    getMeetingPagination({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            portal.getMeetingPagination(pagination, response => {
                commit("setMeeting", response.data.rows);//会议数据
                commit("setTotal", response.data.total);//总数据条数
                let pageBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": "true" };//接口方法返回的pageBean
                commit("setPagination", pageBean);//显示第几页，每页显示多少条
                resolve();
            });
        });
    },
    //获取数据字典
    getByTypeKeyForComBo({ commit, state }, dicKey) {
        return new Promise((resolve, reject) => {
            portal.getByTypeKeyForComBo(dicKey, response => {
                resolve(response);
            });
        });
    },
    //获取下一个流水号
    getNextIdByAlias({ commit, state }, alias) {
        return new Promise((resolve, reject) => {
            portal.getNextIdByAlias(alias, response => {
                resolve(response);
            });
        });
    },
    //获取首页布局
    vueFrontHome({ commit, state }) {
        return new Promise((resolve, reject) => {
            portal.vueFrontHome(response => {
                resolve(response);
            });
        });
    },
    //获取首页布局
    getColumnByAlias({ commit, state }, alias) {
        return new Promise((resolve, reject) => {
            portal.getColumnByAlias(alias, response => {
                resolve(response);
                commit("updateColumnData", response);
            });
        });
    },
    // 批量获取首页布局（请求参数还是逐个栏目，但是一定时间间隔的请求会合并为一次）
    getColumnByAliasBatch({ commit, state, getters }, alias) {
        // 1.如果当前栏目数据中已经有对应的值了，直接返回。
        if (getters.hasColumnDataWithAlias(alias)) {
            return;
        }
        // 2.是否正在进行请求合并；
        if (state.columnQueryMerging) {
            // (1).取消当前倒计时；
            clearTimeout(state.columnQueryMerging);
            // (2).重置当前倒计时取消标记位；
            commit("setColumnQueryMerging", null);
        }
        // 3.构建一个请求倒计时（默认两个请求相差50毫秒内会合并为一个请求）；
        const timeoutCancel = setTimeout(function () {
            // 4.倒计时结束，真正发送请求；
            portal.batchGetColumnByAliases(state.columnAliasAry.join(","), response => {
                // 5.更新栏目数据到vuex的state中。
                commit("setColumnData", response);
            });
            // 清空栏目请求查询别名数组
            commit("clearColumnAliasAry");
            // 重置倒计时取消标记位
            commit("setColumnQueryMerging", null);
        }, 50);
        // 添加栏目请求查询别名到数组
        commit("addColumnAlias", alias);
        // 更新倒计时取消标记位
        commit("setColumnQueryMerging", timeoutCancel);
    }
    ,
    //获取栏目数据
    getColumnData({ commit, state }, column) {
        return new Promise((resolve, reject) => {
            portal.getColumnData(column, response => {
                resolve(response);
            });
        });
    },
    //ccwgq 2022-09-23 还原首页栏目设计下的tab标签页,对应激活
    setColumnInfo({commit,state},info){
        commit('setColumnInfo',info)
    }
    ,
    //更新附件的扩展属性
    updateFileExtraProp({ commit, state }, column) {
        return new Promise((resolve, reject) => {
            portal.updateFileExtraProp(column, response => {
                resolve(response);
            });
        });
    },
}

const mutations = {
    setMenus(state, menus) {
        state.all = menus;
    },
    setResidual(state, val) {
        state.residual = val;
    },
    appendMenus(state, menus) {
        menus.forEach(menu => {
            if (!state.all.some(m => m.alias === menu.alias)) {
                state.all.push(menu);
            }
        });
        state.all.sort((m, n) => { return m.id - n.id });
    },
    setSyncMenus(state, response) {
        if (response && response.data && response.data.value && response.data.value.length > 0) {
            let menus = response.data.value;
            menus.forEach(menu => {
                if (!state.all.some(m => m.code === menu.alias)) {
                    state.all.push({ id: menu.id, code: menu.alias, alias: menu.alias, path: menu.menuUrl, name: menu.name ,sn:menu.sn});
                    //判断是否是流程中心
                    if (menu.alias == "v-flow") {
                        if (response.isLeader) {//没有领导
                            for (let i = 0; i < menu.children.length; i++) {
                                if (menu.children[i].alias == "v-leader") {
                                    menu.children.splice(i, 1);
                                    break;
                                }
                            }
                            state.menuMaps[menu.alias] = menu.children;
                        } else if (!response.isLeader) {//有领导
                            state.menuMaps[menu.alias] = menu.children;
                        }
                    } else {
                        state.menuMaps[menu.alias] = menu.children;
                    }
                }
                // }
            });
        }
    },
    setCurrentMenu(state, response) {
        state.currentMenu = response;
    },
    getAllmenus(state, response){
        return  state.all;
    },
    setPagination(state, pagination) {
        state.pagination = pagination;
    },
    setPaginationSize(state, size) {
        state.pagination.pageSize = size;
    },
    setPaginationPageNum(state, currentPage) {
        state.pagination.page = currentPage;
    },
    setRows(state, rows) {
        state.rows = rows;
    },
    setNotice(state, notice) {
        state.notice = notice;
    },
    setTotal(state, total) {
        state.total = total;
    },
    setFilesData(state, filesData) {
        state.filesData = filesData;
    },
    setMeeting(state, meeting) {
        state.meeting = meeting;
    },
    addColumnAlias(state, alias) {
        state.columnAliasAry.push(alias);
    },
    clearColumnAliasAry(state) {
        state.columnAliasAry = [];
    },
    setColumnQueryMerging(state, val) {
        state.columnQueryMerging = val;
    },
    setColumnData(state, data) {
        let _colData =state.columnData || {}, aliasAry =state.columnDataLoadedAliases?state.columnDataLoadedAliases.split(','): [];
        if (data && data.length > 0) {
            data.forEach(d => {
                aliasAry.push(d.alias);
                _colData[d.alias] = d;
            });
        }
        state.columnData = _colData;
        state.columnDataLoadedAliases = aliasAry.join(",");
    },
    updateColumnData(state, data) {
        if (data && data.alias) {
            state.columnData[data.alias] = data;
        }
    },
    setColumnInfo(state,data){
        if(data && data.alias){
            state.columnInfo.alias=data.alias;
        }
        if(data && data.activeTab){
            state.columnInfo.activeTab=data.activeTab;
        }
        else{
            if('restore' in data){
                state.columnInfo.restore=data.restore
            }
            else{
                state.columnInfo.restore=false
            }
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
