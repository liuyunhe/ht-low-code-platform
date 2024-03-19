import Vue from "vue";
import form from "@/api/form.js";
import { Message } from "element-ui";

const state = {
    form: {},
    isBackendValidate: true,
    bpmTemplatePagination: {},
    bpmTemplateRows: [],
    bpmTemplateTotal: 0,
    bpmTemplateData: {},
    bpmTemplateSubData: { dialogSubVisible: false, tabs: [], ents: [], refId: "" },
    querySqlViewPagination: {},
    querySqlViewRows: [],
    querySqlViewTotal: 0,
    querySqlViewData: {},
    // 自定义对话框数据
    customDialogData: {},
    // 关联查询数据
    customQueryData: {}
}
const getters = {
    hasCustomQueryDataWithAlias: (state) => (alias) => {
        return state.customQueryData.hasOwnProperty(alias);
    },
    hasCustomDialogDataWithAlias: (state) => (alias) => {
        return state.customDialogData.hasOwnProperty(alias);
    }
}

const actions = {
    actionsBpmTemplateSubData({ commit, state }, obj) {
        commit("setBpmTemplateSubData", obj);
    },
    getFormRemindDataByUser({ commit, state }) {
        return new Promise((resolve, reject) => {
            form.getFormRemindDataByUser( res => {
                resolve(res);
            });
        });
    },
    deleteFormRemindDataById({ commit, state }, id) {
        return new Promise((resolve, reject) => {
            form.deleteFormRemindDataById(id, res => {
                resolve(res);
            });
        });
    },
    getByAlias({ commit, state }, alias) {
        return new Promise((resolve, reject) => {
            form.getByAlias(alias, res => {
                resolve(res);
            });
        });
    },
    getCustomQuery({ commit, state, getters }, alias) {
        if (getters.hasCustomQueryDataWithAlias(alias)) {
            return;
        }
        form.getByAliasCq(alias, res => {
            commit("addCustomQueryData", res);
        });
    },
    getByAliasCq({ commit, state }, alias) {
        return new Promise((resolve, reject) => {
            form.getByAliasCq(alias, res => {
                resolve(res);
            });
        });
    },
    selectQuery({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.selectQuery(data, res => {
                resolve(res);
            });
        });
    },
    //获取业务数据模板相关信息
    getBpmDataTemplateInfo({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            form.getBpmDataTemplateInfo(pagination, response => {
                resolve(response.data);
            });
        });
    },
    //保存表单bo数据
    boSave({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            form.boSave(pagination, response => {
                resolve(response.data);
            });
        });
    },
    //保存表单bo草稿数据
    boSaveDraft({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.boSaveDraft(data, response => {
                resolve(response.data);
            });
        });
    },
    //获取业务数据模板表单数据
    getTemplateForm({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            form.getTemplateForm(pagination, response => {
                resolve(response.data);
            });
        });
    },
    //获取业务数据模板表单草稿数据
    getTempDraftData({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getTempDraftData(data, response => {
                resolve(response.data);
            });
        });
    },
    //获取业务数据模板列表模板html
    getTemplateDataListForm({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            form.getTemplateDataListForm(pagination, response => {
                resolve(response.data);
            });
        });
    },
    //删除业务数据模板bo数据
    deleteTemplateDataById({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.deleteTemplateDataById(data, response => {
                if (response.data.state) {
                    Message.success(response.data.message);
                    resolve();
                } else {
                    Message.error(response.data.message);
                    reject();
                }
            });
        });
    },
    //业务数据模板导出
    templateExport({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.templateExport(data, response => {
                resolve(response.data);
            });
        });
    },
    downloadMainTempFile({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.downloadMainTempFile(data, response => {
                resolve(response.data);
            });
        });
    },

    //获取业务数据模板子表信息
    getSubEntsByFormKey({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getSubEntsByFormKey(data, response => {
                resolve(response.data);
            });
        });
    },

    //获取业务数据模板子表数据
    getSubData({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getSubData(data, response => {
                resolve(response.data);
            });
        });
    },

    getSubDataPagination({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getSubDataPagination(data, response => {
                resolve(response.data);
            })
        })
    },

    //获取自定义sql视图数据
    getQuerySqlView({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getQuerySqlView(data, response => {
                resolve(response.data);
            });
        });
    },

    //自定义sql视图数据导出
    querySqlViewExport({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.querySqlViewExport(data, response => {
                resolve(response.data);
            });
        });
    },

    //业务数据模板预览页面
    getBpmTemplateByPagination({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getBpmTemplateByPagination(data, response => {
                // commit("setBpmTemplateRows", response.data.rows);    //列表数据
                // commit("setBpmTemplateTotal", response.data.total);      //总数据条数
                // let pageaBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": true };
                // commit("setBpmTemplatePagination", pageaBean);  //显示第几页，每页显示多少条
                resolve(response);
            });
        });
    },
    setBpmTemplatePaginationSize({ commit, state }, size) {
        commit("setBpmTemplatePaginationSize", size);
    },
    setBpmTemplatePaginationPageNum({ commit, state }, currentPage) {
        commit("setBpmTemplatePaginationPageNum", currentPage);
    },

    //自定义sql查询视图页面
    getQuerySqlViewByPagination({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getQuerySqlViewByPagination(data, response => {
                commit("setQuerySqlViewRows", response.data.rows);    //列表数据
                commit("setQuerySqlViewTotal", response.data.total);      //总数据条数
                let pageaBean = { "page": response.data.page, "pageSize": response.data.pageSize, "showTotal": true };
                commit("setQuerySqlViewPagination", pageaBean);  //显示第几页，每页显示多少条
                resolve(response.data.rows);
            });
        });
    },
    setQuerySqlViewPaginationSize({ commit, state }, size) {
        commit("setQuerySqlViewPaginationSize", size);
    },
    setQuerySqlViewPaginationPageNum({ commit, state }, currentPage) {
        commit("setQuerySqlViewPaginationPageNum", currentPage);
    },

    getCustomChart({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getCustomChart(data, res => {
                resolve(res);
            });
        });
    }
    ,
    getChartData({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getChartData(data, res => {
                resolve(res);
            });
        });
    },
    //批量更新
    batchUpdateTemplateData({ commit, state }, pagination) {
        return new Promise((resolve, reject) => {
            form.batchUpdateTemplateData(pagination, response => {
                resolve(response.data);
            });
        });
    },
    getCustomDialog({ commit, state, getters }, alias) {
        if (getters.hasCustomDialogDataWithAlias(alias)) {
            return;
        }
        form.getDialogByAlias(alias, res => {
            commit("addCustomDialogData", res);
        });
    }
}

const mutations = {
    //业务数据模板预览页面
    setBpmTemplatePagination(state, pagination) {
        state.bpmTemplatePagination = pagination
    },
    setBpmTemplatePaginationSize(state, size) {
        state.bpmTemplatePagination.pageSize = size;
    },
    setBpmTemplatePaginationPageNum(state, currentPage) {
        state.bpmTemplatePagination.page = currentPage;
    },
    setBpmTemplateRows(state, rows) {
        state.bpmTemplateRows = rows
    },
    setBpmTemplateTotal(state, total) {
        state.bpmTemplateTotal = total
    },
    //自定义sql查询视图页面
    setQuerySqlViewPagination(state, pagination) {
        state.querySqlViewPagination = pagination
    },
    setQuerySqlViewPaginationSize(state, size) {
        state.querySqlViewPagination.pageSize = size;
    },
    setQuerySqlViewPaginationPageNum(state, currentPage) {
        state.querySqlViewPagination.page = currentPage;
    },
    setQuerySqlViewRows(state, rows) {
        state.querySqlViewRows = rows
    },
    setQuerySqlViewTotal(state, total) {
        state.querySqlViewTotal = total
    },
    getCustomChart({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getCustomChart(data, res => {
                resolve(res);
            });
        });
    },
    getChartData({ commit, state }, data) {
        return new Promise((resolve, reject) => {
            form.getChartData(data, res => {
                resolve(res);
            });
        });
    },
    setBpmTemplateSubData(state, data) {
        state.bpmTemplateSubData = data;
    },
    addCustomQueryData(state, data) {
        if (data && data.alias) {
            Vue.set(state.customQueryData, data.alias, data);
        }
    },
    addCustomDialogData(state, data) {
        if (data && data.alias) {
            Vue.set(state.customDialogData, data.alias, data);
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
