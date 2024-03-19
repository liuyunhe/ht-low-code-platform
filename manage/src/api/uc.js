import req from "@/request.js";
import utils from "@/hotent-ui-util.js"
import { Promise } from "q";

const uc = window.context.uc;
const portal = window.context.portal;
export default {
    getRolePage(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/role/v1/roles/getRolePage', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
        // return roleData.getRolePageJson(param);
    },
    getUserPage(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/users/listJson', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
    },
    getOrgUserQuery(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/users/getOrgUserQuery', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            });
        })
    },
    getUserByAccount(account, cb) {
        req.get(uc + `/api/user/v1/user/getDetailByAccountOrId?account=${account}`).then(rep => {
            cb(rep.data);
        });
    },
    authentication(principal, cb, errorCb) {
        let Base64 = require("js-base64").Base64;
        req.post(uc + `/auth?tenantId=${principal.tenantId || ''}`, {
            username: principal.account,
            password: Base64.encode(principal.password),
            logintype: principal.logintype
        }).then(function (rep) {
            cb(rep.data);
        }).catch(function (error) {
            errorCb(error.message);
        });
    },
    refreshAndGetAuthenticationToken() {
        return new Promise((resolve, reject) => {
            req.get(`${uc}/refresh`)
                .then(function (rep) {
                    resolve(rep.data);
                })
                .catch(function (error) {
                    reject(error.message);
                });
        });
    },
    logout() {
        return req.get(`${uc}/signout`);
    },
    basicSso(token, cb, errorCb) {
        let service = localStorage.getItem("service");
        req.get(uc + `/sso/auth?ticket=${token}&code=${token}&service=${service}`).then(function (rep) {
            cb(rep.data);
        }).catch(function (error) {
            errorCb(error.message);
        });
    },

    modifyPwd(data, cb) {
        req.post(uc + `/api/user/v1/user/changUserPsd`, data).then(rep => {
            cb(rep.data)
        });
    },

    getAllDimension() {
        return new Promise((resolve, reject) => {
            req.get(`${uc}/api/demension/v1/dems/getAll`)
                .then(function (rep) {
                    resolve(rep.data);
                })
                .catch(function (error) {
                    reject(error.message);
                });
        });

    },

    getOrgsByDemension(demensionId, cb, errorCb) {
        req.post(uc + '/api/org/v1/orgs/getByParentAndDem', {
            demId: demensionId
        }).then(function (rep) {
            cb(utils.tile2nest(rep.data));
        }).catch(function (error) {
            errorCb && errorCb(error.message);
        });
    },

    getOrgsByParentIdAndDemension(parentId, demensionId, cb, errorCb) {
        req.post(uc + '/api/org/v1/orgs/getByParentAndDem', {
            demId: demensionId,
            parentId: parentId
        }).then(function (rep) {
            cb(rep.data);
        }).catch(function (error) {
            errorCb && errorCb(error.message);
        });
    },

    getUsersByOrgId(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(`${uc}/api/user/v1/users/queryByType`, queryFilter)
                .then(function (rep) {
                    resolve(rep.data);
                }).catch(function (error) {
                    reject(error.message);
                });
        });

    },

    getCurrentOrg(cb) {
        req.get(uc + `/api/org/v1/org/getOrgMaster`).then(rep => {
            cb(rep);
        });
    },

    queryOrgByFilter(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/org/v1/orgs/getOrgPage', queryFilter)
                .then(function (response) {
                    resolve(response.data)
                }).catch(function (error) {
                    reject(error)
                });
        })
    },
    getOrgPostPage(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/org/v1/orgPosts/getOrgPostPage', queryFilter).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    getJobPage(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/job/v1/jobs/getJobPage', queryFilter).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    // 查询维度列表
    getDemPage(queryFilter) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/demension/v1/dems/getDemListAll', queryFilter)
                .then(function (response) {
                    resolve(response.data)
                }).catch(function (error) {
                    reject(error)
                });
        })
    },
    getRoleUsers(roleCode, queryFilter) {
        return new Promise((resovle, reject) => {
            req.request({
                url: `${uc}/api/role/v1/role/getRoleUsers`,
                data: queryFilter,
                method: 'POST',
                params: { code: roleCode },
                dataType: 'json'
            })
                .then(function (rep) {
                    resovle(rep.data);
                }).catch(function (error) {
                    reject(error.message);
                });
        });
    },
    saveUserRole(params) {
        return new Promise((resovle, reject) => {
            req.request({
                url: `${uc}/api/role/v1/roleUser/saveUserRole`,
                method: 'POST',
                params: params,
                dataType: 'json'
            })
                .then(function (rep) {
                    resovle(rep.data);
                }).catch(function (error) {
                    reject(error.message);
                });
        })
    },
    fileUpload(param) {   //文件上传
        return new Promise((resolve, reject) => {
            req.post(portal + '/system/file/v1/fileUpload', param).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    getUser(param) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/api/user/v1/user/getDetailByAccountOrId?account=${param}`).then(rep => {
                resolve(rep.data)
            }), error => {
                reject(error)
            }
        })
    },
    getUserOrgPage(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/org/v1/orgs/getUserOrgPage', param).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    userRolePage(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/userRoles/userRolePage', param).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    setMasterById(Id) {
        return new Promise((resolve, reject) => {
            req.put(uc + '/api/org/v1/orgPost/setMasterById?id=' + Id).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    saveUserOrgs(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/org/v1/orgUser/addOrgUserByCode?account=' + param.account + '&orgCode=' + param.orgCode).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    saveUserPosts(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/org/v1/userPost/saveUserPosts?account=' + param.account + '&postCodes=' + param.Code).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    delOrgUser(id) {
        return new Promise((resolve, reject) => {
            req.remove(uc + '/api/org/v1/orgUser/delOrgUser?ids=' + id).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    saveUserRoles(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/role/v1/roleUser/saveUserRoles?account=' + param.account + '&codes=' + param.codes).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    delUserRole(param) {
        return new Promise((resolve, reject) => {
            req.remove(uc + '/api/role/v1/roleUser/deleteUserRole?accounts=' + param.account + '&code=' + param.codes).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    getUserByUserId(userId) {
        return new Promise((resolve, reject) => {
            req.get(uc + '/api/org/v1/orgpost/getUserByUserId?userId=' + userId).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    syncUserToWx(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/users/syncUserToWx?userId=' + param).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    updateUserPsw(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/user/updateUserPsw', param).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    // 获取所有的用户参数
    getUserParams() {
        return new Promise((resolve, reject) => {
            req.get(uc + '/api/params/v1/userParams/getUserParams').then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    // 获取指定用户的用户参数值
    getUserParamsValue(account) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/api/user/v1/user/getUserParams?account=${account}`).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    // 保存指定用户的用户参数
    saveUserParams(data, param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/user/saveUserParams', data, param).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    getRelAuthPage(data, param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/relAuth/v1/relAuths/getRelAuthPage', data, param).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    addRelAuths(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/relAuth/v1/relAuths/addRelAuths?code=' + param.code + "&accounts=" + param.accounts).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    getUserOrgNowNumByOrgIds(param) {
        return new Promise((resolve, reject) => {
            req.get(uc + '/api/org/v1/orgusers/getUserOrgNowNumByOrgIds?orgIds=' + param).then(resp => {
                resolve(resp.data)
            }), error => {
                reject(error)
            }
        })
    },
    //添加汇报线
    addUserRel(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + "/api/userRel/v1/userRel/addUserRel", param).then(
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
            req.post(uc + "/api/userRel/v1/userRel/updateUserRel", param).then(
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
            req.post(uc + "/api/userRel/v1/userRel/deleteUserRel", param).then(
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
            req.post(uc + "/api/org/v1/org/deleteOrg", param).then(
                response => {
                    resolve(response.data);
                },
                error => {
                    reject(error);
                }
            );
        });
    },
    getAllRoles() {
        return new Promise((resolve, reject) => {
            req.post(uc + "/api/role/v1/roles/getAll").then(
                response => {
                    resolve(response.data);
                },
                error => {
                    reject(error);
                }
            )
        })
    },
    getAllJobs() {
        return new Promise((resolve, reject) => {
            req.post(uc + "/api/job/v1/jobs/getJobList", {}).then(
                response => {
                    resolve(response.data);
                },
                error => {
                    reject(error);
                }
            )
        })
    },
    getAllPosts() {
        return new Promise((resolve, reject) => {
            req.post(uc + "/api/org/v1/orgPosts/getOrgPostPage", {}).then(
                response => {
                    resolve(response.data);
                },
                error => {
                    reject(error);
                }
            )
        })
    },
    getTokenByUserName(username) {
        return new Promise(((resolve, reject) => {
            req.post(uc + "/api/user/v1/user/getTokenByUserUserName?username=" + username).then(
                response => {
                    resolve(response.data);
                },
                error => {
                    reject(error);
                }
            )
        }))
    },
    getDefaultPwdStrategy() {
        return new Promise((resolve, reject) => {
            req.get(`${uc}/api/pwdStrategy/v1/getDefault`).then(
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
        req.get(uc + "/api/pwdStrategy/v1/getDefault").then(response => {
            cb(response.data);
        });
    },
    saveDefaultPwdStrategy(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + "/api/pwdStrategy/v1/save", param).then(
                resp => {
                    resolve(resp.data);
                },
                error => {
                    reject(error);
                }
            );
        });
    },
    userExport(selection, cb) {
        req
            .post(uc + "/api/user/v1/user/excelExport", selection, "", "arraybuffer")
            .then(response => {
                cb(response.data);
            });
    },
    matrixList(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + "/uc/matrix/v1/listJson", param).then(resp => {
                resolve(resp.data);
            }, error => {
                reject(error);
            })
        })
    },
    setUnderUser(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + '/api/user/v1/user/setUnderUser', param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getSuperior(underId, demId) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/api/user/v1/user/superior?underId=${underId}&demId=${demId}`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    //节假日列表
    holidayList(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + `/uc/holiday/v1/query`, param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getHoliday(id) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/uc/holiday/v1/${id}`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    ruleList(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + `/uc/shiftRule/v1/query`, param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getRule(id) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/uc/shiftRule/v1/${id}`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getShiftUsers(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + `/api/user/v1/shift/users`, param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        }
        )
    },
    saveShiftUser(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + `/uc/shiftRule/v1/saveShiftUser`, param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    removeShiftUser(ids) {
        return new Promise((resolve, reject) => {
            req.remove(`${uc}/uc/shiftRule/v1/removeShiftUser?ids=${ids}`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getSealByUserId(userId) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/uc/electronicSeal/v1/getSealByUserId/${userId}`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getUserUniteByUserId(userId) {
        return new Promise((resolve, reject) => {
            req.get(uc + `/uc/userUnite/v1/getByUserId/${userId}`).then(response => {
                resolve(response);
            }, error => {
                reject(error);
            })
        })
    },
    getOnlineUsers() {
        return new Promise((resolve, reject) => {
            req.post(uc + `/base/online/v1/users`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    kickOffOnlineUser(param) {
        return new Promise((resolve, reject) => {
            req.post(uc + `/base/online/v1/kickoff`, param).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    kickAllOnlineUsers() {
        return new Promise((resolve, reject) => {
            req.post(uc + `/base/online/v1/kickall`).then(response => {
                resolve(response.data);
            }, error => {
                reject(error);
            })
        })
    },
    getPlatformVersion() {
        return req.get(uc + '/base/tools/v1/getPlatformVersion');
    }
}
