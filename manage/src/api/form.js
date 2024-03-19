import req from '@/request.js'
import {reject} from 'core-js/fn/promise'
const form = window.context.form
const portal = window.context.portal
export default {
  //刷新外部表元数据
  reloadByEntId(id, alias) {
    return new Promise((resolve, reject) => {
      req.get(form + `/bo/def/v1/reload?id=${id}&alias=${alias}`).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  saveTemplateData(data) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/dataTemplate/v1/save`, data).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  // 通过别名获取关联查询
  getByAliasCq(alias, cb) {
    req.post(form + `/form/customQuery/v1/getByAlias`, alias).then(response => {
      cb(response.data)
    })
  },
  //获取数据视图变量
  getDataTemplateVarList(id) {
    return new Promise((resolve, reject) => {
      req.get(form + `/form/dataTemplate/v1/getVarList`).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getPageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/form/v1/list', param).then(
        response => {
          resolve(response.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //数据建模分类树数据
  getBusinessObjTree(param, cb) {
    req
      .get(portal + `/sys/sysType/v1/getTypesByKey?typeKey=${param}`)
      .then(response => {
        cb(response)
      })
  },
  //获取数据建模数据
  getBusinessObjData(param) {
    return new Promise((resovle, rejct) => {
      req.post(form + '/bo/def/v1/list', param).then(
        resp => {
          resovle(resp.data)
        },
        error => {
          rejct(error)
        }
      )
    })
  },
  //获取数据视图
  getDataformation(param, cb) {
    req.get(form + `/bo/def/v1/getBoJson?alias=${param}`).then(resp => {
      cb(resp)
    })
  },
  //修改数据建模状态
  updateBusinessObjStatus(id, status) {
    return new Promise((resolve, rejct) => {
      req.get(form + `/bo/def/v1/setStatus?id=${id}&status=${status}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          rejct(error)
        }
      )
    })
  },
  //删除建模数据
  removeBusinessObj(id) {
    return new Promise((resolve, rejct) => {
      req.remove(form + `/bo/def/v1/removes?ids=${id}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          rejct(error)
        }
      )
    })
  },
  //获取分类
  getCategory(type, cb) {
    req
      .get(portal + `/sys/sysType/v1/getByGroupKey?groupKey=${type}`)
      .then(resp => {
        cb(resp)
      })
  },
  //修改分类
  updateCategory(ids, categoryId, categoryName) {
    return new Promise((resolve, reject) => {
      req
        .get(
          form +
            `/bo/def/v1/updateCategory?ids=${ids}&categoryId=${categoryId}&categoryName=${categoryName}`
        )
        .then(
          resp => {
            resolve(resp)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  //获取表单
  getEntData(id, cb) {
    req.get(form + `/bo/def/v1/getJson?id=${id}`).then(resp => {
      cb(resp)
    })
  },
  //保存实体
  saveEntData(json) {
    return new Promise((resolve, reject) => {
      req.post(form + `/bo/def/v1/createTableForm`, json).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //逻辑删除字段
  removeAttr(attr, alias) {
    return new Promise((resolve, reject) => {
      req.post(form + `/bo/def/v1/removeAttr?alias=` + alias, attr).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //还原删除字段
  recovery(attr, alias) {
    return new Promise((resolve, reject) => {
      req.post(form + `/bo/def/v1/recovery?alias=` + alias, attr).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //发布
  deploy(id) {
    return new Promise((resolve, reject) => {
      req.get(form + `/bo/def/v1/deploy?id=${id}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //数据源
  getDataSource() {
    return new Promise((resolve, reject) => {
      req.get(context.portal + `/sys/sysDataSource/v1/getDataSources`).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //选中外部表
  getTableList(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/customQuery/v1/getByDsObjectName`, param).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //外部表切换
  changeTableName(param, flag) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/customQuery/v1/getTable?flag=` + flag, param).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //模板管理数据
  templateListData(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/template/v1/list`, param).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //设置默认模板
  setDefault(id, type) {
    return new Promise((resolve, reject) => {
      req.get(form + `/form/template/v1/setDefault?id=${id}&type=${type}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //模板复制
  copyTemplate(id, name, alias) {
    return new Promise((resolve, reject) => {
      req
        .post(
          form +
            `/form/template/v1/copyTemplate?templateId=${id}&newTemplateName=${name}&newAlias=${alias}`
        )
        .then(
          resp => {
            resolve(resp)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  //初始化模板
  initTemplate() {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/template/v1/init').then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //根据别名判断表单模板是否已经存在  返回结果：true：不存在，false：存在
  isTemplateByAlias(alias) {
    return new Promise((resolve, reject) => {
      req
        .get(form + '/form/template/v1/isTemplateByAlias?alias=' + alias)
        .then(resp => {
          resolve(resp)
        })
    })
  },
  //获取绑定数据
  getBindData(id, alias) {
    return new Promise((resolve, reject) => {
      req.get(form + `/bo/def/v1/getBindData?id=${id}&alias=${alias}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //获取业务数据模板列表数据
  getDataTemplateData(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/dataTemplate/v1/listToJson`, param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //获取表单列表数据
  getFormData(param) {
    return new Promise((resolve, reject) => {
      req
        .post(form + `/form/form/v1/list?formType=pc&status=deploy`, param)
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  //根据表单别名获取数据视图数据
  getBpmDataTemplate(formKey, boId) {
    return new Promise((resolve, reject) => {
      req
        .get(
          form +
            `/form/dataTemplate/v1/getBpmDataTemplate?formKey=${formKey}&boId=${boId}`
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getBpmDataTemplateById(id, boId) {
    return new Promise((resolve, reject) => {
      req
        .get(
          form + `/form/dataTemplate/v1/getByTemplateId?id=${id}&boId=${boId}`
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getBpmDataTemplateInfo(alias) {
    return new Promise((resolve, reject) => {
      req
        .get(
          form + `/form/dataTemplate/v1/getBpmDataTemplateInfo?alias=` + alias
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getTemplateDataListForm(alias) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/dataTemplate/v1/dataList_` + alias, {}).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  saveTemplateHtml(param) {
    return new Promise((resolve, reject) => {
      req
        .post(
          form + `/form/dataTemplate/v1/saveTemplate?id=` + param.id,
          param.templateHtml
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  //获取业务数据列表
  getBpmTemplateByPagination(data) {
    return new Promise((resolve, reject) => {
      req
        .post(
          form + `/form/dataTemplate/v1/listJson/` + data.templateId,
          data.pagination
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getCustomDialogs() {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/customDialog/v1/getAll`, {}).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomDialogByAlias(alias) {
    return new Promise((resolve, reject) => {
      req.get(form + `/form/customDialog/v1/getByAlias?alias=` + alias).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomChartList(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/customChart/v1/list', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomChartById(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/customChart/v1/get/' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  saveCustomChart(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/customChart/v1/save', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  checkSql(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/querySqldef/checkSql', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getQuerySqlDef(alias) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/query/querySqldef/getJson?alias=' + alias).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getTable(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/customChart/v1/getTable', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getListData(alias, params) {
    return new Promise((resolve, reject) => {
      req
        .post(form + '/form/customChart/v1/getListData?alias=' + alias, params)
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getCustomViewList(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/querySqldef/listJson', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomViewById(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/query/querySqldef/getJson?id=' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getViewList(param, alias) {
    return new Promise((resolve, reject) => {
      req
        .post(form + '/form/query/queryView/listJson?sqlAlias=' + alias, param)
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getViewById(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/query/queryView/getJson?id=' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getTemplateList() {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/queryView/getTempList', {}).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  refreshFields(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/query/querySqldef/refreshFields?id=' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  saveCustomView(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/querySqldef/save', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomDialog() {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/customDialog/v1/getAll', {}).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getQueryViewTemplate(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/query/queryView/getJson?id=' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  saveQueryViewTemplate(id, param) {
    return new Promise((resolve, reject) => {
      req
        .post(form + '/form/query/queryView/saveTemplate?id=' + id, param)
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  saveView(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/queryView/save', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getComVarList(param) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/dataTemplate/v1/getVarList').then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //保存引入脚本和样式对象
  saveFormJs(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/form/v1/saveFormJs`, param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //ccwgq 2022-10-18 保存权限脚本
  saveFormAuthJs(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/form/v1/saveFormTaskAuth', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  importCustomSql(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/query/querySqldef/import`, param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  importCustomDialog(param) {
    return new Promise((resolve, reject) => {
      req.post(form + `/form/customDialog/v1/import`, param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  importCustomQuery(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/customQuery/v1/import', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  //物理删除字段
  deleteAttr(id) {
    return new Promise((resolve, reject) => {
      req.post(form + `/bo/def/v1/deleteAttr?id=${id}`).then(
        resp => {
          resolve(resp)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomDialogList(param) {
    return new Promise((resolve, reject) => {
      req.post(window.context.form + '/form/customDialog/v1/list', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getBindRelation(defId, formKey) {
    return new Promise((resolve, reject) => {
      req
        .get(
          window.context.form +
            `/form/form/v1/getBindRelation?defId=${defId}&formKey=${formKey}`
        )
        .then(
          resp => {
            resolve(resp)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getBODefByFormId(formId) {
    return new Promise((resolve, reject) => {
      req
        .get(
          window.context.form +
            `/form/dataTemplate/v1/getBODefByFormId?formId=${formId}`
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getHideAttr(tableName) {
    return new Promise((resolve, reject) => {
      req
        .get(
          window.context.form + `/bo/def/v1/getHideAttr?tableName=${tableName}`
        )
        .then(
          resp => {
            resolve(resp.data)
          },
          error => {
            reject(error)
          }
        )
    })
  },
  getViewManageList(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/viewManage/v1/listJson', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  createPhysicalViewByViewMngId(id) {
    return new Promise((resolve, reject) => {
      req.get(form + '/form/viewManage/v1/createPhysicalView/' + id).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  savePrintTemplate(data) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/form/v1/savePrintTemplate', data).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  getCustomViews(param) {
    return new Promise((resolve, reject) => {
      req.post(form + '/form/query/queryView/listJson', param).then(
        resp => {
          resolve(resp.data)
        },
        error => {
          reject(error)
        }
      )
    })
  },
  // 通过别名获取对话框
  getDialogByAlias(alias, cb) {
    req
      .get(form + `/form/customDialog/v1/getByAlias?alias=${alias}`)
      .then(response => {
        cb(response.data)
      })
  }
}
