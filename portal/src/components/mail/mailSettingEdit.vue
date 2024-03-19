<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">编辑外部邮箱配置</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form ref="data" status-icon :rules="rules" :model="data" label-width="120px">
                <el-form-item label="用户名称：" prop="nickName">
                    <el-input v-model="data.nickName"></el-input>
                </el-form-item>
                <el-form-item label="邮件类型：" prop="mailType">
                    <el-select v-model="data.mailType" placeholder="请选择邮箱类型" @change="mailTypeChange">
                        <el-option label="pop3类型" value="pop3"></el-option>
                        <el-option label="imap类型" value="imap"></el-option>
                        <el-option label="exchange类型" value="exchange"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="邮箱地址：" prop="mailAddress">
                    <el-input v-model="data.mailAddress" @blur="showInfos"></el-input>
                </el-form-item>
                <el-form-item label="邮箱密码：" prop="password">
                    <el-tooltip class="item" effect="dark" content="该密码为邮箱授权码，非登录密码" placement="top-start">
                        <el-input type="password" v-model="data.password" @change="handleChange()"></el-input>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="smtp主机：" prop="smtp" v-if="data.mailType!='exchange'">
                    <el-input v-model="data.smtpHost"></el-input>
                </el-form-item>
                <el-form-item label="smtp端口：" prop="smtpId" v-if="data.mailType!='exchange'">
                    <el-input v-model="data.smtpPort"></el-input>
                </el-form-item>

                <el-form-item label="pop主机：" v-if="data.mailType=='pop3'">
                    <el-input v-model="data.popHost"></el-input>
                </el-form-item>
                <el-form-item label="pop端口：" v-if="data.mailType=='pop3'">
                    <el-input v-model="data.popPort"></el-input>
                </el-form-item>

                <el-form-item label="imap主机：" v-if="data.mailType=='imap'">
                    <el-input v-model="data.imapHost"></el-input>
                </el-form-item>
                <el-form-item label="imap端口：" v-if="data.mailType=='imap'">
                    <el-input v-model="data.imapPort"></el-input>
                </el-form-item>

                <el-form-item label="域：" v-if="data.mailType=='exchange'">
                    <el-input v-model="data.smtpHost"></el-input>
                </el-form-item>
                <el-form-item label="服务器：" v-if="data.mailType=='exchange'">
                    <el-input v-model="data.smtpPort"></el-input>
                </el-form-item>

                <el-form-item label="使用SSL认证：">
                    <el-switch v-model="data.ssl" @change="changeSSL"></el-switch>
                </el-form-item>
                <el-form-item label="需要身份验证：">
                    <el-switch v-model="data.validate"></el-switch>
                </el-form-item>
                <el-form-item label="删除远程邮件：">
                    <el-switch v-model="data.isDeleteRemote"></el-switch>
                </el-form-item>
                <el-form-item label="下载附件：">
                    <el-switch v-model="data.isHandleAttach"></el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('data')" size="small">保存</el-button>
                    <el-button @click="testConnect" type="success" size="small">测试连接</el-button>
                    <el-button @click="back" size="small" plain>取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';

export default {
    props:["id"],
    name:"mailSettingEdit",
    data() {
        return {
            isOriginPwd:false,
            rules:{
                nickName:[
                    { required: true, message: '请输入用户名称', trigger: 'blur' }
                ],
                mailType:[
                    { required: true, message: '请选择邮箱类型', trigger: 'blur' }
                ],
                mailAddress:[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
                ],
                password:[
                    { required: true, message: '请输入邮箱授权码', trigger: 'blur' }
                ]
                
            },
            
        }
    },
    computed :mapState({
        data: state => state.mail.mailSettingData
    }),
    methods: {
        showInfos() {
            if (this.data.mailAddress != '') {
                var address = this.data.mailAddress;
                var type = this.data.mailType;
                var s = address.substring(address.indexOf('@') + 1,
                        address.length + 1).trim();
                if (type == 'pop3') {
                    this.data.smtpHost = 'smtp.' + s;
                    this.data.popHost = 'pop.' + s;
                }
                if (type == 'pop3') {
                    if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
                            || s == 'live.com' || s == 'hotmail.com') {
                        this.data.ssl = 0;
                    } else {
                        this.data.popPort = '110';
                        this.data.smtpPort = '25';
                    }
                } else if (type == 'imap') {
                    if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
                            || s == 'live.com' || s == 'hotmail.com') {
                        this.data.ssl = 0;
                    } else {
                        this.data.smtpPort = '25';
                        this.data.imapPort = '143';
                    }
                    this.data.imapHost = 'imap' + '.' + s;
                }else{
                    this.data.smtpHost = s;
                    this.data.smtpPort = "mail."+s;
                }
		    }
        },
        mailTypeChange(change){
            if (this.data.mailAddress != '') {
                var address = this.data.mailAddress;
                var s = address.substring(address.indexOf('@') + 1,
                        address.length + 1).trim();
                if (change == 'pop3') {
                    this.data.smtpHost = 'smtp.' + s;
                    this.data.popHost = 'pop.' + s;
                }
                if (change == 'pop3') {
                    if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
                            || s == 'live.com' || s == 'hotmail.com') {
                        this.data.ssl = 0;
                    } else {
                        this.data.popPort = '110';
                        this.data.smtpPort = '25';
                    }
                } else if (change == 'imap') {
                    if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
                            || s == 'live.com' || s == 'hotmail.com') {
                        this.data.ssl = 0;
                    } else {
                        this.data.imapPort = '143';
                        this.data.smtpPort = '25';
                    }
                    this.data.imapHost = 'imap' + '.' + s;
                }else{
                    this.data.smtpHost = s;
                    this.data.smtpPort = "mail."+s;
                }
		    }
        },
        changeSSL() {
            if (this.data.ssl == '1' && this.data.mailType != 'exchange') {
			    this.data.imapPort = '993';
			    this.data.smtpPort = '465';
			    this.data.popPort = '995';
            } else if (this.data.mailType != 'exchange') {
                this.data.imapPort = '143';
                this.data.smtpPort = '25';
                this.data.popPort = '110';
            }
        },
        handleChange(){
            this.isOriginPwd=true;
            this.$store.dispatch("mail/setIsOriginPwd",this.isOriginPwd);
        },
        back() {
            this.$router.go(-1);//返回上一层
        },
        submitForm(data) {
            //判断是否为空格
            var regu = "^[ ]+$";
            var re = new RegExp(regu);
            //用户名称
            if(this.data.nickName && re.test(this.data.nickName)){
                this.$message.warning("用户名称不能为空!");
                return false;
            }
            //邮箱账号
            if(this.data.mailAddress && re.test(this.data.mailAddress)){
                this.$message.warning("邮箱地址不能为空!");
                return false;
            }
            //密码
            if(this.data.password && re.test(this.data.password)){
                this.$message.warning("邮箱密码不能为空!");
                return false;
            }
            this.$refs[data].validate((valid) => {
                if (valid) {
                    this.$store.dispatch("mail/saveMailSetting",this.data).then(()=>{
                        this.back();
                    });
                } else {
                    this.$message.warning("您输入表单信息有误，请重新填写!");
                    return false;
                }
            });
        },
        testConnect() {
            Message.info("测试连接可能需要点时间,请耐心等候下。");
            this.$store.dispatch("mail/testMailConnect",this.data);
        }
    },
    created() {
        this.$store.dispatch("mail/getMailSettingById",this.id);
    }

};
</script>

<style lang="stylus" scoped>
.el-container{
    background-color: #fff;
}
.el-header {
    padding-top:10px;
    border-bottom :1px solid #E7EAEC;
}
.el-select{
    height :32px;
}
.title{
    font-size:16px;
    margin:0;
    margin-top:10px;
}
.back{
    float :right;
    margin-top:4px;
}
</style>

