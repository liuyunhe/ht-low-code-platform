const _users = [
    { id: "1", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "2", name: "张三张三张三张三张三张三张三张三张三张三张三张三张三张三张三张三张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "1" },
    { id: "3", name: "李四", account: "lisi", email: "lisi@hotent.com", mobile: "13849293125", sex: "1", status: "0" },
    { id: "4", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "5", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "1" },
    { id: "6", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "2" },
    { id: "7", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "8", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "9", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "0" },
    { id: "10", name: "王五", account: "wangwu", email: "wangwu@hotent.com", mobile: "17729940512", sex: "0", status: "1" },
    { id: "11", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "12", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "13", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "2" },
    { id: "14", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "15", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "16", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "1" },
    { id: "17", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "0" },
    { id: "18", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "19", name: "纳兰烧苇", account: "nlsw", email: "nlsw@hotent.com", mobile: "12352980716", sex: "1", status: "1" },
    { id: "20", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "21", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "22", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "2" },
    { id: "23", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "24", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "25", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "26", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "1" },
    { id: "27", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "2" },
    { id: "28", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "29", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "30", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "1" },
    { id: "31", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "32", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "2" },
    { id: "33", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "34", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "35", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "0", status: "0" },
    { id: "36", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "37", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "38", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" },
    { id: "39", name: "张三", account: "zhangsan", email: "zhangsan@hotent.com", mobile: "13812345678", sex: "1", status: "1" }
]

import mockUtil from "@/api/mock-util.js";

export default {
    name: "userData",
    getData(param) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockUtil.query(_users, param));
            }, 500)
        })
    },

}