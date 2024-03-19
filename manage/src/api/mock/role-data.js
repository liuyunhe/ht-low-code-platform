const _data = [{
		"createBy": "1",
		"updateTime": "2019-10-16 09:48:56",
		"createOrgId": "876613",
		"isDelete": "0",
		"version": 1,
		"id": "1643341",
		"name": "测试角色",
		"code": "csjs",
		"enabled": 1,
		"description": "",
		"path": "测试角色",
		"groupId": "1643341",
		"parentId": "",
		"identityType": "group",
		"groupType": "role",
		"groupCode": "csjs",
		"orderNo": 1
	}, {
		"createBy": "1",
		"updateTime": "2019-10-09 09:05:59",
		"createOrgId": "31766",
		"isDelete": "0",
		"version": 1,
		"id": "471151",
		"name": "普通用户",
		"code": "ptyh",
		"enabled": 1,
		"description": "",
		"path": "普通用户",
		"groupId": "471151",
		"parentId": "",
		"identityType": "group",
		"groupType": "role",
		"groupCode": "ptyh",
		"orderNo": 1
	}, {
		"createBy": "1",
		"updateTime": "2019-09-29 14:21:59",
		"isDelete": "0",
		"version": 1,
		"id": "31755",
		"name": "管理人员",
		"code": "glry",
		"enabled": 1,
		"description": "",
		"path": "管理人员",
		"groupId": "31755",
		"parentId": "",
		"identityType": "group",
		"groupType": "role",
		"groupCode": "glry",
		"orderNo": 1
	}];

import mockUtil from "@/api/mock-util.js";
export default {
    name: "sysTypeData",
    getRolePageJson(param) {
            return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockUtil.query(_data, param));
            }, 500)
        });
    }
}