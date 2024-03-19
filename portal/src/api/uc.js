import req from "@/request.js";
const uc = window.context.uc;
export default {
    getCurrent(cb) {
        req.post(uc + `/api/user/v1/user/getByAccount`).then(rep => {
            cb(rep);
        });
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
            //ccwgq 2022-4-1 增加登录类型
            logintype: principal.logintype
        }).then(function (rep) {
            cb(rep.data);
        }).catch(function (error) {
            if (error.response && error.response.data && error.response.data.message) {
                errorCb(error.response.data.message);
            } else {
                errorCb(error.message);
            }

        });
    },
    authenticationByQRCode(qrCode, cb, errorCb) {
        req.get(
            uc +
            `/eipx7/opun/uc/qrCode/v1/loginByQrCode?qrCode=${qrCode}`,
            null,
            false
        )
        .then(function(rep) {
            cb(rep.data)
        })
        .catch(function(error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                errorCb(error.response.data.message)
            } else {
                errorCb(error.message)
            }
        })
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
    //lyzcw  2022-4-1
    basicSso(token, cb, errorCb) {
        let service = localStorage.getItem("service");
        //检查单点登录时使用
        // setTimeout(()=>{
        //     req.get(uc + `/sso/auth?ticket=${token}&code=${token}&service=${service}`).then(function (resp) {
        //     if (!window.ssoConfig.mode || window.ssoConfig.mode == "jwt") {
        //         if (token.substr(0, 1) === ' ') {
        //             token = token.substr(1);
        //         }
        //         //TODO:先把这句给注释掉,这里的重新赋值，导致了token格式错误，导致了POC单点跳转错误。
        //         //resp.data.token = token;
        //     }
        //     cb(resp.data);
        // }).catch(function (error) {
        //     errorCb(error.message);
        // });
        // },15000)
        req.get(uc + `/sso/auth?ticket=${token}&code=${token}&service=${service}`).then(function (resp) {
            if (!window.ssoConfig.mode || window.ssoConfig.mode == "jwt") {
                if (token.substr(0, 1) === ' ') {
                    token = token.substr(1);
                }
                //TODO:先把这句给注释掉,这里的重新赋值，导致了token格式错误，导致了POC单点跳转错误。
                //resp.data.token = token;
            }
            cb(resp.data);
        }).catch(function (error) {
            errorCb(error.message);
        });
    },

    modifyPwd(data, cb) {
        req.post(uc + `/api/user/v1/user/changUserPsd`, data).then(rep => {
            cb(rep.data)
        });
    },

    getAllDimension(cb, errorCb) {
        req.get(uc + '/api/demension/v1/dems/getAll')
            .then(function (rep) {
                cb(rep.data);
            })
            .catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },

    getOrgsByDemension(demensionId, cb, errorCb) {
        req.post(uc + '/api/org/v1/orgs/getByParentAndDem', {
            demId: demensionId
        }).then(function (rep) {
            cb(rep.data);
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

    getUsersByOrgId(queryFilter, cb, errorCb) {
        req.post(uc + '/api/user/v1/users/queryByType', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },

    getCurrentOrg(cb) {
        req.get(uc + `/api/org/v1/org/getOrgMaster`).then(rep => {
            cb(rep);
        });
    },

    queryOrgByFilter(queryFilter, cb, errorCb) {
        req.post(uc + '/api/org/v1/orgs/getOrgPage', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },
    getOrgPostPage(queryFilter, cb, errorCb) {
        req.post('/api/org/v1/orgPosts/getOrgPostPage', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },
    getRolePage(queryFilter, cb, errorCb) {
        req.post('/api/role/v1/roles/getRolePage', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },
    getJobPage(queryFilter, cb, errorCb) {
        req.post('/api/job/v1/jobs/getJobPage', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },
    //查询维度列表
    getDemPage(queryFilter, cb, errorCb) {
        req.post(uc + '/api/demension/v1/dems/getDemListAll', queryFilter)
            .then(function (rep) {
                cb(rep);
            }).catch(function (error) {
                errorCb && errorCb(error.message);
            });
    },
    //获取默认密码策略
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
    fileUpload(param) {   //文件上传
        return new Promise((resolve, reject) => {
            req.post(uc + '/system/file/v1/fileUpload', param).then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    },
    getCurrentSeal() {
        // 获取当前登录用户的电子签章
        return new Promise((resolve, reject) => {
            req.get(uc + '/uc/electronicSeal/v1/getSealByCurrentUserId').then(response => {
                resolve(response.data)
            }), error => {
                reject(error)
            }
        })
    }
}