import req from "@/request.js";
const form = window.context.form;

/**
 * 获取表单列表
 * @param { Object } req
 * pageBean: { page: 1, pageSize: 10 } 分页参数
 * sorter: [] 排序参数
 * querys: {} 查询参数
 * alias: 别名
 */
export function getList(req) {
    let templateId
    let condition = {}
    return new Promise((resolve, reject) => {
        getBpmDataTemplateInfo({ alias: req.alias }).then((res) => {
            let data = res.data
            if (data.state) {
                templateId = data.value.id
                if (data.value.conditionField)
                    condition = JSON.parse(data.value.conditionField)

                resolve(
                    getBpmTemplateByPagination({
                        queryFilter: req,
                        templateId: templateId,
                        condition: condition,
                    })
                )
            } else {
                resolve(data)
            }
        })
    })
}



/**
 * 根据表单key获取业务数据模板相关信息
 * @param {alias,needDisplayFileds} data
 * alias:数据报表别名
 * needDisplayFileds:是否需要显示字段
 */
export function getBpmDataTemplateInfo(data) {
    let needDisplayFileds = data.needDisplayFileds ? true : false
    return req.get(
        form +
        '/form/dataTemplate/v1/getBpmDataTemplateInfo?alias=' +
        data.alias +
        '&needDisplayFileds=' +
        needDisplayFileds
    )
}

/**
 * 业务数据模板列表(分页条件查询)数据
 * 查询条件设置
 * name：字段名  == property
 * qt.toLocaleUpperCase()：条件 == operation
 * mg ？ AND ： OR == relation
 * -------转换-------
 * group: "main"
 * relation: "AND"
 * operation: "BETWEEN"
 * property: "create_time"
 * value
 * @param {*} data
 * @returns
 */
export function getBpmTemplateByPagination(data) {
    let querys_ = []
    if (data.queryFilter.querys) {
        let keys = Object.keys(data.queryFilter.querys)
        keys.forEach((key) => {
            let conditionItem = data.condition.find((item) => key == item.name)
            if (conditionItem) {
                querys_.push({
                    property: key,
                    value: data.queryFilter.querys[key],
                    group: 'main',
                    relation: 'AND',
                    operation: conditionItem.qt.toLocaleUpperCase(),
                })
            } else {
                querys_.push({
                    property: key,
                    value: data.queryFilter.querys[key],
                    group: 'main',
                    relation: 'AND',
                    operation: 'IN',
                })
            }
        })
    }
    data.queryFilter.querys = querys_
    /**自定义sql视图查询vo */
    const dataTemplateQueryVo = {
        /**业务对象主键 */
        templateId: data.templateId,
        /**通用查询对象 */
        queryFilter: data.queryFilter,
    }
    if (data.isJoinFlow && data.taskType && data.defKey) {
        dataTemplateQueryVo.isJoinFlow = data.isJoinFlow
        /**
         * 任务类型 todo代办 done已办 request我的请求 todoRead待阅 doneRead已阅 myRead我传阅的 myDelegate我转办的
         */
        dataTemplateQueryVo.taskType = data.taskType
        dataTemplateQueryVo.defKey = data.defKey //流程定义key
    }
    if (data.selectField) {
        /**关联查询字段名称 */
        dataTemplateQueryVo.selectField = data.selectField
        /**关联查询字段值 */
        dataTemplateQueryVo.selectValue = data.selectValue
    }
    if (data.selectList) {
        /**关联查询数组 */
        dataTemplateQueryVo.selectList = data.selectList
    }
    /**作为子表时外键的值 */
    dataTemplateQueryVo.refIdValue = data.refIdValue
    return req.post(
        form + '/form/dataTemplate/v1/listJson',
        dataTemplateQueryVo
    )
}

//获取业务数据模板表单数据
export function getTemplateForm(data) {
    return req.get(
        form +
        '/form/dataTemplate/v1/getForm/' +
        data.formKey +
        '/' +
        data.boAlias +
        '?id=' +
        data.id +
        '&action=' +
        data.action +
        '&recordId=' +
        data.recordId +
        '&dataKey=' +
        data.dataKey
    )
}

/**
 * 汉字转首字符拼音
 * @param params 要转换的汉字
 * @returns 
 */
export async function getPinyin(params) {
    let url = `${window.context.uc}/base/tools/v1/getPinyin?chinese=${params}&type=0`;
    return new Promise((resolve, reject) => {
        window.app.$http.get(url).then((resp) => {
            const { state, value } = resp.data
            if (state) {
                resolve(value)
            }
        })

    })
}
