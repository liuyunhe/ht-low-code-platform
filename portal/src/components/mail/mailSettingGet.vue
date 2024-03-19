<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">查看外部邮箱配置</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form ref="data" :model="data" label-width="120px">
                <el-form-item label="用户名称：">
                    <el-input v-model="data.nickName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="邮件类型：">
                    <el-input v-model="data.mailType" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="邮箱地址：">
                    <el-input v-model="data.mailAddress" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="邮箱密码：">
                    <el-input type="password" v-model="data.password" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="是否默认：">
                    <el-switch v-model="defaults" disabled></el-switch>
                </el-form-item>
                <el-form-item label="smtp主机：" v-if="data.mailType!='exchange'">
                    <el-input v-model="data.smtpHost" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="smtp端口：" v-if="data.mailType!='exchange'">
                    <el-input v-model="data.smtpPort" readonly="readonly"></el-input>
                </el-form-item>

                <el-form-item label="pop主机：" v-if="data.mailType=='pop3'">
                    <el-input v-model="data.popHost" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="pop端口：" v-if="data.mailType=='pop3'">
                    <el-input v-model="data.popPort" readonly="readonly"></el-input>
                </el-form-item>

                <el-form-item label="imap主机：" v-if="data.mailType=='imap'">
                    <el-input v-model="data.imapHost" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="imap端口：" v-if="data.mailType=='imap'">
                    <el-input v-model="data.imapPort" readonly="readonly"></el-input>
                </el-form-item>

                <el-form-item label="域：" v-if="data.mailType=='exchange'">
                    <el-input v-model="data.smtpHost" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="服务器：" v-if="data.mailType=='exchange'">
                    <el-input v-model="data.smtpPort" readonly="readonly"></el-input>
                </el-form-item>

                <el-form-item label="使用SSL认证：">
                    <el-switch v-model="data.ssl" disabled></el-switch>
                </el-form-item>
                <el-form-item label="需要身份验证：">
                    <el-switch v-model="data.validate" disabled></el-switch>
                </el-form-item>
                <el-form-item label="删除远程邮件：">
                    <el-switch v-model="data.isDeleteRemote" disabled></el-switch>
                </el-form-item>
                <el-form-item label="下载附件：">
                    <el-switch v-model="data.isHandleAttach" disabled></el-switch>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    props:["id"],
    name:"mailSettingGet",
    data() {
        return {
            defaults:false, 
        }
    },
    computed :mapState({
        data: state => state.mail.mailSettingData
    }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        }
    },
    created() {
        this.$store.dispatch("mail/getMailSettingById",this.id).then(mailsetting=>{;
            if(mailsetting.isDefault==1){
                this.defaults=true;
            }
        });
    }



}
</script>

<style lang="stylus" scoped>
.el-container{
    background-color: #fff;
}
.el-header {
    padding-top:10px;
    border-bottom :1px solid #E7EAEC;
}
.back{
    float :right;
    margin-top:4px;
}
.title{
    font-size:16px;
    margin:0;
    margin-top:10px;
}
</style>

