<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">编辑邮箱联系人</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form :model="data" status-icon :rules="rules" ref="data" label-width="120px" class="demo-ruleForm">
                <el-form-item label="联系人名称：" prop="linkName">
                    <el-input v-model="data.linkName"></el-input>
                </el-form-item>
                <el-form-item label="邮箱地址：" prop="mailId">
                    <el-input v-model="data.mailId"></el-input>
                </el-form-item>
                <el-form-item label="联系人电话：" prop="phone">
                    <el-input v-model="data.phone"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('data')" size="small">保存</el-button>
                    <el-button @click="back" size="small">取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    props:["id"],
    name:"mailLinkmanEdit",
    data() {
        var checkName = (rule, value, callback) => {
            var pattern = new RegExp("[`~!@#$%^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]");
            if (value == "") {
                callback(new Error("请输入联系人名称"));
            } else if (pattern.test(value)) {
                callback(new Error("联系人名称包含特殊字符，请重新输入"));
            } else {
                callback();
            }
        };
        var checkphone = (rule, value, callback) => {
            const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
            if (value == "") {
                callback(new Error("请输入手机号"));
            } else if (!reg.test(value)) {
                callback(new Error("请输入正确的手机号!"));
            } else {
                callback();
            }
        };
        return {
            rules:{
                mailId:[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
                ],
                linkName:[
                    { required: true, validator: checkName, trigger: "blur" }
                ],
                phone:[
                    { required: true, validator: checkphone, trigger: "blur" }
                ]
            }
        }
    },
    computed :mapState({
        data: state => state.mail.mailLinkmanData
    }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        },
        submitForm(data) {
            this.$refs[data].validate((valid) => {
                if (valid) {
                    this.$store.dispatch("mail/saveMailLinkman",this.data).then(()=>{
                        this.back();
                    });
                } else {
                    this.$message.warning("您输入表单信息有误，请重新填写!");
                    return false;
                }
            });
        }
    },
    created() {
        this.$store.dispatch("mail/getMailLinkmanById",this.id);
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

