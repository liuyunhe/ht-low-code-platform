import portal from "@/api/portal.js"

const state = {
    all: [],            //菜单数据
    statement: [],      //报表中心菜单
    pagination: {},     //分页参数
    rows: [],           //新闻动态列表数据
    notice: [],         //发文公告列表数据
    total: 0,           //列表数据总条数
    filesData: {},      //新闻公告详情
    meeting: [],         //会议列表
    menuMaps: {},		//动态菜单数据
	currentMenu:{},     //当前一级菜单
}

const getters = {}

const actions = {
    downloadImg({ commit, state }, url) {
        return new Promise((resolve, reject) => {
            portal.downloadImg(url, response => {
                resolve(response);
            });
        });
    },
    // 查询静态资源目录
    getStaticMenus({ commit }) {
        portal.getMenus(menus => {
            commit('appendMenus', menus)
        })
    },
    // 查询流程中心下的资源目录
    getSyncMenus({ commit }) {
		portal.getSubMenus('front_menu', response => {
		    commit('setSyncMenus', response)
		});
    },
    //获取流程中心下的资源目录
    getDefaultMenus({commit}){
        return new Promise((resolve, reject) => {
            portal.getSubMenus('front_menu', response => {
                commit('setSyncMenus', response);
                resolve();
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
	getCurrentMenu({ commit },menu) {
	   commit('setCurrentMenu', menu);
	},
    // 追加一个目录到目录菜单中
    append2menus({ commit, state }, menu) {
        commit('appendMenus', [menu]);
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
        return portal.onlinePreview(id);
    },
    //附件下载
    downloadFile({ commit, state }, id) {
        portal.downloadFile(id, response => {
            document.location.href = response;
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
    myMobileHome({ commit, state }) {
        return new Promise((resolve, reject) => {
            portal.myMobileHome(response => {
                resolve(response);
            });
        });
    },
    //获取首页布局
    getColumnByAlias({ commit, state },alias) {
        return new Promise((resolve, reject) => {
            portal.getColumnByAlias(alias,response => {
                resolve(response);
            });
        });
    }
    ,
    //获取栏目数据
    getColumnData({ commit, state }, column) {
        return new Promise((resolve, reject) => {
            portal.getColumnData(column, response => {
                resolve(response);
            });
        });
    }
    ,
    //更新附件的扩展属性
    updateFileExtraProp({ commit, state }, column) {
        return new Promise((resolve, reject) => {
            portal.updateFileExtraProp(column, response => {
                resolve(response);
            });
        });
    }
}

const mutations = {
    appendMenus(state, menus) {
        menus.forEach(menu => {
            if (!state.all.some(m => m.alias === menu.alias)) {
				 state.all.push(menu);
            }
        });
        state.all.sort((m, n) => { return m.id - n.id });
    },
    setSyncMenus(state, response) {
        if (response && response.data && response.data.value && response.data.value.length>0) {
		   let menus = response.data.value;
           menus.forEach(menu => {
			   if (!state.all.some(m => m.code === menu.alias)) {
			       state.all.push({id: menu.id,code: menu.alias,alias: menu.alias, path:menu.menuUrl,name:menu.name});
				   state.menuMaps[menu.alias] = menu.children;
			   }
           });
        }
    },
	setCurrentMenu(state, response) {
	    state.currentMenu = response;
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
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}