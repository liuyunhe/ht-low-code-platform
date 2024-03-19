<template>
    <el-container>
        <el-header>
            <el-row>
                <el-col :span="22">
                    <h5 class="title">查看邮箱联系人</h5>
                </el-col>
                <el-col :span="2">
                    <el-button class="back" @click="back" size="small" type="danger" icon="el-icon-back" plain>返回</el-button>
                </el-col>
            </el-row>
        </el-header>
        <el-main>
            <el-form ref="data" :model="data" label-width="120px">
                <el-form-item label="联系人名称：">
                    <el-input v-model="data.linkName" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="邮箱地址：">
                    <el-input v-model="data.mailId" readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="联系人电话：">
                    <el-input v-model="data.phone" readonly="readonly"></el-input>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    props:["id"],
    name:"mailLinkmanGet",
    computed :mapState({
        data: state => state.mail.mailLinkmanData
    }),
    methods: {
        back() {
            this.$router.go(-1);//返回上一层
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

