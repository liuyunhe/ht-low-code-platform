<template>
    <el-container>
        <el-header height="">
            <el-row>
                <div class="top-left">
                    <h2 v-text="data.subject"></h2>
                </div>
                <div class="top-right">
                    <el-button @click="reply()" v-if="data.type==1" style="margin-left:5px" size="small" type="success" icon="el-icon-plus">回复</el-button>
                    <el-button @click="deletes()" style="margin-left:5px" size="small" type="danger" icon="el-icon-delete">删除</el-button>
                    <el-button @click="back()" style="margin-left:5px" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </div>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <label>发件人:</label>
                    &nbsp;&nbsp;
                    <label>{{data.senderName}}</label>
                    &lt;<label>{{data.senderAddress}}</label>&gt;
                </el-col>
            </el-row>
            <el-row style="margin-bottom:20px;">
                <div>
                    <span style="float:left">
                        <label>收件人:</label>
                        &nbsp;&nbsp;
                        <label>{{data.receiverName}}</label>
                        &lt;<label>{{data.receiverAddresses}}</label>&gt;
                    </span>
                    <span style="float:right">
                        <label v-text="data.sendDate"></label>
                    </span>
                </div>
            </el-row>
        </el-header>
        <el-main>
            <el-row v-html="data.content" class="content">
            </el-row>
            <el-row v-if="mailAttachments.length>0" class="folder">
                <label class="foots"><i class="el-icon-document"></i>&nbsp;共有{{length}}个附件</label>
            <el-card v-for="item in data.mailAttachments" :key="item.id">
                <div>
                    <p class="fonts">{{item.fileName}}<el-button icon="el-icon-download" @click="download(item)" style="margin-left:10px" type="primary" size="mini">下载</el-button></p>
                </div>
            </el-card>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import req from "@/request.js";
import { Message } from "element-ui";
const portal = window.context.portal;

export default {
    props:["id"],
    name:"mailGet",
    data() {
        return {
            mailAttachments:[],
            length:0,
        }
    },
    computed :mapState({
        data: state => state.mail.mailData
    }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
        },
        reply() {
            this.$router.push("/mail/mailEdit/" + this.id);
        },
        deletes() {
            this.$confirm('此操作将删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                    this.$store.dispatch("mail/deleteMaliOnes",this.data).then(()=>{
                        this.back();
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
            });


        },
        download(item) {
            req.download("${portal}/system/file/v1/downloadFile?fileId=" +  item.id);
        }
    },
    created() {
        this.$store.dispatch("mail/getMailById",this.id).then((data)=>{
            this.mailAttachments=data.mailAttachments;
            this.length=data.mailAttachments.length;
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
    border :1px solid #E7EAEC;
}
.el-row {
    margin-top: 10px;
}
.el-main {
    border-bottom :1px solid #E7EAEC;
}
.content{
    margin-bottom :30px;
}
.folder{
    border-top :1px solid #E7EAEC;
}
.foots{
    line-height :40px;
}
.el-card {
    width :240px;
    margin-top :20px;
}
.fonts {
    color:#4EC1C3;
    margin-left :10px;
}
.footed {
    float: right ;
    margin-top :10px;
}
.top-left{
    float: left;
    display :inline-block;
}
.top-right{
    float: right;
    display :inline-block;
}
</style>


