<template>
    <el-container style="background-color: #fff;">
        <el-header height="48px" style="border-bottom: 1.5px solid #ededed;">
            <el-row>
                <div class="top-left">
                    <h3 class="title" style="line-height:20px">{{procName}}-办结流程列表</h3>
                </div>
                <div class="top-right">
                    <el-button @click="goBack" style="margin-top :8px;" plain size="small" type="danger" icon="el-icon-back">返回</el-button>
                </div>
            </el-row>
        </el-header>
        <el-main>
            <el-row>
                <el-col :span="24">
                    <el-input
                            size="medium"
                            style="width:380px;"
                            clearable
                            placeholder="请输入关键词 主题/发起人"
                            prefix-icon="el-icon-search"
                            v-model="keyWord"
                            @keyup.enter.native="searchEnterFun"
                    ></el-input>
                    <span style="margin-left: 20px;margin-right:8px">发布时间</span>
                    <el-date-picker
                            v-model="date"
                            type="datetimerange"
                            align="right"
                            size="medium"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']">
                    </el-date-picker>

                    <el-button style="margin-left: 20px" size="small" type="primary" icon="el-icon-search"
                               @click="search('find')">查询
                    </el-button>
                    <el-button size="small" @click="reset" icon="el-icon-refresh">重置</el-button>
                </el-col>
            </el-row>
            <el-table
                    :data="rows"
                    style="witdh:100%"
                    size="medium"
                    v-loading.fullscreen.lock="loading"
            >
                <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
                <el-table-column label="标题" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-link :underline="false" @click="showBoData(scope.row.id)" v-text="scope.row.subject.replace('<p>','').replace('</p>','')"></el-link>
                    </template>
                </el-table-column>
                <el-table-column  prop="createTime" align="center" label="创建时间" show-overflow-tooltip width="150"></el-table-column>
                <el-table-column  prop="endTime" align="center" label="结束时间" show-overflow-tooltip width="150"></el-table-column>
                <el-table-column  prop="creator" align="center" label="创建人" show-overflow-tooltip width="150"></el-table-column>
            </el-table>
        </el-main>
        <el-footer height="45px">
            <el-row type="flex" justify="end">
                <el-pagination @size-change="handleSizeChange"
                               @current-change="handleCurrentChange"
                               :current-page="pageBean.page"
                               :page-sizes="[10, 20, 50, 100]"
                               :page-size="pageBean.pageSize"
                               layout="total, sizes, prev, pager, next, jumper"
                               :total="pageBean.total"></el-pagination>
            </el-row>
        </el-footer>
    </el-container>
</template>
<script>
import req from "@/request.js";
export default {

    name:"completeView",
    props:[
        "procDefKey",
    ],
    data(){
        return {
            title:"",
            pageBean:{
                page:1,
                pageSize:10,
                total:0
            },
            querys:[
                {
                    group:"advance",
                    operation:"EQUAL",
                    property:"status_",
                    relation:"AND",
                    value:"end"
                },
                {
                    group:"advance",
                    operation:"EQUAL",
                    property:"proc_def_key_",
                    relation:"AND",
                    value:this.procDefKey
                }
            ],
            sorter:[{
                direction:"DESC",
                property:"create_time_"
            }],
            keyWord:"",
            startTime:"",
            endTime:"",
            date:"",
            rows:null,
            loading:true,
            procName:""
        }
    },
    created(){
        //验证当前流程定义别名是否已经配置流程公示
        this.$http.get("${portal}/portal/sysIndexColumn/sysIndexColumn/v1/validateProcAnn?defKey=" + this.procDefKey).then(resp=>{
            if(resp.data && resp.data.state){
                this.init();
            }else{
                this.$router.push("/")
            }
        })
    },
    methods:{
        init(){
            this.loading = true;
            let that = this;
            let pageBean = this.pageBean;
            let querys = this.querys;
            let sorter = this.sorter;
            req.post(window.context.bpmRunTime+"/runtime/instance/v1/query",{
                pageBean,
                querys,
                sorter
            }).then(resp=>{
                if(resp.status == "200"){
                    if(resp.data.rows.length > 0){
                        that.procName = resp.data.rows[0].procDefName;
                    }
                    that.rows = resp.data.rows;
                    that.loading = false;
                    that.pageBean.total = resp.data.total;
                }else{
                    this.loading = false;
                }

            })

        },
        goBack(){
            this.$router.go(-1);
        },
        search(){
            //删除旧的查询
            for(let i = this.querys.length-1;i>=0;i--){
                let property = this.querys[i].property;
                if(property == 'subject' || property == 'creator' || property == 'createTime'){
                    this.querys.splice(i,1);
                }
            }
            if(this.keyWord){
                this.querys.push({
                    group:"main",
                    property:"subject",
                    operation:"LIKE",
                    relation:"OR",
                    value:this.keyWord
                });
                this.querys.push({
                    group:"main",
                    property:"creator",
                    operation:"LIKE",
                    relation:"OR",
                    value:this.keyWord
                })
            }
            if(this.date && this.date.length == 2){
                this.querys.push({
                    group:"time",
                    property:"createTime",
                    operation: "BETWEEN",
                    relation:"AND",
                    value:this.date
                })
            }
            this.init();
        },
        handleSizeChange:function(size){
            this.pageBean.pageSize = size;
            this.init();
        },
        handleCurrentChange:function(page){
            this.pageBean.page = page;
            this.init();
        },
        reset(){
            //删除旧的查询
            for(let i = this.querys.length-1;i>=0;i--){
                let property = this.querys[i].property;
                if(property == 'subject' || property == 'creator' || property == 'createTime'){
                    this.querys.splice(i,1);
                }
            }
            this.keyWord = "";
            this.date = "";
        },
        //前往业务数据表单页面
        showBoData(id){
            let token = this.$store.state.login.currentUser.token;
            let url = window.context.front + "/doneReadOnly/"+id + "?token="+token;
            window.open(url,"_self","width="+(window.screen.availWidth-10)+",height="+(window.screen.availHeight-10));
        }
    }
}
</script>
<style lang="stylus" scoped>
    .el-container {
        background-color: #fff;
    }

    .el-row {
        margin-bottom: 20px;
    }

    .el-header {
        border-bottom: 1.5px solid #ededed;
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