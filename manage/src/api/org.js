import req from "@/request.js";
import {Promise} from "q";

const uc = window.context.uc;

export default {
  getDescAll(){
    //获取组织树的下拉列表
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/demension/v1/dems/getAll').then(rep => {
        resolve(rep.data);
      }).catch(error => {
        reject(error.message);
      })
    })
  },
  getByParentAndDem(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgs/getByParentAndDem' ,param).then(resp => {
        resolve(resp.data);
      }).catch(error => {
        reject(error.message);
      })
    }))
  },
  getByParentAndDemToTree(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgs/getByParentAndDemToTree' ,param).then(resp => {
        resolve(resp.data);
      }).catch(error => {
        reject(error.message);
      })
    }))
  },
  getDemListAll(param){
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/demension/v1/dems/getDemListAll', param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  setDemDefault(param){
    return new Promise((resolve, reject) => {
      req.put(uc+'/api/demension/v1/dem/setDefaultDem?code='+param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getOrg(param){
    return new Promise(((resolve, reject) => {
      req.get(uc+'/api/org/v1/org/getOrg?code='+ encodeURIComponent(param)).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getOrgUserPage(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgUsers/getOrgUserPage',param).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  addUsersForOrg(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgUsers/addUsersForOrg',null,param,null).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getUserUndersPage(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/userUnder/getUserUndersPage',param).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  setUnderUsers(param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgUsers/setUnderUsers',null,param,null).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  setOrgCharge(param){   //设置负责人
    return new Promise((resolve, reject) => {
      req.put(uc+'/api/org/v1/orgUser/setOrgCharge?account='+param.account+'&orgCode='+param.orgCode+'&isCharge='+param.isCharge).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    })
  },
  setMasterById(param){  //设置是否为主组织
    return new Promise((resolve, reject) => {
      req.put(uc+'/api/org/v1/orgPost/setMasterById?id='+param).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    })
  },
  setMasterByIds(param){  //设置是否为主组织
    return new Promise((resolve, reject) => {
      req.put(uc+'/api/org/v1/orgPost/setMasterByIds?ids='+param).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    })
  },
  getOrgPost(param){
    return new Promise((resolve, reject) => {
    req.get(uc+'/api/org/v1/orgPost/getOrgPost?postCode='+encodeURIComponent(param)).then(response => {
      resolve(response.data)
    }),error => {
      reject(error)
    }
    })
  },
  getOrgAuthPage(data,param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/orgAuth/v1/orgAuths/getOrgAuthPage?orgCode='+ param.orgCode, data).then(response =>{
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  saveOrgParams(data,param){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/org/v1/orgParam/saveOrgParams',data,param).then(response =>{
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getParamsPage(data){
    return new Promise(((resolve, reject) => {
      req.post(uc+'/api/params/v1/params/getParamsPage',data).then(resp => {
        resolve(resp.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getParams(data){
    return new Promise(((resolve, reject) => {
      req.get(uc+'/api/params/v1/param/getParams?code='+data).then(resp => {
        resolve(resp.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getJobPage(param){
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/job/v1/jobs/getJobPage', param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getOrgPostPage(param){
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/org/v1/orgPosts/getOrgPostPage', param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getFullname(param){
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/org/v1/orgpost/getFullname?postId='+param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  saveUserPost(param){
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/org/v1/userPost/saveUserPost?postCode='+param.postCode+'&accounts='+param.accounts).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getUserRelByTypeId(param){
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/userRel/v1/userRels/getUserRelByTypeId?typeId='+param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  addOrg(param) {
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/org/v1/org/addOrg', param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  updateOrg(param) {
    return new Promise((resolve, reject) => {
      req.post(uc + '/api/org/v1/org/updateOrg', param).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getOrgParams(){  // 获取组织参数
    return new Promise((resolve, reject) => {
      req.get(uc+'/api/params/v1/orgParams/getOrgParams').then(resp => {
        resolve(resp.data);
      }), error => {
        reject(error);
      }
    })
  },
  setPostMaster(param){
    return new Promise((resolve, reject) => {
      req.put(uc + '/api/org/v1/orgPost/setPostMaster?postCode='+param.postCode+'&isMain='+param.isMain).then(response => {
        resolve(response.data);
      }, error => {
        reject(error);
      });
    })
  },
  getOrgParamsByCode(param){
    return new Promise((resolve, reject) => {
      req.get(uc+'/api/org/v1/orgParam/getOrgParams?orgCode='+encodeURIComponent(param)).then(resp => {
        resolve(resp.data);
      }), error => {
        reject(error);
      }
    })
  },
  getAllOrgAuth(){
    //获取组织树的下拉列表
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/orgAuth/v1/orgAuths/getAllOrgAuth').then(rep => {
        resolve(rep.data);
      }).catch(error => {
        reject(error.message);
      })
    })
  },
  getCurrentUserAuthOrgLayout(){
    //获取当前登录用户的布局权限
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/orgAuth/v1/orgAuths/getCurrentUserAuthOrgLayout').then(rep => {
        resolve(rep.data);
      }).catch(error => {
        reject(error.message);
      })
    })
  },
  get(orgId){
    //获取当前登录用户的布局权限
    return new Promise((resolve, reject) => {
      req.get(uc + '/api/org/v1/org/get?id='+orgId).then(rep => {
        resolve(rep.data);
      }).catch(error => {
        reject(error.message);
      })
    })
  },
  getOrgLimitByCodes(param){
    return new Promise(((resolve, reject) => {
      req.get(uc+'/api/org/v1/org/getOrgLimitByCodes?codes='+param).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  },
  getChildrenByOrgId(id){
    return new Promise(((resolve, reject) => {
      req.get(uc + `/api/org/v1/orgs/children/${id}`).then(response => {
        resolve(response.data)
      }),error => {
        reject(error)
      }
    }))
  }
}
