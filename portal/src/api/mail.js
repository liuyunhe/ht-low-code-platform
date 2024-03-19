import req from "@/request.js";

const portal = window.context.portal;

export default {
    //获取邮件信息列表
    getMialByPagination(pagination,cb) {
        req.post(portal+"/mail/mail/mail/v1/listJson",pagination).then(response=>{
            cb(response);
        });
    },
    //获取邮箱分类树
    getMailTreeList(cb) {
        req.get(portal+"/mail/mail/mail/v1/getMailTreeData").then(response=>{ 
            cb(response);
        });
    },
    //获取邮箱详细信息
    getMailById(id,cb) {
        req.get(portal+"/mail/mail/mail/v1/getJson?id="+id).then(response=>{
            cb(response);
        });
    },
    //删除邮件
    deleteMaliById(data,cb) {
        var s="";
        for(var i=0;i<data.length;i++){
            s+=s+data[i].id+",";
        }
        var type=data[0].type;
        req.get(portal+"/mail/mail/mail/v1/remove?ids="+s+"&&type="+type).then(response=>{
            cb(response);
        });
    },
    //删除单个邮件
    deleteMaliOnes(data,cb) {
        req.get(portal+"/mail/mail/mail/v1/remove?ids="+data.id+"&&type="+data.type).then(response=>{
            cb(response);
        });
    },
    //同步邮件
    getSysncById(id,cb) {
        req.post(portal+"/mail/mail/mail/v1/sync?id="+id).then(response=>{
            cb(response);
        });
    },
    //发送邮件(保存邮件信息)
    saveMail(data,cb) {
        req.post(portal+'/mail/mail/mail/v1/send',data).then(response=>{
            cb(response);
        });
    },
    //模糊查询联系人和用户信息
    getUserlistByPagination(query,cb){
        req.get(portal+"/mail/mail/mailLinkman/v1/getMailAndUserData?query="+query).then(response=>{
            cb(response);
        });
    },
    //邮件变成已读
    setMailByisRead(id,cb) {
        req.get(portal+"/mail/mail/mail/v1/isRead?id="+id).then(response=>{
            cb(response);
        });
    },
    
    //获取外部邮件联系人列表
    getMailLinkmanByPagination(pagination,cb) {
        req.post(portal+"/mail/mail/mailLinkman/v1/listJson",pagination).then(response=>{
            cb(response); 
        });
    },
    //获取外部邮件联系人详细信息
    getMailLinkmanById(id,cb) {
        req.get(portal+"/mail/mail/mailLinkman/v1/getJson?id="+id).then(response=>{
            cb(response);
        });
    },
    //保存外部邮件联系人
    saveMailLinkman(data,cb) {
        req.post(portal+'/mail/mail/mailLinkman/v1/save',data).then(response=>{
            cb(response);
        });
    },
    //根据邮件名称获取邮件联系人
    getMailLinkmanByMail(mailId,cb) {
        req.get(portal+"/mail/mail/mailLinkman/v1/getLinkMan?mailId="+mailId).then(response=>{
            cb(response);
        });
    },
    //删除邮件联系人
    deleteMaliLinkmanById(data,cb) {
        var s="";
        for(var i=0;i<data.length;i++){
            s+=s+data[i].id+",";
        }
        s = s.substring(0, s.length - 1);
        req.remove(portal+"/mail/mail/mailLinkman/v1/remove?ids="+s).then(response=>{
            cb(response);
        });
    },

    //获取外部邮箱配置列表
    getMailSettingByPagination(pagination,cb) {
        req.post(portal+"/mail/mail/mailSetting/v1/listJson",pagination).then(response=>{
            cb(response);
        });
    },
    //获取外部邮箱配置详细信息
    getMailSettingById(id,cb) {
        req.get(portal+"/mail/mail/mailSetting/v1/getJson?id="+id).then(response=>{
            cb(response);
        });
    },
    //保存外部邮箱配置
    saveMailSetting(data,cb) {
        req.post(portal+'/mail/mail/mailSetting/v1/save?isOriginPwd='+data.isOriginPwd,data).then(response=>{
            cb(response);
        });
    },
    //测试邮箱连接(编辑/新增情况)
    testMailConnect(data,cb) {
        req.post(portal+"/mail/mail/mailSetting/v1/test?isOriginPwd="+data.isOriginPwd,data).then(response=>{
            cb(response);
        }); 
        
    },
    //测试邮箱连接(根据id)
    testMailConnectById(id,cb){
        req.post(portal+"/mail/mail/mailSetting/v1/test?id="+id).then(response=>{
            cb(response);
        });
    },

    //删除外部邮箱配置
    deleteMaliSettingById(data,cb) {
        var s="";
        for(var i=0;i<data.length;i++){
            s+=s+data[i].id+",";
        }
        s = s.substring(0, s.length - 1);
        req.remove(portal+"/mail/mail/mailSetting/v1/remove?ids="+s).then(response=>{
            cb(response);
        });
    },
    //设置默认邮箱配置
    setMailSettingDefaultById(id,cb) {
        req.post(portal+"/mail/mail/mailSetting/v1/setDefault?id="+id).then(response=>{
            cb(response);
        });
    }
}