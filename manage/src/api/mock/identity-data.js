const _identitys = [{
	"id": "647222",
	"name": "流水号",
	"alias": "lsh",
	"regulation": "HRB{yyyy}{MM}{dd}{NO}",
	"genType": 1,
	"noLength": 6,
	"curDate": "20191211",
	"initValue": 9,
	"curValue": 9,
	"step": 2,
	"newCurValue": 0,
	"curIdenValue": ""
}, {
	"id": "545132",
	"name": "编码",
	"alias": "bm",
	"regulation": "{yyyy}{MM}{dd}{NO}",
	"genType": 1,
	"noLength": 3,
	"curDate": "20191213",
	"initValue": 0,
	"curValue": 1,
	"step": 1,
	"newCurValue": 0,
	"curIdenValue": ""
}, {
	"id": "4929154",
	"name": "数字字符",
	"alias": "szzf",
	"regulation": "HI2020{yyyy}{MM}{dd}{NO}",
	"genType": 1,
	"noLength": 3,
	"initValue": 1,
	"curValue": 0,
	"step": 1,
	"newCurValue": 0,
	"curIdenValue": ""
}, {
	"id": "4106663",
	"name": "{yyyy}{MM}{dd}{NO}",
	"alias": "lshca2",
	"regulation": "{yyyy}{MM}{dd}{NO}",
	"genType": 1,
	"noLength": 1,
	"curDate": "20191129",
	"initValue": 201,
	"curValue": 201,
	"step": 1,
	"newCurValue": 0,
	"curIdenValue": ""
}, {
	"id": "4106229",
	"name": "{yyyy}{MM}{dd}{no}",
	"alias": "lshcs1",
	"regulation": "{yyyy}{MM}{dd}{no}",
	"genType": 1,
	"noLength": 1,
	"curDate": "20191209",
	"initValue": 105,
	"curValue": 1545,
	"step": 120,
	"newCurValue": 0,
	"curIdenValue": ""
}, {
	"id": "1569490",
	"name": "请假id",
	"alias": "qjid",
	"regulation": "{yyyy}{MM}{dd}{NO}",
	"genType": 1,
	"noLength": 5,
	"initValue": 1,
	"curValue": 0,
	"step": 1,
	"newCurValue": 0,
	"curIdenValue": ""
}]

import mockUtil from "@/api/mock-util.js";

export default {
    name: "identityData",
    getData(param) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockUtil.query(_identitys, param));
            }, 500)
        })
    },

}