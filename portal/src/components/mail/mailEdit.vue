<template>
    <el-container>
        <el-header>
            <el-row type="flex" justify="space-between">
                <el-col :span="8">
                    <b style="line-height:40px;font-size:20px">发送邮件</b>
                    <span style="margin-left:20px;">
                        <el-button type="text" @click="addAddress()" v-show="isShowAddress==1">添加抄送</el-button>
                        <el-button type="text" @click="deleteArress()" v-show="isShowAddress==2">删除抄送</el-button>
                        <el-button type="text" @click="addCAddresses()" v-show="isShowCAdress==1">添加密送</el-button>
                        <el-button type="text" @click="deltetCAddresses()" v-show="isShowCAdress==2">删除密送</el-button>
                    </span>
                </el-col>
                <el-col :span="12"></el-col>
                <el-col :span="4">
                    <el-button class="back" @click="back()" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-container>
        <el-main>
            <el-form ref="data" status-icon :rules="rules" :model="data" label-width="80px">
                <el-form-item label="发件人：">
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            <input type="text" class="senderAdds" v-model="data.senderAddress"><i class="el-icon-arrow-down"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="item in rows" :key='item.id' @click.native="selectAddress(item.mailAddress)">{{item.mailAddress}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-form-item>
                <el-form-item label="收件人：" prop="receAddresses">
                    <el-select v-model="data.receAddresses" 
                    filterable  
                    multiple
                    remote
                    allow-create
                    default-first-option
                    :remote-method="remoteMethodAddress"
                    placeholder="请选择收件人 / 请输入关键字 姓名或邮箱地址"
                    :loading="loading"
                    class="receiver"
                    >
                        <el-option
                        v-for="item in queryAll"
                        :key="item.id"
                        :label="item.linkName+'<'+item.mailId+'>'"
                        :value="item.mailId"
                        >
                            <span style="float: left; color: #8492a6; font-size: 13px">{{ item.linkName }}</span>
                            <span style="floar: left; color:#409EFF;font-size:13px;margin-left:50px">{{item.orgName}}</span>
                            <span style="float: right;padding-left:30px">{{ item.mailId }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="抄送：" v-show="isShowAddress==2">
                    <el-select v-model="Addresses" 
                    filterable 
                    multiple 
                    remote
                    allow-create
                    default-first-option
                    :remote-method="remoteMethodToAddress"
                    placeholder="请选择抄送人 / 请输入关键字 姓名或邮箱地址"
                    class="receiver"
                    >
                        <el-option
                        v-for="item in queryList"
                        :key="item.id"
                        :label="item.linkName+'<'+item.mailId+'>'"
                        :value="item.mailId"
                        >
                            <span style="float: left; color: #8492a6; font-size: 13px">{{ item.linkName }}</span>
                            <span style="floar: left; color:#409EFF;font-size:13px;margin-left:50px">{{item.orgName}}</span>
                            <span style="float: right;padding-left:30px">{{ item.mailId }}</span>
                        </el-option>
                    </el-select> 
                </el-form-item>
                <el-form-item label="密送：" v-show="isShowCAdress==2">
                    <el-select v-model="CAddresses" 
                    filterable 
                    multiple 
                    remote
                    allow-create
                    default-first-option
                    :remote-method="remoteMethodCAddress"
                    placeholder="请选择密送人 / 请输入关键字 姓名或邮箱地址"
                    class="receiver"
                    >
                        <el-option
                        v-for="item in querys"
                        :key="item.id"
                        :label="item.linkName+'<'+item.mailId+'>'"
                        :value="item.mailId"
                        >
                            <span style="float: left; color: #8492a6; font-size: 13px">{{ item.linkName }}</span>
                            <span style="floar: left; color:#409EFF;font-size:13px;margin-left:50px">{{item.orgName}}</span>
                            <span style="float: right;padding-left:30px">{{ item.mailId }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                
                <el-form-item label="主题：" prop="subject">
                    <el-input v-model="data.subject" placeholder="请输入主题"></el-input>
                </el-form-item>
                <el-form-item label="附件：">
                    <FileUpload ref="fileUpload"/>
                </el-form-item>
                <el-form-item label="正文："> 
                    <div class="edit_container">
                        <quill-editor 
                        v-model="data.content" 
                        ref="myQuillEditor" 
                        :options="editorOption" 
                        :editorOption="editorOption"
                        >
                        </quill-editor>
                    </div>
                </el-form-item>
                <el-form-item style="float:left">
                    <el-button @click="sendMail(2,'data')" size="small" type="primary" icon="el-icon-edit-outline" :disabled="disabled">发送</el-button>
                    <el-button @click="sendMail(3,'data')" style="margin-left:5px" size="small" type="info" icon="el-icon-edit">草稿</el-button>
                    <el-button @click="back" style="margin-left:5px" size="small" icon="el-icon-close" plain>取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>
        </el-container>
    </el-container>
</template>
<script>
import { quillEditor } from "vue-quill-editor"; //调用编辑器
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { Message } from "element-ui";
import FileUpload from "@/components/common/fileUpload.vue";
import { mapState, mapActions } from "vuex";

export default {
    props:["id"],
    name:"mailEdit",
    components: {
        quillEditor,
        FileUpload
    },
    data() {
        return {
            str: '',
            Addresses:[],
            CAddresses:[],
            editorOption: {},
            list:[],
            queryAll:[],
            queryList:[],
            querys:[],
            loading:false,
            disabled: false,
            isShowAddress:1,
            isShowCAdress:1,
            data:{
                receAddresses:[],
                senderAddress:"",
                type:"",
                isReply:0,
                fileIds:"",
                subject:"",
            },
            rules:{
                subject:[
                    { required: true, message: '请输入主题', trigger: 'blur' }
                ],
                receAddresses:[
                    { type: 'array', required: true, message: '请选择收件人', trigger: 'change' }
                ]
            },
            editorOption: {
                // 改变提示文字内容
                placeholder: '请输入内容......',
            },
        }
    },
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        },
        sendMail(action,data) {
            this.$refs[data].validate((valid) => {
                if (valid) {
                    this.disabled = true;
                    if(action == 2){
                        Message.info("正在发送邮件，请稍等!");
                    }
                    this.data.type = action;
                    this.data.receiverAddresses=this.data.receAddresses.join(';');
                    this.data.copyToAddresses=this.Addresses.join(';');
                    this.data.bcCAddresses=this.CAddresses.join(';');
                    //附件
                    if(this.$refs.fileUpload.getFiles()!=""){
                        this.data.fileIds = JSON.stringify(this.$refs.fileUpload.getFiles());
                    }
                    this.$store.dispatch("mail/saveMail",this.data).then(()=>{
                        this.back();
                    }).catch(() => {
                        this.disabled = false;
                    });
                } else {
                    this.$message.warning("您输入表单信息有误，请重新填写!");
                    return false;
                }
            });
            
        },
        remoteMethodAddress(query) {
            if (query !== '') {
                this.loading = true;
                this.$store.dispatch("mail/getUserlistByPagination",query);
                setTimeout(() => {
                    this.queryAll=this.userRows;
                    this.loading = false;
                }, 200);
            }else{
                this.queryAll=this.options;
            }
            
        },
        remoteMethodToAddress(query) {
            if (query !== '') {
                this.$store.dispatch("mail/getUserlistByPagination",query);
                setTimeout(() => {
                    this.queryList=this.userRows;
                }, 200);
            }else{
                this.queryList=this.options;
            }
        },
        remoteMethodCAddress(query) {
            if (query !== '') {
                this.$store.dispatch("mail/getUserlistByPagination",query);
                setTimeout(() => {
                    this.querys=this.userRows;
                }, 200);
            }else{
                this.querys=this.options;
            }
        },
        addAddress() {
            this.isShowAddress=2;
        },
        deleteArress() {
            this.isShowAddress=1;
            this.Addresses=[];
        },
        addCAddresses() {
            this.isShowCAdress=2;
        },
        deltetCAddresses() {
            this.isShowCAdress=1;
            this.CAddresses=[];
        },
        selectAddress(item) {
            this.data.senderAddress=item;
        },
    },
    computed: mapState({
        editor() {
            return this.$refs.myQuillEditor.quill;
        },
        rows: state => state.mail.mailSettingRows,
        options: state => state.mail.mailLinkmanRows,
        userRows: state => state.mail.userRows
    }),
    mounted() {
        this.editor.container.style.height = `260px`
    },
    created() {
        let pageBean = {"pageBean":{"page":"1","pageSize":"10","showTotal":"true"}}; //初次加载默认pageBean
        this.$store.dispatch("mail/getMailSettingByPagination",pageBean);
        this.$store.dispatch("mail/getMailLinkmanByPagination",pageBean).then((maillst)=>{
            this.queryAll=maillst;
            this.queryList=maillst;
            this.querys=maillst;
        });

        this.$store.dispatch("mail/getMailById",this.id).then((mails)=>{
            if(mails.type==3){
                this.data.senderAddress=mails.senderAddress;
                this.data.subject=mails.subject;
                this.data.content=mails.content;
            }else if(mails.type==1){
                this.data.senderAddress=mails.receiverAddresses;
                this.data.content="";
                this.data.subject="回复："+mails.subject;
            }
            
            if(mails.receiverAddresses!=null && mails.receiverAddresses!=""){
                if(mails.type==3){
                    this.data.receAddresses.push(mails.receiverAddresses);
                }else if(mails.type==1){
                    this.data.receAddresses.push(mails.senderAddress);
                }
            }
            if(mails.copyToAddresses!=null && mails.copyToAddresses!=""){
                this.isShowAddress=2;
                this.Addresses.push(mails.copyToAddresses);
            }
            if(mails.bcCAddresses!=null && mails.bcCAddresses!=""){
                this.isShowCAdress=2;
                this.CAddresses.push(mails.bcCAddresses);
            }
        });

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
.receiver {
    width :100%;
}
.el-button{
    margin:5px;
}
.back{
    float :right;
    margin-top:4px;
}
.senderAdds{
    width:155px;
    display :inline;
    border:0;
    cursor: pointer;
    color: #409EFF;
}
.el-icon-arrow-down {
    font-size: 12px;
    color: #409EFF;
    margin-right:10px;
}
.el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
}
</style>
