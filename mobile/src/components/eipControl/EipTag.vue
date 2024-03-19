<template>
<div class="inputs">
    <el-select
            :filterable="filterable"
            :remote="filterable"
            :remote-method="remoteMethod"
            multiple
            v-if="inputWriteable && permission_sub!='n'"
            v-model="inputVal"
            style="width:100%;">
        <div v-loading="loading">
            <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name">
            </el-option>
        </div>

        <div class="text-center">
            <a class="text-normal">
                <el-pagination
                        @current-change="currentChange"
                        layout="prev, pager, next"
                        :page-size="pagination.pageSize"
                        :pager-count="5"
                        :current-page="pagination.page"
                        :total="pagination.total">
                </el-pagination>
            </a>
        </div>
        <template slot="empty" v-if="expand">
            <el-button style="width: 100%" @click="add">添加</el-button>
        </template>
    </el-select>
    <template v-if="!inputWriteable && permission_sub!='n'">
        <el-tag type="info" v-for="item in values" style="margin: 0 3px">{{item}}</el-tag>
    </template>
</div>
</template>

<script>
    import utils from "@/hotent-ui-util.js"
    import portal from "@/api/portal.js";
    import sub_pio_mixin from "@/sub-permission-mixin.js";
    export default {
        name: "eip-tag",
        props:{
            filterable:{
                type: Boolean,
                default: false
            },
            expand:{
                type: Boolean,
                default: false
            },
            tagKey: String,
            value: String,
            permission: String | Object
        },
        mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
        data(){
            return {
                options: [],
                pagination: {
                    pageSize: 5,
                    page: 1,
                    total: 0
                },
                loading: false,
                currentQuery: "",
                values: []
            }
        },
        methods: {
            remoteMethod(query){
                this.currentQuery = query;
                let param = {
                    pageBean: this.pagination,
                    querys:[{property: "type_key_", value: this.tagKey, group: "query", operation: "EQUAL", relation: "AND"}]
                }
                if (query){
                    param.querys.push({property: "name_", value: query, group: "query", operation: "LIKE", relation: "AND"});
                }
                this.loading = true;
                portal.getTagList(param).then(data => {
                    this.options = data.rows;
                    this.pagination = {
                        pageSize: data.pageSize,
                        page: data.page,
                        total: data.total
                    }
                }).finally(() => {
                    this.loading = false
                })

            },
            currentChange(page){
                this.pagination.page = page;
                this.remoteMethod(this.currentQuery);
            },
            add(){
                let param = {
                    name: this.currentQuery,
                    typeKey: this.tagKey
                }
                portal.saveTag(param).then(data => {
                    if (data.state){
                        this.$message({type: "success",message: "添加成功"});
                        this.remoteMethod(this.currentQuery);
                    }
                })
            }
        },
        mounted() {
            let param = {
                pageBean: this.pagination,
                querys: [{property: "type_key_", value: this.tagKey, group: "query", operation: "EQUAL", relation: "AND"}]
            };
            portal.getTagList(param).then(data => {
                this.options = data.rows;
                this.pagination = {
                    pageSize: data.pageSize,
                    page: data.page,
                    total: data.total
                }
            })
            if (this.value){
                this.values = this.value.split(",");
            }
        },
        computed: {
            inputWriteable: function() {
                return utils.getWriteable(this.permission_sub);
            },
            inputVal:{
                set(value){
                    if (value){
                        this.$emit("input",value.join(","));
                    }else{
                        this.$emit("input",value);
                    }
                },
                get(){
                    if (this.value){
                        this.values = this.value.split(",");
                        return this.value.split(",");
                    }
                    return this.value;
                }
            },
        }
    }
</script>

<style scoped>
    .text-center{
        position: sticky;
        background: #fff;
        height:30px;
        top:0;
        z-index:1;
        text-align: center;
    }
</style>
