'use strict'
import req from "@/request.js";
import { Message, Loading } from 'element-ui';

const form = window.context.form;
export default {
    getByAlias(alias, cb) {
        req.get(form + `/form/customDialog/v1/getByAlias?alias=` + alias).then(response => {
            cb(response.data);
        });
    },
    getByAliasCq(alias, cb) {
        req.post(form + `/form/customQuery/v1/getByAlias`, alias).then(response => {
            cb(response.data);
        });
    },
    selectQuery(customQuery, cb) {
        var queryUrl = customQuery.dsType == 'dataSource' ? '${form}/form/customQuery/v1/doQueryBase64?alias=' + customQuery.alias : customQuery.url;
        var requestType = customQuery.requestType ? customQuery.requestType : 'GET';
        var queryData = customQuery.queryData ? customQuery.queryData : "";
        queryData = Base64.encode(queryData);
        var currentPage = customQuery.currentPage ? customQuery.currentPage : 1;
        if (customQuery.dsType == "dataSource") {
            req.get(queryUrl + `&queryData=` + queryData + `&page=` + currentPage).then(response => {
                cb(response.data);
            });
        }
        if (requestType == "POST" && customQuery.dsType == "restful") {
            req.post(queryUrl, customQuery.pageBean).then(response => {
                cb(response.data);
            });
        }
        if (requestType == "GET" && customQuery.dsType == "restful") {
            req.get(queryUrl, customQuery.pageBean).then(response => {
                cb(response.data.row ? response.data : { "rows": response.data });
            });
        }
    },
    backendValidate(data, cb) {
        let loadingInstance = Loading.service({ fullscreen: true }); //开始
        let params = {};
        if (data.submitFormData == "true") {
            let formElementAry = document.getElementsByName("online-form");
            if (formElementAry && formElementAry.length == 1) {
                let frmInst = formElementAry[0].__vue__;
                params = frmInst.data;
            }
        }
        req.post(data.url + data.param, params).then(response => {
            cb(response.data);
            loadingInstance.close();
        }).catch(function (error) {
            loadingInstance.close();
        });;
    },
    //获取业务数据模板信息
    //获取业务数据模板信息
    getBpmDataTemplateInfo(data, cb) {
        let needDisplayFileds = data.needDisplayFileds ? true : false;
        req
            .get(
                form +
                "/form/dataTemplate/v1/getBpmDataTemplateInfo?alias=" +
                data.templateKey +
                "&needDisplayFileds=" +
                needDisplayFileds
            )
            .then(response => {
                cb(response);
            });
    },
    //获取业务数据模板信息
    boSave(data, cb) {
        req.post(form + '/form/dataTemplate/v1/boSave/' + data.boAlias + `?delDraftId=${data.delDraftId || ''}`, data.boData).then(response => {
            cb(response);
        });
    },
    //获取业务数据模板表单数据
    getTemplateForm(data, cb) {
        req.get(form + '/form/dataTemplate/v1/getForm/' + data.formKey + '/' + data.boAlias + '?id=' + data.id + '&action=' + data.action + "&recordId=" + data.recordId + "&dataKey=" + data.dataKey).then(response => {
            cb(response);
        });
    },
    //获取业务数据模板列表模板html
    getTemplateDataListForm(data, cb) {
        req.post(form + '/form/dataTemplate/v1/dataList_' + data, {}).then(response => {
            cb(response);
        });
    },

    //获取业务数据列表
    getBpmTemplateByPagination(data, cb) {
        const dataTemplateQueryVo = {
            templateId: data.templateId,
            queryFilter: data.pagination
        };
        if (data.isJoinFlow) {
            dataTemplateQueryVo.isJoinFlow = data.isJoinFlow;
            dataTemplateQueryVo.taskType = data.taskType;
            dataTemplateQueryVo.defKey = data.defKey;
        }
        if (data.selectField) {
            dataTemplateQueryVo.selectField = data.selectField;
            dataTemplateQueryVo.selectValue = data.selectValue;
        }
        req
            .post(form + "/form/dataTemplate/v1/listJson", dataTemplateQueryVo)
            .then(response => {
                cb(response);
            });
    },

    //删除业务数据模板bo数据
    deleteTemplateDataById(data, cb) {
        req.remove(form + "/form/dataTemplate/v1/boDel/" + data.boAlias + "?ids=" + data.ids).then(response => {
            cb(response);
        });
    },
    //业务数据模板导出
    templateExport(data, cb) {
        req.post(form + "/form/dataTemplate/v1/export?formKey=" + data.boAlias + '&getType=' + data.getType + '&filterKey=' + data.filterKey + '&expField=' + data.expField, data.query, 'blob').then(response => {
            // 这里会弹出一个下载框，增强用户体验
            var blob = new Blob([response.data], { type: "application/vnd.ms-excel" });
            var objectUrl = URL.createObjectURL(blob);//  创建a标签模拟下载
            var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href", objectUrl);
            $("body").append(aForExcel);
            $(".forExcel").click();
            aForExcel.remove();
            cb(response);
        });
    },
    getCustomChart(data, cb) {
        req.get(form + `/form/customChart/v1/get/` + data).then(response => {
            cb(response.data);
        });
    },
    getCustomChartById(id) {
        return new Promise((resolve, reject) => {
            req.get(form + "/form/customChart/v1/get/" + id).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    getListData(alias, params) {
        return new Promise((resolve, reject) => {
            req.post(form + "/form/customChart/v1/getListData?alias=" + alias, params).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    getChartData(data, cb) {
        req.post(form + `/form/customChart/v1/getListData?alias=` + data.id, data.filter).then(response => {
            cb(response.data);
        });
    },
    //获取业务数据模板子表信息
    getSubEntsByFormKey(data, cb) {
        req.get(form + "/form/form/v1/getSubEntsByFormKey?formKey=" + data).then(response => {
            cb(response);
        });
    },

    //获取业务数据模板子表数据
    getSubData(data, cb) {
        req.get(form + "/form/dataTemplate/v1/getSubData?alias=" + data.name + '&refId=' + data.refId).then(response => {
            cb(response);
        });
    },

    //获取自定义sql视图数据
    getQuerySqlView(data, cb) {
        req.get(form + "/form/query/queryView/getJson?sqlAlias=" + data.sqlAlias + '&alias=' + data.alias).then(response => {
            cb(response);
        });
    },

    //获取自定义sql查询视图数据列表
    getQuerySqlViewByPagination(data, cb) {
        req.post(form + "/form/query/queryView/data_" + data.sqlAlias + "/" + data.alias, data.pagination).then(response => {
            cb(response);
        });
    },

    //自定义sql查询视图数据导出
    querySqlViewExport(data, cb) {
        req.post(form + "/form/query/queryView/export?sqlAlias=" + data.sqlAlias + '&alias=' + data.alias + '&getType=' + data.getType + '&expField=' + data.expField, data.query, 'blob').then(response => {
            // 这里会弹出一个下载框，增强用户体验
            var blob = new Blob([response.data], { type: "application/vnd.ms-excel" });
            var objectUrl = URL.createObjectURL(blob);//  创建a标签模拟下载
            var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href", objectUrl);
            $("body").append(aForExcel);
            $(".forExcel").click();
            aForExcel.remove();
            cb(response);
        });
    },
    // 通过别名获取对话框
    getDialogByAlias(alias, cb) {
        req.get(form + `/form/customDialog/v1/getByAlias?alias=${alias}`).then(response => {
            cb(response.data);
        });
    },
    //2022-07-05:yigz 获取提醒信息
    getFormRemindDataByUser(cb) {
        req.get(form + `/form/formRemindData/v1/getFormRemindDataByUser`).then(response => {
            cb(response.data);
        });
    },
    //2022-07-06：yigz 删除提醒信息
    deleteFormRemindDataById(id, cb) {
        req.remove(form + `/form/formRemindData/v1/` + id).then(response => {
            cb(response.data);
        });
    },

}
