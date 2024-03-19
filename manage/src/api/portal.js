import req from "@/request.js";
import tenant from '@/store/tenant';
import utils from "@/hotent-ui-util.js";
const portal = window.context.portal;
export default {
  getSysCat() {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysType/v1/sysTypeTree").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //批量保存菜单资源数据信息
  saveBatch(list) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysMenu/v1/saveBatch",list).then(response => {
          resolve(response.data);
      });
    });
  },
  getSysCatByPage(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/category/v1/list", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },

  getMenus() {
    return new Promise((resolve, reject) => {
      req
        .get(
          `${portal}/sys/sysMenu/v1/getCurrentUserMenu?menuAlias=manage_menu`
        )
        .then(
          response => {
            resolve(response.data.value);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  removeMenuById(id) {
    return new Promise((resolve, reject) => {
      req.remove(`${portal}/sys/sysMenu/v1/remove?id=${id}`).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getMenuTree() {
    let ignoreAlias = "";
    if (tenant.state.tenantId){
      ignoreAlias = "?ignoreAlias=tenant"
    }
    return new Promise((resolve, reject) => {
      req.get(`${portal}/sys/sysMenu/v1/getTree${ignoreAlias}`).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getMenuByRoleAlias(roleAlias) {
    return new Promise((resolve, reject) => {
      req
        .get(
          `${portal}/sys/sysMenu/v1/getMenuByRoleAlias?roleAlias=` + roleAlias
        )
        .then(
          response => {
            resolve(utils.tile2nest(response.data));
          },
          error => {
            reject(error);
          }
        );
    });
  },
  delSysType(id) {
    return new Promise((resolve, reject) => {
      req.remove(`${portal}/sys/sysType/v1/remove?id=${id}`).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //附件在线预览
  onlinePreview(id, cb) {
    req
      .get(
        portal + "/file/onlinePreviewController/v1/onlinePreview?fileId=" + id
      )
      .then(response => {
        cb(response);
      });
  },
  //附件下载
  downloadFile(id, cb) {
    req.download(portal + "/system/file/v1/downloadFile?fileId=" + id);
  },
  //流水号列表
  getIdentityPageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/identity/v1/listJson", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },

  getSysExternalUnitePageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/portal/sysExternalUnite/v1/listJson", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  delSysExternalUniteById(id) {
    return new Promise((resolve, reject) => {
      req.remove(portal + `/portal/sysExternalUnite/v1/removes?ids=` + id).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  syncUser(id) {
    return new Promise((resolve, reject) => {
      req.get(portal + `/portal/sysExternalUnite/v1/syncUser?id=` + id,"arraybuffer").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  pullUser(id) {
    return new Promise((resolve, reject) => {
      req.get(portal + `/portal/sysExternalUnite/v1/pullUser?id=` + id).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  generateMenuUrl(id) {
    return new Promise((resolve, reject) => {
      req
        .get(portal + `/portal/sysExternalUnite/v1/generateMenuUrl?id=` + id)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },

  //数据源列表
  getDataSourcePageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysDataSource/v1/listJson", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //测试数据源连接
  checkConnection(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysDataSource/v1/checkConnection", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //定时计划列表
  getschedulerPageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/job/scheduler/v1/jobList", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //切换定时计划状态
  changeStart(isStandby) {
    return new Promise((resolve, reject) => {
      req
        .post(portal + "/job/scheduler/v1/changeStart?isStandby=" + isStandby)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //删除定时计划
  delJob(jobName) {
    return new Promise((resolve, reject) => {
      req.remove(portal + "/job/scheduler/v1/delJob?jobName=" + jobName).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //定时计划日志列表
  getSchedulerPageJsonbyJobName(url, param) {
    return new Promise((resolve, reject) => {
      req.post(url, param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //定时计划触发器列表
  getTriggersJsonByJob(url, param) {
    return new Promise((resolve, reject) => {
      req.post(url, param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //定时计划禁用触发器
  toggleTriggerRun(triggerName) {
    return new Promise((resolve, reject) => {
      req
        .post(portal + "/job/scheduler/v1/toggleTriggerRun?name=" + triggerName)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //定时计划删除触发器
  delTrigger(triggerName) {
    return new Promise((resolve, reject) => {
      req
        .remove(portal + "/job/scheduler/v1/delTrigger?name=" + triggerName)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //国际化资源管理列表
  getI18nMessageTypePageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/i18n/custom/i18nMessageType/v1/list", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  }, //查询所有语种类型
  geti18nMessageTypeAll() {
    return new Promise((resolve, reject) => {
      req.post(portal + "/i18n/custom/i18nMessageType/v1/all").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //国际化资源判断类型是否存在
  getI18nMessageTypeByType(type) {
    return new Promise((resolve, reject) => {
      req
        .post(portal + "/i18n/custom/i18nMessageType/v1/getByType?type=" + type)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //国际化资源判断key是否存在
  getByMessKey(key) {
    return new Promise((resolve, reject) => {
      req
        .post(portal + "/i18n/custom/i18nMessage/v1/getByMessKey?key=" + key)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //删除国际化资源
  i18nMessageDelByKey(key) {
    return new Promise((resolve, reject) => {
      req
        .remove(portal + `/i18n/custom/i18nMessage/v1/delByKey?key=` + key)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //获取国际化资源
  getI18nMessagePageJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/i18n/custom/i18nMessage/v1/list", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //初始化国际化资源
  i18nMessageInit() {
    return new Promise((resolve, reject) => {
      req.post(portal + "/i18n/custom/i18nMessage/v1/init").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //清除缓存
  i18nMessageClearCache() {
    return new Promise((resolve, reject) => {
      req.post(portal + "/i18n/custom/i18nMessage/v1/clearCache").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //根据分类id获取字典
  getByTypeId(typeId) {
    return new Promise((resolve, reject) => {
      req.post(`${portal}/sys/dataDict/v1/getByTypeId`, typeId).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //根据数据字典id 删除数据
  delDataDict(id) {
    return new Promise((resolve, reject) => {
      req.remove(`${portal}/sys/dataDict/v1/remove?id=${id}`).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //获取布局
  getIndexLayoutPage(param) {
    return new Promise((resolve, reject) => {
      req
        .post(
          portal + "/portal/sysIndexLayout/sysIndexLayout/v1/listJson",
          param
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //获取布局
  getIndexColumnPage(param) {
    return new Promise((resolve, reject) => {
      req
        .post(
          portal + "/portal/sysIndexColumn/sysIndexColumn/v1/listJson",
          param
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //添加汇报线
  addUserRel(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/api/userRel/v1/userRel/addUserRel", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //修改汇报线
  updateUserRel(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/api/userRel/v1/userRel/updateUserRel", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  deleteUserRel(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/api/userRel/v1/userRel/deleteUserRel", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //获取布局管理列表
  getLayoutManagerPage(param) {
    return new Promise((resolve, reject) => {
      req
        .post(
          portal +
            "/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/listJson",
          param
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //获取布局管理列表
  getLayoutManageDesignData(id, layoutType) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal +
            `/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/design?id=${id}&layoutType=${layoutType}`
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //获取首页布局
  getHomeLayout() {
    return new Promise((resolve, reject) => {
      req.get(portal + "/portal/main/v1/myHome").then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getColumnByAlias(alias) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal +
            "/portal/sysIndexColumn/sysIndexColumn/v1/getByAlias?alias=" +
            alias
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  deleteOrg(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/api/org/v1/org/deleteOrg", param).then(
        response => {
          resolve(response.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getDefaultLayoutManagerPage(param) {
    return new Promise((resolve, reject) => {
      req
        .post(
          portal +
            "/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/getSysDefaultLayout",param)
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  setlayoutMngShareToSub(id, shareToSub) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal +
            `/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/setShareToSub?id=${id}&shareToSub=${shareToSub}`
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  setlayoutMngEnable(id, enable) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal +
            `/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/enable?id=${id}&enable=${enable}`
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  getLayoutMngById(id) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal +
            "/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/getJson?id=" +
            id
        )
        .then(
          response => {
            resolve(response.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  getCurrentMenu() {
    return new Promise((resolve, reject) => {
      req
        .get(portal + "/sys/sysMenu/v1/getCurrentUserMenu?menuAlias=front_menu")
        .then(
          resp => {
            resolve(resp.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  //获取用户头像
  downloadImg(fileId, cb) {
    req.get(window.context.portal + "/system/file/v1/preview?fileId="+fileId, "blob").then(
      response => {
        if(response.data.size>0){
          var blob = response.data;
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = function(e) {
            cb(e.target.result);
          };
        }else{
          cb("");
        }
      },
      function errorCallback() {
        cb("");
      }
    );
  },
  getCurrentMenuByAlias(menuAlias) {
    return new Promise((resolve, reject) => {
      req
        .get(
          portal + "/sys/sysMenu/v1/getCurrentUserMenu?menuAlias=" + menuAlias
        )
        .then(
          resp => {
            resolve(resp.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  saveDataTemplateToMenu(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysMenu/v1/addDataTemplateToMenu", param).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  isMenuExist(alias) {
    return new Promise((resolve, reject) => {
      req
        .get(portal + "/sys/sysMenu/v1/isMenuExistByAlias?alias=" + alias)
        .then(
          resp => {
            resolve(resp.data);
          },
          error => {
            reject(error);
          }
        );
    });
  },
  getSysProperties(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysProperties/v1/listJson", param).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //系统属性明细页面
  getSysProperty(id) {
    return new Promise((resolve, reject) => {
      req.get(`${portal}/sys/sysProperties/v1/getJson?id=${id}`).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //获取系统属性解密后参数值
  getSysPropertyByAlias(alias) {
    return new Promise((resolve, reject) => {
      req.get(`${portal}/sys/sysProperties/v1/getDecryptByAlias?alias=${alias}`).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  //获取系统属性别名为“sysSetting”解密后参数值
  getDecryptBySysSetting() {
    return new Promise((resolve, reject) => {
      req.get(`${portal}/sys/sysProperties/v1/getDecryptBySysSetting`).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getSysModuleJson(param) {
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysModule/v1/listJson", param).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getSysModuleById(id) {
    return new Promise((resolve, reject) => {
      req.get(portal + "/sys/sysModule/v1/getJson?id="+id).then(
          resp => {
            resolve(resp.data);
          },
          error => {
            reject(error);
          }
      );
    })
  },
  getDefaultPwdStrategy(){
    return new Promise((resolve, reject) => {
      req.get(`${portal}/sys/sysPwdStrategy/v1/getDefault`).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  getDefPwdStrategy(cb) {
    req.get(portal + "/sys/sysPwdStrategy/v1/getDefault").then(response => {
        cb(response.data);
    });
  },
  saveDefaultPwdStrategy(param){
    return new Promise((resolve, reject) => {
      req.post(portal + "/sys/sysPwdStrategy/v1/save", param).then(
        resp => {
          resolve(resp.data);
        },
        error => {
          reject(error);
        }
      );
    });
  },
  importDataDict(param, typeId){
    return new Promise((resolve, reject) => {
      req.post(portal + `/sys/dataDict/v1/import?typeId=${typeId}`,param).then(resp=>{
        resolve(resp.data)
      },error=>{
        reject(error)
      })
    })
  },
  importIdentity(param){
    return new Promise((resolve,reject)=>{
      req.post(portal + '/sys/identity/v1/import',param).then(resp=>{
        resolve(resp.data);
      },error=>{
        reject(error)
      })
    })
  },
  importSysDataSource(param){
    return new Promise((resolve,reject)=>{
      req.post(portal + "/sys/sysDataSource/v1/import",param).then(resp=>{
        resolve(resp.data);
      },error=>{
        reject(error);
      })
    })
  },
  importSysTags(param,typeId){
    return new Promise((resolve,reject)=>{
      req.post(portal + "/portal/sysTag/v1/import?typeId="+typeId,param).then(resp=>{
        resolve(resp.data);
      },error=>{
        reject(error);
      })
    })
  },
  removeTagByTypeId(id){
    return new Promise((resolve, reject) => {
      req.remove(portal + `/portal/sysTag/v1/removeByTypeId?id=${id}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  getTagsByTypeId(id){
    return new Promise((resolve, reject) => {
      req.get(portal + `/portal/sysTag/v1/tags?typeId=${id}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  removeTag(ids){
    return new Promise((resolve, reject) => {
      req.remove(portal + `/portal/sysTag/v1/remove?ids=${ids}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  getSysAppList(param){
    return new Promise((resolve, reject) => {
      req.post(`${portal}/portal/sysApp/v1/query`,param).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  getSysApp(id){
    return new Promise((resolve, reject) => {
      req.get(`${portal}/portal/sysApp/v1/${id}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  getSysAppTree(id){
    return new Promise((resolve, reject) => {
      req.get(`${portal}/portal/sysAppMenu/v1/getTree?appId=${id}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  deleteSysApp(id){
    return new Promise((resolve, reject) => {
      req.remove(`${portal}/portal/sysApp/v1/remove?ids=${id}`).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  publishApp(param){
    return new Promise((resolve, reject) => {
      req.post(`${portal}/portal/sysApp/v1/publish`,param).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  saveApp(param){
    return new Promise((resolve, reject) => {
      req.post(`${portal}/portal/sysApp/v1/save`,param).then(resp => {
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  getRights(id,type) {
    return req.get(`${portal}/sys/authUser/v1/getRightsAndDefaultRightType?id=${id}&objType=${type}`);
  },
  importSysMenus(param,parentMenuId){
    return new Promise((resolve,reject)=>{
      req.post(portal + "/sys/sysMenu/v1/import?parentMenuId="+parentMenuId,param).then(resp=>{
        resolve(resp.data);
      },error=>{
        reject(error);
      })
    })
  },
  //导入栏目
  importColumn(param){
    return new Promise((resolve,reject)=>{
        req.post(`${portal}/portal/sysIndexColumn/sysIndexColumn/v1/importColumn`, param).then(resp=>{
            resolve(resp.data);
        }, error=>{
            reject(error);
        })
    })
  },
  importNews(param,typeId){
    return new Promise((resolve, reject) =>{
      req.post(`${portal}/portalNewsNotice/v1/importNews?classifyId=${typeId}`, param).then(resp =>{
        resolve(resp.data);
      }, error =>{
        reject(error);
      })
    })
  },
  importTree(param,typeId){
    return new Promise((resolve, reject)=>{
      req.post(`${portal}/portalNewsTree/v1/importTree?classifyId=${typeId}`,param).then(resp=>{
        resolve(resp.data);
      }, error=>{
        reject(error);
      })
    })
  },
  importDefaultLayout(param){
    return new Promise((resolve, reject) => {
      req.post(`${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/importDefaultLayout?orgId=&isDefault=true`,param).then(resp=>{
        resolve(resp.data);
      }, error => {
        reject(error);
      })
    })
  },
  importOrgLayout(param,orgId){
    return new Promise((resolve, reject) => {
      req.post(`${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/importDefaultLayout?orgId=${orgId}&isDefault=false`,param).then(resp=>{
        resolve(resp.data);
      },error=>{
        reject(error);
      })
    })
  },
};
