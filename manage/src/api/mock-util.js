const mockUtil = {
    // 通用分页查询方法
    query(data, param) {
        data = data || [];
        param = param || {};
        let tmpAry = [...data];
        if (param.querys) {
            const group = param.querys.groupByKey("group");
            // 每一个分组所对应的查询结果集(二维数组)
            let ary4group = [];

            Object.keys(group).forEach(g => {
                let tmp = [...data];
                const qs = group[g];
                // 同一组查询条件只取第一个条件中的relation作为当前组的组合关系
                const relation = qs[0]["relation"];

                // AND类型的组合，每一个查询条件在上一次过滤的结果集中再次过滤
                if (relation == 'AND') {
                    qs.forEach(q => {
                        tmp = this._query4operation(q, tmp);
                    });
                    ary4group.push(tmp);
                }
                // OR类型的组合，每一个查询条件得到单独的过滤结果集，最后将结果集合并去重
                else if (relation == 'OR') {
                    let ary4query = [];
                    qs.forEach(q => {
                        const r = this._query4operation(q, tmp);
                        // 合并
                        ary4query = ary4query.concat(r);
                    });
                    // 去重
                    ary4query.unique();
                    ary4group.push(ary4query);
                }
                else {
                    throw `当前传入的relation是${relation}，只能是'AND'或'OR'`;
                }
            });
            // 取多个分组的查询结果集的交集
            tmpAry = this._mixArray(ary4group);
        }
        // 排序（仅支持一个排序字段）
        if (param.sorter) {
            const sort = param.sorter[0];
            const directDic = ['ASC', 'DESC'];
            if (directDic.indexOf(sort.direction) == -1) {
                throw `不支持排序方向${sort.direction}，仅支持${directDic}`;
            }
            const isASC = sort.direction == 'ASC';
            tmpAry.sort((pre, after) => {
                return pre[sort.property] > after[sort.property] ? (isASC ? 1 : -1) : (isASC ? -1 : 1);
            });
        }
        // 分页
        if (param.pageBean) {
            const rows = tmpAry.slice((param.pageBean.page - 1) * param.pageBean.pageSize, param.pageBean.page * param.pageBean.pageSize);
            return { rows, page: param.pageBean.page, pageSize: param.pageBean.pageSize, total: tmpAry.length };
        }
        else {
            return { rows };
        }
    },
    // 根据不同的查询条件进行过滤
    _query4operation(query, ary) {
        const operation = query.operation;
        const permitOperations = ['equal', 'like', 'in'];
        if (permitOperations.indexOf(operation) == -1) {
            throw `查询条件不支持${operation}，仅支持${permitOperations}`;
        }
        let result = [];
        switch (operation) {
            case 'equal':
                result = ary.filter(m => query.value === m[query.property]);
                break;
            case 'like':
                result = ary.filter(m => m[query.property].indexOf(query.value) > -1);
                break;
            case 'in':
                result = ary.filter(m => query.value.indexOf(m[query.property]) > -1);
                break;
        }
        return result;
    },
    // 多个数组之间取交集
    _mixArray(ary4group) {
        ary4group = ary4group || [];
        let result = [];
        ary4group.forEach((ary, index) => {
            if (index == 0) {
                result = [...ary];
            }
            else {
                const set1 = new Set(result),
                    set2 = new Set(ary);
                result = [...new Set([...set1].filter(x => set2.has(x)))];
            }
        });
        return result;
    }
}

export default mockUtil;