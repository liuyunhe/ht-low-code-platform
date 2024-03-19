import userData from "@/api/mock/user-data.js";

export default {
    getUsers(param) {
        return userData.getData(param);
    }
}