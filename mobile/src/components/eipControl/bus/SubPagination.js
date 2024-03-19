import Vue from "vue";
import util from "@/hotent-ui-util.js";

const SubPagination = {
    // 全局对象，存放不同子表路径对应的数据
    _map: new Map(),
    set: (path, obj) => {
        SubPagination._map.set(path, obj);
        if (obj.rows) {
            // 分页信息变化时需要触发子表调用filter
            SubPagination._digest(obj.rows);
        }
    },
    // 销毁path对象的数据
    clear: (path) => {
        SubPagination._map.delete(path);
        SubPagination._map.delete(SubPagination._vueComponentKey(path));
    },
    // 消化子表数据变化，触发视图层渲染
    _digest: (rows) => {
        if (rows && rows.length > 0) {
            const firstItem = rows[0];
            Vue.set(rows, 0, firstItem);
        }
    },
    _vueComponentKey: (path) => {
        return `${path}:VueComponent`;
    },
    // 导入数据
    importData: (path, importRows, mode, mergeMethod) => {
        return new Promise((resolve, reject) => {
            if (SubPagination._map.has(path)) {
                const instKey = SubPagination._vueComponentKey(path);

                if (!SubPagination._map.has(instKey)) {
                    reject(`未找到${path}所对应的数据实例，无法导入数据。`);
                }

                const obj = SubPagination._map.get(path),
                    inst = SubPagination._map.get(instKey),
                    array = obj.rows;
                switch (mode) {
                    case "override":
                        // 覆盖
                        util.setValueByPath(inst, path, importRows);
                        break;
                    case "append":
                        // 追加
                        const newAry = array.concat(importRows);
                        util.setValueByPath(inst, path, newAry);
                        break;
                    case "merge":
                        if (!mergeMethod && mergeMethod.constructor != Function) {
                            reject(`合并导入必须提供合并导入的方法：${mergeMethod}`);
                        }
                        const newRows = mergeMethod(array, importRows);
                        util.setValueByPath(inst, path, newRows);
                        break;
                }
                obj.rows = util.getValueByPath(inst, path);
                SubPagination._digest(obj.rows);
                resolve();
            }
            else {
                reject(`未找到${path}所对应的子表数据`);
            }
        });
    },
    // 导出数据
    exportData: (path, type) => {
        return new Promise((resolve, reject) => {
            if (SubPagination._map.has(path)) {
                if (type == 'current') {
                    resolve(SubPagination.pagingByPath(path));
                }
                else if (type == 'all') {
                    const obj = SubPagination._map.get(path);
                    resolve(obj.rows);
                }
                else {
                    reject(`未知的导出类型：${type}`);
                }
            }
            else {
                reject(`未找到${path}所对应的子表数据`);
            }
        });
    },
    pagingByPath: (path, inst) => {
        const instKey = SubPagination._vueComponentKey(path);
        if (!SubPagination._map.has(instKey) && inst) {
            // 将子表数据所属的VueComponent对象实例存储（用于数据导入）
            SubPagination._map.set(instKey, inst);
        }

        // 如果有该子表路径的对象，则进行前端分页
        if (SubPagination._map.has(path)) {

            const obj = SubPagination._map.get(path),
                array = obj.rows,
                pageSize = obj.pageSize,
                offset = (obj.currentPage - 1) * pageSize;
            return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
        }
        else {
            // 没有子表路径的对象时，直接返回空集合
            return [];
        }
    }
};

export default SubPagination;