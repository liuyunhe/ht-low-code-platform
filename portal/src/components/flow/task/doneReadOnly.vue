<template>
    <el-main class="base-main">
        <div
                style="width:1080px;margin: 0px auto 0;background-color: #fff;padding:20px;margin-top: 20px;"
        >
            <div id="printData">
                <div class="form-container">
                    <span>表单内容</span>
                </div>
                <div class="form-content">
                    <form v-if="html" data-vv-scope="custom-form">
                        <online-form
                                class="custom-form"
                                :html="html"
                                :data="formData"
                                :permission="permission"
                                :isView="isView"
                                ref="onlineForm"
                                :isPrint="isPrint"
                        />
                    </form>
                </div>
            </div>
        </div>
    </el-main>
</template>
<script>
import OnlineForm from "@/components/flow/OnlineForm.vue"
import req from "@/request.js"
import form from "@/api/form.js";
import utils from "@/utils.js";
export default{
    name:"doneReadOnly",
    props:[
        "instId"
    ],
    data(){
        return {
            html:"",
            permission:{},
            isView:true,
            isPrint:false,
            formData:{}
        }
    },
    created() {
        this.init();
    },
    methods:{
        //初始化
        init(){
            let that = this;
            req.get(window.context.bpmRunTime+"/runtime/instance/v1/getInstFormAndBO?proInstId="+this.instId)
                .then(resp=>{
                    //this.data = resp.data;
                    that.formData = resp.data.data;
                    that.permission = JSON.parse(resp.data.permission);
                    this.handleReadonly(this.permission);
                    that.html = resp.data.form.formHtml;

            })
        },
        handleReadonly(permission){
            for(let key in permission){
                if(typeof permission[key] == "string" && (permission[key] == 'w' || permission[key] == 'b')){
                    permission[key] = 'r';
                }else if(typeof permission[key] == "object"){
                    this.handleReadonly(permission[key]);
                }
            }
        }
    },
    components:{
        OnlineForm
    }
}
</script>
<style lang="scss" scoped>
    @import "@/assets/css/element-variables.scss";
    /deep/.el-form-item {
        margin-bottom: 15px !important;
        margin-top: 10px !important;
        margin-right : 10px !important;
    }
    .base-main {
        background-color: #e9eef3;
    }

    /deep/ .form-table {
        width: 100%;
        border-top: 1px solid #ebeef5;
        border-left: 1px solid #ebeef5;
    }

    /deep/ .form-table > thead > tr > th, /deep/ .form-table > tbody > tr > th {
        text-align: right;
        color: #666;
        font-weight: normal;
    }

    /deep/ .form-table > tbody > tr > th.group-th {
        text-align: left;
        background: #f9f9f9;
        font-weight: bold;
    }

    /deep/ .form-table > thead > tr.sub-table-header > th {
        text-align: center;
        background: #fafafa;
    }

    /deep/ .form-table > tbody > tr > th > span, /deep/ .form-table > thead > tr > th > span {
        color: #f00;
    }

    /deep/ .form-table > tbody > tr > th, /deep/ .form-table > tbody > tr > td, /deep/ .form-table > tfoot > tr > td, /deep/ .form-table > thead > tr > th {
        border-right: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
        padding: 10px;
        min-width: 0;
        box-sizing: border-box;
        text-overflow: ellipsis;
        vertical-align: middle;
        position: relative;
    }

    /deep/ .form-table > tfoot > tr > td {
        padding: 5px 10px;
    }

    .form-container {
        border-bottom: 1px solid #ebeef5;
        padding-bottom: 10px;
    }

    .form-container > span {
        border-left: 3px solid $--theme-color;
        font-weight: bold;
        font-size: 14px;
        padding-left: 10px;
        color: #666;
    }

    .form-content {
        padding: 11px 0;
    }

    /deep/ div[aria-invalid='true'] + small, /deep/ small.error-message {
        display: block;
        margin-top: 8px;
        color: #f56c6c;
        font-size: 12px;
        font-weight: bold;
        line-height: 1;
    }
</style>