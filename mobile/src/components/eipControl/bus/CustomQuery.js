import store from "@/store.js";
import utils from "@/hotent-ui-util.js";
import req from "@/request.js";
import { Message } from "element-ui";

const CustomQuery = {
    /**
     * 通过别名获取关联查询定义
     */
    get: (alias) => {
        return new Promise((resolve, reject) => {
            if (!alias) {
                reject("alias can not be null.");
            }
            let _query = null;
            // 通过vuex加载关联查询对象
            const unwatchMethod = store.watch(
                (state) => state.form.customQueryData,
                (val) => {
                    if (val) {
                        _query = val[alias];
                    }
                    if (_query) {
                        setTimeout(() => {
                            // 获取到指定别名的关联查询后即移除watch
                            unwatchMethod && unwatchMethod();
                        }, 10);
                        resolve(_query);
                    }
                },
                { deep: true, immediate: true }
            );
            setTimeout(() => {
                // vuex缓存的数据中没找到关联查询时，查询后台
                !_query && store.dispatch("form/getCustomQuery", alias);
                // 15秒后未找到关联查询时，移除watch并显示错误信息。
                setTimeout(() => {
                    if (!_query) {
                        unwatchMethod();
                        reject();
                        CustomQuery._throwException(`未找到别名为${alias}的关联查询`);
                    }
                }, 15000);
            }, 10);
        });
    },
    /**
    * 通过别名获取对话框
    */
    getDialog: (alias) => {
        return new Promise((resolve, reject) => {
            if (!alias) {
                reject("alias can not be null.");
            }
            let _query = null;
            // 通过vuex加载关联查询对象
            const unwatchMethod = store.watch(
                (state) => state.form.customDialogData,
                (val) => {
                    if (val) {
                        _query = val[alias];
                    }
                    if (_query) {
                        setTimeout(() => {
                            // 获取到指定别名的关联查询后即移除watch
                            unwatchMethod && unwatchMethod();
                        }, 10);
                        resolve(_query);
                    }
                },
                { deep: true, immediate: true }
            );
            setTimeout(() => {
                // vuex缓存的数据中没找到关联查询时，查询后台
                !_query && store.dispatch("form/getCustomDialog", alias);
                // 15秒后未找到关联查询时，移除watch并显示错误信息。
                setTimeout(() => {
                    if (!_query) {
                        unwatchMethod();
                        reject();
                        CustomQuery._throwException(`未找到别名为${alias}的关联查询`);
                    }
                }, 15000);
            }, 10);
        });
    },
    /**
     * 传入关联查询别名和查询参数，返回查询到的数据
     */
    load: (alias, params) => {
        return new Promise((resolve, reject) => {
            CustomQuery.get(alias).then((query) => {
                // 执行关联查询
                CustomQuery._doQuery(query, params, '1', (data) => {
                    resolve(data);
                });
            }, () => {
                reject();
            });
        });
    },

    /**
     * 传入对话框别名和查询参数，返回查询到的数据
     */
    loadDialog: (alias, params) => {
        return new Promise((resolve, reject) => {
            CustomQuery.getDialog(alias).then((query) => {
                // 执行关联查询
                CustomQuery._doQuery(query, params, '2', (data) => {
                    resolve(data);
                });
            }, () => {
                reject();
            });
        });
    },
    _throwException: (msg) => {
        Message.error(msg);
        throw msg;
    },
    // 处理POST请求时的参数
    _handlePostData: (query, queryParams) => {
        if (!query.dataParam || query.dataParam.constructor != String) {
            return queryParams;
        }
        // 构建上下文数据对象
        let ctx = {};
        queryParams &&
            queryParams.forEach(element => {
                ctx[element.key] = element.value;
            });
        const exp = utils.parseExp(query.dataParam, ctx);
        try {
            return JSON.parse(exp);
        } catch (e) {
            CustomQuery._throwException(`POST参数不是有效的JSON格式${query.dataParam}`);
        }
    },
    // 处理GET请求的URL（GET请求的查询参数追加到URL后面）
    _handleGetUrl: (url, queryParams) => {
        if (!url) {
            CustomQuery._throwException('Restful类型的url地址为空');
        }
        let urlParamsAry = [];
        queryParams &&
            queryParams.forEach(q => {
                urlParamsAry.push(`${q.key}=${q.value}`);
            });
        const linkWord = url.indexOf("?") == -1 ? "?" : "&";
        return `${url}${linkWord}${urlParamsAry.join("&")}`;
    },
    _doQuery: (query, params, type, cb) => {
        params = params || {};
        // 复制一份关联查询对象
        query = { ...query };
        // 关联数据始终查询第一页
        const page = 1;
        // 关联数据查询参数
        let queryParams = [];

        if (query.conditionfield) {
            try {
                const conditionFields = JSON.parse(query.conditionfield);
                // 构建查询参数
                if (conditionFields && conditionFields.constructor == Array && conditionFields.length > 0) {
                    conditionFields.forEach(c => {
                        // 默认按照固定值构建查询参数
                        let obj = {
                            key: c.field,
                            value: c.defaultValue
                        };
                        // 参数传入时获取传入的params中的同名参数值
                        if (c.defaultType == "1") {
                            if (params.hasOwnProperty(c.field)) {
                                obj.value = params[c.field];
                            }
                        }
                        queryParams.push(obj);
                    });
                }
            }
            catch (e) {
                CustomQuery._throwException(`条件字段的JSON格式错误：${e}`);
            }
        }
        if (query.dsType != "dataSource") {
            // POST请求，则处理queryParams参数
            if (query.requestType == "POST") {
                queryParams = CustomQuery._handlePostData(query, queryParams);
            }
            // GET请求，则处理url地址
            else if (query.requestType == "GET") {
                query.url = CustomQuery._handleGetUrl(query.url, queryParams);
            }
        }
        // 构建查询地址
        let queryUrl =
            query.dsType == "dataSource"
                ? "${form}/form/customQuery/v1/doQuery?alias=" +
                query.alias +
                "&page=" +
                page
                : query.url;

        // 处理url地址中的${服务名}
        queryUrl = utils.parseUrl(queryUrl);

        let requestMethod = "POST";
        //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
        if (query.dsType != "dataSource") {
            requestMethod = query.requestType;
        }
        //查询数据
        let response = req
            .request({
                url: queryUrl,
                method: requestMethod,
                data: queryParams,
                headers: query.header
            }).then((response) => {
                //自定义对话框因为要显示分页信息，并且显示字段的key是小写，故此处直接返回，由自定义对话框组件本身处理数据
                if (type == '2') {
                    const data = CustomQuery._handleDialogResponse(
                        response.data,
                        query
                    );
                    cb(data);
                } else {
                    //如果数据来源是数据源
                    if (query.dsType == "dataSource") {
                        cb(response.data.rows);
                    } else {
                        // 如果数据来源是REST接口
                        const data = CustomQuery._handleResponse(
                            response.data,
                            query.listKey
                        );
                        cb(data);
                    }
                }

            }, (reason) => {
                cb([]);
                CustomQuery._throwException(reason);
            });
    },
    _handleDialogResponse: (data, query) => {
        if (!data) {
            Message.error("返回的数据为空");
            return [];
        }
        if (data.constructor == String) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                CustomQuery._throwException(`将返回值解析为JSON对象时出错了：${e}`);
            }
        }
        let result = { rows: [] };
        if (data.constructor == Object) {
            if (query.dsType == "dataSource") {
                if (data && data.rows) {
                    result.rows = data.rows;
                    //如果有分页
                    if (data.page) {
                        result.pageResult = {
                            page: data.page,
                            pageSize: data.pageSize,
                            total: data.total
                        };
                    }
                }
            } else {
                // 如果没有指定提取key，则将返回值包装为列表
                if (!query.listKey) {
                    result.rows = [data];
                } else {
                    try {
                        result.rows = utils.getValueByPath(data, query.listKey) || [];
                        //如果有分页
                        if (query.pageKey && data[query.pageKey]) {
                            result.pageResult = {
                                page: data[query.pageKey],
                                pageSize: data[query.pageSizeKey],
                                total: data[query.totalKey]
                            };
                        }
                    } catch (e) {
                        CustomQuery._throwException(`从返回的数据中提取数组时出错了：${e}`);
                    }
                }
            }

        } else if (data.constructor == Array) {
            // 已经是数组类型时，不再通过rowsKey提取
            result.rows = data;
        } else {
            CustomQuery._throwException(`返回的数据无法解析:${data}`);
        }
        result.rows = CustomQuery._listKeyToLower(result.rows);
        return result;
    },
    _handleResponse: (data, rowsKey) => {
        if (!data) {
            Message.error("返回的数据为空");
            return [];
        }
        if (data.constructor == String) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                CustomQuery._throwException(`将返回值解析为JSON对象时出错了：${e}`);
            }
        }

        if (data.constructor == Object) {
            // 如果没有指定提取key，则将返回值包装为列表
            if (!rowsKey) {
                return [data];
            }
            try {
                return utils.getValueByPath(data, rowsKey);
            } catch (e) {
                CustomQuery._throwException(`从返回的数据中提取数组时出错了：${e}`);
            }
        } else if (data.constructor == Array) {
            // 已经是数组类型时，不再通过rowsKey提取
            return data;
        } else {
            CustomQuery._throwException(`返回的数据无法解析:${data}`);
        }
    },
    _listKeyToLower: (list) => {
        let newRows = [];
        //不知道为什么724的某个版本自定义对话框的显示字段key后台被转小写了，所以此处把返回值也转小写
        for (let i = 0; i < list.length; i++) {
            let data = list[i];
            let keys = Object.keys(data);
            let objRows = {};
            keys.forEach(key => {
                objRows[key.toLowerCase()] = data[key];
            });
            newRows.push(objRows);
        }
        return newRows;
    }
}

export default CustomQuery;
